import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-12 max-w-2xl text-center">
        <div className="mb-6">
          <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Cloud Storage App
        </h1>
        <p className="text-gray-600 mb-8 text-lg">
          Simpan file Anda dengan aman dan bagikan dengan mudah
        </p>

        <Link
          href="/dashboard"
          className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium text-lg"
        >
          🚀 Mulai Upload
        </Link>

        <div className="mt-6 text-sm text-gray-400">
          Powered by Filebase + Next.js
        </div>
      </div>
    </div>
  );
}
