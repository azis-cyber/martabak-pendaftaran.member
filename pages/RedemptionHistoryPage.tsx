import React, { useState, useEffect, useMemo } from 'react';
import { getAllRedemptions, processRedemption } from '../services/firebaseService';
import { type Redemption } from '../types';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

interface RedemptionHistoryPageProps {
  handleBack: () => void;
}

const RedemptionHistoryPage: React.FC<RedemptionHistoryPageProps> = ({ handleBack }) => {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | Redemption['status']>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getAllRedemptions();
      setRedemptions(data);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat riwayat penukaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProcessRedemption = async (redemptionId: string, action: 'approve' | 'reject') => {
    setProcessingId(redemptionId);
    try {
        await processRedemption(redemptionId, action);
        await fetchData(); // Refresh data after processing
    } catch (err: any) {
        console.error("Failed to process redemption", err);
        alert(`Error: ${err.message}`);
    } finally {
        setProcessingId(null);
    }
  };

  const filteredRedemptions = useMemo(() => {
    if (filter === 'all') {
      return redemptions;
    }
    return redemptions.filter(r => r.status === filter);
  }, [filter, redemptions]);

  const getStatusChip = (status: Redemption['status']) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">Menunggu</span>;
      case 'approved': return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Disetujui</span>;
      case 'rejected': return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Ditolak</span>;
    }
  };

  const FilterButton: React.FC<{ filterValue: typeof filter, text: string }> = ({ filterValue, text }) => (
    <button
        onClick={() => setFilter(filterValue)}
        className={`px-4 py-2 text-sm font-semibold rounded-lg transition ${filter === filterValue ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
    >
        {text}
    </button>
  );

  return (
    <div className="animate-fade-in">
      <button onClick={handleBack} className="flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 hover:text-gray-900">
        <ArrowLeftIcon className="h-4 w-4" /> Kembali ke Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Riwayat Penukaran Poin Member</h1>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-6">
        {loading ? (
          <div className="flex justify-center items-center py-20"><SpinnerIcon className="h-10 w-10 animate-spin text-yellow-600" /><span className="ml-3 text-lg">Memuat data...</span></div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 bg-red-50 rounded-lg">{error}</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
                <FilterButton filterValue="all" text="Semua" />
                <FilterButton filterValue="pending" text="Menunggu" />
                <FilterButton filterValue="approved" text="Disetujui" />
                <FilterButton filterValue="rejected" text="Ditolak" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Nama Member</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Poin</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Tgl Permintaan</th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRedemptions.map((req) => (
                    <tr key={req.id} className="hover:bg-yellow-50">
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">{req.memberName} <span className="text-gray-500 font-normal">({req.memberId})</span></td>
                      <td className="py-4 px-4 text-sm font-bold text-amber-600">{req.pointsToRedeem}</td>
                      <td className="py-4 px-4 text-sm text-gray-500">{req.requestTimestamp.toLocaleString('id-ID')}</td>
                      <td className="py-4 px-4 text-sm">{getStatusChip(req.status)}</td>
                      <td className="py-4 px-4 text-sm text-center">
                        {req.status === 'pending' ? (
                          <div className="flex gap-2 justify-center">
                            <button onClick={() => handleProcessRedemption(req.id, 'approve')} disabled={processingId === req.id} className="px-3 py-1 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 rounded-md disabled:bg-gray-400">Setujui</button>
                            <button onClick={() => handleProcessRedemption(req.id, 'reject')} disabled={processingId === req.id} className="px-3 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-md disabled:bg-gray-400">Tolak</button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Diproses {req.processedTimestamp?.toLocaleDateString('id-ID')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRedemptions.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                    <p>Tidak ada data penukaran yang cocok dengan filter "{filter}".</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RedemptionHistoryPage;