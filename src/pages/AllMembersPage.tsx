// pages/AllMembersPage.tsx
import React, { useState, useEffect } from 'react';
import { getAllMembers } from '../services/firebaseService';
import { type MemberData } from '../types';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import RoutePlannerModal from '../components/RoutePlannerModal';
import RouteIcon from '../components/icons/RouteIcon';
import SearchIcon from '../components/icons/SearchIcon';

interface AllMembersPageProps {
  handleBack: () => void;
}

const AllMembersPage: React.FC<AllMembersPageProps> = ({ handleBack }) => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeTargetMember, setRouteTargetMember] = useState<MemberData | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        setError('');
        const memberList = await getAllMembers();
        memberList.sort((a, b) => a.name.localeCompare(b.name));
        setMembers(memberList);
        setFilteredMembers(memberList);
      } catch (err) {
        console.error(err);
        setError('Gagal memuat daftar member. Silakan coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);
  
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = members.filter(member =>
      member.name.toLowerCase().includes(lowercasedQuery) ||
      member.memberId.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredMembers(filtered);
  }, [searchQuery, members]);
  
  const handlePlanRoute = (member: MemberData) => {
    setRouteTargetMember(member);
    setIsRouteModalOpen(true);
  };

  return (
    <div className="animate-fade-in">
       <button 
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Kembali ke halaman sebelumnya"
      >
          <ArrowLeftIcon className="h-4 w-4" />
          Kembali ke Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Daftar Semua Member</h1>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl p-6">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <SpinnerIcon className="h-10 w-10 animate-spin text-yellow-600" />
            <span className="ml-3 text-gray-600 text-lg">Memuat data member...</span>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600 bg-red-50 rounded-lg">{error}</div>
        ) : (
          <>
            <div className="mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari berdasarkan nama atau member ID..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500"
                    />
                </div>
            </div>
            {members.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p className="text-xl">Belum ada member yang terdaftar.</p>
                </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member ID</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontak</th>
                      <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                      <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Poin</th>
                      <th className="py-3 px-6 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredMembers.map((member) => (
                      <tr key={member.uid} className="hover:bg-yellow-50">
                        <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{member.name}</td>
                        <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500 font-mono">{member.memberId}</td>
                        <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex flex-col">
                                <span>{member.email}</span>
                                <span className="text-xs text-gray-400">{member.phone}</span>
                            </div>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">
                          {member.address ? (
                            <div className="flex flex-col">
                                <span className="max-w-xs truncate" title={member.address.displayAddress}>
                                    {member.address.displayAddress}
                                </span>
                                <a 
                                    href={
                                        member.address.mapUrl || 
                                        (member.address.coords ? `https://www.google.com/maps?q=${member.address.coords.latitude},${member.address.coords.longitude}` : 
                                        `https://www.google.com/maps?q=${encodeURIComponent(member.address.displayAddress)}`)
                                    } 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-yellow-600 hover:underline text-xs font-semibold"
                                >
                                    Lihat di Peta
                                </a>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Belum diatur</span>
                          )}
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap text-sm text-right font-bold text-amber-600">{member.points}</td>
                        <td className="py-4 px-6 whitespace-nowrap text-sm text-center">
                            {member.address && (
                                <button 
                                    onClick={() => handlePlanRoute(member)}
                                    className="flex items-center gap-1.5 bg-blue-100 text-blue-800 font-semibold py-1 px-3 rounded-full text-xs hover:bg-blue-200 transition"
                                    title={`Buat rute ke ${member.name}`}
                                >
                                    <RouteIcon className="h-4 w-4" />
                                    Buat Rute
                                </button>
                            )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                 {filteredMembers.length === 0 && searchQuery && (
                    <div className="text-center py-10 text-gray-500">
                        <p>Tidak ada member yang cocok dengan pencarian "{searchQuery}".</p>
                    </div>
                 )}
              </div>
            )}
          </>
        )}
      </div>
      
      <RoutePlannerModal
        isOpen={isRouteModalOpen}
        onClose={() => {
            setIsRouteModalOpen(false);
            setRouteTargetMember(null);
        }}
        targetMember={routeTargetMember}
    />
    </div>
  );
};

export default AllMembersPage;
