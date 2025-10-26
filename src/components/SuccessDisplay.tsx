import React, { useEffect, useState, useRef } from 'react';
import MartabakIcon from './icons/MartabakIcon';
import { generateWelcomeMessage } from '../services/geminiService';
import SpinnerIcon from './icons/SpinnerIcon';
import QRCode from 'qrcode';

interface SuccessDisplayProps {
  name: string;
  memberId: string;
}

const SuccessDisplay: React.FC<SuccessDisplayProps> = ({ name, memberId }) => {
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loadingMessage, setLoadingMessage] = useState<boolean>(true);
  const [qrError, setQrError] = useState<string>('');

  useEffect(() => {
    const fetchWelcomeMessage = async () => {
      setLoadingMessage(true);
      try {
        const message = await generateWelcomeMessage(name);
        setWelcomeMessage(message);
      } catch (error) {
        console.error("Failed to generate welcome message:", error);
        setWelcomeMessage(`Selamat datang di Klub Pecinta Martabak, ${name}! Kami senang Anda bergabung.`);
      } finally {
        setLoadingMessage(false);
      }
    };

    const generateQrCodeWithLogo = async () => {
        if (!memberId) {
            setQrError('ID Member tidak valid.');
            return;
        }
        try {
            const canvas = document.createElement('canvas');
            
            // Options for QR code
            const qrOptions = {
                errorCorrectionLevel: 'H' as const, // High correction level for logo
                width: 200,
                margin: 2,
                color: {
                    dark: "#78350f",
                    light: "#ffffff"
                }
            };
            
            // Draw QR code to canvas
            await QRCode.toCanvas(canvas, memberId, qrOptions);
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get canvas context.');
            }

            // Create logo from SVG string
            const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#78350f"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 12.5c-1.63 0-3.06.8-3.98 2h7.96c-.92-1.2-2.35-2-3.98-2zM12 7c-2.76 0-5 2.24-5 5h10c0-2.76-2.24-5-5-5z" opacity=".3"/><path d="M12 7c.55 0 1 .45 1 1v3h-2V8c0-.55.45-1 1-1zm-.5 6.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5H11.5z"/></svg>`;
            const logoUrl = `data:image/svg+xml;base64,${btoa(logoSvg)}`;
            const logo = new Image();
            logo.src = logoUrl;
            
            logo.onload = () => {
                const logoSize = canvas.width * 0.25; // Logo is 25% of the QR code size
                const x = (canvas.width - logoSize) / 2;
                const y = (canvas.height - logoSize) / 2;
                
                // Draw a white circle background for the logo to stand out
                ctx.beginPath();
                ctx.arc(x + logoSize / 2, y + logoSize / 2, logoSize / 2 + 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'white';
                ctx.fill();

                // Draw the logo
                ctx.drawImage(logo, x, y, logoSize, logoSize);
                
                // Set the final data URL
                setQrCodeUrl(canvas.toDataURL('image/png'));
                setQrError('');
            };
            logo.onerror = () => {
                throw new Error('Logo image could not be loaded.');
            };

        } catch (err) {
            console.error("Failed to generate QR Code with logo:", err);
            setQrError('Gagal membuat QR Code. Silakan coba muat ulang halaman.');
        }
    };
    
    fetchWelcomeMessage();
    generateQrCodeWithLogo();
  }, [name, memberId]);

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `QRCode_MartabakJuara_${memberId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="text-center animate-fade-in py-8">
      <h2 className="text-3xl font-bold text-green-600 mb-4">Pendaftaran Berhasil!</h2>
      {loadingMessage ? (
         <div className="flex justify-center items-center gap-2 text-gray-600 mb-8">
            <SpinnerIcon className="h-5 w-5 animate-spin" />
            <span>Membuat pesan selamat datang...</span>
        </div>
      ) : (
        <p className="text-gray-700 mb-8 text-lg max-w-lg mx-auto">{welcomeMessage}</p>
      )}
      
      <div className="bg-gradient-to-br from-yellow-400 to-amber-500 text-white max-w-sm mx-auto rounded-xl shadow-lg p-6 transform transition-all duration-500 hover:scale-105">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold">Kartu Member Virtual</h3>
          <MartabakIcon className="h-8 w-8 text-yellow-100" />
        </div>
        <div className="text-left">
          <p className="text-sm opacity-80">Nama Member</p>
          <p className="text-2xl font-semibold tracking-wider">{name}</p>
        </div>
        <div className="text-left mt-4">
          <p className="text-sm opacity-80">Member ID</p>
          <p className="text-lg font-mono tracking-widest">{memberId}</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-4 inline-block rounded-lg shadow-md">
        {qrCodeUrl ? (
          <img src={qrCodeUrl} alt={`QR Code untuk ${memberId}`} className="mx-auto" />
        ) : qrError ? (
          <div className="w-[200px] h-[200px] flex items-center justify-center text-center text-red-600 p-4">
            <span>{qrError}</span>
          </div>
        ) : (
          <div className="w-[200px] h-[200px] flex items-center justify-center">
            <SpinnerIcon className="h-8 w-8 animate-spin text-yellow-600" />
          </div>
        )}
      </div>

      <p className="mt-4 text-gray-600 text-sm">
        Scan QR Code ini di kasir untuk transaksi & penambahan poin.
      </p>

      <button
        onClick={handleDownload}
        disabled={!qrCodeUrl || !!qrError}
        className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Unduh QR Code
      </button>
    </div>
  );
};

export default SuccessDisplay;
