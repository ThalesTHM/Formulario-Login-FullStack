import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import NextAuth, { Session, SessionStrategy, TokenSet } from "next-auth"
import { User } from "@/generated/prisma"
import { addIpTry, checkIpTries } from "@/lib/server-utils"

let bcrypt = require('bcrypt')

export const authConfig = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if(!(await checkIpTries(req))) throw new Error("TOO_MANY_TRIES");;
        
        await addIpTry(req)

        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        })

        if (!user) throw new Error("INVALID_CREDENTIALS");

        const passwordCorrect = await bcrypt.compare(credentials.password, user.password)

        if (!passwordCorrect) throw new Error("INVALID_CREDENTIALS");

        return { id: user.id, username: user.username }
      }
    })
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  pages: {
    signIn: "/auth/login",
    error:  "/auth/login"
  },
  secret: process.env.NEXT_PUBLIC_AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        Object.assign(session, {
          id: token.id,
        })
      }
      return session
    }
  }
}

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }