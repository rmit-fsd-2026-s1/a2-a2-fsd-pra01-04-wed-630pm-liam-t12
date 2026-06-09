import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const validatePassword = (p: string) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{6,}$/.test(p);

export default function SignUpPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'hirer', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError('All fields are required'); return;
    }
    if (!validatePassword(form.password)) {
      setError('Password needs 6+ chars, 1 uppercase, 1 lowercase, 1 special character'); return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match'); return;
    }
    setLoading(true);
    try {
      await api.post('/auth/signup', { name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-bold text-amber-400 mb-2 text-center">Create Account</h1>
        <p className="text-gray-400 text-center mb-8">Join VenueVendors today</p>
        {error && <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Alice Johnson' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Phone', key: 'phone', type: 'text', placeholder: '04XX XXX XXX' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
            { label: 'Confirm Password', key: 'confirm', type: 'password', placeholder: '••••••••' },
          ].map(f => (
            <div key={f.key}>
              <label className="text-gray-300 text-sm block mb-1">{f.label}</label>
              <input
                type={f.type} value={form[f.key as keyof typeof form]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500"
                placeholder={f.placeholder}
              />
            </div>
          ))}
          <div>
            <label className="text-gray-300 text-sm block mb-1">I am a</label>
            <select
              value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-amber-500"
            >
              <option value="hirer">Hirer — I want to book venues</option>
              <option value="vendor">Vendor — I manage venues</option>
            </select>
          </div>
          <p className="text-gray-500 text-xs">Password must have 6+ characters, 1 uppercase, 1 lowercase, 1 special character</p>
          <button
            type="submit" disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-800 text-white py-3 rounded-lg font-semibold transition"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-gray-400 mt-6 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-amber-400 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}