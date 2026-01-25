'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button, Skeleton } from '@mui/material';
import { useState, useEffect } from 'react';

export default function LoginLogoutButton() {
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);

    // Fix hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // 1. While the session is fetching, show a Skeleton placeholder
    if (!mounted || status === 'loading') {
        return (
            <Skeleton
                variant="rectangular"
                width={80}
                height={36}
                sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1 }}
            />
        );
    }

    // 2. Logged In State
    if (session) {
        return (
            <Button sx={{ color: '#fff' }} onClick={() => signOut({ callbackUrl: '/' })}>
                Logout
            </Button>
        );
    }

    // 3. Logged Out State
    return (
        <Button sx={{ color: '#fff' }} onClick={() => signIn()}>
            Login
        </Button>
    );
}