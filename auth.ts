import NextAuth, { type DefaultSession } from 'next-auth';
// import GitHub from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials';

declare module 'next-auth' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
    } & DefaultSession['user']
  } 
}


export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental
} = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "user" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        const user = { id: "1", name: "user", email: "user@example.com"  }
  
        if (user) {
          return user
        } else {
          return null
  
        }
      }
    })
  ],
  callbacks: {
        jwt({ token, profile }) {
          if (profile) {
            token.id = profile.id
            token.image = profile.avatar_url || profile.picture
          }
          return token
        },
        authorized({ auth }) {
          return !!auth?.user // this ensures there is a logged in user for -every- request
        }
      },
      pages: {
        signIn: '/sign-in' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
      }
});

// export const {
//   handlers: { GET, POST },
//   auth,
//   CSRF_experimental // will be removed in future
// } = NextAuth({
//   providers: [GitHub],
//   callbacks: {
//     jwt({ token, profile }) {
//       if (profile) {
//         token.id = profile.id
//         token.image = profile.avatar_url || profile.picture
//       }
//       return token
//     },
//     authorized({ auth }) {
//       return !!auth?.user // this ensures there is a logged in user for -every- request
//     }
//   },
//   pages: {
//     signIn: '/sign-in' // overrides the next-auth default signin page https://authjs.dev/guides/basics/pages
//   }
// })
