import Link from 'next/link';

export default function OccupationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">
              AI Youni
            </Link>
            <nav className="flex gap-4">
              <Link href="/" className="hover:text-indigo-200 transition-colors">
                Home
              </Link>
              <Link href="/occupations" className="hover:text-indigo-200 transition-colors font-medium">
                Occupations
              </Link>
              <Link href="/career-explorer" className="hover:text-indigo-200 transition-colors">
                Career Explorer
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow py-8 bg-gray-50">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 p-4">
        <div className="container mx-auto text-center text-sm">
          <p>Occupation data provided by <a href="https://www.onetonline.org/" target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200">O*NET Online</a>, a resource of the U.S. Department of Labor's Employment and Training Administration.</p>
          <p className="mt-2">© {new Date().getFullYear()} AI Youni. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
} 