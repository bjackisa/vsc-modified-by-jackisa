'use client';

import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  isAdmin?: boolean;
  isStudent?: boolean;
  role?: string;
  showAuth?: boolean;
}

export default function Layout({
  children,
  title,
  isAdmin = false,
  isStudent = false,
  role = '',
  showAuth = true,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title={title}
        isAdmin={isAdmin}
        isStudent={isStudent}
        role={role}
        showAuth={showAuth}
      />

      <main className="flex-grow container mx-auto px-4 py-8 w-full max-w-full sm:px-6 lg:px-8">
        <div className="w-full overflow-hidden">
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
