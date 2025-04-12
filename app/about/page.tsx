import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header title="Varsity Scholars Consult" showAuth={true} />

      <main className="flex-grow container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">About Varsity Scholars Consult</h1>

        <div className="prose lg:prose-xl">
          <p>
            Varsity Scholars Consult is a leading educational consultancy dedicated to helping students
            achieve their academic goals through personalized guidance and support.
          </p>

          <h2>Our Mission</h2>
          <p>
            Our mission is to empower students with the knowledge, resources, and support they need
            to navigate the complex world of higher education and secure admissions to their dream
            institutions.
          </p>

          <h2>Our Services</h2>
          <ul>
            <li>University application assistance</li>
            <li>Scholarship guidance</li>
            <li>Document preparation and verification</li>
            <li>Interview coaching</li>
            <li>Post-admission support</li>
          </ul>

          <h2>Why Choose Us</h2>
          <p>
            With years of experience and a team of dedicated professionals, we have helped thousands
            of students secure admissions to prestigious institutions around the world. Our personalized
            approach ensures that each student receives the attention and guidance they need to succeed.
          </p>
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
