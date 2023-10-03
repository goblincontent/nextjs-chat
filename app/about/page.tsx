'use client'

import * as Accordion from "@radix-ui/react-accordion";
import { Popover } from "@radix-ui/react-popover";
import React from "react";
import { IconChevronDown } from "@/components/ui/icons"
import { clsx } from "clsx";

interface AccordionItem {
  header: string,
  content: string;
}

const items: AccordionItem[] = [
  {
    header: "About",
    content: `
    This Demo is an example to showcase the power of RAG (Retrieval-Augmented Generation)
    though the use of a custom AI Chatbot designed for lawyers to do case research.
    It uses a supabase postgres database backend to store embeddings for chunks of case law text.
    Each chunk consists of roughly 400 tokens.`
  },
  {
    header: "Dataset and Limitations",
    content: "Content2"
  },
  {
    header: "How does it work?",
    content: "Content3"
  },
  {
    header: "Technology Stack",
    content: "Content3"
  }
]

interface AccordionProps { }

const MyAboutPageAccordion = (props: AccordionProps) => {
  return (
    <Accordion.Root
      type="single"
      className={clsx("space-y-4 w-full")}
      defaultValue="item-1">
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
      <div className="rounded-lg border bg-background p-8">
        <MyAboutPageAccordion/>
      </div>
    </div>
  )
}