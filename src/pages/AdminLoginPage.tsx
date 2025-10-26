import React, { useState } from 'react';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import MartabakIcon from '../components/icons/MartabakIcon';
import { signInAdmin } from '../services/firebaseService';

interface AdminLoginPageProps {
  navigate: (page: 'admin-dashboard') => void;
  setIsAdmin: (isAdmin: boolean) => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ navigate, setIsAdmin }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Use the service to handle admin login.
      // This will trigger onAuthChange in App.tsx to set the user state.
      await signInAdmin(formData.username, formData.password);
      setIsAdmin(true);
      navigate('admin-dashboard');
    } catch (err: any) {
      // Display the specific error message from the firebaseService
      setError(err.message || 'Terjadi kesalahan saat login.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <MartabakIcon className="h-12 w-12 text-yellow-600 mx-auto" />
          <h2 className="text-3xl font-bold text-gray-800 mt-2">Login Admin</h2>
          <p className="text-gray-600">Akses panel manajemen member.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" />
          </div>
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-400">
            {isLoading ? <><SpinnerIcon className="h-5 w-5 animate-spin" /> Masuk...</> : 'Masuk sebagai Admin'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
