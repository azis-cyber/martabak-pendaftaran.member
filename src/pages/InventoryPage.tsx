import React, { useState, useEffect } from 'react';
import { 
  getInventoryItems, 
  addInventoryItem, 
  deleteInventoryItem, 
  updateInventoryItem, 
  recordInventoryUsage, 
  getRecentInventoryUsage 
} from '../services/firebaseService';
import { type InventoryItem, type InventoryUsageLog } from '../types';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

interface InventoryPageProps {
  handleBack: () => void;
}

// Helper function to format numbers for display
const formatNumber = (num: number): string => {
  // Use Intl.NumberFormat for locale-aware formatting (e.g., using comma as decimal separator)
  // and to handle significant digits appropriately.
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
};

const InventoryPage: React.FC<InventoryPageProps> = ({ handleBack }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', stock: '', unit: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const [activeTab, setActiveTab] = useState<'list' | 'usage'>('list');
  const [usageData, setUsageData] = useState({ itemId: '', quantity: '' });
  const [selectedItemUnit, setSelectedItemUnit] = useState('');
  const [isUsageSubmitting, setIsUsageSubmitting] = useState(false);
  const [usageError, setUsageError] = useState('');
  const [usageSuccess, setUsageSuccess] = useState('');
  const [recentUsages, setRecentUsages] = useState<InventoryUsageLog[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchData = async () => {
    setLoadingData(true);
    setError('');
    try {
      const itemsPromise = getInventoryItems();
      const usagePromise = getRecentInventoryUsage();
      const [items, usages] = await Promise.all([itemsPromise, usagePromise]);
      
      setInventory(items);
      setRecentUsages(usages);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat data. Coba muat ulang halaman.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getStatus = (stock: number): { text: string; color: string } => {
    if (stock <= 0) {
      return { text: 'Habis', color: 'bg-red-100 text-red-800' };
    }
    if (stock <= 10) {
      return { text: 'Stok Sedikit', color: 'bg-yellow-100 text-yellow-800' };
    }
    return { text: 'Tersedia', color: 'bg-green-100 text-green-800' };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem(prev => ({ ...prev, [name]: value }));
  };
  
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setNewItem({ name: '', stock: '', unit: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setNewItem({ 
        name: item.name, 
        stock: String(item.stock),
        unit: item.unit 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.stock || !newItem.unit) {
      alert('Semua kolom harus diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemData = {
        name: newItem.name,
        stock: parseFloat(newItem.stock.replace(',', '.')), // Handle comma decimal input
        unit: newItem.unit
      };
      
      if (editingItem) {
        await updateInventoryItem(editingItem.id, itemData);
      } else {
        await addInventoryItem(itemData);
      }

      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error(err);
      alert(editingItem ? 'Gagal memperbarui item.' : 'Gagal menambahkan item baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus item "${name}"?`)) {
        try {
            await deleteInventoryItem(id);
            await fetchData();
        } catch (err) {
            console.error(err);
            alert('Gagal menghapus item.');
        }
    }
  };

  const handleUsageInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUsageData(prev => ({ ...prev, [name]: value }));
    setUsageError('');
    setUsageSuccess('');

    if (name === 'itemId') {
        const selectedItem = inventory.find(item => item.id === value);
        setSelectedItemUnit(selectedItem ? selectedItem.unit : '');
    }
  };

  const handleUsageSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      const { itemId, quantity } = usageData;
      const quantityNum = parseFloat(quantity.replace(',', '.')); // Handle comma decimal input

      if (!itemId || !quantity || quantityNum <= 0) {
          setUsageError('Silakan pilih item dan masukkan jumlah yang valid.');
          return;
      }

      const selectedItem = inventory.find(item => item.id === itemId);
      if (!selectedItem) {
          setUsageError('Item yang dipilih tidak valid.');
          return;
      }

      setIsUsageSubmitting(true);
      setUsageError('');
      setUsageSuccess('');
      try {
          await recordInventoryUsage(
              selectedItem.id,
              selectedItem.name,
              quantityNum,
              selectedItem.unit
          );
          setUsageSuccess(`Berhasil mencatat penggunaan ${formatNumber(quantityNum)} ${selectedItem.unit} ${selectedItem.name}.`);
          setUsageData({ itemId: '', quantity: '' });
          setSelectedItemUnit('');
          await fetchData();
      } catch (err: any) {
          setUsageError(err.message || 'Gagal mencatat penggunaan.');
      } finally {
          setIsUsageSubmitting(false);
      }
  };

  const TabButton: React.FC<{ tabId: 'list' | 'usage'; children: React.ReactNode }> = ({ tabId, children }) => (
    <button
        onClick={() => setActiveTab(tabId)}
        className={`px-3 py-2 font-semibold text-lg rounded-t-lg transition-colors ${
            activeTab === tabId
                ? 'border-b-4 border-yellow-500 text-yellow-800'
                : 'text-gray-500 hover:text-yellow-700'
        }`}
    >
        {children}
    </button>
  );


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

      <h1 className="text-3xl font-bold text-gray-800 mb-6">Manajemen Inventaris</h1>
      
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="border-b border-gray-200">
            <nav className="flex space-x-6" aria-label="Tabs">
                <TabButton tabId="list">Daftar Stok</TabButton>
                <TabButton tabId="usage">Catat Penggunaan</TabButton>
            </nav>
        </div>

        {loadingData ? (
          <div className="flex justify-center items-center py-10">
            <SpinnerIcon className="h-8 w-8 animate-spin text-yellow-600" />
            <span className="ml-2 text-gray-600">Memuat data...</span>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-600 bg-red-50 rounded-lg">{error}</div>
        ) : (
            <>
                {activeTab === 'list' && (
                    <div className="pt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-yellow-900">Stok Bahan Baku</h2>
                            <button onClick={handleOpenAddModal} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg transition">
                                Tambah Item Baru
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                            <thead className="bg-gray-50">
                                <tr>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Item</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stok</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {inventory.map((item) => {
                                const status = getStatus(item.stock);
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="py-4 px-6 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                    <td className="py-4 px-6 whitespace-nowrap text-sm text-gray-500">{formatNumber(item.stock)} {item.unit}</td>
                                    <td className="py-4 px-6 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                                        {status.text}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 whitespace-nowrap text-sm font-medium">
                                        <button onClick={() => handleOpenEditModal(item)} className="text-yellow-600 hover:text-yellow-900 mr-4">Edit</button>
                                        <button onClick={() => handleDelete(item.id, item.name)} className="text-red-600 hover:text-red-900">Hapus</button>
                                    </td>
                                    </tr>
                                )
                                })}
                            </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                {activeTab === 'usage' && (
                    <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Usage Form */}
                        <div>
                            <h2 className="text-xl font-bold text-yellow-900 mb-4">Form Penggunaan Bahan</h2>
                            <form onSubmit={handleUsageSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <label htmlFor="itemId" className="block text-sm font-medium text-gray-700 mb-1">Pilih Item</label>
                                    <select name="itemId" id="itemId" value={usageData.itemId} onChange={handleUsageInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500">
                                        <option value="" disabled>-- Pilih bahan baku --</option>
                                        {inventory.map(item => <option key={item.id} value={item.id}>{item.name} (Stok: {formatNumber(item.stock)} {item.unit})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Digunakan</label>
                                    <div className="flex">
                                        <input type="number" name="quantity" id="quantity" value={usageData.quantity} onChange={handleUsageInputChange} min="0.001" step="any" required className="w-full px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-yellow-500 focus:border-yellow-500" placeholder="Contoh: 0,5" />
                                        {selectedItemUnit && <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">{selectedItemUnit}</span>}
                                    </div>
                                </div>
                                {usageError && <p className="text-red-500 text-sm text-center">{usageError}</p>}
                                {usageSuccess && <p className="text-green-600 text-sm text-center">{usageSuccess}</p>}
                                <button type="submit" disabled={isUsageSubmitting} className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-400">
                                    {isUsageSubmitting ? <><SpinnerIcon className="h-5 w-5 animate-spin" /> Mencatat...</> : 'Catat Penggunaan'}
                                </button>
                            </form>
                        </div>
                        {/* Recent Usage */}
                        <div>
                            <h2 className="text-xl font-bold text-yellow-900 mb-4">5 Penggunaan Terakhir</h2>
                            {recentUsages.length > 0 ? (
                                <ul className="space-y-3">
                                    {recentUsages.map(log => (
                                        <li key={log.id} className="p-3 bg-yellow-50 rounded-lg text-sm">
                                            <p className="font-semibold text-gray-800">{log.itemName}</p>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Digunakan: <span className="font-bold">{formatNumber(log.quantityUsed)} {log.unit}</span></span>
                                                <span className="text-xs">{log.timestamp.toLocaleString('id-ID')}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center mt-8">Belum ada riwayat penggunaan.</p>
                            )}
                        </div>
                    </div>
                )}
            </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md animate-fade-in">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">{editingItem ? 'Edit Item Inventaris' : 'Tambah Item Inventaris Baru'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nama Item</label>
                  <input type="text" name="name" id="name" value={newItem.name} onChange={handleInputChange} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" />
                </div>
                <div>
                  <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">Jumlah Stok</label>
                  <input type="number" name="stock" id="stock" value={newItem.stock} onChange={handleInputChange} min="0" step="any" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" placeholder="Contoh: 10,5" />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                  <input type="text" name="unit" id="unit" value={newItem.unit} onChange={handleInputChange} placeholder="Contoh: kg, pcs, blok" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-yellow-500 focus:border-yellow-500" />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Batal</button>
                <button type="submit" disabled={isSubmitting} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-400 flex items-center gap-2">
                  {isSubmitting ? <><SpinnerIcon className="h-5 w-5 animate-spin" /> Menyimpan...</> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
