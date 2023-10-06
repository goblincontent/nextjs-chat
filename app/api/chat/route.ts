import { kv } from '@vercel/kv'
// import { OpenAIStream, StreamingTextResponse } from 'ai'
// import { Configuration, OpenAIApi } from 'openai-edge'
import { CallbackManager } from 'langchain/callbacks';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessagePromptTemplate, PromptTemplate, SystemMessagePromptTemplate } from 'langchain/prompts';
import type { NextApiRequest, NextApiResponse } from 'next';
import { SupabaseClient, createClient } from "@supabase/supabase-js";
import { SupabaseHybridSearch } from 'langchain/retrievers/supabase';


import { auth } from '@/auth'
import { nanoid } from '@/lib/utils'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { LLM } from 'langchain/dist/llms/base';
import { group } from 'console';
import { LangChainStream, StreamingTextResponse } from 'ai';
import { BytesOutputParser } from 'langchain/schema/output_parser';

export const runtime = 'edge'

const templates = {
    qaTemplate: `Answer the question based on the context below. 
        - There will be a CASE_CONTEXT, CASE_SUMMARY AND a QUESTION.
        - The CASE_CONTEXT is a part of a case law document.
        - The CASE_SUMMARY is a summary of the case law document
        - The QUESTION is a the user's question.
        - The final answer must always be styled using markdown.
        - Your main goal is to give the user relevant information for each of the three cases from the CASE_CONTEXT
        - Use bullet points, lists, paragraphs and text styling to present the answer in markdown.
        - The answer should only be based on common sense and sound reasoning.
        - When answering, state the case ID if you can, and write a short summary of the case.
        - be descriptive and think about the user's question and make connections to the context

        CASE_SUMMARY: {case_summaries}

        CASE_CONTEXT: {case_relevant_documents}

        QUESTION: {question}

        Final Answer: `,
    
    summaryTemplate: `Create a Summary of this case law document.
    Do not use information outside of the text aside from common sense and sound reasoning.
    CASE_LAW_DOCUMENT: {case_law_document}
    `
}

export type Metadata = {
    case_id: number;
    keywords: string;
    author_name: string;
    description: string;
    date_published: string;
}

const getMatchesFromEmbeddings = async (
    inquiry: string,
    client: SupabaseClient,
    topK: number
) => {
    const embeddings = new OpenAIEmbeddings();

    const store = new SupabaseVectorStore(embeddings, {
        client,
        tableName: "case_chunks",
        queryName: "match_documents"
    });

    try {
        // console.log("before similarity search")
        // console.log(inquiry);
        // console.log(topK);
        const queryResult = await store.similaritySearchWithScore(inquiry, topK);
        // console.log("====QueryResult====");
        // console.log(queryResult);
        return (
            queryResult.map((match) => ({
                ...match,
                metadata: match[0].metadata as Metadata,
                score: match[1]
            })) || []
        );
    } catch (error) {
        console.log(`Error querying embeddings: ${error}`);
    }
}

const getSummary = async (full_case_text: string) => {
    // cut off at 8000 tokens
    const summaryTemplate = new PromptTemplate({
        template: templates.summaryTemplate,
        inputVariables: [
            "case_law_document"
        ],
    });
    const summaryChain = new LLMChain({
        prompt: summaryTemplate,
        llm: new ChatOpenAI({
            streaming: false,
            verbose: false,
            modelName: "gpt-3.5-turbo-16k",
        })
    })
    return await summaryChain.invoke({ case_law_document: full_case_text.slice(0, 18000) })
}

