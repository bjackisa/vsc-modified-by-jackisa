import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-2xl font-bold text-gray-800">
              Admission Portal
            </Link>
            <nav className="hidden md:flex ml-8">
              <ul className="flex gap-6">
                <li>
                  <Link 
                    href="/student/dashboard" 
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/student/apply" 
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Apply
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      
      <footer className="bg-gray-800 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} Admission Portal. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
