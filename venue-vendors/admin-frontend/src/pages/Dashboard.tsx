import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_ALL = gql`
  query GetAll {
    venues {
      id name location capacity pricePerHour image suitability vendorId isFeatured
      vendor { id name email }
    }
    vendors { id name email }
    topVenues { venueId venueName totalBookings popularDay popularTime }
    topHirers { hirerId hirerName totalApplications successfulBookings }
  }
`;

const CREATE_VENUE = gql`
  mutation CreateVenue($name: String!, $location: String!, $capacity: Int!, $pricePerHour: Float!, $image: String, $description: String, $suitability: String, $vendorId: Int!) {
    createVenue(name: $name, location: $location, capacity: $capacity, pricePerHour: $pricePerHour, image: $image, description: $description, suitability: $suitability, vendorId: $vendorId) {
      id name
    }
  }
`;

const UPDATE_VENUE = gql`
  mutation UpdateVenue($id: Int!, $name: String, $location: String, $capacity: Int, $pricePerHour: Float, $image: String, $description: String, $suitability: String) {
    updateVenue(id: $id, name: $name, location: $location, capacity: $capacity, pricePerHour: $pricePerHour, image: $image, description: $description, suitability: $suitability) {
      id name
    }
  }
`;

const DELETE_VENUE = gql`
  mutation DeleteVenue($id: Int!) { deleteVenue(id: $id) }
`;

const SET_FEATURED = gql`
  mutation SetFeatured($id: Int!, $isFeatured: Boolean!) {
    setFeatured(id: $id, isFeatured: $isFeatured) { id isFeatured }
  }
`;

const ASSIGN_VENDOR = gql`
  mutation AssignVendor($venueId: Int!, $vendorId: Int!) {
    assignVendor(venueId: $venueId, vendorId: $vendorId) { id vendorId }
  }
`;

type Tab = 'venues' | 'assign' | 'reports';

