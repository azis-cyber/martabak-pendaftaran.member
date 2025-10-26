
import React from 'react';
import MartabakIcon from '../components/icons/MartabakIcon';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

interface AboutPageProps {
  handleBack?: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ handleBack }) => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
        {handleBack && (
            <button 
                onClick={handleBack}
                className="flex items-center gap-2 mb-6 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                aria-label="Kembali ke halaman sebelumnya"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Kembali
            </button>
        )}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
            <div className="text-center mb-8">
                <MartabakIcon className="h-16 w-16 text-yellow-600 mx-auto" />
                <h1 className="text-4xl font-bold text-gray-800 mt-4">Tentang Martabak Juara</h1>
                <p className="text-lg text-gray-600 mt-2">Kelezatan Tradisi, Inovasi Tiada Henti</p>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700">
                <p>
                    Berawal dari sebuah resep keluarga yang diwariskan turun-temurun, Martabak Juara lahir dari kecintaan kami terhadap cita rasa otentik martabak Indonesia. Kami percaya bahwa setiap gigitan martabak harus menjadi sebuah pengalaman yang tak terlupakan. Oleh karena itu, kami hanya menggunakan bahan-bahan pilihan berkualitas terbaik, dari adonan yang lembut hingga topping yang melimpah.
                </p>
                <p>
                    Di Martabak Juara, kami tidak hanya menyajikan martabak klasik, tetapi juga terus berinovasi menciptakan varian rasa baru yang unik dan menggugah selera. Misi kami adalah untuk membawa kebahagiaan di setiap kotak martabak yang kami sajikan dan menjadi bagian dari momen-momen spesial Anda bersama keluarga dan teman.
                </p>
                <p>
                    Program member kami diciptakan sebagai bentuk apresiasi kepada Anda, para pelanggan setia kami. Dengan bergabung, Anda tidak hanya mendapatkan diskon, tetapi juga menjadi bagian dari keluarga besar Martabak Juara.
                </p>
            </div>
        </div>
    </div>
  );
};

export default AboutPage;