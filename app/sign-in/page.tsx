'use client'
import { auth } from '@/auth'
import { LoginButton } from '@/components/login-button'
import { redirect } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react';
// import { useEffect } from 'react';

export default async function SignInPage() {
  
  const session = await auth();
  
  const handleDummyLogin = async () => {
    try {
      // Use the signIn function to simulate a login with dummy credentials
      await signIn('Credentials', {
        username: 'user',
        password: 'pass',
        callbackUrl: '/',
      });
    } catch (error) {
      console.error('Dummy login failed:', error);
    }
  };

  // Call the dummy login function when the page loads
  handleDummyLogin();

  // redirect to home if user is already logged in
  if (session?.user) {
    redirect('/')
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center py-10">
      <LoginButton />
    </div>
  )
}
