import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from "@clerk/nextjs";
import '../globals.css'
import Topbar from '@/components/shared/Topbar';
import LeftSidebar from '@/components/shared/LeftSidebar';
import RightSidebar from '@/components/shared/RightSidebar';
import Bottombar from '@/components/shared/Bottombar';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Toaster } from "@/components/ui/toaster"


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Oraz.io",
  description: "An online consciergerie for airbnb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      //appearance={{baseTheme: dark}}
    >
      <html lang='en'>
        <body className={inter.className}>
          <Topbar />

          <main className='flex flex-row'>
            <LeftSidebar />
            <section className='main-container'>
              <div className='w-full max-w-4xl'>{children}</div>
            </section>
            {/* @ts-ignore */}
            {/* <RightSidebar /> */}
            
          </main>

          <Bottombar />
          <SpeedInsights />
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  )
}
