import React from 'react';

interface HomePageProps {
  navigate: (page: 'register') => void;
  showRegisterButton?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ navigate, showRegisterButton = true }) => {
  return (
    <div className="animate-fade-in">
       <div className="w-full bg-white rounded-2xl shadow-xl p-6 sm:p-10">
        <section id="hero" className="text-center">
            <img 
            src={`https://picsum.photos/seed/${new Date().getDate()}/1200/500`}
            alt="Martabak lezat" 
            className="w-full h-48 sm:h-72 object-cover rounded-xl mb-6 shadow-md"
            />
            <h1 className="text-3xl sm:text-4xl font-bold text-yellow-900 mb-3">
            Selamat Datang di Klub Pecinta Martabak Juara!
            </h1>
            <p className="text-gray-700 max-w-3xl mx-auto text-lg mb-8">
            Jadilah bagian dari komunitas kami! Dapatkan diskon eksklusif, informasi rasa baru lebih dulu, dan kumpulkan poin untuk ditukar dengan martabak gratis.
            </p>
            {showRegisterButton && (
              <button
                onClick={() => navigate('register')}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-transform transform hover:scale-105"
              >
                Daftar Jadi Member Sekarang!
              </button>
            )}
        </section>
        </div>
    </div>
  );
};

export default HomePage;