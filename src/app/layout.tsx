import type { ReactNode } from 'react'
import { DM_Sans, Inter, JetBrains_Mono } from 'next/font/google'
import { NextAppDirEmotionCacheProvider } from '@/lib/theme/EmotionCache'
import { AppThemeProvider } from '@/lib/theme/ThemeProvider'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans'
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter'
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono'
})

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
          <AppThemeProvider>{children}</AppThemeProvider>
        </NextAppDirEmotionCacheProvider>
      </body>
    </html>
  )
}
