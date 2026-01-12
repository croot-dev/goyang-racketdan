import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import '@/styles/globals.css'
import { Provider as ChakraProvider } from '@/components/ui/provider'
import TanstackProvider from './tanstackProvider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: '고양 라켓단 - 테니스 초보자 모임',
  description: '테니스 초보자들의 즐거운 모임, 고양 라켓단입니다. 함께 배우고 성장하는 테니스 커뮤니티에 참여하세요!',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ChakraProvider>
          <TanstackProvider>{children}</TanstackProvider>
        </ChakraProvider>
      </body>
    </html>
  )
}
