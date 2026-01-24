import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/admin');
            const isOnAdminPath = nextUrl.pathname.startsWith('/admin');
            if (isOnAdminPath) {
                if (isLoggedIn) return true;
                return false; // Redirects to the login page defined above
            }
            if (isOnDashboard) {
                return isLoggedIn;
                 // Redirect unauthenticated users to login page
            }
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;