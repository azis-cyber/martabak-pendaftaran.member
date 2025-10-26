import React, { useState, useEffect, useRef } from 'react';
import { getDashboardStats, findMemberByMemberId, addPointsToMember, getPendingRedemptions, processRedemption } from '../services/firebaseService';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import { type MemberData, type Redemption } from '../types';
import { Html5Qrcode } from 'html5-qrcode';
import ClockIcon from '../components/icons/ClockIcon';

interface DashboardStats {
  totalMembers: number;
  totalPoints: number;
  lowStockItems: number;
  pendingRedemptions: number;
}

interface AdminDashboardPageProps {
  navigate: (page: 'all-members' | 'inventory' | 'redemption-history') => void;
}

const StatCard: React.FC<{ title: string; value: string | number; description: string; onClick?: () => void; urgent?: boolean }> = ({ title, value, description, onClick, urgent }) => (
    <div onClick={onClick} className={`bg-white p-6 rounded-xl shadow-md ${onClick ? 'cursor-pointer hover:bg-yellow-50' : ''} ${urgent ? 'ring-2 ring-red-500' : ''}`}>
        <h3 className="text-lg font-semibold text-gray-500">{title}</h3>
        <p className="text-4xl font-bold text-yellow-900 mt-2">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
    </div>
);

