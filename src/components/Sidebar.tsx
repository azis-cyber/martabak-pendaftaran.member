
import React from 'react';
import { type Page } from '../types';
import MartabakIcon from './icons/MartabakIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import CogIcon from './icons/CogIcon';
import ClockIcon from './icons/ClockIcon';

interface SidebarProps {
  navigate: (page: Page) => void;
  currentPage: Page;
  user: any; // Firebase user object
  isAdmin: boolean;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const NavLink: React.FC<{
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-3 rounded-lg transition-colors text-lg flex items-center gap-3 ${
            isActive
                ? 'bg-yellow-400 text-yellow-900 font-bold'
                : 'text-gray-600 hover:bg-yellow-100 hover:text-yellow-800'
        }`}
    >
        {children}
    </button>
);

const Sidebar: React.FC<SidebarProps> = ({ navigate, currentPage, user, isAdmin, onLogout, isOpen, setIsOpen }) => {
    const handleNavigation = (page: Page) => {
        navigate(page);
        if (window.innerWidth < 1024) { // Close sidebar on mobile after navigation
            setIsOpen(false);
        }
    };
    
  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`fixed top-0 left-0 h-full bg-yellow-50 shadow-lg z-40 w-72 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative lg:w-72 lg:flex-shrink-0`}>
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-yellow-200">
                <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => handleNavigation(isAdmin ? 'admin-dashboard' : 'home')}
                >
                    <MartabakIcon className="h-10 w-10 text-yellow-600" />
                    <h1 className="text-xl font-bold text-yellow-900">Martabak Juara</h1>
                </div>
                <button onClick={() => setIsOpen(false)} className="lg:hidden p-1 text-gray-500 hover:text-gray-800">
                    <ChevronLeftIcon className="h-6 w-6" />
                </button>
            </div>
            <nav className="flex-grow p-4 space-y-2">
                {isAdmin ? (
                    <>
                        <p className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">Admin Menu</p>
                        <NavLink onClick={() => handleNavigation('admin-dashboard')} isActive={currentPage === 'admin-dashboard'}>Dashboard</NavLink>
                        <NavLink onClick={() => handleNavigation('all-members')} isActive={currentPage === 'all-members'}>Daftar Member</NavLink>
                        <NavLink onClick={() => handleNavigation('inventory')} isActive={currentPage === 'inventory'}>Inventaris</NavLink>
                        <NavLink onClick={() => handleNavigation('redemption-history')} isActive={currentPage === 'redemption-history'}><ClockIcon className="h-5 w-5" /> Riwayat Penukaran</NavLink>
                        <NavLink onClick={() => handleNavigation('settings')} isActive={currentPage === 'settings'}><CogIcon className="h-5 w-5" /> Pengaturan</NavLink>
                    </>
                ) : user ? (
                     <>
                        <p className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase">Member Area</p>
                        <NavLink onClick={() => handleNavigation('member-dashboard')} isActive={currentPage === 'member-dashboard'}>Dashboard Member</NavLink>
                        <NavLink onClick={() => handleNavigation('about')} isActive={currentPage === 'about'}>Tentang Kami</NavLink>
                    </>
                ) : (
                    <>
                        <NavLink onClick={() => handleNavigation('home')} isActive={currentPage === 'home'}>Home</NavLink>
                        <NavLink onClick={() => handleNavigation('register')} isActive={currentPage === 'register'}>Daftar Member</NavLink>
                        <NavLink onClick={() => handleNavigation('member-login')} isActive={currentPage === 'member-login'}>Login Member</NavLink>
                        <NavLink onClick={() => handleNavigation('about')} isActive={currentPage === 'about'}>Tentang Kami</NavLink>
                         <hr className="my-4 border-yellow-200" />
                        <NavLink onClick={() => handleNavigation('admin-login')} isActive={currentPage === 'admin-login'}>Login Admin</NavLink>
                    </>
                )}
            </nav>
            {user && (
                 <div className="p-4 border-t border-yellow-200">
                     <p className="text-sm text-gray-600 truncate mb-2">Login sebagai: <span className="font-semibold">{user.email}</span></p>
                    <button
                        onClick={onLogout}
                        className="w-full text-center bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        Logout
                    </button>
                 </div>
            )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
