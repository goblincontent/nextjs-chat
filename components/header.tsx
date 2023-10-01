import * as React from 'react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { auth } from '@/auth'
import { clearChats } from '@/app/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { SidebarList } from '@/components/sidebar-list'
import {
  IconGitHub,
  IconNextChat,
  IconOpenAI,
  IconSeparator,
  IconVercel
} from '@/components/ui/icons'
import { SidebarFooter } from '@/components/sidebar-footer'
import { ThemeToggle } from '@/components/theme-toggle'
import { ClearHistory } from '@/components/clear-history'
import { UserMenu } from '@/components/user-menu'
import { LoginButton } from '@/components/login-button'
import { signIn } from 'next-auth/react';

export async function Header() {
  const session = await auth()
  
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between w-full h-16 px-4 border-b shrink-0 bg-gradient-to-b from-background/10 via-background/50 to-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center">
          {session?.user ? (
            <Sidebar>
              <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
                {/* @ts-ignore */}
                <SidebarList userId={session?.user?.name} />
              </React.Suspense>
              <SidebarFooter>
                <ThemeToggle />
                <ClearHistory clearChats={clearChats} />
              </SidebarFooter>
            </Sidebar>
          ) : null}
  
          <Link href="/">
            <div className="flex items-center">
              <IconOpenAI className="w-6 h-6 ml-2 mr-2" />
              <span>Case Law Chatbot Demo</span>
            </div>
          </Link>
        </div>
  
        <div className="flex items-center">
          <Button variant="secondary" className="mr-4">
            <Link href="/about">About</Link>
          </Button>
  
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <Button variant="ghost" asChild className="ml-2">
              <Link href="/sign-in?callbackUrl=/">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}


