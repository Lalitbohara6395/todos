import Link from 'next/link'; // Import the Link component to enable internal navigation between pages

export default function AboutPage() { // Define the functional component for the About page
  return ( // Return the HTML-like JSX structure for the page
    <div className="min-h-screen bg-white p-20 flex flex-col items-center text-center"> {/* A full-height, white background container with padding and centered content */}
      <h1 className="text-4xl font-extrabold mb-4 text-slate-800">About This Project</h1> {/* Large, bold header for the page title */}
      <p className="text-xl text-slate-600 max-w-lg mb-8"> {/* Medium-sized text for the project description, limited in width for readability */}
        This application was built specifically to teach the fundamentals of Next.js App Router,
        MongoDB database interaction, and how to structure a modern full-stack application.
      </p>
      <Link href="/" className="bg-slate-800 text-white px-6 py-3 rounded-full hover:bg-slate-700 transition font-semibold"> {/* A styled navigation link back to the homepage */}
        Back to Todo List
      </Link>
    </div>
  );
}
