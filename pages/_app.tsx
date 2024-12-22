import type { AppProps } from 'next/app';
import Footer from '@/components/layout/Footer';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen">
      <Component {...pageProps} />
      <Footer />
    </div>
  );
}