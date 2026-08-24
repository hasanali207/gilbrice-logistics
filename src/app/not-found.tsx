// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-blue-600">404</h1>
        <p className="text-gray-700 text-lg">Oops! Page not found.</p>
        <Link
          href="/"
          className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Go back to Home
        </Link>
      </div>
    </div>
  );
}
