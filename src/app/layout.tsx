import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "./theme";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import Navbar from "@/app/admin/navbar";
import AuthProvider from "@/app/AuthProvider";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Magic Shop Nepal",
  description: "Hello World",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      ><AppRouterCacheProvider>
        <ThemeProvider theme={theme}>

            <AuthProvider >

            <Navbar/>
            <CssBaseline />
            {children}
            </AuthProvider>


        </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
