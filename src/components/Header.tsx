import React from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header(): React.JSX.Element {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          dev.log
        </Link>
        <div className="flex items-center gap-6">
          <nav>
            <ul className="flex gap-8 text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <li>
                <Link href="/" className="hover:text-gray-900 dark:hover:text-white transition-colors">
                  Home
                </Link>
              </li>
            </ul>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
