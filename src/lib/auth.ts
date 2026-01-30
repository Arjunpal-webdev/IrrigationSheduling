import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';

// Mock user storage (replace with actual database)
const users: { email: string; password: string; name: string }[] = [];

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log('Missing credentials');
                    return null;
                }

                console.log('Attempting to find user:', credentials.email);
                console.log('Current users in array:', users.length);

                const user = users.find((u) => u.email === credentials.email);

                if (!user) {
                    console.log('User not found in array');
                    return null;
                }

                console.log('User found, comparing passwords');
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    console.log('Password comparison failed');
                    return null;
                }

                console.log('Authentication successful for:', user.email);
                return {
                    id: user.email,
                    email: user.email,
                    name: user.name,
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            authorization: {
                params: {
                    prompt: 'consent',
                    access_type: 'offline',
                    response_type: 'code'
                }
            }
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production',
};

// Export function to add users (for registration)
export async function registerUser(email: string, password: string, name: string) {
    console.log('Registering user:', email);
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword, name });
    console.log('User added to array. Total users:', users.length);
}

// Export function to delete user
export function deleteUser(email: string): boolean {
    console.log('Deleting user:', email);
    const index = users.findIndex((u) => u.email === email);
    if (index !== -1) {
        users.splice(index, 1);
        console.log('User deleted. Total users:', users.length);
        return true;
    }
    console.log('User not found for deletion');
    return false;
}

