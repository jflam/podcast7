import Link from 'next/link';
import { Headphones } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <Link href="/" className="flex items-center space-x-2">
            <Headphones className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Hanselminutes</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Fresh Air for Developers</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Episodes
            </Link>
            <a 
              href="https://hanselminutes.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Website
            </a>
            <a 
              href="/api/episodes" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-700 hover:text-blue-600 transition-colors text-sm"
            >
              RSS
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
