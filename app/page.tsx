import Link from "next/link";
import { ArrowRight, Shield, Zap, Globe, FolderOpen } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Shield size={16} />
            <span>Secure Cloud Storage</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Simpan & Bagikan File
            <br />
            <span className="text-blue-600">Dengan Aman</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            Platform penyimpanan cloud yang aman dan mudah digunakan. Upload, kelola, dan bagikan file Anda dengan cepat.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-lg font-medium shadow-lg hover:shadow-xl"
          >
            Mulai Sekarang
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cepat & Responsif</h3>
            <p className="text-gray-500">Upload dan akses file Anda dengan kecepatan tinggi dari mana saja.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aman & Terenkripsi</h3>
            <p className="text-gray-500">File Anda dilindungi dengan enkripsi tingkat tinggi.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Bagikan dengan Mudah</h3>
            <p className="text-gray-500">Buat link share dan bagikan file ke siapa saja.</p>
          </div>
        </div>
      </div>
    </div>
  );
      }
