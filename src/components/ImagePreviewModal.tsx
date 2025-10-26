import React from 'react';
import XIcon from './icons/XIcon';

interface ImagePreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[60] p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-2xl p-2"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image/padding
      >
        <img 
          src={imageUrl} 
          alt="Preview" 
          className="max-w-full max-h-[calc(90vh-1rem)] object-contain rounded" 
        />
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-200 transition-transform transform hover:scale-110"
          aria-label="Tutup pratinjau"
        >
          <XIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default ImagePreviewModal;
