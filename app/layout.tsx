import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Link from 'next/link'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'FC Zürich Affoltern – Anwesenheiten',
  description: 'Trainings- und Turnier-Anwesenheiten tracken',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${jakarta.variable} h-full`}>
      <body className="min-h-full bg-background antialiased">
        <header className="border-b border-border/60 bg-card/80 backdrop-blur sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-extrabold text-base tracking-tight text-foreground hover:text-primary transition-colors">
              FC Zürich Affoltern Fb
            </Link>
            <nav className="flex gap-1">
              <Link href="/" className="text-sm font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Übersicht
              </Link>
              <Link href="/report" className="text-sm font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                Report
              </Link>
            </nav>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
