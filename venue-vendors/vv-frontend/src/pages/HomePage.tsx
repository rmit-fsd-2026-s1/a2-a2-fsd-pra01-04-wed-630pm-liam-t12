import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import type { Venue } from '../types';

export default function HomePage() {
  const [featured, setFeatured] = useState<Venue[]>([]);

  useEffect(() => {
    api.get('/venues/featured').then(r => setFeatured(r.data)).catch(() => {});
  }, []);

  return (
    <div className="text-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-24 px-6 text-center">
        <h1 className="text-5xl font-bold text-amber-400 mb-4">Find Your Perfect Venue</h1>
        <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-8">
          Melbourne's premier venue booking platform. Connect hirers with extraordinary spaces for every occasion.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/signup" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition">
            Get Started
          </Link>
          <Link to="/login" className="border border-amber-500 text-amber-400 hover:bg-amber-500 hover:text-white px-8 py-3 rounded-lg font-semibold text-lg transition">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-900">
        <h2 className="text-3xl font-bold text-center text-amber-400 mb-12">Why VenueVendors?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            { icon: '🏛️', title: 'Premium Venues', desc: 'Browse hundreds of curated Melbourne venues across every suburb and style.' },
            { icon: '📅', title: 'Easy Booking', desc: 'Submit booking requests in minutes and track status in real time.' },
            { icon: '⭐', title: 'Trusted Reviews', desc: 'Reputation scores and compliance ratings keep both hirers and vendors accountable.' },
          ].map(f => (
            <div key={f.title} className="bg-gray-800 rounded-xl p-6 text-center border border-gray-700">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold text-amber-400 mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Venues */}
      {featured.length > 0 && (
        <section className="py-16 px-6 bg-gray-950">
          <h2 className="text-3xl font-bold text-center text-amber-400 mb-12">Featured Venues</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {featured.map(v => (
              <div key={v.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-amber-500 transition">
                <img src={v.image} alt={v.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white">{v.name}</h3>
                  <p className="text-gray-400 text-sm">{v.location}</p>
                  <p className="text-amber-400 text-sm mt-1">${v.pricePerHour}/hr · Up to {v.capacity} guests</p>
                  <p className="text-gray-500 text-xs mt-1">{v.suitability}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}