export default function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('venues');
  const [venueForm, setVenueForm] = useState({ name: '', location: '', capacity: '', pricePerHour: '', image: '', description: '', suitability: '', vendorId: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [assignForm, setAssignForm] = useState({ venueId: '', vendorId: '' });
  const [msg, setMsg] = useState('');

  const { data, loading, refetch } = useQuery(GET_ALL);
  const [createVenue] = useMutation(CREATE_VENUE, { onCompleted: () => { refetch(); setMsg('✅ Venue created!'); resetForm(); } });
  const [updateVenue] = useMutation(UPDATE_VENUE, { onCompleted: () => { refetch(); setMsg('✅ Venue updated!'); resetForm(); } });
  const [deleteVenue] = useMutation(DELETE_VENUE, { onCompleted: () => { refetch(); setMsg('✅ Venue deleted!'); } });
  const [setFeatured] = useMutation(SET_FEATURED, { onCompleted: () => refetch() });
  const [assignVendor] = useMutation(ASSIGN_VENDOR, { onCompleted: () => { refetch(); setMsg('✅ Vendor assigned!'); } });

  const resetForm = () => {
    setVenueForm({ name: '', location: '', capacity: '', pricePerHour: '', image: '', description: '', suitability: '', vendorId: '' });
    setEditId(null);
  };

  const handleVenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vars = {
      name: venueForm.name, location: venueForm.location,
      capacity: parseInt(venueForm.capacity), pricePerHour: parseFloat(venueForm.pricePerHour),
      image: venueForm.image, description: venueForm.description,
      suitability: venueForm.suitability, vendorId: parseInt(venueForm.vendorId),
    };
    if (editId) updateVenue({ variables: { id: editId, ...vars } });
    else createVenue({ variables: vars });
  };

  const startEdit = (v: any) => {
    setEditId(v.id);
    setVenueForm({ name: v.name, location: v.location, capacity: String(v.capacity), pricePerHour: String(v.pricePerHour), image: v.image || '', description: v.description || '', suitability: v.suitability || '', vendorId: String(v.vendorId) });
  };

  const logout = () => { localStorage.removeItem('adminToken'); navigate('/login'); };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-red-400">VenueVendors Admin</h1>
        <button onClick={logout} className="bg-red-700 hover:bg-red-600 px-4 py-1.5 rounded text-sm transition">Logout</button>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(['venues', 'assign', 'reports'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg capitalize font-medium transition ${tab === t ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
              {t === 'assign' ? 'Assign Vendors' : t}
            </button>
          ))}
        </div>

        {msg && <div className={`mb-4 px-4 py-2 rounded text-sm ${msg.startsWith('✅') ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>{msg}</div>}

        {/* VENUES TAB */}
        {tab === 'venues' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-red-400 mb-4">{editId ? 'Edit Venue' : 'Add Venue'}</h2>
              <form onSubmit={handleVenueSubmit} className="space-y-3">
                {[
                  { key: 'name', label: 'Name', type: 'text' },
                  { key: 'location', label: 'Location', type: 'text' },
                  { key: 'capacity', label: 'Capacity', type: 'number' },
                  { key: 'pricePerHour', label: 'Price/hr ($)', type: 'number' },
                  { key: 'image', label: 'Image URL', type: 'text' },
                  { key: 'suitability', label: 'Suitability', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-gray-400 text-xs block mb-0.5">{f.label}</label>
                    <input type={f.type} value={venueForm[f.key as keyof typeof venueForm]}
                      onChange={e => setVenueForm({ ...venueForm, [f.key]: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500" />
                  </div>
                ))}
                <div>
                  <label className="text-gray-400 text-xs block mb-0.5">Vendor</label>
                  <select value={venueForm.vendorId} onChange={e => setVenueForm({ ...venueForm, vendorId: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500">
                    <option value="">Select vendor</option>
                    {data?.vendors?.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-semibold transition">
                    {editId ? 'Update' : 'Create'} Venue
                  </button>
                  {editId && <button type="button" onClick={resetForm} className="px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition">Cancel</button>}
                </div>
              </form>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-400 mb-4">All Venues ({data?.venues?.length})</h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {data?.venues?.map((v: any) => (
                  <div key={v.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{v.name}</h3>
                          {v.isFeatured && <span className="text-xs bg-amber-700 text-amber-200 px-2 py-0.5 rounded-full">Featured</span>}
                        </div>
                        <p className="text-gray-400 text-sm">{v.location} · {v.capacity} guests</p>
                        <p className="text-gray-500 text-xs">Vendor: {v.vendor?.name || 'Unassigned'}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button onClick={() => startEdit(v)} className="text-xs bg-blue-700 hover:bg-blue-600 px-2 py-1 rounded transition">Edit</button>
                        <button onClick={() => deleteVenue({ variables: { id: v.id } })} className="text-xs bg-red-700 hover:bg-red-600 px-2 py-1 rounded transition">Delete</button>
                        <button onClick={() => setFeatured({ variables: { id: v.id, isFeatured: !v.isFeatured } })}
                          className={`text-xs px-2 py-1 rounded transition ${v.isFeatured ? 'bg-amber-700 hover:bg-amber-600' : 'bg-gray-600 hover:bg-gray-500'}`}>
                          {v.isFeatured ? 'Unfeature' : 'Feature'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ASSIGN TAB */}
        {tab === 'assign' && (
          <div className="max-w-lg">
            <h2 className="text-xl font-semibold text-red-400 mb-4">Assign Vendor to Venue</h2>
            <p className="text-gray-400 text-sm mb-6">Use this to swap a venue from one vendor to another.</p>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 space-y-4">
              <div>
                <label className="text-gray-300 text-sm block mb-1">Venue</label>
                <select value={assignForm.venueId} onChange={e => setAssignForm({ ...assignForm, venueId: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500">
                  <option value="">Select venue</option>
                  {data?.venues?.map((v: any) => (
                    <option key={v.id} value={v.id}>{v.name} (current: {v.vendor?.name || 'none'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-300 text-sm block mb-1">New Vendor</label>
                <select value={assignForm.vendorId} onChange={e => setAssignForm({ ...assignForm, vendorId: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-red-500">
                  <option value="">Select vendor</option>
                  {data?.vendors?.map((v: any) => <option key={v.id} value={v.id}>{v.name} — {v.email}</option>)}
                </select>
              </div>
              <button
                onClick={() => assignVendor({ variables: { venueId: parseInt(assignForm.venueId), vendorId: parseInt(assignForm.vendorId) } })}
                disabled={!assignForm.venueId || !assignForm.vendorId}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white py-3 rounded-lg font-semibold transition">
                Assign Vendor
              </button>
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {tab === 'reports' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold text-red-400 mb-4">Top 3 Most Popular Venues</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data?.topVenues?.length === 0 ? <p className="text-gray-400">No data yet.</p> :
                  data?.topVenues?.map((v: any, i: number) => (
                    <div key={v.venueId} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{['🥇', '🥈', '🥉'][i]}</span>
                        <h3 className="font-semibold">{v.venueName}</h3>
                      </div>
                      <p className="text-amber-400 text-sm">{v.totalBookings} accepted bookings</p>
                      {v.popularDay && <p className="text-gray-400 text-xs mt-1">Most popular: {v.popularDay} at {v.popularTime}</p>}
                    </div>
                  ))
                }
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-red-400 mb-4">Top 3 Most Active Hirers</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data?.topHirers?.length === 0 ? <p className="text-gray-400">No data yet.</p> :
                  data?.topHirers?.map((h: any, i: number) => (
                    <div key={h.hirerId} className="bg-gray-800 rounded-xl p-5 border border-gray-700">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl">{['🥇', '🥈', '🥉'][i]}</span>
                        <h3 className="font-semibold">{h.hirerName}</h3>
                      </div>
                      <p className="text-amber-400 text-sm">{h.successfulBookings} successful bookings</p>
                      <p className="text-gray-400 text-xs mt-1">{h.totalApplications} total applications</p>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}