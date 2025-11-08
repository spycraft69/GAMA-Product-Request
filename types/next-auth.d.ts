import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      role: 'NONPROFIT' | 'EDUCATIONAL' | 'MANUFACTURER'
    }
  }

  interface User {
    role: 'NONPROFIT' | 'EDUCATIONAL' | 'MANUFACTURER'
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'NONPROFIT' | 'EDUCATIONAL' | 'MANUFACTURER'
  }
}

