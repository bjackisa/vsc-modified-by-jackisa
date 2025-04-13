import Image from "next/image";
import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Varsity Scholars Consult" showAuth={true} />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-indigo-600 py-20 text-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Welcome to Varsity Scholars Consult</h2>
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
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium text-center transition-colors border border-white"
              >
                Check Status
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <Image
              src="/graduation.svg"
              alt="Admission Portal"
              width={500}
              height={400}
              className="max-w-full h-auto"
              priority
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white text-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Your Academic Journey?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Join thousands of students who have successfully enrolled through our admission portal.</p>
          <Link
            href="https://varsityscholarsconsult.com/"
            className="text-white bg-blue-600 hover:bg-blue-100 px-8 py-3 rounded-md font-medium inline-block transition-colors"
          >
            Find All Our Ongoing scholarship here
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-blue-500">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Admission Portal</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Application Process</h3>
              <p className="text-gray-600">Our streamlined application process makes it easy to apply for admission to your desired programs.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track Your Application</h3>
              <p className="text-gray-600">Stay updated on your application status with real-time tracking and notifications.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Manage Documents</h3>
              <p className="text-gray-600">Upload and manage all your application documents in one secure location.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Continents Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Study Opportunities Around the World</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* North America */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/north-america.jpg"
                  alt="North America"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">North America</h3>
                <p className="text-gray-600">Explore prestigious universities in the USA and Canada with world-class education systems and research opportunities.</p>
              </div>
            </div>

            {/* Europe */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/europe.jpg"
                  alt="Europe"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Europe</h3>
                <p className="text-gray-600">Discover historic universities in the UK, Germany, France and more with diverse cultural experiences and academic excellence.</p>
              </div>
            </div>

            {/* Asia */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/asia.jpg"
                  alt="Asia"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Asia</h3>
                <p className="text-gray-600">Experience rapidly growing educational hubs in China, Japan, Singapore and more with innovative programs and cultural immersion.</p>
              </div>
            </div>

            {/* Australia */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-48">
                <Image
                  src="/australia.jpg"
                  alt="Australia"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">Australia & Oceania</h3>
                <p className="text-gray-600">Study in Australia and New Zealand with high-quality education, beautiful landscapes, and excellent quality of life.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
