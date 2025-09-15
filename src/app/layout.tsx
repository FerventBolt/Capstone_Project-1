import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CTE SkillsHub - Career & Technical Education Platform',
  description: 'A comprehensive learning management system for Career and Technical Education with TESDA certification management.',
  keywords: ['CTE', 'TESDA', 'Education', 'Certification', 'Learning Management'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}