// pages/MemberDashboardPage.tsx
import React, { useState, useEffect } from 'react';
import { getMemberData, requestRedemption, updateMemberAddress, getMemberRedemptionHistory } from '../services/firebaseService';
import { type MemberData, type Address, type Redemption } from '../types';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import MartabakIcon from '../components/icons/MartabakIcon';
import HomePage from './HomePage'; // Import HomePage
import QRCode from 'qrcode';
import LocationModal from '../components/LocationModal';
import MapPinIcon from '../components/icons/MapPinIcon';
import ClockIcon from '../components/icons/ClockIcon';

interface MemberDashboardPageProps {
  user: { uid: string };
}

const MemberDashboardPage: React.FC<MemberDashboardPageProps> = ({ user }) => {
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrError, setQrError] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError] = useState('');
  const [redeemSuccess, setRedeemSuccess] = useState('');
  
  const [redemptionHistory, setRedemptionHistory] = useState<Redemption[]>([]);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  
  // State untuk modal & picker lokasi
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const POINTS_TO_REDEEM = 300;

  const fetchData = async () => {
    if (!user.uid) return;
    setLoading(true);
    setError('');
    try {
      const dataPromise = getMemberData(user.uid);
      const historyPromise = getMemberRedemptionHistory(user.uid);
      const [data, history] = await Promise.all([dataPromise, historyPromise]);

      setMemberData(data);
      setRedemptionHistory(history);
      setHasPendingRequest(history.some(r => r.status === 'pending'));

    } catch (err) {
      setError('Gagal memuat data member.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.uid]);
  
  useEffect(() => {
    const generateQrCodeWithLogo = async () => {
      if (!memberData || !memberData.memberId) return;
      try {
        setQrError('');
        const canvas = document.createElement('canvas');
        
        const qrOptions = {
          errorCorrectionLevel: 'H' as const,
          width: 256,
          margin: 2,
          color: { dark:"#78350f", light:"#ffffff" }
        };
        
        await QRCode.toCanvas(canvas, memberData.memberId, qrOptions);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context.');

        const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#78350f"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 12.5c-1.63 0-3.06.8-3.98 2h7.96c-.92-1.2-2.35-2-3.98-2zM12 7c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5z" opacity=".3"/><path d="M12 7c.55 0 1 .45 1 1v3h-2V8c0-.55.45-1 1-1zm-.5 6.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5H11.5z"/></svg>`;
        const logoUrl = `data:image/svg+xml;base64,${btoa(logoSvg)}`;
        const logo = new Image();
        logo.src = logoUrl;
        
        logo.onload = () => {
          const logoSize = canvas.width * 0.25;
          const x = (canvas.width - logoSize) / 2;
          const y = (canvas.height - logoSize) / 2;
          
          ctx.beginPath();
          ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'white';
          ctx.fill();

          ctx.drawImage(logo, x, y, logoSize, logoSize);
          
          setQrCodeUrl(canvas.toDataURL('image/png'));
        };
        logo.onerror = () => {
          throw new Error('Logo image could not be loaded.');
        };

      } catch (err) {
        console.error("QR Code generation failed:", err);
        setQrError("Gagal membuat QR Code.");
      }
    };
    generateQrCodeWithLogo();
  }, [memberData]);

  const handleDownloadQrCode = () => {
    if (qrCodeUrl && memberData) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `QRCode_MartabakJuara_${memberData.memberId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRedeemRequest = async () => {
    if (memberData && memberData.points >= POINTS_TO_REDEEM) {
        setRedeemLoading(true);
        setRedeemError('');
        setRedeemSuccess('');
        try {
            await requestRedemption(memberData, POINTS_TO_REDEEM);
            setRedeemSuccess('Permintaan penukaran berhasil dikirim! Harap tunggu konfirmasi dari admin.');
            // Refresh data to show pending status
            await fetchData();
        } catch(err: any) {
            setRedeemError(err.message || 'Gagal mengirim permintaan penukaran.');
        } finally {
            setRedeemLoading(false);
        }
    }
  }
  
  const handleLocationSave = async (newAddress: Address) => {
    try {
      await updateMemberAddress(user.uid, newAddress);
      setMemberData(prev => prev ? { ...prev, address: newAddress } : null);
      setIsLocationModalOpen(false);
    } catch (err) {
      console.error("Failed to save address:", err);
      alert('Gagal menyimpan alamat. Silakan coba lagi.');
      throw err;
    }
  };

  const getMapLink = (address: Address) => {
      if (address.mapUrl) return address.mapUrl;
      if (address.coords) return `https://www.google.com/maps?q=${address.coords.latitude},${address.coords.longitude}`;
      return `https://www.google.com/maps?q=${encodeURIComponent(address.displayAddress)}`;
  }

  const getStatusChip = (status: Redemption['status']) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">Menunggu</span>;
      case 'approved': return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Disetujui</span>;
      case 'rejected': return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Ditolak</span>;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><SpinnerIcon className="h-10 w-10 animate-spin text-yellow-600" /></div>;
  }

  if (error || !memberData) {
    return <div className="text-center text-red-500">{error || 'Data member tidak ditemukan.'}</div>;
  }

  const pointsProgress = Math.min((memberData.points / POINTS_TO_REDEEM) * 100, 100);

  return (
    <div className="animate-fade-in space-y-8">
      <HomePage navigate={() => {}} showRegisterButton={false} />

      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Dashboard Member Anda</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 flex flex-col">
            <h2 className="text-xl font-bold text-yellow-900">Poin Reward Anda</h2>
            <div className="text-center my-4">
              <p className="text-6xl font-bold text-amber-600">{memberData.points}</p>
              <p className="text-gray-600">Poin Terkumpul</p>
            </div>
            <div className="mt-auto">
              <h3 className="font-semibold text-gray-700">Tukar Poin dengan Produk Gratis</h3>
              <p className="text-sm text-gray-500 mb-2">Butuh {POINTS_TO_REDEEM} poin untuk dapat 1 martabak gratis!</p>
              <div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-gradient-to-r from-yellow-400 to-amber-500 h-4 rounded-full" style={{ width: `${pointsProgress}%` }}></div></div>
              <p className="text-right text-sm font-medium mt-1 text-gray-600">{memberData.points} / {POINTS_TO_REDEEM} Poin</p>
            </div>
            <button 
              onClick={handleRedeemRequest}
              disabled={memberData.points < POINTS_TO_REDEEM || redeemLoading || hasPendingRequest}
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {redeemLoading ? <><SpinnerIcon className="w-5 h-5 animate-spin" /> Mengirim...</> : hasPendingRequest ? 'Permintaan Sedang Diproses' : `Ajukan Penukaran ${POINTS_TO_REDEEM} Poin`}
            </button>
            {redeemError && <p className="text-red-500 text-center text-sm mt-2">{redeemError}</p>}
            {redeemSuccess && <p className="text-green-600 text-center text-sm mt-2">{redeemSuccess}</p>}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                <h2 className="text-xl font-bold text-yellow-900 mb-4">Kode Member</h2>
                <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white w-full mx-auto rounded-xl p-4 mb-4">
                    <div className="flex justify-between items-center"><h3 className="text-lg font-bold">Member Card</h3><MartabakIcon className="h-6 w-6 text-yellow-100" /></div>
                    <div className="text-left mt-2"><p className="text-xs opacity-80">Member ID</p><p className="font-mono tracking-widest">{memberData.memberId}</p></div>
                </div>
                {qrCodeUrl ? <img src={qrCodeUrl} alt="QR Code Member" className="mx-auto rounded-lg" /> : qrError ? <div className="w-[256px] h-[256px] flex items-center justify-center text-center mx-auto text-red-600 bg-red-50 p-4 rounded-lg"><span>{qrError}</span></div> : <div className="w-[256px] h-[256px] flex items-center justify-center mx-auto"><SpinnerIcon className="h-8 w-8 animate-spin" /></div>}
                <p className="mt-2 text-sm text-gray-600">Gunakan kode ini saat transaksi.</p>
                <button
                  onClick={handleDownloadQrCode}
                  disabled={!qrCodeUrl || !!qrError}
                  className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Unduh QR Code
                </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-yellow-900 mb-4 flex items-center gap-2"><ClockIcon className="h-5 w-5" /> Riwayat Penukaran Poin</h2>
            {redemptionHistory.length > 0 ? (
              <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {redemptionHistory.map(item => (
                  <li key={item.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">Tukar {item.pointsToRedeem} Poin</p>
                      <p className="text-xs text-gray-500">{item.requestTimestamp.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                    {getStatusChip(item.status)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-8">Anda belum pernah melakukan penukaran poin.</p>
            )}
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-yellow-900 mb-4">Alamat Pengiriman</h2>
            {memberData.address ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3"><MapPinIcon className="h-5 w-5 text-gray-500 mt-1 flex-shrink-0" /><p className="text-gray-700">{memberData.address.displayAddress}</p></div>
                  <a href={getMapLink(memberData.address)} target="_blank" rel="noopener noreferrer" className="text-yellow-600 hover:underline text-sm font-semibold">Lihat di Peta</a>
                </div>
            ) : <p className="text-gray-500">Anda belum mengatur alamat.</p>}
            <button onClick={() => setIsLocationModalOpen(true)} className="w-full mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition">
                {memberData.address ? 'Ubah Alamat' : 'Atur Alamat Sekarang'}
            </button>
        </div>
      </div>
      
      <LocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} onSave={handleLocationSave} />
    </div>
  );
};

export default MemberDashboardPage;
