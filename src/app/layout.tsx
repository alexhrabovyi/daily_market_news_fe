import type { Metadata } from 'next';
import '@/styles/globals.css';
import interVar from '@/fontsSetup/fontsSetup';
import ReduxProvider from '@/api/ReduxProvider/ReduxProvider';

export const metadata: Metadata = {
  title: 'digestify',
  description: 'All your markets, one clear view',
};

interface RootLayoutProps {
  readonly children: React.ReactNode,
}

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="uk"
      className={`${interVar} antialiased>`}
    >
      <body
        className="w-full min-h-screen"
      >
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
