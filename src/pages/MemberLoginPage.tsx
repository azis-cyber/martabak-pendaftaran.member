import React, { useState } from 'react';
import { signInMember } from '../services/firebaseService';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import MartabakIcon from '../components/icons/MartabakIcon';

interface MemberLoginPageProps {
  navigate: (page: 'register' | 'member-dashboard') => void;
}

const MemberLoginPage: React.FC<MemberLoginPageProps> = ({ navigate }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      await signInMember(formData.email, formData.password);
      navigate('member-dashboard');
    } catch (err: any) {
      setError('Email atau password salah. Silakan coba lagi.');
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
          <h2 className="text-3xl font-bold text-gray-800 mt-2">Login Member</h2>
          <p className="text-gray-600">Masuk untuk melihat poin Anda.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" />
          </div>
          {error && <p className="text-red-500 text-center text-sm">{error}</p>}
          <div className="text-right text-sm">
            <a href="https://wa.me/6283801928405?text=Halo%20Admin%20Martabak%20Juara,%20saya%20lupa%20kata%20sandi%20akun%20member%20saya." target="_blank" rel="noopener noreferrer" className="font-medium text-yellow-600 hover:underline">
              Lupa Kata Sandi?
            </a>
          </div>
          <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-400">
            {isLoading ? <><SpinnerIcon className="h-5 w-5 animate-spin" /> Masuk...</> : 'Masuk'}
          </button>
        </form>
        <p className="text-center mt-6 text-sm text-gray-600">
          Belum punya akun?{' '}
          <button onClick={() => navigate('register')} className="font-medium text-yellow-600 hover:underline">
            Daftar di sini
          </button>
        </p>
      </div>
    </div>
  );
};

export default MemberLoginPage;
