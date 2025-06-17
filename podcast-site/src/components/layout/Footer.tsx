import KeyboardShortcuts from '@/components/ui/KeyboardShortcuts';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              About
            </h3>
            <p className="mt-4 text-sm text-gray-600">
              Hanselminutes is a weekly talk show on tech with Scott Hanselman. 
              Fresh Air for Developers - bringing you the latest in technology and developer culture.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a 
                  href="https://hanselminutes.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Official Website
                </a>
              </li>
              <li>
                <a 
                  href="https://twitter.com/shanselman" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Scott on Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://hanselman.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Scott&apos;s Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              Subscribe
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a 
                  href="https://podcasts.apple.com/us/podcast/hanselminutes/id117488860" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Apple Podcasts
                </a>
              </li>
              <li>
                <a 
                  href="https://open.spotify.com/show/4SrTQKsAOGBMNKkJDV7hKp" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Spotify
                </a>
              </li>
              <li>
                <a 
                  href="https://hanselminutes.com/subscribe" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  RSS Feed
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} Hanselminutes. Built with Next.js and love for developers.
            </p>
            <KeyboardShortcuts />
          </div>
        </div>
      </div>
    </footer>
  );
}
