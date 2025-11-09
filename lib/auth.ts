import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

const ALLOWED_ROLES = ['NONPROFIT', 'EDUCATIONAL', 'MANUFACTURER'] as const
type AllowedRole = typeof ALLOWED_ROLES[number]

function normalizeRole(role: string): AllowedRole | null {
  return (ALLOWED_ROLES as readonly string[]).includes(role) ? (role as AllowedRole) : null
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        const role = normalizeRole(user.role)
        if (!role) {
          console.warn(`User ${user.id} has unsupported role "${user.role}"`)
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as 'NONPROFIT' | 'EDUCATIONAL' | 'MANUFACTURER'
        if (typeof token.sub === 'string') {
          session.user.id = token.sub
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
}

