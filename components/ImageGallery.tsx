import React from 'react';
import { Icon } from './Icon';

interface ImageGalleryProps {
    images: string[];
    onImageSelect: (image: string) => void;
    onClearHistory: () => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onImageSelect, onClearHistory }) => {
    return (
        <div className="p-6 rounded-2xl border border-gray-800 bg-slate-900 shadow-xl relative z-20">
            <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
                <h2 className="text-lg font-bold text-indigo-300">المحفوظات</h2>
                <button 
                    onClick={onClearHistory}
                    className="text-gray-400 hover:text-red-400 transition-colors text-xs flex items-center bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 hover:border-red-500/30"
                    title="مسح المحفوظات"
                    aria-label="Clear image history"
                >
                    <Icon name="fa-trash" className="mr-2" />
                    مسح الكل
                </button>
            </div>

            <p className="text-xs text-gray-500 mb-4">
                يتم عرض آخر 15 صورة تم إنشاؤها.
            </p>

            <div className="flex overflow-x-auto space-x-4 space-x-reverse pb-4 custom-scrollbar">
                {images.map((image, index) => (
                    <div 
                        key={index} 
                        className="flex-shrink-0 group cursor-pointer" 
                        onClick={() => onImageSelect(image)}
                        role="button"
                        aria-label={`View generated image ${index + 1}`}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onImageSelect(image)}
                    >
                        <img 
                            src={image} 
                            alt={`Generated image ${index + 1}`}
                            className="w-24 h-24 object-cover rounded-xl border-2 border-gray-700/50 group-hover:border-indigo-500 shadow-md transition-all duration-200"
                            loading="lazy"
                        />
                    </div>
                ))}
            </div>
            
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    );
};