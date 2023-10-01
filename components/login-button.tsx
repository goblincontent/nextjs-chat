'use client'

import * as React from 'react'
import { signIn } from 'next-auth/react'

import { cn } from '@/lib/utils'
import { Button, type ButtonProps } from '@/components/ui/button'
import { IconSpinner } from '@/components/ui/icons'

interface LoginButtonProps extends ButtonProps {
  text?: string
}

export function LoginButton({
  text = 'Login',
  className,
  ...props
}: LoginButtonProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Simulate a dummy login on the client side
      await signIn('credentials', {
        id: 1,
        username: 'user',
        password: 'pass',
        callbackUrl: '/',
      });
    } catch (error) {
      console.error('Dummy login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  React.useEffect(() => {
    handleLogin();
  })
  return (
    <Button
      variant="outline"
      onClick={() => {
        setIsLoading(true)
        // next-auth signIn() function doesn't work yet at Edge Runtime due to usage of BroadcastChannel
        // signIn('github', { callbackUrl: `/` })
        // signIn('Credentials', {"redirect": false, "username": "user", "password": "pass", callbackUrl: `/`})
      }}
      disabled={isLoading}
      className={cn(className)}
      {...props}
    >
      {isLoading ? (
        <IconSpinner className="mr-2 animate-spin" />
      ) : null}
      {text}
    </Button>
  )
}
