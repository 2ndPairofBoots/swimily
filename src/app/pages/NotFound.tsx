import { Link } from 'react-router';
import { Droplets } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center">
        <Droplets className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-slate-600 mb-6">Page not found</p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
