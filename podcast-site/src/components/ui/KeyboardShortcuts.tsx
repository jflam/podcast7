'use client';

import { useState } from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsProps {
  className?: string;
}

export default function KeyboardShortcuts({ className }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: 'Space', description: 'Play/Pause' },
    { key: '←', description: 'Skip back 10 seconds' },
    { key: '→', description: 'Skip forward 10 seconds' },
    { key: '↑', description: 'Volume up' },
    { key: '↓', description: 'Volume down' },
    { key: 'R', description: 'Change playback speed' },
    { key: 'Esc', description: 'Close player' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`p-2 text-gray-500 hover:text-gray-700 transition-colors ${className}`}
        aria-label="Show keyboard shortcuts"
        title="Keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {shortcuts.map((shortcut) => (
                  <div key={shortcut.key} className="flex justify-between items-center">
                    <span className="text-gray-600">{shortcut.description}</span>
                    <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                      {shortcut.key}
                    </kbd>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Shortcuts work when the audio player is open and you&apos;re not typing in an input field.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