const handleRequest = async (
    { prompt, userId, supabaseClient }: {
        prompt: string,
        userId: string,
        supabaseClient: SupabaseClient
    }) => {
    const matches = await getMatchesFromEmbeddings(
        prompt,
        supabaseClient,
        15
    )

    const caseIds =
        matches &&
        Array.from(
            new Set(
                matches.map((match) => {
                    const metadata = match.metadata as Metadata;
                    const score = match.score;
                    const text = match[0].pageContent;
                    const { case_id } = metadata;
                    return { case_id, score, text };
                })
            )
        );
    
    if (caseIds !== undefined) {
        const caseData: { case_id: number, score: number, text: string, [key: number]: any }[] = caseIds
        
        let groupedData = Object.values(caseData.reduce((acc, obj) => {
            const { case_id, score, text } = obj;
            if (!acc[case_id]) {
                acc[case_id] = { case_id, scores: [], texts: [] };
            }
            acc[obj.case_id].scores.push(obj.score);
            acc[obj.case_id].texts.push(obj.text);
            return acc;
        })).map(({ case_id, scores, texts }) => {
            if (scores !== undefined) {
                const average = scores.reduce((sum: any, score: any) => sum + score, 0) / scores.length;
                return { case_id, average, texts };
            } else {
                return { case_id, average: 0, texts };
            }
        });

        groupedData.sort((a, b) => b.average - a.average);

        let fullSummary = "";
        let relevantDocuments = "";
        let i;
        for (i = 0; i < 3; i++) {
            let group = groupedData.at(i);
            if (group !== undefined) {
                let documents = group.texts.join("\n");
                
                relevantDocuments += `\n\nCASE ID: ${group?.case_id}\n\n`;
                relevantDocuments += documents;
                const { data, error } = await supabaseClient.from("cases").select("case_text").eq("case_id", group.case_id);
                const summary = await getSummary(data?.at(0)?.case_text);
                fullSummary += `\n\nCase ID: ${group?.case_id}\n\n`;
                fullSummary += summary.text;
                fullSummary += "\n\n";
            }
        }

        const promptTemplate = new PromptTemplate({
            template: templates.qaTemplate,
            inputVariables: [
                "case_summaries",
                "case_relevant_documents",
                "question"
            ]
        })
        
        const outputParser = new BytesOutputParser();
        const model = new ChatOpenAI({
            temperature: 0.5,
            streaming: true,
            verbose: false,
            modelName: "gpt-3.5-turbo-16k"
        });
        // const chain = new LLMChain({
        //     prompt: promptTemplate,
        //     llm: new ChatOpenAI({
        //         streaming: true,
        //         verbose: false,
        //         modelName: "gpt-3.5-turbo-16k"
        //     })
        // });

        const chain = promptTemplate.pipe(model).pipe(outputParser);

        console.log("=====relevantDocuments=====");
        console.log(relevantDocuments);
        console.log("=====fullSummary=====");
        console.log(fullSummary);

        const stream = await chain.stream({ case_summaries: fullSummary, case_relevant_documents: relevantDocuments, question: prompt });
        return new StreamingTextResponse(stream);
    } else {
        console.log("No matches found");
        return null;
        // return "No matches found."
    }
}


export async function POST(req: Request) {
    const json = await req.json()
    const { messages, previewToken } = json
    const userId = (await auth())?.user.name;

    const session = await auth()
    // console.log("session: ", session);
    // console.log("userId in api/chat/route.ts: ", userId);

    if (!userId) {
        return new Response('Unauthorized', {
            status: 401
        })
    }

    //Setup supabase
    const client = createClient(
        process.env.SUPABASE_URL || "",
        process.env.SUPABASE_API_KEY || ""
    );

    // console.log("=====messages====");
    // console.log(messages);
    const stream = await handleRequest({
        prompt: messages.pop().content,
        userId: "user",
        supabaseClient: client
    });

    return stream;


    // return new StreamingTextResponse(await result);
    // return new Response(result, {
    //     status: 200
    // });

    // const chat = await openai.createChatCompletion({
    //     model: 'gpt-3.5-turbo',
    //     messages,
    //     temperature: 0.7,
    //     stream: true
    // })

    // const stream = OpenAIStream(res, {
    //     async onCompletion(completion) {
    //         const title = json.messages[0].content.substring(0, 100)
    //         const id = json.id ?? nanoid()
    //         const createdAt = Date.now()
    //         const path = `/chat/${id}`
    //         const payload = {
    //             id,
    //             title,
    //             userId,
    //             createdAt,
    //             path,
    //             messages: [
    //                 ...messages,
    //                 {
    //                     content: completion,
    //                     role: 'assistant'
    //                 }
    //             ]
    //         }
    //         await kv.hmset(`chat:${id}`, payload)
    //         await kv.zadd(`user:chat:${userId}`, {
    //             score: createdAt,
    //             member: `chat:${id}`
    //         })
    //     }
    // })

    // return new StreamingTextResponse(stream)
}
