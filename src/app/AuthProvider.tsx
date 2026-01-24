
'use client';

import { SessionProvider } from 'next-auth/react';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    // The SessionProvider provides the session context to all its children.
    return <SessionProvider refetchInterval={5 * 60}
                            refetchOnWindowFocus={true}>{children}</SessionProvider>;
}
