import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      organisation: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    organisation: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    organisation: string;
  }
}
