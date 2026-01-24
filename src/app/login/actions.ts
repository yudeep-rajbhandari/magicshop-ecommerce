// src/app/login/actions.ts
import {signIn} from "next-auth/react";
import {AuthError} from "next-auth";

export async function authenticate(prevState: string | undefined, formData: FormData) {
    try {
        // Remove redirectTo here. We want to handle it in the component.
        await signIn('credentials', {
            ...Object.fromEntries(formData),
            redirect: false, // Tell Auth.js not to redirect automatically
        });
        return "SUCCESS"; // Return a success string
    } catch (error) {
        if (error instanceof AuthError) {
            return 'Invalid credentials.';
        }
        return 'Something went wrong.';
    }
}