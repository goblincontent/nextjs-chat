'use client'

import * as Accordion from "@radix-ui/react-accordion";
import * as Popover  from "@radix-ui/react-popover";
import React from "react";
import { IconChevronDown } from "@/components/ui/icons"
import { clsx } from "clsx";

interface AccordionItem {
  header: string,
  content: React.ReactNode;
}

// const MyComponent = () : React.ReactNode  => {
//   return (
//     <div className="">
//       Testing 1 2 3 
//       <br/>
//       <Popover.Root>
//         <Popover.Trigger>4</Popover.Trigger>
//         <Popover.Portal>
//           <Popover.Content>
//             Some more info…
//             <Popover.Arrow />
//           </Popover.Content>
//         </Popover.Portal>
//       </Popover.Root>
//       Other text

//     </div>
//   )
// }

const items: AccordionItem[] = [
  {
    header: "About",
    content: `
    There are 2 main problems with generative AI. The first is hallucinations and using made-up information.
    The second is that there is usually a token limit (for example, gpt-3.5 has a limit of 8191 tokens, gpt-4-32k has a 32k limit).

    This Demo is an example to showcase the power of RAG (Retrieval-Augmented Generation) to solve the above problems.
    This technique solves the problem of hallucinations by using a retrieval model to find relevant information,
    and using embeddings to look for chunks of text that are similar to the input greatly reduces the amount of input tokens,
    compared with sending the entire case law document, which could be 100000s of tokens.
    
    It is a custom AI Chatbot designed for lawyers to do case law research. 
    I believe this is a good use case for the demo due to the overwhelmingly large size of case law documents.
    `
  },
  {
    header: "Dataset and Limitations",
    content: `Since I don't have access to a paid law database like WestLaw or LexisNexis, 
    I decided to use the "Caselaw Access Project" provided by Harvard Library Innovation Lab.
    Since its a free database, I only used a small subset (234 cases) to do with online marketplaces,
    inspired by the recent FTC lawsuit against Amazon.

    Even though its a small subset of the entire case law library, it still contains 20000 case chunks, so roughly 8 million tokens
    and 6.6 million words.

    You can find the sql used to write the match documents embeddings function on the github under data/case_chunks.sql

    Additionally, addings indexing to make the embeddings query more efficient is possible.
    
    I haven't added conversation history yet because
    I have plans to make the chatbot be able to remember the relevant documents more efficiently.
    `
  },
  {
    header: "How does it work?",
    content: `
    Each case law document is a string, and we split it into chunks of 400 tokens.
    We use langchain's OpenAIEmbeddings() to produce the embeddings for each chunk.

    When a user has a question, the question is converted into vector embeddings using the same embeddings function.
    Then we use the user's embeddings to find the most similar chunks and then use write an
    appropriate prompt to generate a response.

    Vector similarity is known to be extremely efficient.
    Please note that the typescript async code I wrote has yet to be optimised.
    `
  },
  {
    header: "Technology Stack",
    content: `
    For the backend, it uses a service called Supabase. Supabase is an open-source Firebase alternative and 
    it provides access to the pgvector extension for PostgreSQL, allowing us to do vector similarity searches.
    We save our case law documents in the database called "cases" and we save the embeddings in the database called "case_chunks".
    Langchain is used for prompt generation, 
    For the frontend, it uses Next.js, React, TailwindCSS, and Radix UI. The source code was forked from a Vercel template app.
    It also uses Vercel for edge-compute so we already have a cdn and CI/CD. All we have to do is make commits and the production app will be updated.
    `
  }
]

interface AccordionProps { }

const MyAboutPageAccordion = (props: AccordionProps) => {
  return (
    <Accordion.Root
      type="multiple"
      className={clsx("space-y-4 w-full")}
      defaultValue={["item-1"]}>
      {items.map(({ header, content }, i) => (
        <Accordion.Item
          key={`header-${i}`}
          value={`item-${i + 1}`}
          className="rounded-lg focus-within:ring focus-within:ring-purple-500 
          focus-within:ring-opacity-75 focus:outline-none w-full"
        >
          <Accordion.Header className="w-full">
            <Accordion.Trigger
              className={
                clsx(
                  "group",
                  "radix-state-open:rounded-t-lg radix-state-closed:rounded-lg",
                  "focus:outline-none",
                  "inline-flex w-full items-center justify-between bg-white px-4 py-2 text-left dark:bg-gray-800"
                )
              }>
              <span className="text-sm font-medium dark:text-gray-100">
                {header}
              </span>
            <IconChevronDown className={clsx(
              "ml-2 h-5 w-5 shrink-0 text-gray-700 ease-in-out dark:text-gray-400",
              "group-radix-state-open:rotate-180 group-radix-state-open:duration-300"
              )}
              />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="pt-1 w-full rounded-b-lg bg-white dark:bg-gray-800 px-4 pb-3">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {content}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  )
}

export default function About() {

  return (
    <div className="w-full mx-auto max-w-2xl px-4">
      <div className="flex h-screen">
        <div className="rounded-lg border bg-background p-8 m-auto ">
          <MyAboutPageAccordion/>
        </div>
      </div>
    </div>
  )
}