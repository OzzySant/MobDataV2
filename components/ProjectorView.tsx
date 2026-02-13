import React, { useEffect, useState } from 'react';
import { BroadcastMessage, ProjectionContent, ProjectionType } from '../types';
import { Monitor, Loader2 } from 'lucide-react';

const ProjectorView: React.FC = () => {
  const [projection, setProjection] = useState<ProjectionContent>({ type: ProjectionType.IDLE, content: '' });
  const [settings, setSettings] = useState({ theme: 'dark', fontSize: 48, bgImage: null as string | null });
  const [isBlackout, setIsBlackout] = useState(false);
  const [scale, setScale] = useState(1);
  const [connected, setConnected] = useState(false);

  // Animation Buffer
  const [displayedProjection, setDisplayedProjection] = useState(projection);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel('church_presenter_channel');
    
    channel.onmessage = (event) => {
      const msg = event.data as BroadcastMessage;
      if (msg.type === 'SYNC_STATE' && msg.payload) {
        setProjection(msg.payload.projection);
        setSettings(msg.payload.settings);
        setIsBlackout(msg.payload.isBlackout);
        setConnected(true);
      }
    };

    // Solicita estado inicial assim que monta
    try {
        channel.postMessage({ type: 'REQUEST_SYNC' });
    } catch (e) {
        console.warn("Failed to request sync:", e);
    }

    return () => {
        try {
            channel.close();
        } catch (e) { /* ignore */ }
    };
  }, []);

  // Responsividade: Escala para caber na janela mantendo 1920x1080
  useEffect(() => {
    const handleResize = () => {
      const scaleX = window.innerWidth / 1920;
      const scaleY = window.innerHeight / 1080;
      // Use 'contain' logic: fit the smallest dimension
      setScale(Math.min(scaleX, scaleY));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animação de transição (Idêntica ao LivePreview)
  useEffect(() => {
    if (
      projection.content !== displayedProjection.content ||
      projection.reference !== displayedProjection.reference ||
      projection.type !== displayedProjection.type
    ) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayedProjection(projection);
        setIsAnimating(false);
      }, 150); 
      return () => clearTimeout(timer);
    }
  }, [projection, displayedProjection]);

  if (!connected) {
      return (
          <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-white">
              <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
              <h1 className="text-xl font-bold">Aguardando conexão com o Painel...</h1>
              <p className="text-gray-500 mt-2">Mantenha esta janela aberta.</p>
          </div>
      );
  }

  return (
    <div className="h-screen w-screen bg-black overflow-hidden flex items-center justify-center">
        {/* Container 1920x1080 fixo que é escalado */}
        <div 
            style={{
                width: '1920px',
                height: '1080px',
                backgroundColor: 'black',
                backgroundImage: settings.bgImage ? `url(${settings.bgImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transform: `scale(${scale})`,
                fontFamily: 'Georgia, serif',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
             {settings.bgImage && <div className="absolute inset-0 bg-black/40 z-0"></div>}

             <div className={`relative z-10 w-full h-full flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${isAnimating || isBlackout ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                
                {/* IDLE STATE */}
                {displayedProjection.type === ProjectionType.IDLE && (
                    <div className="flex flex-col items-center opacity-90 animate-fade-in">
                        <div className="w-48 h-48 border-8 border-white/20 rounded-full flex items-center justify-center mb-8">
                        <Monitor size={80} className="text-white/50" />
                        </div>
                        <h1 className="text-white/80 text-6xl font-bold tracking-[0.2em] uppercase drop-shadow-lg">Bem-Vindo</h1>
                    </div>
                )}

                {/* TEXT / LYRIC STATE */}
                {(displayedProjection.type === ProjectionType.TEXT || displayedProjection.type === ProjectionType.LYRIC) && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-[80px]">
                        <div className="flex-1 flex items-center justify-center w-full">
                            <p 
                                className="text-center text-white font-semibold drop-shadow-2xl whitespace-pre-wrap leading-tight max-w-[90%]"
                                style={{ fontSize: `${settings.fontSize}px` }}
                            >
                                {displayedProjection.content}
                            </p>
                        </div>
                        
                        {displayedProjection.reference && (
                            <div className="h-[100px] flex items-end">
                                <p 
                                className="text-yellow-400 font-sans font-medium tracking-wide drop-shadow-lg opacity-90"
                                style={{ fontSize: `${settings.fontSize * 0.45}px` }}
                                >
                                    {displayedProjection.reference}
                                </p>
                            </div>
                        )}
                    </div>
                )}
             </div>
        </div>
    </div>
  );
};

export default ProjectorView;