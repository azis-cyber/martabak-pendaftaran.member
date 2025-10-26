import React, { useState } from 'react';
import { signUpMember } from '../services/firebaseService';
import SpinnerIcon from './icons/SpinnerIcon';
import LocationModal from './LocationModal';
import { type Address } from '../types';
import MapPinIcon from './icons/MapPinIcon';

interface RegistrationFormProps {
  onSuccess: (data: { name: string; memberId: string }) => void;
  navigate: (page: 'member-login') => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, navigate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<React.ReactNode>(null);
  
  // State untuk manajemen alamat
  const [address, setAddress] = useState<Address | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSave = (newAddress: Address) => {
    setAddress(newAddress);
    setIsLocationModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const { name, phone, email, birthDate, password } = formData;
      const memberId = await signUpMember(email, password, { name, phone, birthDate }, address ?? undefined);
      onSuccess({ name, memberId });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError(
          <span>
            Email ini sudah terdaftar. Silakan{' '}
            <button
              type="button"
              onClick={() => navigate('member-login')}
              className="font-bold text-yellow-600 hover:underline"
            >
              login
            </button>
            {' '}atau gunakan email lain.
          </span>
        );
      } else {
        setError('Gagal mendaftar. Silakan coba lagi nanti.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section id="form-section">
        <h3 className="text-xl font-bold text-center text-yellow-800 mb-6 border-b-2 border-yellow-200 pb-2">
          Isi Formulir Pendaftaran
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition" placeholder="Contoh: Budi Santoso" />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition" placeholder="Contoh: 081234567890" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Alamat Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition" placeholder="Contoh: budi.s@email.com" />
          </div>
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
            <input type="date" id="birthDate" name="birthDate" value={formData.birthDate} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition text-gray-700" />
          </div>

          {/* Kolom Alamat Baru */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Pengiriman (Opsional)</label>
            <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
              {address ? (
                <div className="flex justify-between items-center">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-800 text-sm">{address.displayAddress}</p>
                  </div>
                  <button type="button" onClick={() => setIsLocationModalOpen(true)} className="text-sm font-semibold text-yellow-600 hover:underline flex-shrink-0 ml-2">Ubah</button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">Alamat belum diatur.</p>
                  <button type="button" onClick={() => setIsLocationModalOpen(true)} className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg border border-gray-300 text-sm">
                    Atur Alamat
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required minLength={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition" placeholder="Minimal 6 karakter" />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 transition" placeholder="Ulangi password" />
          </div>
          
          {error && <div className="text-red-500 text-center text-sm">{error}</div>}

          <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed">
            {isLoading ? (
              <><SpinnerIcon className="h-5 w-5 animate-spin" /> Mendaftarkan...</>
            ) : ( 'Daftar Sekarang' )}
          </button>
        </form>
      </section>
      
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={(newAddress) => Promise.resolve(handleAddressSave(newAddress))}
      />
    </>
  );
};

export default RegistrationForm;