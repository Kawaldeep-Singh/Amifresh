import { DefaultSession } from 'next-auth';
import { UserRole, UserStatus } from '@/models/User';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
      referralCode: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: UserRole;
    status: UserStatus;
    referralCode: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    referralCode: string;
  }
}
