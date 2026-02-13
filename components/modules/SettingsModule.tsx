import React, { useState, useRef, useEffect } from 'react';
import { useProjection } from '../../context/ProjectionContext';
import { Settings, Image as ImageIcon, Type, Upload, Link, Check, Monitor } from 'lucide-react';

const BACKGROUND_PRESETS = [
  { id: 'black', label: 'Preto (Padrão)', value: null, thumb: '' },
  { id: 'nature', label: 'Natureza', value: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=1920', thumb: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?q=80&w=200' },
  { id: 'sky', label: 'Céu/Nuvens', value: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?q=80&w=1920', thumb: 'https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?q=80&w=200' },
  { id: 'abstract', label: 'Abstrato Azul', value: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1920', thumb: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=200' },
  { id: 'warm', label: 'Luz Quente', value: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=1920', thumb: 'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?q=80&w=200' },
];

const SettingsModule: React.FC = () => {
  const { settings, updateSettings } = useProjection();
  const [customUrl, setCustomUrl] = useState('');
  const [isUrlInputVisible, setIsUrlInputVisible] = useState(false);
  
  // Ref e State para simular o projetor 1920x1080
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(0.2);

  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        // Calcula a escala baseada na largura do container de preview
        const availableWidth = previewContainerRef.current.clientWidth;
        const newScale = availableWidth / 1920;
        setPreviewScale(newScale);
      }
    };

    // Delay curto para garantir que o DOM renderizou
    setTimeout(updateScale, 100);
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSettings({ bgImage: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (customUrl) {
        updateSettings({ bgImage: customUrl });
        setIsUrlInputVisible(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-gray-800 text-gray-100 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 pb-4 border-b border-gray-700">
            <Settings className="text-gray-400" /> Configurações de Apresentação
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT COLUMN - PREVIEW & TYPOGRAPHY */}
            <div className="space-y-8">
                {/* 1. Preview Area */}
                <section className="bg-gray-900 rounded-xl p-1 border border-gray-700 shadow-lg">
                     <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800 mb-1">
                        <h3 className="text-sm font-semibold flex items-center gap-2 text-blue-400">
                            <Monitor size={16} /> Pré-visualização Real
                        </h3>
                        <span className="text-[10px] text-gray-500 uppercase">16:9 Aspect Ratio</span>
                     </div>
                     
                     <div ref={previewContainerRef} className="w-full aspect-video bg-black rounded overflow-hidden relative">
                        {/* 
                            Scaled Container simulating 1920x1080 
                            Esta estrutura deve ser idêntica à do LivePreview.tsx
                        */}
                        <div 
                            style={{
                                width: '1920px',
                                height: '1080px',
                                backgroundColor: 'black',
                                backgroundImage: settings.bgImage ? `url(${settings.bgImage})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                fontFamily: 'Georgia, serif',
                                transform: `scale(${previewScale})`,
                                transformOrigin: 'top left',
                                position: 'absolute',
                                top: 0,
                                left: 0
                            }}
                        >
                             {settings.bgImage && <div className="absolute inset-0 bg-black/40 z-0"></div>}
                             
                             <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-[80px]">
                                <div className="flex-1 flex items-center justify-center w-full">
                                    <p 
                                        className="text-center text-white font-semibold drop-shadow-2xl whitespace-pre-wrap leading-tight max-w-[90%]"
                                        style={{ fontSize: `${settings.fontSize}px` }}
                                    >
                                        Alegrei-me quando me disseram: <br/>Vamos à casa do Senhor.
                                    </p>
                                </div>
                                <div className="h-[100px] flex items-end">
                                    <p 
                                        className="text-yellow-400 font-sans font-medium tracking-wide drop-shadow-lg opacity-90"
                                        style={{ fontSize: `${settings.fontSize * 0.45}px` }}
                                    >
                                        Salmos 122:1
                                    </p>
                                </div>
                             </div>
                        </div>
                     </div>
                     <p className="text-center text-xs text-gray-500 mt-2 pb-2">
                        * A renderização agora é 100% fiel ao projetor.
                     </p>
                </section>

                {/* 2. Typography Control */}
                <section className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Type size={18} className="text-white" /> Tamanho da Fonte
                    </h3>
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-mono text-gray-500">24px</span>
                        <input
                            type="range"
                            min="24"
                            max="96"
                            step="4"
                            value={settings.fontSize}
                            onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                        />
                        <span className="w-12 text-right font-mono text-blue-400 font-bold">{settings.fontSize}px</span>
                    </div>
                </section>
            </div>


            {/* RIGHT COLUMN - BACKGROUND SELECTION */}
            <div className="space-y-6">
                 <section className="bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-sm h-full">
                    <div className="flex justify-between items-start mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <ImageIcon size={18} className="text-purple-400" /> Fundo da Tela
                        </h3>
                        
                        {/* Custom Buttons */}
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setIsUrlInputVisible(!isUrlInputVisible)}
                                className={`p-2 rounded hover:bg-gray-700 transition-colors ${isUrlInputVisible ? 'text-blue-400 bg-gray-800' : 'text-gray-400'}`}
                                title="Link da Web"
                            >
                                <Link size={18} />
                            </button>
                            <label className="p-2 rounded hover:bg-gray-700 text-gray-400 hover:text-green-400 cursor-pointer transition-colors" title="Upload do Computador">
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                                <Upload size={18} />
                            </label>
                        </div>
                    </div>

                    {/* URL Input Area */}
                    {isUrlInputVisible && (
                        <div className="mb-6 flex gap-2 animate-fade-in">
                            <input 
                                type="text" 
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                placeholder="Cole a URL da imagem aqui..."
                                className="flex-1 bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                            />
                            <button 
                                onClick={handleUrlSubmit}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
                            >
                                <Check size={16} />
                            </button>
                        </div>
                    )}

                    {/* Presets Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {BACKGROUND_PRESETS.map((preset) => {
                            const isActive = settings.bgImage === preset.value;
                            return (
                                <button
                                    key={preset.id}
                                    onClick={() => updateSettings({ bgImage: preset.value })}
                                    className={`relative group rounded-lg overflow-hidden border-2 transition-all duration-200 aspect-video ${
                                        isActive 
                                        ? 'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] ring-1 ring-blue-500' 
                                        : 'border-transparent hover:border-gray-500 opacity-70 hover:opacity-100'
                                    }`}
                                >
                                    {preset.value === null ? (
                                        <div className="w-full h-full bg-black flex items-center justify-center">
                                            <span className="text-xs text-gray-500 font-medium">Preto</span>
                                        </div>
                                    ) : (
                                        <>
                                            <img src={preset.thumb} alt={preset.label} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/30 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[10px] text-white font-medium truncate w-full text-left shadow-black drop-shadow-md">
                                                    {preset.label}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    
                                    {isActive && (
                                        <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-0.5">
                                            <Check size={10} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 p-4 bg-blue-900/10 border border-blue-900/30 rounded-lg">
                        <h4 className="text-xs font-bold text-blue-300 mb-1 uppercase tracking-wider">Dica Pro</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            A imagem selecionada será usada tanto como fundo para os textos quanto como tela de "Descanso" quando o Blackout estiver ativado.
                        </p>
                    </div>
                </section>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;