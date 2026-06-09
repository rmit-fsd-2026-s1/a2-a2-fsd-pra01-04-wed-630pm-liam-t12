import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import type { Venue, Booking } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer
} from 'recharts';

const TABS = ['venues', 'bookings', 'charts', 'profile'] as const;
type Tab = typeof TABS[number];
const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'];

export default function VendorDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('venues');
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'all'>('all');
  const [venueForm, setVenueForm] = useState({ name: '', location: '', capacity: '', pricePerHour: '', image: '', description: '', suitability: '' });
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [venueMsg, setVenueMsg] = useState('');
  const [blockForm, setBlockForm] = useState<{ [venueId: number]: { from: string; to: string } }>({});
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    const [v, b, s] = await Promise.all([
      api.get('/venues').catch(() => ({ data: [] })),
      api.get('/bookings').catch(() => ({ data: [] })),
      api.get('/hirer/stats').catch(() => ({ data: null })),
    ]);
    setVenues(v.data); setBookings(b.data); setStats(s.data);
  };

  const submitVenue = async (e: React.FormEvent) => {
    e.preventDefault(); setVenueMsg('');
    try {
      if (editingVenue) {
        await api.put(`/venues/${editingVenue.id}`, venueForm);
        setVenueMsg('✅ Venue updated!'); setEditingVenue(null);
      } else {
        await api.post('/venues', venueForm);
        setVenueMsg('✅ Venue created!');
      }
      setVenueForm({ name: '', location: '', capacity: '', pricePerHour: '', image: '', description: '', suitability: '' });
      loadAll();
    } catch (err: any) { setVenueMsg('❌ ' + (err.response?.data?.message || 'Failed')); }
  };

  const deleteVenue = async (id: number) => {
    if (!confirm('Delete this venue?')) return;
    await api.delete(`/venues/${id}`);
    loadAll();
  };

  const startEdit = (v: Venue) => {
    setEditingVenue(v);
    setVenueForm({ name: v.name, location: v.location, capacity: String(v.capacity), pricePerHour: String(v.pricePerHour), image: v.image || '', description: v.description || '', suitability: v.suitability || '' });
    setTab('venues');
  };

  const blockSlot = async (venueId: number) => {
    const f = blockForm[venueId];
    if (!f?.from || !f?.to) return;
    await api.post(`/venues/${venueId}/block`, { fromDate: f.from, toDate: f.to });
    loadAll();
  };

  const unblockSlot = async (venueId: number, bpId: number) => {
    await api.delete(`/venues/${venueId}/block/${bpId}`);
    loadAll();
  };

  const updateStatus = async (bookingId: number, status: 'accepted' | 'rejected', comment?: string) => {
    await api.put(`/bookings/${bookingId}/status`, { status, vendorComment: comment || '' });
    loadAll();
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await api.put('/auth/profile', profile); setProfileMsg('✅ Updated!'); }
    catch { setProfileMsg('❌ Failed'); }
  };

  // Filter stats by time
  const filterByTime = (data: any[]) => {
    if (!data || timeFilter === 'all') return data;
    const now = new Date();
    return data.filter((d: any) => {
      const m = new Date(d.month + '-01');
      if (timeFilter === 'week') return (now.getTime() - m.getTime()) < 7 * 86400000;
      if (timeFilter === 'month') return m.getMonth() === now.getMonth() && m.getFullYear() === now.getFullYear();
      return true;
    });
  };

  const hirerTotals = stats?.hirersByVenue?.reduce((acc: any, h: any) => {
    const key = h.hirerName;
    acc[key] = (acc[key] || 0) + parseInt(h.count);
    return acc;
  }, {});
  const pieData = hirerTotals ? Object.entries(hirerTotals).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-amber-400 mb-6">Vendor Dashboard</h1>

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-amber-400 mb-4">
                {editingVenue ? `Editing: ${editingVenue.name}` : 'Add New Venue'}
              </h2>
              {venueMsg && <div className={`mb-3 px-4 py-2 rounded text-sm ${venueMsg.startsWith('✅') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{venueMsg}</div>}
              <form onSubmit={submitVenue} className="space-y-3">
                {[
                  { key: 'name', placeholder: 'Venue name', label: 'Name' },
                  { key: 'location', placeholder: 'e.g. Melbourne CBD', label: 'Location' },
                  { key: 'capacity', placeholder: 'Max guests', label: 'Capacity', type: 'number' },
                  { key: 'pricePerHour', placeholder: 'Price per hour ($)', label: 'Price/hr', type: 'number' },
                  { key: 'image', placeholder: 'Image URL (unsplash.com/...)', label: 'Image URL' },
                  { key: 'suitability', placeholder: 'e.g. Weddings, Conferences', label: 'Suitability' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-gray-400 text-xs block mb-0.5">{f.label}</label>
                    <input value={venueForm[f.key as keyof typeof venueForm]}
                      onChange={e => setVenueForm({ ...venueForm, [f.key]: e.target.value })}
                      type={f.type || 'text'} placeholder={f.placeholder}
                      className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 text-sm" />
                  </div>
                ))}
                <textarea value={venueForm.description} onChange={e => setVenueForm({ ...venueForm, description: e.target.value })}
                  placeholder="Description" rows={3}
                  className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 text-sm" />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-lg font-semibold transition text-sm">
                    {editingVenue ? 'Update Venue' : 'Add Venue'}
                  </button>
                  {editingVenue && (
                    <button type="button" onClick={() => { setEditingVenue(null); setVenueForm({ name: '', location: '', capacity: '', pricePerHour: '', image: '', description: '', suitability: '' }); }}
                      className="px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">Cancel</button>
                  )}
                </div>
              </form>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-amber-400 mb-4">My Venues</h2>
              {venues.length === 0 ? <p className="text-gray-400">No venues yet. Add one!</p> : (
                <div className="space-y-4">
                  {venues.map(v => (
                    <div key={v.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{v.name}</h3>
                          <p className="text-gray-400 text-sm">{v.location} · {v.capacity} guests · ${v.pricePerHour}/hr</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(v)} className="text-xs bg-blue-700 hover:bg-blue-600 px-2 py-1 rounded transition">Edit</button>
                          <button onClick={() => deleteVenue(v.id)} className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded transition">Delete</button>
                        </div>
                      </div>
                      {/* Block timeslot */}
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <p className="text-gray-500 text-xs mb-2">Block a timeslot:</p>
                        <div className="flex gap-2 flex-wrap">
                          <input type="date" onChange={e => setBlockForm({ ...blockForm, [v.id]: { ...blockForm[v.id], from: e.target.value } })}
                            className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-xs focus:outline-none" />
                          <input type="date" onChange={e => setBlockForm({ ...blockForm, [v.id]: { ...blockForm[v.id], to: e.target.value } })}
                            className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-xs focus:outline-none" />
                          <button onClick={() => blockSlot(v.id)} className="bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded text-xs transition">Block</button>
                        </div>
                        {v.blockedPeriods && v.blockedPeriods.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {v.blockedPeriods.map(bp => (
                              <div key={bp.id} className="flex justify-between items-center bg-gray-700 px-2 py-1 rounded text-xs">
                                <span className="text-red-400">{bp.fromDate} → {bp.toDate}</span>
                                <button onClick={() => unblockSlot(v.id, bp.id)} className="text-gray-400 hover:text-white ml-2">✕</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div>
            <h2 className="text-xl font-semibold text-amber-400 mb-4">Booking Requests</h2>
            {bookings.length === 0 ? <p className="text-gray-400">No booking requests yet.</p> : (
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <div>
                        <h3 className="font-semibold">{b.eventName}</h3>
                        <p className="text-gray-400 text-sm">{b.venue?.name} · {b.date} at {b.time} · {b.duration}hrs</p>
                        <p className="text-gray-400 text-sm">Hirer: <span className="text-white">{b.hirer?.name}</span></p>
                        <div className="flex gap-3 mt-1">
                          <span className="text-xs text-gray-500">
                            Compliance: {'⭐'.repeat(b.complianceScore || 0)}{'☆'.repeat(5 - (b.complianceScore || 0))} ({b.complianceScore || 0}/5)
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'accepted' ? 'bg-green-800 text-green-300' : b.status === 'rejected' ? 'bg-red-800 text-red-300' : 'bg-yellow-800 text-yellow-300'}`}>
                          {b.status}
                        </span>
                        {b.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(b.id, 'accepted')} className="bg-green-700 hover:bg-green-600 px-3 py-1 rounded text-xs transition">Accept</button>
                            <button onClick={() => updateStatus(b.id, 'rejected')} className="bg-red-700 hover:bg-red-600 px-3 py-1 rounded text-xs transition">Reject</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CHARTS TAB */}
        {tab === 'charts' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-amber-400">Analytics</h2>
              <div className="flex gap-2">
                {(['week', 'month', 'all'] as const).map(f => (
                  <button key={f} onClick={() => setTimeFilter(f)}
                    className={`px-3 py-1 rounded text-xs font-medium transition ${timeFilter === f ? 'bg-amber-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                    {f === 'all' ? 'All Time' : `This ${f}`}
                  </button>
                ))}
              </div>
            </div>
            {!stats ? <p className="text-gray-400">No data yet. Bookings will appear here.</p> : (
              <div className="space-y-10">
                {/* Bar chart — bookings per venue */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-amber-400 mb-4">Bookings per Venue</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.bookingsByVenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="venueName" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
                      <Legend />
                      <Bar dataKey="accepted" fill="#10b981" name="Accepted" />
                      <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                      <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Stacked bar — hirers per venue */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-amber-400 mb-4">Hirers Tally per Venue (Stacked)</h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.bookingsByVenue}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="venueName" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
                      <Legend />
                      <Bar dataKey="total" stackId="a" fill="#f59e0b" name="Total Bookings" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie chart — hirers tally */}
                {pieData.length > 0 && (
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-amber-400 mb-4">Most Active Hirers</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Line chart — utilization over time */}
                {stats.utilizationOverTime?.length > 0 && (
                  <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                    <h3 className="text-lg font-semibold text-amber-400 mb-4">Venue Utilization Over Time</h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={filterByTime(stats.utilizationOverTime)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', color: '#fff' }} />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} name="Bookings" dot={{ fill: '#f59e0b' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div className="max-w-lg">
            <h2 className="text-xl font-semibold text-amber-400 mb-6">My Profile</h2>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
              <p className="font-semibold text-lg">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <p className="text-amber-400 text-sm mt-1">Vendor Account</p>
              <p className="text-gray-500 text-xs">Member since {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}</p>
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