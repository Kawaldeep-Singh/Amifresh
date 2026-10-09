import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConnect from './mongodb';
import User from '@/models/User';
import { verifyPassword } from './auth/password';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        loginId: { label: 'Login ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.loginId || !credentials?.password) {
          throw new Error('Please provide both login ID and password');
        }

        await dbConnect();

        const user = await User.findOne({ 
          $or: [
            { email: credentials.loginId },
            { loginId: credentials.loginId }
          ]
        }).select('+password +mustChangePassword');

        if (!user) {
          throw new Error('Invalid login ID or password');
        }

        if (user.status === 'BLOCKED') {
          throw new Error('Your account has been blocked');
        }

        if (user.status === 'REJECTED') {
          throw new Error('Your registration was rejected');
        }

        if (user.status === 'INACTIVE') {
          throw new Error('Your account is inactive');
        }

        if (user.status === 'PENDING') {
          throw new Error('Your registration is pending approval');
        }

        const isPasswordMatch = await verifyPassword(credentials.password, user.password!);

        if (!isPasswordMatch) {
          throw new Error('Invalid login ID or password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          referralCode: user.referralCode,
          mustChangePassword: user.mustChangePassword,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.referralCode = user.referralCode;
        token.mustChangePassword = (user as any).mustChangePassword;
      }
      
      if (trigger === 'update' && session) {
        if (session.mustChangePassword !== undefined) {
          token.mustChangePassword = session.mustChangePassword;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.referralCode = token.referralCode;
        (session.user as any).mustChangePassword = token.mustChangePassword;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 48 * 60 * 60, // 48 hours
  },
  secret: process.env.AUTH_SECRET,
};
