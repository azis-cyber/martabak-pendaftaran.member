import React, { useState } from 'react';
import RegistrationForm from '../components/RegistrationForm';
import SuccessDisplay from '../components/SuccessDisplay';
import MartabakIcon from '../components/icons/MartabakIcon';

interface RegistrationPageProps {
  navigate: (page: 'member-login') => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ navigate }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [successData, setSuccessData] = useState({ name: '', memberId: '' });

  const handleSuccess = (data: { name: string; memberId: string }) => {
    setSuccessData(data);
    setIsSubmitted(true);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-10">
            {!isSubmitted ? (
                <>
                <div className="text-center mb-6">
                    <MartabakIcon className="h-12 w-12 text-yellow-600 mx-auto" />
                    <h2 className="text-3xl font-bold text-gray-800 mt-2">Buat Akun Member</h2>
                    <p className="text-gray-600">Isi data di bawah untuk mendapatkan keuntungan eksklusif.</p>
                </div>
                <RegistrationForm onSuccess={handleSuccess} navigate={navigate} />
                <p className="text-center mt-4 text-sm text-gray-600">
                    Sudah punya akun?{' '}
                    <button onClick={() => navigate('member-login')} className="font-medium text-yellow-600 hover:underline">
                    Login di sini
                    </button>
                </p>
                </>
            ) : (
                <SuccessDisplay name={successData.name} memberId={successData.memberId} />
            )}
        </div>
    </div>
  );
};

export default RegistrationPage;