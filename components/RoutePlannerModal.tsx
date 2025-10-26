import React, { useState, useEffect } from 'react';
import { type MemberData, type Address } from '../types';
import XIcon from './icons/XIcon';
import MapPinIcon from './icons/MapPinIcon';
import RouteIcon from './icons/RouteIcon';
import { getStoreSettings } from '../services/firebaseService';
import SpinnerIcon from './icons/SpinnerIcon';

interface RoutePlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMember: MemberData | null;
}

const RoutePlannerModal: React.FC<RoutePlannerModalProps> = ({ isOpen, onClose, targetMember }) => {
  const [storeAddress, setStoreAddress] = useState<Address | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(true);
  const [error, setError] = useState('');
  
  const FALLBACK_STORE_ADDRESS_STRING = "Jl. Raya Martabak No. 1, Jakarta";
  const FALLBACK_STORE_ADDRESS: Address = { type: 'manual', displayAddress: FALLBACK_STORE_ADDRESS_STRING };

  useEffect(() => {
    if (isOpen) {
      setIsLoadingAddress(true);
      setError('');
      getStoreSettings()
        .then(settings => {
          if (settings?.address) {
            setStoreAddress(settings.address);
          } else {
            setStoreAddress(FALLBACK_STORE_ADDRESS);
            console.warn("Store address not found in settings, using fallback.");
          }
        })
        .catch(err => {
          console.error("Failed to fetch store settings:", err);
          setError("Gagal memuat alamat toko. Menggunakan alamat default.");
          setStoreAddress(FALLBACK_STORE_ADDRESS);
        })
        .finally(() => setIsLoadingAddress(false));
    }
  }, [isOpen]);

  if (!isOpen || !targetMember || !targetMember.address) return null;
  
  const origin = encodeURIComponent(storeAddress?.displayAddress || FALLBACK_STORE_ADDRESS_STRING);
  const destination = encodeURIComponent(targetMember.address!.displayAddress);
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg animate-fade-in max-h-[90vh] flex flex-col">
        <header className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Rencanakan Rute ke Member</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800 rounded-full hover:bg-gray-100">
            <XIcon className="h-6 w-6" />
          </button>
        </header>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="font-bold text-lg text-gray-700 mb-2">Tujuan Pengiriman:</h3>
            <div className="p-4 bg-gray-50 rounded-lg border flex items-start gap-3">
              <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-800 text-lg">{targetMember.name}</p>
                <p className="text-sm text-gray-600">{targetMember.address?.displayAddress}</p>
              </div>
            </div>
          </div>
          
           <div>
            <h3 className="font-bold text-lg text-gray-700 mb-2">Titik Awal:</h3>
            <div className="p-4 bg-gray-50 rounded-lg border flex items-start gap-3">
               <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
               <div>
                <p className="font-semibold text-gray-800 text-lg">Toko Martabak Juara</p>
                {isLoadingAddress ? (
                  <div className="flex items-center gap-2 mt-1">
                    <SpinnerIcon className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Memuat alamat...</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{storeAddress?.displayAddress}</p>
                )}
              </div>
            </div>
            {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
          </div>

          <div className="p-4 bg-yellow-50 text-yellow-900 rounded-lg text-sm">
            Klik tombol di bawah untuk membuat rute pengiriman di Google Maps. Tautan ini dapat Anda bagikan ke kurir atau ojek online.
          </div>
        </div>

        <footer className="p-4 border-t bg-gray-50 rounded-b-2xl">
          <a 
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={isLoadingAddress}
            className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition aria-disabled:bg-gray-400 aria-disabled:cursor-not-allowed"
          >
            <RouteIcon className="h-5 w-5" />
            Buka Rute di Google Maps
          </a>
        </footer>
      </div>
    </div>
  );
};

export default RoutePlannerModal;