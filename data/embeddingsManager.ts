import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { Document } from 'langchain/document';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { SupabaseWrapper } from './supabaseWrapper.js';

require('dotenv').config();

// Responsible for creating openAI embeddings
class EmbeddingsManager {
    textSplitter: TokenTextSplitter;
    supabaseWrapperCaseChunks: SupabaseWrapper;
    constructor() {
        this.textSplitter = new TokenTextSplitter({
            encodingName: "cl100k_base",
            chunkOverlap: 20,
            chunkSize: 400
        });
        this.supabaseWrapperCaseChunks = new SupabaseWrapper("case_chunks");
    }

    async addDocumentToVectorStore(document: string, metadata: object)
    {
        try {
            //split text into documents
            const docs = await this.textSplitter.splitDocuments([
                new Document({
                    pageContent: document,
                    metadata: metadata
                })
            ]);

            const embeddings = new OpenAIEmbeddings();
            const store = new SupabaseVectorStore(embeddings, {
                client: this.supabaseWrapperCaseChunks.supabase,
                tableName: this.supabaseWrapperCaseChunks.tableName
            });

            console.log("Adding documents");
            for (const doc of docs) {
                await store.addDocuments([doc]);
            }
            
            
        } catch (error) {
            console.error("Problem adding document to vector store: ", error);
        }
    }

    forceStringIntoUtf8(text: string)
    {
        const enc = new TextEncoder();
        return new TextDecoder("utf-8").decode(enc.encode(text));
    }

    
    async parseText(case_id: number, text: string) {
        let firstIndex = findNthLastIndexOf(text, "{", 5);
        if (!text.substring(firstIndex).includes("@context")) {
            firstIndex = findNthLastIndexOf(text, "{", 6);
        }

        if (firstIndex) {

            const textSection = text.substring(0, firstIndex)
            const jsonBlob = text.substring(firstIndex);
            try {
                //Parse json into object
                const parsedJson = JSON.parse(jsonBlob);
                // example blob:
                //{ "@context": "https://schema.org", "@type": "Article", "mainEntityOfPage": { "@type": "WebPage", "@id":"https://cite.case.law/f-supp-3d/385/1022/" }, "headline": "McDonald v. Aps", "author": { "@type": "Organization", "name": "United States District Court for the Northern District of California" }, "genre": "Law", "keywords": "385 F. Supp. 3d 1022, McDonald v. Aps", "publisher": { "@type": "Organization", "name": "Harvard Law School Library Innovation Lab", "logo": { "@type": "ImageObject", "url":"https://case.law/static/img/lil-logo-black.png", "width": 693, "height": 361 } }, "image": "https://case.law/static/img/og_image/api.jpg", "datePublished": "2019-05-22", "dateModified": "2023-03-29T19:33:20.158477+00:00", "dateCreated": "2021-08-27", "description": "Michael MCDONALD et al., Plaintiffs, v. KILOO APS et al., Defendants. Amanda Rushing et al., Plaintiffs, v. The Walt Disney Company et al., Defendants. Amanda Rushing et al., Plaintiffs, v. Viacom Inc. et al., Defendants." }
                // remove @context, @type, mainEntityOfPage, publisher, image, dateCreated
                const keysToFilterOut = ["@context", "@type", "mainEntityOfPage", "publisher", "genre", "image", "dateCreated"];
                const filteredJson: any = Object.keys(parsedJson).reduce((result, key) => {
                    if (!keysToFilterOut.includes(key)) {
                        result[key] = parsedJson[key];
                    }
                    return result;
                }, {} as {[key: string]: string})
                // console.log(JSON.stringify(filteredJson));
                
                //create case-chunk metadata object
                const metadata = {
                    "case_id": case_id,
                    "author_name": filteredJson.author.name,
                    "keywords": filteredJson.keywords,
                    "date_published": filteredJson.datePublished,
                    "description": filteredJson.description
                }

                //save document into supabase through SupabaseVectorStore along with metadata
                const text_utf8 = this.forceStringIntoUtf8(textSection);
                await this.addDocumentToVectorStore(text_utf8, metadata);
                console.log("Done: ", case_id);

            } catch (error) {
                console.error("Error parsing json blob, ", error);
            }
        } else {
            console.log("No json blob found");
        }
        return;
    }
}

function findNthLastIndexOf(input: string, charToFind: string, n: number): number {
    let lastIndex = input.lastIndexOf(charToFind);
    while (lastIndex !== -1 && n > 1) {
      lastIndex = input.lastIndexOf(charToFind, lastIndex - 1);
      n--;
    }
    return lastIndex;
}

async function main() {
    const embeddingsManager: EmbeddingsManager = new EmbeddingsManager();
    const supabaseCases: SupabaseWrapper  = new SupabaseWrapper("cases");
    let allData = await supabaseCases.getData();

    for (const row of allData) {
        await embeddingsManager.parseText(row.case_id, row.case_text);
    }
    return;
    
}

main();