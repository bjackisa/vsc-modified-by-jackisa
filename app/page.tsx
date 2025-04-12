import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Admission Portal</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/sign-in"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Sign Up
            </Link>
            <Link
              href="/direct-admin"
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Admin Setup
            </Link>
            <Link
              href="/setup-clerk-admin"
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Clerk Admin Setup
            </Link>
            <Link
              href="/check-role"
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Check Role
            </Link>
            <Link
              href="/api/admin/setup-super-admin"
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Setup Super Admin
            </Link>
            <Link
              href="/api/set-admin-role"
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Set Admin Role
            </Link>
            <Link
              href="/api/set-email-admin"
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Set qudmeet@gmail.com as Admin
            </Link>
            <Link
              href="/api/set-db-admin"
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Set DB Admin
            </Link>
            <Link
              href="/admin-tools"
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Admin Tools
            </Link>
            <Link
              href="/api/create-new-admin"
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Create New Admin
            </Link>
            <Link
              href="/admin-setup"
              className="text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              Admin Setup
            </Link>
            <Link
              href="/admin-auth"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors font-bold"
            >
              Admin Portal
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-indigo-600 py-20 flex-grow">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-white mb-10 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Our Admission Portal</h2>
            <p className="text-xl mb-8">Apply for admission, track your application status, and manage your documents all in one place.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/student/apply"
                className="bg-white text-blue-600 hover:bg-gray-100 px-6 py-3 rounded-md font-medium text-center transition-colors"
              >
                Apply Now
              </Link>
              <Link
                href="/student/dashboard"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 px-6 py-3 rounded-md font-medium text-center transition-colors"
              >
                Check Status
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <Image
              src="/graduation.svg"
              alt="Graduation"
              width={500}
              height={400}
              className="max-w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Why Choose Our Portal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Application</h3>
              <p className="text-gray-600">Simple and straightforward application process with step-by-step guidance.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Document Management</h3>
              <p className="text-gray-600">Upload and manage all your documents securely in one place.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Get instant notifications about your application status and next steps.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Admission Portal</h2>
              <p className="text-gray-400 mt-1">© {new Date().getFullYear()} All rights reserved</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
