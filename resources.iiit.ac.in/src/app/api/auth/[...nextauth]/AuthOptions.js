import prisma from '@/utils/connect';
import CredentialProvider  from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'

export const authOptions = {
    pages:{
        signIn: "/login"
    },
    providers: [
        CredentialProvider({
            name: "credentials",    
            credentials: {
                email: {
                    label: 'email',
                    type: 'text'
                },
                password: {
                    label: 'password',
                    type: 'password'
                }
            },
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password){
                    throw new Error('Invaid Email or password')
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email
                    }
                });
                if(!user || !user?.password){
                    throw new Error('Invaid Email or password')
                }
                const isCorrectPassword = await bcrypt.compare(credentials.password, user.password)
                if(!isCorrectPassword){
                    throw new Error('Invaid Email or password')
                }

                return user;
            }
            })
    ],
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET

};