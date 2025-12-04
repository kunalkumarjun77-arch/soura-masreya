import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateExpandedImage, expandPrompt } from './services/geminiService';

import { generateRandomScene } from './services/prompt-generator';
import { saveImageToHistory, getHistoryImages, clearHistoryDB } from './services/storage';
import { Spinner } from './components/Spinner';
import { Icon } from './components/Icon';
import { ImageGallery } from './components/ImageGallery';
import { Adjustments } from './types';

// Removed createThumbnail as we now store full quality in IndexedDB

/**
 * Applies a CSS-style filter to a base64 image using a canvas.
 */
const applyFilterToImage = (base64Image: string, effect: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Image;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context not available'));

            canvas.width = img.width;
            canvas.height = img.height;

            let filter = 'none';
            switch (effect) {
                case 'vintage':
                    filter = 'sepia(0.5) contrast(1.1) brightness(1.1) saturate(1.2)';
                    break;
                case 'bw':
                    filter = 'grayscale(1)';
                    break;
                case 'sepia':
                    filter = 'sepia(1)';
                    break;
                case 'cool':
                    filter = 'contrast(1.1) sepia(0.2) hue-rotate(-15deg)';
                    break;
                case 'warm':
                    filter = 'sepia(0.4) saturate(1.2) brightness(1.05)';
                    break;
                case 'cinematic':
                    filter = 'contrast(1.2) saturate(0.85)';
                    break;
                case 'vibrant':
                    filter = 'saturate(1.6) contrast(1.1)';
                    break;
            }
            ctx.filter = filter;
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };
        img.onerror = (err) => reject(err);
    });
};

const defaultAdjustments: Adjustments = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    sharpen: 0,
};

const applyCustomAdjustments = (base64Image: string, adjustments: Adjustments): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = base64Image;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Canvas context not available'));

            canvas.width = img.width;
            canvas.height = img.height;
            
            const { brightness, contrast, saturation, sharpen } = adjustments;
            
            let sharpenFilter = '';
            if (sharpen > 0) {
                const intensity = sharpen / 100;
                sharpenFilter = `drop-shadow(0 0 ${intensity * 0.4}px rgba(0,0,0,${intensity * 0.5}))`;
            }

            ctx.filter = `
                brightness(${brightness / 100}) 
                contrast(${contrast / 100}) 
                saturate(${saturation / 100})
                ${sharpenFilter}
            `.trim();
            
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
        };
        img.onerror = (err) => reject(err);
    });
};

// --- Modern Glassmorphism Components ---

interface FileInputProps {
  onFileSelect: (file: File) => void;
  previewUrl: string | null;
  hasError: boolean;
}

