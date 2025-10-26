import React, { useState, useEffect } from 'react';
import { getStoreSettings, updateStoreSettings } from '../services/firebaseService';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import LocationModal from '../components/LocationModal';
import { type Address } from '../types';
import MapPinIcon from '../components/icons/MapPinIcon';

interface SettingsPageProps {
  handleBack: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ handleBack }) => {
  const [storeAddress, setStoreAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await getStoreSettings();
        if (settings?.address) {
          setStoreAddress(settings.address);
        }
      } catch (err) {
        console.error(err);
        setError('Gagal memuat pengaturan. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveAddress = async (newAddress: Address) => {
    setError('');
    setSuccess('');
    try {
      await updateStoreSettings({ address: newAddress });
      setStoreAddress(newAddress);
      setIsLocationModalOpen(false);
      setSuccess('Alamat toko berhasil diperbarui!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Gagal menyimpan alamat. Silakan coba lagi.');
      // Re-throw to let the modal know saving failed and keep its spinner off
      throw err;
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        <button 
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Kembali ke halaman sebelumnya"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Kembali ke Dashboard
        </button>

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Pengaturan Toko</h1>

          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <SpinnerIcon className="h-8 w-8 animate-spin text-yellow-600" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Alamat Toko (Titik Awal Rute)</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Alamat ini akan digunakan sebagai titik awal saat membuat rute pengiriman untuk member.
                  </p>
                  <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                    {storeAddress ? (
                      <div className="flex items-start gap-3">
                        <MapPinIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-800">{storeAddress.displayAddress}</p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Alamat toko belum diatur.</p>
                    )}
                  </div>
                </div>

                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                {success && <p className="text-green-600 text-center text-sm animate-fade-in">{success}</p>}

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex justify-center items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105"
                  >
                    {storeAddress ? 'Ubah Alamat' : 'Atur Alamat Toko'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSave={handleSaveAddress}
      />
    </>
  );
};

export default SettingsPage;
