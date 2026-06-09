import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import type { Venue, Booking, HireRecord, PreferredVenue, ComplianceDocument } from '../types';

const TABS = ['venues', 'preferred', 'bookings', 'history', 'documents', 'profile'] as const;
type Tab = typeof TABS[number];

const KEYWORDS = ['wedding', 'birthday', 'conference', 'dinner', 'concert', 'exhibition', 'party', 'seminar'];

export default function HirerDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('venues');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [history, setHistory] = useState<HireRecord[]>([]);
  const [preferred, setPreferred] = useState<PreferredVenue[]>([]);
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [search, setSearch] = useState('');
  const [keyword, setKeyword] = useState('');
  const [suitableVenues, setSuitableVenues] = useState<Venue[]>([]);
  const [bookingForm, setBookingForm] = useState({ venueId: '', eventName: '', guestCount: '', date: '', time: '', duration: '' });
  const [bookingMsg, setBookingMsg] = useState('');
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '', avatarUrl: user?.avatarUrl || '' });
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [v, b, h, p, d] = await Promise.all([
      api.get('/venues').catch(() => ({ data: [] })),
      api.get('/bookings').catch(() => ({ data: [] })),
      api.get('/bookings/history').catch(() => ({ data: [] })),
      api.get('/hirer/preferred').catch(() => ({ data: [] })),
      api.get('/hirer/documents').catch(() => ({ data: [] })),
    ]);
    setVenues(v.data); setBookings(b.data);
    setHistory(h.data); setPreferred(p.data); setDocuments(d.data);
  };

  const searchKeyword = async (kw: string) => {
    setKeyword(kw);
    if (!kw) { setSuitableVenues([]); return; }
    const res = await api.get(`/venues/suitability?keyword=${kw}`).catch(() => ({ data: [] }));
    setSuitableVenues(res.data);
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingMsg('');
    try {
      await api.post('/bookings', bookingForm);
      setBookingMsg('✅ Booking request submitted!');
      setBookingForm({ venueId: '', eventName: '', guestCount: '', date: '', time: '', duration: '' });
      loadAll();
    } catch (err: any) { setBookingMsg('❌ ' + (err.response?.data?.message || 'Failed')); }
  };

  const togglePreferred = async (venueId: number) => {
    const exists = preferred.find(p => p.venueId === venueId);
    if (exists) {
      await api.delete(`/hirer/preferred/${venueId}`);
    } else {
      await api.post('/hirer/preferred', { venueId, rank: preferred.length + 1 });
    }
    const res = await api.get('/hirer/preferred');
    setPreferred(res.data);
  };

  const uploadDoc = async (docType: string, file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      await api.post('/hirer/documents', { docType, fileName: file.name, fileUrl: reader.result });
      const res = await api.get('/hirer/documents');
      setDocuments(res.data);
    };
    reader.readAsDataURL(file);
  };

  const complianceScore = () => {
    const types = new Set(documents.map(d => d.docType));
    const required = ['drivers_license', 'insurance', 'business_certificate'];
    return Math.round((required.filter(t => types.has(t)).length / required.length) * 5);
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/auth/profile', profile);
      setProfileMsg('✅ Profile updated!');
    } catch { setProfileMsg('❌ Update failed'); }
  };

  const filtered = venues.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.location.toLowerCase().includes(search.toLowerCase()) ||
    v.suitability?.toLowerCase().includes(search.toLowerCase())
  );

  const stars = complianceScore();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-amber-400 mb-6">Hirer Dashboard</h1>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg capitalize text-sm font-medium transition ${tab === t ? 'bg-amber-500 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* VENUES TAB */}
        {tab === 'venues' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-6">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search venues by name, location, suitability..."
                className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500" />
            </div>
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-2">Check suitability by keyword:</p>
              <div className="flex flex-wrap gap-2">
                {KEYWORDS.map(kw => (
                  <button key={kw} onClick={() => searchKeyword(keyword === kw ? '' : kw)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${keyword === kw ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                    {kw}
                  </button>
                ))}
              </div>
              {keyword && (
                <p className="text-sm text-amber-400 mt-2">{suitableVenues.length} venue(s) suitable for "{keyword}"</p>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(keyword ? suitableVenues : filtered).map(v => (
                <div key={v.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-amber-500 transition">
                  <img src={v.image || 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600'} alt={v.name} className="w-full h-44 object-cover" />
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-white">{v.name}</h3>
                      <button onClick={() => togglePreferred(v.id)}
                        className={`text-xl ${preferred.find(p => p.venueId === v.id) ? 'text-amber-400' : 'text-gray-600'}`}>★</button>
                    </div>
                    <p className="text-gray-400 text-sm">{v.location}</p>
                    <p className="text-amber-400 text-sm">${v.pricePerHour}/hr · {v.capacity} guests</p>
                    <p className="text-gray-500 text-xs mt-1">{v.suitability}</p>
                    <p className="text-gray-400 text-xs mt-2 line-clamp-2">{v.description}</p>
                    {v.blockedPeriods && v.blockedPeriods.length > 0 && (
                      <p className="text-red-400 text-xs mt-2">⚠️ Some dates blocked</p>
                    )}
                    <button onClick={() => { setTab('bookings'); setBookingForm(f => ({ ...f, venueId: String(v.id) })); }}
                      className="mt-3 w-full bg-amber-500 hover:bg-amber-600 text-white py-1.5 rounded text-sm transition">
                      Book This Venue
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PREFERRED TAB */}
        {tab === 'preferred' && (
          <div>
            <h2 className="text-xl font-semibold text-amber-400 mb-4">Saved Venues</h2>
            {preferred.length === 0 ? (
              <p className="text-gray-400">No saved venues. Click ★ on any venue to save it.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preferred.map((pv, i) => (
                  <div key={pv.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">#{i + 1}</span>
                      <button onClick={() => togglePreferred(pv.venueId)} className="text-red-400 text-xs hover:underline">Remove</button>
                    </div>
                    <h3 className="font-semibold">{pv.venue?.name}</h3>
                    <p className="text-gray-400 text-sm">{pv.venue?.location}</p>
                    <p className="text-amber-400 text-sm">${pv.venue?.pricePerHour}/hr</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-amber-400 mb-4">Make a Booking</h2>
              {bookingMsg && <div className={`mb-4 px-4 py-2 rounded ${bookingMsg.startsWith('✅') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{bookingMsg}</div>}
              <form onSubmit={submitBooking} className="space-y-3">
                <select value={bookingForm.venueId} onChange={e => setBookingForm({ ...bookingForm, venueId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500">
                  <option value="">Select a venue</option>
                  {venues.map(v => <option key={v.id} value={v.id}>{v.name} — {v.location}</option>)}
                </select>
                <input value={bookingForm.eventName} onChange={e => setBookingForm({ ...bookingForm, eventName: e.target.value })}
                  placeholder="Event name" className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500" />
                <input type="number" value={bookingForm.guestCount} onChange={e => setBookingForm({ ...bookingForm, guestCount: e.target.value })}
                  placeholder="Guest count" className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500" />
                <input type="date" value={bookingForm.date} onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500" />
                <input type="time" value={bookingForm.time} onChange={e => setBookingForm({ ...bookingForm, time: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500" />
                <input type="number" value={bookingForm.duration} onChange={e => setBookingForm({ ...bookingForm, duration: e.target.value })}
                  placeholder="Duration (hours)" className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500" />
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition">
                  Submit Booking Request
                </button>
              </form>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-amber-400 mb-4">My Booking Requests</h2>
              {bookings.length === 0 ? <p className="text-gray-400">No bookings yet.</p> : (
                <div className="space-y-3">
                  {bookings.map(b => (
                    <div key={b.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">{b.eventName}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'accepted' ? 'bg-green-800 text-green-300' : b.status === 'rejected' ? 'bg-red-800 text-red-300' : 'bg-yellow-800 text-yellow-300'}`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm">{b.venue?.name} · {b.date} at {b.time}</p>
                      <p className="text-gray-500 text-xs">{b.guestCount} guests · {b.duration}hrs</p>
                      {b.vendorComment && <p className="text-amber-400 text-xs mt-1">Vendor: {b.vendorComment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <div>
            <h2 className="text-xl font-semibold text-amber-400 mb-4">Hire History</h2>
            {history.length === 0 ? <p className="text-gray-400">No completed hires yet.</p> : (
              <div className="space-y-3">
                {history.map(h => (
                  <div key={h.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{h.eventName}</h3>
                      <p className="text-gray-400 text-sm">{h.venue?.name} · {h.dateOfHire}</p>
                    </div>
                    <div className="text-amber-400 text-xl">
                      {h.rating ? '⭐'.repeat(h.rating) : <span className="text-gray-600">Not rated</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {tab === 'documents' && (
          <div>
            <h2 className="text-xl font-semibold text-amber-400 mb-2">Compliance Documents</h2>
            <p className="text-gray-400 text-sm mb-6">Upload documents to improve your credibility score with vendors.</p>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6 text-center">
              <p className="text-5xl font-bold text-amber-400 mb-1">{stars}/5</p>
              <p className="text-2xl mb-1">{'⭐'.repeat(stars)}{'☆'.repeat(5 - stars)}</p>
              <p className="text-gray-400 text-sm">Compliance Score</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { type: 'drivers_license', label: "Driver's License", accept: '.jpg,.jpeg,.png' },
                { type: 'insurance', label: 'Insurance Certificate', accept: '.pdf' },
                { type: 'business_certificate', label: 'Business Certificate', accept: '.pdf' },
              ].map(doc => {
                const uploaded = documents.find(d => d.docType === doc.type);
                return (
                  <div key={doc.type} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <h3 className="font-semibold mb-2">{doc.label}</h3>
                    {uploaded ? (
                      <div>
                        <p className="text-green-400 text-sm">✅ {uploaded.fileName}</p>
                        <label className="mt-2 block cursor-pointer text-xs text-amber-400 hover:underline">
                          Replace
                          <input type="file" accept={doc.accept} className="hidden" onChange={e => e.target.files && uploadDoc(doc.type, e.target.files[0])} />
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer block">
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-amber-500 transition">
                          <p className="text-gray-400 text-sm">Click to upload</p>
                          <p className="text-gray-600 text-xs">{doc.accept}</p>
                        </div>
                        <input type="file" accept={doc.accept} className="hidden" onChange={e => e.target.files && uploadDoc(doc.type, e.target.files[0])} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div className="max-w-lg">
            <h2 className="text-xl font-semibold text-amber-400 mb-6">My Profile</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <img src={profile.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=f59e0b&color=fff&size=80`}
                  alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-amber-500" />
                <div>
                  <p className="font-semibold text-lg">{user?.name}</p>
                  <p className="text-gray-400 text-sm">{user?.email}</p>
                  <p className="text-gray-500 text-xs">Member since {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
            {profileMsg && <div className={`mb-4 px-4 py-2 rounded text-sm ${profileMsg.startsWith('✅') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{profileMsg}</div>}
            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="text-gray-300 text-sm block mb-1">Display Name</label>
                <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-1">Phone</label>
                <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-1">Avatar URL</label>
                <input value={profile.avatarUrl} onChange={e => setProfile({ ...profile, avatarUrl: e.target.value })}
                  placeholder="https://..." className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500" />
              </div>
              <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-lg font-semibold transition">
                Save Profile
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}