/*import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
<<<<<<< HEAD
import { Toaster } from "sonner";

=======

export const metadata: Metadata = {
  title: "CheckItRight — Know What You Buy. Check It Right.",
  description:
    "CheckItRight is an AI-assisted platform that scans packaged product labels and checks their declarations against Legal Metrology (Packaged Commodities) Rules, 2011.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY ? (
          <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
            {children}
          </ClerkProvider>
        ) : (
          <>{children}</>
        )}
      </body>
    </html>
  );
}
>>>>>>> 8df15bc (Update reviewer UI)
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CheckItRight — Know What You Buy. Check It Right.",
  description:
    "CheckItRight is an AI-assisted platform that scans packaged product labels and checks their declarations against Legal Metrology (Packaged Commodities) Rules, 2011.",
};

<<<<<<< HEAD
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
=======
export default function RootLayout({ children }: { children: React.ReactNode }) {
>>>>>>> 8df15bc (Update reviewer UI)
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
<<<<<<< Updated upstream
        <ClerkProvider>
          {children}
          <Toaster position="top-right" richColors />
        </ClerkProvider>
=======
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY ? (
          <ClerkProvider>
            {children}
          </ClerkProvider>
        ) : (
          <>{children}</>
        )}
      </body>
    </html>
  );
}*/


import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CheckItRight — Know What You Buy. Check It Right.",
  description:
    "CheckItRight is an AI-assisted platform that scans packaged product labels and checks their declarations against Legal Metrology (Packaged Commodities) Rules, 2011.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
        process.env.CLERK_SECRET_KEY ? (
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          >
            {children}
          </ClerkProvider>
        ) : (
          <>{children}</>
        )}
>>>>>>> Stashed changes
      </body>
    </html>
  );
}