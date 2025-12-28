import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MasterLayout from '@/components/MasterLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Python NextGen Course',
    description: 'The future of interactive learning',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="he" dir="rtl">
            <body className={inter.className}>
                <MasterLayout>
                    {children}
                </MasterLayout>
            </body>
        </html>
    )
}