const ReferenceImageInput: React.FC<FileInputProps> = ({ onFileSelect, previewUrl, hasError }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onFileSelect(event.target.files[0]);
    }
  };

  return (
    <div className={`relative overflow-hidden p-6 rounded-2xl mb-6 transition-all duration-300 border ${hasError ? 'border-red-500/50 bg-red-900/10' : 'border-white/10 bg-white/5 hover:bg-white/10'} backdrop-blur-md shadow-lg`}>
      <h2 className="text-lg font-bold mb-4 text-indigo-300 flex items-center">
        <span className="bg-indigo-500/20 text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs ml-2">1</span>
        الصورة المرجعية
      </h2>
      <div className="relative group">
        <input
          type="file"
          id="refImageInput"
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${previewUrl ? 'border-green-500/50 bg-green-900/10' : 'border-gray-600 group-hover:border-indigo-400 group-hover:bg-indigo-900/10'}`}>
            {!previewUrl ? (
                <>
                    <Icon name="fa-cloud-arrow-up" className="text-3xl text-gray-400 mb-3 group-hover:text-indigo-300" />
                    <p className="text-sm text-gray-300 font-medium">اضغط هنا لرفع صورة الشخص</p>
                    <p className="text-xs text-gray-500 mt-1">يفضل صورة واضحة للوجه</p>
                </>
            ) : (
                <div className="relative">
                    <img src={previewUrl} className="max-h-48 w-auto rounded-lg mx-auto shadow-md" alt="معاينة" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
                        <p className="text-white font-bold"><Icon name="fa-rotate" className="mr-1"/> تغيير الصورة</p>
                    </div>
                </div>
            )}
        </div>
      </div>
      {hasError && <div className="text-red-400 text-sm mt-3 font-medium flex items-center"><Icon name="fa-circle-exclamation" className="ml-1"/> الرجاء رفع صورة أولاً.</div>}
    </div>
  );
};

interface SelectorProps {
    title: string;
    stepNumber: number;
    options: { id: string; name: string; icon: string }[];
    selectedId: string;
    onChange: (id: string) => void;
}

const ModernSelector: React.FC<SelectorProps> = ({ title, stepNumber, options, selectedId, onChange }) => {
    return (
        <div className="p-6 rounded-2xl mb-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-indigo-300 flex items-center">
                <span className="bg-indigo-500/20 text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs ml-2">{stepNumber}</span>
                {title}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {options.map(option => (
                    <button
                        key={option.id}
                        onClick={() => onChange(option.id)}
                        className={`px-3 py-3 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-2 text-sm font-medium border
                            ${selectedId === option.id 
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)] transform scale-105' 
                                : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-700 hover:border-gray-500 hover:text-gray-200'
                            }`}
                    >
                        <Icon name={option.icon} className={`text-lg ${selectedId === option.id ? 'text-white' : 'text-gray-500'}`} />
                        <span>{option.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

interface SceneDescriptionProps {
    prompt: string;
    setPrompt: (prompt: string) => void;
    onRandomize: () => void;
}

const SceneDescriptionInput: React.FC<SceneDescriptionProps> = ({ prompt, setPrompt, onRandomize }) => (
    <div className="p-6 rounded-2xl mb-6 border border-white/10 bg-white/5 backdrop-blur-md shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-indigo-300 flex items-center">
            <span className="bg-indigo-500/20 text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs ml-2">5</span>
            وصف المشهد
        </h2>
        
        <div className="relative">
            <textarea 
                rows={3} 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-4 rounded-xl bg-gray-900/50 border border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-100 placeholder-gray-500 text-sm transition-all resize-none" 
                placeholder="اوصف المشهد اللي في خيالك... أو سيب الذكاء الاصطناعي يبدع."
            />
            <button
                type="button"
                onClick={onRandomize}
                className="absolute bottom-3 left-3 text-xs bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 px-3 py-1.5 rounded-lg transition-colors flex items-center border border-indigo-500/30"
                title="اقترح مشهدًا عشوائيًا"
            >
                <Icon name="fa-dice" className="ml-1" />
                اقتراح مشهد
            </button>
        </div>
    </div>
);

interface GenerationControlProps {
    onGenerate: () => void;
    isLoading: boolean;
}

const GenerationControl: React.FC<GenerationControlProps> = ({ onGenerate, isLoading }) => (
    <div className="mb-8">
         <button 
            onClick={onGenerate}
            disabled={isLoading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.4)]"
        >
            <span className="relative z-10 text-lg flex items-center">
                {isLoading ? <Spinner /> : <Icon name="fa-wand-magic-sparkles" className="ml-2 animate-pulse" />}
                {isLoading ? ' جاري الرسم...' : ' اصنع الصورة الآن'}
            </span>
        </button>
        {isLoading && (
            <div className="mt-4 text-center text-sm text-indigo-300 animate-pulse bg-indigo-900/20 py-2 rounded-lg border border-indigo-500/20">
                <Icon name="fa-palette" className="ml-2" /> الذكاء الاصطناعي يقوم برسم (M.Hefny) في المشهد... لحظات.
            </div>
        )}
    </div>
);

interface ImageEditorProps {
    selectedEffect: string;
    onEffectChange: (effect: string) => void;
    adjustments: Adjustments;
    onAdjustmentChange: (adjustment: keyof Adjustments, value: number) => void;
    onResetAdjustments: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ selectedEffect, onEffectChange, adjustments, onAdjustmentChange, onResetAdjustments }) => {
    const effects = [
        { id: 'none', name: 'طبيعي', icon: 'fa-image' },
        { id: 'bw', name: 'أبيض وأسود', icon: 'fa-droplet-slash' },
        { id: 'vintage', name: 'كلاسيك', icon: 'fa-film' },
        { id: 'warm', name: 'دافئ', icon: 'fa-sun' },
        { id: 'cinematic', name: 'سينمائي', icon: 'fa-clapperboard' },
        { id: 'vibrant', name: 'ألوان', icon: 'fa-palette' }
    ];

    const adjustmentControls: { key: keyof Adjustments; label: string; min: number; max: number; }[] = [
        { key: 'brightness', label: 'السطوع', min: 0, max: 200 },
        { key: 'contrast', label: 'التباين', min: 0, max: 200 },
        { key: 'saturation', label: 'التشبع', min: 0, max: 200 },
        { key: 'sharpen', label: 'الحدة', min: 0, max: 100 },
    ];

    return (
        <div className="mt-6 p-4 bg-black/20 rounded-xl border border-white/5">
            <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3 text-gray-400">فلاتر جاهزة</h3>
                <div className="flex overflow-x-auto pb-2 gap-2 custom-scrollbar">
                    {effects.map(effect => (
                        <button
                            key={effect.id}
                            onClick={() => onEffectChange(effect.id)}
                            className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center text-xs whitespace-nowrap border
                                ${selectedEffect === effect.id 
                                    ? 'bg-indigo-600 text-white border-indigo-500' 
                                    : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
                                }`}
                        >
                            <Icon name={effect.icon} className="ml-2" />
                            <span>{effect.name}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-semibold text-gray-400">تحكم يدوي</h3>
                    <button onClick={onResetAdjustments} className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1 transition-colors">
                        <Icon name="fa-rotate-left" />
                        إعادة ضبط
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    {adjustmentControls.map(({ key, label, min, max }) => (
                         <div key={key} className="flex items-center gap-3">
                            <label htmlFor={key} className="text-xs text-gray-400 w-12">{label}</label>
                            <input
                                type="range"
                                id={key}
                                min={min}
                                max={max}
                                value={adjustments[key]}
                                onInput={(e) => onAdjustmentChange(key, parseInt(e.currentTarget.value, 10))}
                                className="flex-1 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


interface ResultDisplayProps {
    isLoading: boolean;
    displayedImage: string | null;
    error: string | null;
    onDownload: () => void;
    selectedEffect: string;
    onEffectChange: (effect: string) => void;
    adjustments: Adjustments;
    onAdjustmentChange: (adjustment: keyof Adjustments, value: number) => void;
    onResetAdjustments: () => void;
    forwardRef: React.RefObject<HTMLDivElement>;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
    isLoading, displayedImage, error, onDownload, 
    selectedEffect, onEffectChange, adjustments, onAdjustmentChange, onResetAdjustments, forwardRef
}) => (
    <div ref={forwardRef} className="p-1 rounded-2xl mb-8 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-md shadow-2xl border border-white/10 scroll-mt-24 relative z-0">
        <div className="bg-gray-900/90 rounded-xl p-6 h-full">
            <h2 className="text-lg font-bold mb-4 text-indigo-300 flex items-center border-b border-gray-800 pb-3">
                <span className="bg-indigo-500/20 text-indigo-300 w-6 h-6 rounded-full flex items-center justify-center text-xs ml-2">7</span>
                النتيجة النهائية
            </h2>
            
            {isLoading && (
                <div className="flex flex-col justify-center items-center h-64">
                    <Spinner />
                    <p className="mt-4 text-indigo-300 animate-pulse text-sm">جاري المعالجة...</p>
                </div>
            )}

            {!isLoading && displayedImage && (
                <div className="animate-fade-in">
                    <div className="relative group overflow-hidden rounded-xl shadow-2xl border border-gray-700 mb-4">
                        <img id="generatedImage" src={displayedImage} className="w-full h-auto object-cover" alt="الصورة التي تم توليدها" />
                        <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/10 rounded-xl"></div>
                    </div>
                    
                    <ImageEditor 
                        selectedEffect={selectedEffect} 
                        onEffectChange={onEffectChange}
                        adjustments={adjustments}
                        onAdjustmentChange={onAdjustmentChange}
                        onResetAdjustments={onResetAdjustments}
                    />

                    <button 
                        id="downloadBtn" 
                        onClick={onDownload}
                        className="w-full mt-4 bg-green-600 hover:bg-green-500 transition-colors text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center shadow-lg shadow-green-900/20"
                    >
                        <Icon name="fa-download" className="ml-2" /> حفظ الصورة
                    </button>
                </div>
            )}
            
            {!isLoading && !displayedImage && (
                <div className="text-center text-gray-600 py-16 border-2 border-dashed border-gray-800 rounded-xl bg-gray-900/50">
                    <Icon name="fa-image" className="text-4xl mb-4 opacity-50" />
                    <p className="text-sm font-medium">النتيجة ستظهر هنا بعد التوليد</p>
                </div>
            )}
            
            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-4 flex items-start">
                    <Icon name="fa-circle-xmark" className="text-red-400 mt-1 ml-3" />
                    <p className="text-red-300 text-sm leading-relaxed">{error}</p>
                </div>
            )}
        </div>
    </div>
);

