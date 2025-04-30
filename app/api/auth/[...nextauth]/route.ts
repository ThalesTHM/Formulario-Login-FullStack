import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import NextAuth, { SessionStrategy, DefaultSession, AuthOptions } from "next-auth"
import { addIpTry, checkIpTries } from "@/lib/server-utils"
import bcrypt from "bcrypt";


declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT { id?: string }
}

type _RawCbs = AuthOptions["callbacks"];

// 2) Extract just the `jwt` and `session` function types  
type JWTCallback = NonNullable<NonNullable<_RawCbs>["jwt"]>;  
type SessionCallback = NonNullable<NonNullable<_RawCbs>["session"]>;

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
    async jwt( 
      params: Parameters<JWTCallback>[0] 
    ) {
      const { token, user } = params;
      if (user) token.id = user.id;
      return token;              
    },

    async session(
      params: Parameters<SessionCallback>[0]
    ) {
      const { session, token } = params;
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;            
    }
  }
}

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }