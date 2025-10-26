
import React, { useState, useEffect } from 'react';
import { onAuthChange, doSignOut, type User } from './services/firebaseService';
import { type Page } from './types';

import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import RegistrationPage from './pages/RegistrationPage';
import MemberLoginPage from './pages/MemberLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AboutPage from './pages/AboutPage';
import MemberDashboardPage from './pages/MemberDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import InventoryPage from './pages/InventoryPage';
import AllMembersPage from './pages/AllMembersPage';
import SettingsPage from './pages/SettingsPage';
import RedemptionHistoryPage from './pages/RedemptionHistoryPage';
import MenuIcon from './components/icons/MenuIcon';
import SpinnerIcon from './components/icons/SpinnerIcon';
import Chatbot from './components/Chatbot';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [history, setHistory] = useState<Page[]>(['home']);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setIsAdmin(!!user && user.email === 'admin@martabakjuara.com');
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (authLoading) return; 

    const adminPages: Page[] = ['admin-dashboard', 'all-members', 'inventory', 'settings', 'redemption-history'];
    const memberPages: Page[] = ['member-dashboard'];
    const publicAuthPages: Page[] = ['home', 'register', 'member-login', 'admin-login', 'about'];
    const protectedPages: Page[] = [...adminPages, ...memberPages];

    if (isAdmin) {
      if (!adminPages.includes(currentPage)) {
        navigate('admin-dashboard');
      }
    } else if (user) {
      if (publicAuthPages.includes(currentPage)) {
        navigate('member-dashboard');
      }
    } else {
      if (protectedPages.includes(currentPage)) {
        navigate('home');
      }
    }
  }, [user, isAdmin, currentPage, authLoading]);


  const navigate = (page: Page) => {
    if (page !== currentPage) {
      setHistory(prev => [...prev, page]);
      setCurrentPage(page);
    }
  };
  
  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const previousPage = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentPage(previousPage);
    }
  };

  const handleLogout = async () => {
    await doSignOut();
    setUser(null);
    setIsAdmin(false);
    setCurrentPage('home');
    setHistory(['home']);
  };

  const renderPage = () => {
    if (authLoading) {
      return (
        <div className="flex justify-center items-center h-full w-full">
          <SpinnerIcon className="h-12 w-12 animate-spin text-yellow-600" />
        </div>
      );
    }
    
    // Admin Routes
    if (isAdmin) {
        switch (currentPage) {
            case 'admin-dashboard':
                return <AdminDashboardPage navigate={navigate} />;
            case 'all-members':
                return <AllMembersPage handleBack={handleBack} />;
            case 'inventory':
                return <InventoryPage handleBack={handleBack} />;
            case 'settings':
                return <SettingsPage handleBack={handleBack} />;
            case 'redemption-history':
                return <RedemptionHistoryPage handleBack={handleBack} />;
            default:
                return <AdminDashboardPage navigate={navigate} />;
        }
    }
    
    // Member Routes
    if (user) {
        switch (currentPage) {
            case 'member-dashboard':
                return <MemberDashboardPage user={{ uid: user.uid }} />;
            case 'about':
                return <AboutPage handleBack={handleBack} />;
             default:
                return <MemberDashboardPage user={{ uid: user.uid }} />;
        }
    }

    // Public Routes
    switch (currentPage) {
      case 'register':
        return <RegistrationPage navigate={navigate} />;
      case 'member-login':
        return <MemberLoginPage navigate={navigate} />;
      case 'admin-login':
        return <AdminLoginPage navigate={navigate} setIsAdmin={setIsAdmin} />;
      case 'about':
        return <AboutPage handleBack={handleBack} />;
      case 'home':
      default:
        return <HomePage navigate={navigate} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar 
        navigate={navigate} 
        currentPage={currentPage}
        user={user} 
        isAdmin={isAdmin} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white shadow-md lg:hidden">
            <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg text-yellow-900">Martabak Juara</h1>
            </div>
            <button onClick={() => setIsSidebarOpen(true)} className="p-2">
                <MenuIcon className="h-6 w-6 text-gray-700" />
            </button>
        </header>
        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {renderPage()}
        </div>
      </main>
      <Chatbot />
    </div>
  );
};

export default App;