const suggestEffectForPrompt = (prompt: string): string => {
    const lowerCasePrompt = prompt.toLowerCase();
    
    // Time of day & Nostalgia
    if (/\b(night|dark|neon|moon|film noir)\b/.test(lowerCasePrompt)) return 'cinematic';
    if (/\b(sunset|sunrise|golden hour|nostalgic|old|ancient|history)\b/.test(lowerCasePrompt)) return 'vintage';
    if (/\b(warm|cozy|intimate|fire|lamp)\b/.test(lowerCasePrompt)) return 'warm';

    // Mood
    if (/\b(sad|melancholy|rain|rainy|overcast|grey|lonely)\b/.test(lowerCasePrompt)) return 'bw';
    if (/\b(vibrant|market|celebration|joyful|colorful|sweets)\b/.test(lowerCasePrompt)) return 'vibrant';
    
    return 'none';
};

const App: React.FC = () => {
    const [referenceFile, setReferenceFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState<string>('');
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [displayedImage, setDisplayedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [fileError, setFileError] = useState<boolean>(false);
    const [imageHistory, setImageHistory] = useState<string[]>([]);
    const [selectedPersona, setSelectedPersona] = useState<string>('random');
    const [selectedShotType, setSelectedShotType] = useState<string>('random');
    const [selectedAspectRatio, setSelectedAspectRatio] = useState<string>('1:1');
    const [aesthetic, setAesthetic] = useState<string>('candid');
    
    // State for image editing
    const [selectedEffect, setSelectedEffect] = useState<string>('none');
    const [adjustments, setAdjustments] = useState<Adjustments>(defaultAdjustments);

    const resultSectionRef = useRef<HTMLDivElement>(null);

    // AUTO-FULLSCREEN LOGIC - PERSISTENT
    useEffect(() => {
        const enterFullscreen = () => {
            const elem = document.documentElement;
            if (!document.fullscreenElement) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen().catch(() => {});
                } else if ((elem as any).webkitRequestFullscreen) { /* Safari */
                    (elem as any).webkitRequestFullscreen();
                }
            }
        };

        const handleInteraction = () => {
            enterFullscreen();
        };

        // Add persistent listener for ANY click or touch to ensure we stay fullscreen
        document.addEventListener('click', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);

        return () => {
            document.removeEventListener('click', handleInteraction);
            document.removeEventListener('touchstart', handleInteraction);
        };
    }, []);

    // Load history from IndexedDB on mount
    useEffect(() => {
        const loadHistory = async () => {
            const history = await getHistoryImages();
            setImageHistory(history);
        };
        loadHistory();
    }, []);

    // Effect to apply filters/adjustments
    useEffect(() => {
        if (!originalImage) return;

        const applyEdits = async () => {
            setIsLoading(true);
            try {
                let finalImage = originalImage;
                if (selectedEffect !== 'none') {
                    finalImage = await applyFilterToImage(originalImage, selectedEffect);
                } else {
                    const isDefault = Object.keys(defaultAdjustments).every(
                        key => adjustments[key as keyof Adjustments] === defaultAdjustments[key as keyof Adjustments]
                    );
                    if (!isDefault) {
                        finalImage = await applyCustomAdjustments(originalImage, adjustments);
                    }
                }
                setDisplayedImage(finalImage);
            } catch (err) {
                 console.error('Failed to apply image edit:', err);
                 setError('فشل في تطبيق التعديل على الصورة.');
                 setDisplayedImage(originalImage);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(applyEdits, 50);
        return () => clearTimeout(timeoutId);
    }, [originalImage, selectedEffect, adjustments]);


    const handleFileSelect = (file: File) => {
        setReferenceFile(file);
        setFileError(false);
        const reader = new FileReader();
        reader.onload = () => {
            setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };
    
    const fileToGenerativePart = async (file: File): Promise<{mimeType: string, data: string}> => {
        const base64EncodedDataPromise = new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.readAsDataURL(file);
        });
        return {
          mimeType: file.type,
          data: await base64EncodedDataPromise,
        };
    };

    const handleGenerate = useCallback(async () => {
        if (!referenceFile) {
            setFileError(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setOriginalImage(null);
        setDisplayedImage(null);
        setSelectedEffect('none');
        setAdjustments(defaultAdjustments);

        // Scroll to result section immediately to show loader
        if (resultSectionRef.current) {
            resultSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }

        let finalPrompt = prompt.trim();

        try {
            const isShortPrompt = finalPrompt.split(' ').length < 6 && finalPrompt.length > 0;

            if (isShortPrompt) {
                const expandedPrompt = await expandPrompt(finalPrompt, selectedPersona, selectedShotType);
                finalPrompt = expandedPrompt;
                setPrompt(expandedPrompt);
            } else if (!finalPrompt) {
                finalPrompt = generateRandomScene(selectedPersona, selectedShotType);
                setPrompt(finalPrompt);
            }
            
            const imagePart = await fileToGenerativePart(referenceFile);
            const resultBase64 = await generateExpandedImage(
  finalPrompt,
  imagePart.data,
  imagePart.mimeType,
  aesthetic,
  selectedAspectRatio

);

            const newImage = `data:image/png;base64,${resultBase64}`;
            
            const suggestedEffect = suggestEffectForPrompt(finalPrompt);

            setOriginalImage(newImage); 
            setSelectedEffect(suggestedEffect);
            
            // Save full quality image to IndexedDB
            await saveImageToHistory(newImage);
            
            // Reload history to update UI
            const updatedHistory = await getHistoryImages();
            setImageHistory(updatedHistory);

        } catch (err) {
            console.error("Generation failed:", err);
            const errorMessage = err instanceof Error ? err.message : 'حدث خطأ غير معروف.';
            setError(errorMessage);
            setIsLoading(false); 
        }
    }, [referenceFile, prompt, selectedPersona, aesthetic, selectedShotType, selectedAspectRatio]);
    
    const handleEffectChange = (effect: string) => {
        setSelectedEffect(effect);
        if (effect !== 'none') {
            setAdjustments(defaultAdjustments);
        }
    };
    
    const handleAdjustmentChange = (adjustment: keyof Adjustments, value: number) => {
        if (selectedEffect !== 'none') {
            setSelectedEffect('none');
        }
        setAdjustments(prev => ({ ...prev, [adjustment]: value }));
    };

    const handleResetAdjustments = () => {
        if (selectedEffect !== 'none') {
            setSelectedEffect('none');
        }
        setAdjustments(defaultAdjustments);
    }

    const handleDownload = () => {
        if (!displayedImage) return;
        const link = document.createElement('a');
        link.href = displayedImage;
        const effectName = selectedEffect !== 'none' ? `_${selectedEffect}` : '_edited';
        link.download = `SouraMasreya_MHefny${effectName}_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSelectFromHistory = (image: string) => {
        // Since we are now using IndexedDB with full quality, 'image' is the full base64 string
        setOriginalImage(image);
        setSelectedEffect('none');
        setAdjustments(defaultAdjustments);
        
        // Scroll to the result section so the user can see the large image
        if (resultSectionRef.current) {
            resultSectionRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const handleClearHistory = async () => {
        if (window.confirm('هل أنت متأكد من رغبتك في مسح سجل الصور؟ لا يمكن التراجع عن هذا الإجراء.')) {
            await clearHistoryDB();
            setImageHistory([]);
        }
    };

    const handleRandomizePrompt = () => {
        setPrompt(generateRandomScene(selectedPersona, selectedShotType));
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch((e) => {
                console.error(`Error attempting to enable fullscreen mode: ${e.message} (${e.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#1a1b2e] to-black text-gray-100 font-['Cairo'] pb-20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/30 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex justify-between items-center shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Icon name="fa-camera-retro" className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white tracking-wide">صورة مصرية</h1>
                        <p className="text-[10px] text-gray-400 -mt-1">Powered by M.Hefny</p>
                    </div>
                </div>
                <button 
                    onClick={toggleFullscreen} 
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/5"
                    title="ملء الشاشة"
                >
                    <Icon name="fa-expand" className="text-gray-300" />
                </button>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-8">
                <div className="text-center mb-8 animate-fade-in-up">
                    <h2 className="text-3xl md:text-4xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300">
                        حوّل صورتك للقطة سينمائية
                    </h2>
                    <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed">
                        استخدم الذكاء الاصطناعي لدمج صورتك في مشاهد مصرية واقعية وعفوية، مع الحفاظ على ملامحك بدقة عالية.
                    </p>
                </div>
                
                <ReferenceImageInput 
                    onFileSelect={handleFileSelect}
                    previewUrl={previewUrl}
                    hasError={fileError}
                />

                <ModernSelector
                    title="تحديد الشخصية"
                    stepNumber={2}
                    options={[
                        { id: 'random', name: 'عشوائي', icon: 'fa-dice' },
                        { id: 'man', name: 'رجل', icon: 'fa-person' },
                        { id: 'woman', name: 'امرأة', icon: 'fa-person-dress' },
                        { id: 'woman_hijabi', name: 'محجبة', icon: 'fa-user-shield' },
                        { id: 'child_boy', name: 'ولد', icon: 'fa-child' },
                        { id: 'child_girl', name: 'بنت', icon: 'fa-child-dress' },
                    ]}
                    selectedId={selectedPersona}
                    onChange={setSelectedPersona}
                />
                
                <ModernSelector
                    title="نوع اللقطة"
                    stepNumber={3}
                    options={[
                        { id: 'random', name: 'عشوائي', icon: 'fa-dice' },
                        { id: 'close-up', name: 'مقربة', icon: 'fa-face-smile' },
                        { id: 'medium', name: 'متوسطة', icon: 'fa-user' },
                        { id: 'full-body', name: 'كاملة', icon: 'fa-person-walking' },
                        { id: 'environmental', name: 'واسعة', icon: 'fa-panorama' },
                    ]}
                    selectedId={selectedShotType}
                    onChange={setSelectedShotType}
                />

                <ModernSelector
                    title="أبعاد الصورة"
                    stepNumber={4}
                    options={[
                        { id: '1:1', name: 'مربع', icon: 'fa-square' },
                        { id: '9:16', name: 'ستوري', icon: 'fa-mobile' },
                        { id: '16:9', name: 'يوتيوب', icon: 'fa-desktop' },
                    ]}
                    selectedId={selectedAspectRatio}
                    onChange={setSelectedAspectRatio}
                />

                <SceneDescriptionInput
                    prompt={prompt}
                    setPrompt={setPrompt}
                    onRandomize={handleRandomizePrompt}
                />

                <ModernSelector
                    title="الأسلوب الفني"
                    stepNumber={6}
                    options={[
                        { id: 'candid', name: 'عفوي (Mobile)', icon: 'fa-camera' },
                        { id: 'clean', name: 'احترافي (Pro)', icon: 'fa-gem' }
                    ]}
                    selectedId={aesthetic}
                    onChange={setAesthetic}
                />

                <GenerationControl 
                    onGenerate={handleGenerate}
                    isLoading={isLoading}
                />

                <ResultDisplay
                    forwardRef={resultSectionRef}
                    isLoading={isLoading && !displayedImage}
                    displayedImage={displayedImage}
                    error={error}
                    onDownload={handleDownload}
                    selectedEffect={selectedEffect}
                    onEffectChange={handleEffectChange}
                    adjustments={adjustments}
                    onAdjustmentChange={handleAdjustmentChange}
                    onResetAdjustments={handleResetAdjustments}
                />
                
                {imageHistory.length > 0 && (
                    <div className="relative z-20 mt-16 pb-10">
                        <ImageGallery 
                            images={imageHistory}
                            onImageSelect={handleSelectFromHistory}
                            onClearHistory={handleClearHistory}
                        />
                    </div>
                )}
            </div>
            
            <div className="text-center text-xs text-gray-600 pb-6 mt-10">
                 &copy; 2024 Soura Masreya AI. Created by M.Hefny.
            </div>
        </div>
    );
};

export default App;