const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ navigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');
  
  const [pendingRedemptions, setPendingRedemptions] = useState<Redemption[]>([]);
  const [loadingRedemptions, setLoadingRedemptions] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // State for transaction panel
  const [searchId, setSearchId] = useState('');
  const [foundMember, setFoundMember] = useState<MemberData | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [addPointsLoading, setAddPointsLoading] = useState(false);
  const [addPointsSuccess, setAddPointsSuccess] = useState('');
  const [isScannerVisible, setIsScannerVisible] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-scanner-container";


  const fetchAllData = async () => {
      setLoadingStats(true);
      setLoadingRedemptions(true);
      try {
          const statsPromise = getDashboardStats();
          const redemptionsPromise = getPendingRedemptions();

          const [statsData, redemptionsData] = await Promise.all([statsPromise, redemptionsPromise]);
          
          setStats(statsData);
          setPendingRedemptions(redemptionsData);

      } catch (err) {
          console.error(err);
          setError('Gagal memuat data dashboard.');
      } finally {
          setLoadingStats(false);
          setLoadingRedemptions(false);
      }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleProcessRedemption = async (redemptionId: string, action: 'approve' | 'reject') => {
    setProcessingId(redemptionId);
    try {
        await processRedemption(redemptionId, action);
        // Refresh all data to keep dashboard consistent
        await fetchAllData();
    } catch (err: any) {
        console.error("Failed to process redemption", err);
        alert(`Error: ${err.message}`);
    } finally {
        setProcessingId(null);
    }
  };


  const handleScanSuccess = (decodedText: string) => {
    setIsScannerVisible(false);
    setSearchId(decodedText);
    resetSearch();
    setTimeout(() => handleSearchMember(), 100);
  };

  useEffect(() => {
    if (isScannerVisible) {
        const html5QrCode = new Html5Qrcode(scannerContainerId);
        scannerRef.current = html5QrCode;
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        
        html5QrCode.start({ facingMode: "environment" }, config, handleScanSuccess, undefined)
            .catch(err => {
                console.error("Unable to start scanning.", err);
                setSearchError("Gagal memulai kamera. Pastikan Anda memberikan izin.");
                setIsScannerVisible(false);
            });
    }
    return () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().catch(err => console.error("Failed to stop scanner.", err));
        }
    };
  }, [isScannerVisible]);

  const resetSearch = () => {
      setFoundMember(null);
      setSearchError('');
      setAddPointsSuccess('');
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchId(e.target.value);
      resetSearch();
  };
  
  const handleSearchMember = async () => {
      if (!searchId) return;
      setSearchLoading(true);
      resetSearch();

      try {
          const member = await findMemberByMemberId(searchId.trim().toUpperCase());
          if (member) setFoundMember(member);
          else setSearchError(`Member dengan ID "${searchId}" tidak ditemukan.`);
      } catch (err) {
          console.error(err);
          setSearchError('Terjadi kesalahan saat mencari member.');
      } finally {
          setSearchLoading(false);
      }
  };

  const handleAddPoints = async () => {
      if (!foundMember) return;
      
      setAddPointsLoading(true);
      setAddPointsSuccess('');
      setSearchError('');
      const POINTS_PER_TRANSACTION = 5;

      try {
        const newPoints = await addPointsToMember(foundMember.uid, POINTS_PER_TRANSACTION);
        setFoundMember(prev => prev ? { ...prev, points: newPoints } : null);
        setAddPointsSuccess(`Berhasil! ${POINTS_PER_TRANSACTION} poin ditambahkan. Total poin sekarang: ${newPoints}.`);
      } catch (err: any) {
        setSearchError(err.message || 'Gagal menambahkan poin.');
      } finally {
        setAddPointsLoading(false);
      }
  };
  
  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
        {loadingStats ? <div className="text-center p-4"><SpinnerIcon className="h-8 w-8 animate-spin text-yellow-600" /></div> : error ? <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Member" value={stats?.totalMembers ?? 0} description="Jumlah member terdaftar" />
            <StatCard title="Poin Beredar" value={stats?.totalPoints ?? 0} description="Total poin milik member" />
            <StatCard title="Stok Menipis" value={stats?.lowStockItems ?? 0} description="Item inventaris stok rendah" />
            <StatCard 
                title="Permintaan Pending" 
                value={stats?.pendingRedemptions ?? 0} 
                description="Penukaran menunggu persetujuan" 
                onClick={() => document.getElementById('redemption-panel')?.scrollIntoView({ behavior: 'smooth' })}
                urgent={(stats?.pendingRedemptions ?? 0) > 0}
            />
          </div>
        )}
      </div>
      
      {/* Redemption Panel */}
      <div id="redemption-panel" className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-yellow-900 mb-4 flex items-center gap-2"><ClockIcon className="h-6 w-6"/> Permintaan Penukaran Poin</h2>
        {loadingRedemptions ? <div className="text-center p-4"><SpinnerIcon className="h-6 w-6 animate-spin text-yellow-600" /></div> : pendingRedemptions.length > 0 ? (
          <div className="space-y-4">
            {pendingRedemptions.map(req => (
              <div key={req.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-lg text-gray-800">{req.memberName}</p>
                  <p className="text-sm text-gray-600">ID: {req.memberId} | Minta tukar <span className="font-bold">{req.pointsToRedeem}</span> poin</p>
                  <p className="text-xs text-gray-500">Pada: {req.requestTimestamp.toLocaleString('id-ID')}</p>
                </div>
                <div className="flex gap-2 mt-3 sm:mt-0">
                  <button 
                    onClick={() => handleProcessRedemption(req.id, 'approve')} 
                    disabled={processingId === req.id}
                    className="flex-1 sm:flex-none justify-center px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:bg-gray-400 flex items-center gap-1"
                  >
                    {processingId === req.id ? <SpinnerIcon className="h-4 w-4 animate-spin"/> : 'Setujui'}
                  </button>
                  <button 
                    onClick={() => handleProcessRedemption(req.id, 'reject')}
                    disabled={processingId === req.id}
                    className="flex-1 sm:flex-none justify-center px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:bg-gray-400 flex items-center gap-1"
                  >
                    {processingId === req.id ? <SpinnerIcon className="h-4 w-4 animate-spin"/> : 'Tolak'}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => navigate('redemption-history')} className="w-full text-center mt-4 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700">Lihat Riwayat Lengkap</button>
          </div>
        ) : <p className="text-center text-gray-500 py-4">Tidak ada permintaan penukaran poin yang pending.</p>}
      </div>

      {/* Transaction Panel */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold text-yellow-900 mb-4">Catat Transaksi & Tambah Poin</h2>
        {isScannerVisible && ( <div className="mb-4"> <div id={scannerContainerId} className="w-full max-w-sm mx-auto rounded-lg overflow-hidden border"></div><button onClick={() => setIsScannerVisible(false)} className="mt-2 w-full text-center p-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm">Tutup Scanner</button></div> )}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input type="text" value={searchId} onChange={handleSearchChange} placeholder="Ketik atau Scan Member ID" className="flex-grow px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"/>
          <div className="flex gap-2">
            <button onClick={handleSearchMember} disabled={searchLoading || !searchId} className="w-full sm:w-auto flex justify-center items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400">
              {searchLoading ? <><SpinnerIcon className="h-5 w-5 animate-spin" /> Mencari...</> : 'Cari Member'}
            </button>
            <button onClick={() => setIsScannerVisible(true)} className="w-full sm:w-auto bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded-lg">Scan QR</button>
          </div>
        </div>
        {searchError && <p className="text-red-500 text-center text-sm mt-2">{searchError}</p>}
        {addPointsSuccess && <p className="text-green-600 text-center text-sm mt-2">{addPointsSuccess}</p>}
        {foundMember && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800">Member Ditemukan:</h3>
            <p className="text-2xl font-bold text-yellow-800">{foundMember.name}</p>
            <p className="text-gray-600">ID: {foundMember.memberId} | Poin Saat Ini: <span className="font-bold">{foundMember.points}</span></p>
            <button onClick={handleAddPoints} disabled={addPointsLoading} className="w-full mt-4 flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg disabled:bg-gray-400">
              {addPointsLoading ? <><SpinnerIcon className="h-5 w-5 animate-spin" /> Memproses...</> : 'Catat Transaksi & Tambah 5 Poin'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold text-yellow-900 mb-4">Akses Cepat</h2>
            <div className="space-y-4">
                <button onClick={() => navigate('all-members')} className="w-full text-left p-4 bg-yellow-100 hover:bg-yellow-200 rounded-lg font-semibold text-yellow-800 transition">Lihat Semua Member</button>
                <button onClick={() => navigate('inventory')} className="w-full text-left p-4 bg-yellow-100 hover:bg-yellow-200 rounded-lg font-semibold text-yellow-800 transition">Kelola Inventaris</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;