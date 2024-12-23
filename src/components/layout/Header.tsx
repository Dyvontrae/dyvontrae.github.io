import { Home } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-gray-900 border-b border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link 
          href="/"
          className="text-2xl font-bold text-white flex items-center gap-2 hover:text-blue-400 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span style={{
            textShadow: `
              1px 1px 0 #ff0000,
              -1px -1px 0 #00ff00,
              0 0 5px rgba(255,255,255,0.5)
            `,
            letterSpacing: '0.1em'
          }}>
            DYVONTRAE
          </span>
        </Link>

        <div className="text-sm text-gray-400">
          Admin Panel
        </div>
      </div>
    </header>
  );
}