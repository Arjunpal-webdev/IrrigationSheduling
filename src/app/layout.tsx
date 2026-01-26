import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'GreenGuard AI - Smart Irrigation & Crop Wellness',
    description: 'Nurturing fields with intelligence, cultivating a sustainable future.',
    keywords: ['agriculture', 'AI', 'irrigation', 'smart farming', 'crop management'],
    authors: [{ name: 'GreenGuard AI Team' }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>{children}</body>
        </html>
    );
}
