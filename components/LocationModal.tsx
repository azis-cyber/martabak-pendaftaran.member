
import React, { useState } from 'react';
import { type Address } from '../types';
import SpinnerIcon from './icons/SpinnerIcon';
import XIcon from './icons/XIcon';
import GpsIcon from './icons/GpsIcon';
import MapPinIcon from './icons/MapPinIcon';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => Promise<void>;
}

type Tab = 'manual' | 'gps' | 'map';

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<Tab>('manual');
  const [isSaving, setIsSaving] = useState(false);
  
  // Manual Tab State
  const [manualAddress, setManualAddress] = useState('');
  
  // GPS Tab State
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [gpsData, setGpsData] = useState<{ coords: GeolocationCoordinates; address: string } | null>(null);
  const [gpsError, setGpsError] = useState('');

  if (!isOpen) return null;

  const handleSave = async (address: Address) => {
    setIsSaving(true);
    try {
      await onSave(address);
    } catch (err) {
      // Error is handled by the parent, but we need to stop the saving spinner
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualSave = () => {
    if (!manualAddress.trim()) {
      alert('Alamat tidak boleh kosong.');
      return;
    }
    const newAddress: Address = {
      type: 'manual',
      displayAddress: manualAddress.trim(),
    };
    handleSave(newAddress);
  };
  
  const handleGpsSave = () => {
    if (!gpsData) return;
    const newAddress: Address = {
      type: 'gps',
      displayAddress: gpsData.address,
      coords: {
        latitude: gpsData.coords.latitude,
        longitude: gpsData.coords.longitude,
      },
    };
    handleSave(newAddress);
  };

  const handleGetLocation = () => {
    setGpsStatus('loading');
    setGpsData(null);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = position.coords;
        const displayAddress = `Lat: ${coords.latitude.toFixed(5)}, Lon: ${coords.longitude.toFixed(5)}`;
        setGpsData({ coords, address: displayAddress });
        setGpsStatus('success');
      },
      (error) => {
        let message = 'Terjadi kesalahan saat mengakses lokasi.';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Anda harus memberikan izin akses lokasi di browser Anda.';
        }
        setGpsError(message);
        setGpsStatus('error');
      },
      { enableHighAccuracy: true }
    );
  };

  const TabButton: React.FC<{ tabId: Tab; icon: React.ReactNode; text: string; }> = ({ tabId, icon, text }) => (
    <button
      onClick={() => setActiveTab(tabId)}
      className={`flex-1 p-3 text-sm font-bold text-center transition-colors border-b-4 flex items-center justify-center gap-2 ${
        activeTab === tabId ? 'border-yellow-500 text-yellow-800' : 'border-transparent text-gray-500 hover:bg-gray-100'
      }`}
    >
      {icon} {text}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-fade-in max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Atur Alamat Pengiriman</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
            <XIcon className="h-6 w-6" />
          </button>
        </header>
        
        <nav className="flex border-b">
            <TabButton tabId="manual" icon={<>📝</>} text="Alamat Lengkap" />
            <TabButton tabId="gps" icon={<GpsIcon className="h-5 w-5"/>} text="Lokasi Saat Ini" />
            <TabButton tabId="map" icon={<MapPinIcon className="h-5 w-5"/>} text="Cari di Peta" />
        </nav>

        <div className="p-6 overflow-y-auto">
          {activeTab === 'manual' && (
            <div>
              <label htmlFor="manualAddress" className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
              <textarea
                id="manualAddress"
                rows={4}
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                placeholder="Contoh: Jl. Martabak Enak No. 10, Kel. Bahagia, Kec. Sejahtera, Kota Juara 12345"
              />
              <button onClick={handleManualSave} disabled={isSaving || !manualAddress.trim()} className="w-full mt-4 flex justify-center items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">
                {isSaving ? <><SpinnerIcon className="h-5 w-5 animate-spin" /> Menyimpan...</> : 'Simpan Alamat'}
              </button>
            </div>
          )}

          {activeTab === 'gps' && (
            <div className="text-center">
              <button onClick={handleGetLocation} disabled={gpsStatus === 'loading'} className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-400">
                <GpsIcon className="h-5 w-5" />
                {gpsStatus === 'loading' ? 'Mencari Lokasi...' : 'Gunakan Lokasi Saya Saat Ini'}
              </button>
              {gpsStatus === 'loading' && <SpinnerIcon className="h-8 w-8 animate-spin text-blue-600 mx-auto mt-4" />}
              {gpsError && <p className="text-red-500 text-sm mt-4">{gpsError}</p>}
              {gpsData && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left animate-fade-in space-y-3">
                  <div>
                    <p className="font-semibold text-gray-800">Lokasi Terdeteksi:</p>
                    <p className="text-gray-700 font-mono">{gpsData.address}</p>
                  </div>
                  <button onClick={handleGpsSave} disabled={isSaving} className="w-full flex justify-center items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">
                    {isSaving ? <><SpinnerIcon className="h-5 w-5 animate-spin" /> Menyimpan...</> : 'Simpan Alamat Ini'}
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'map' && (
             <div className="text-center">
                <MapPinIcon className="h-12 w-12 text-yellow-500 mx-auto" />
                <h3 className="text-lg font-bold text-gray-800 mt-2">Cari di Google Maps</h3>
                <p className="text-gray-600 max-w-sm mx-auto mt-1 mb-4">
                    Gunakan Google Maps untuk menemukan dan menyalin alamat Anda dengan akurasi tertinggi.
                </p>
                <a 
                    href="https://www.google.com/maps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg"
                >
                    Buka Google Maps
                </a>
                <div className="mt-6 text-left text-sm text-gray-600 bg-gray-50 p-4 rounded-lg border">
                    <p className="font-semibold mb-2">Cara Penggunaan:</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Klik tombol di atas untuk membuka Google Maps di tab baru.</li>
                        <li>Cari lokasi persis Anda dan salin alamatnya.</li>
                        <li>Kembali ke sini, pilih tab <b className="text-gray-800">"Alamat Lengkap"</b>, dan tempel alamat tersebut.</li>
                    </ol>
                </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default LocationModal;