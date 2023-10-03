import { UseChatHelpers } from 'ai/react'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ExternalLink } from '@/components/external-link'
import { IconArrowRight } from '@/components/ui/icons'

const exampleMessages = [
  {
    heading: 'Look for previous case law to do with amazon and online monopolies',
    message: `Look for case law concerning the dominance of Amazon in the online retail space and monopoly of online marketplaces\n`
  },
  {
    heading: `I'm looking for privacy concerns regarding apps and advertisements`,
    message: `Find case law for for any companies that have violated privacy concerns regarding apps and advertisements.\n`
  },
  {
    heading: `I'm interested in electronic payment fraud`,
    message: `Look for case law to do with electronic payment fraud.\n`
  }
]

export function EmptyScreen({ setInput }: Pick<UseChatHelpers, 'setInput'>) {
  return (
    <div className="mx-auto max-w-2xl px-4">
      <div className="rounded-lg border bg-background p-8">
        <h1 className="mb-2 text-lg font-semibold">
          Welcome to my custom AI Chatbot designed for lawyers to do case research!
        </h1>
        <p className="mb-2 leading-normal text-muted-foreground">
          Please read the about page <Link href="/about" target="_blank" rel="nofollow">here</Link> for more information on limitations and dataset.
        </p>
        <p className="leading-normal text-muted-foreground">
          You can start a conversation here or try the following examples:
        </p>
        <div className="mt-4 flex flex-col items-start space-y-2">
          {exampleMessages.map((message, index) => (
            <Button
              key={index}
              variant="link"
              className="h-auto p-0 text-base"
              onClick={() => setInput(message.message)}
            >
              <IconArrowRight className="mr-2 text-muted-foreground" />
              {message.heading}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
