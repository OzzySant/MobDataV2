import React, { useRef, useState, useEffect } from 'react';
import { useProjection } from '../context/ProjectionContext';
import { ProjectionType } from '../types';
import { Cast, Monitor, Play, Pause, SkipBack, SkipForward, Eye, EyeOff, AlertCircle, Maximize2, Minimize2 } from 'lucide-react';

interface LivePreviewProps {
    isFullscreen?: boolean;
    onToggleFullscreen?: () => void;
}

const LivePreview: React.FC<LivePreviewProps> = ({ isFullscreen = false, onToggleFullscreen }) => {
  const { 
    currentProjection, 
    settings, 
    isBlackout, 
    toggleBlackout, 
    navigationHandlers 
  } = useProjection();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Animation Buffer State
  const [displayedProjection, setDisplayedProjection] = useState(currentProjection);
  const [isAnimating, setIsAnimating] = useState(false);

  // REF para armazenar os handlers mais recentes para o setInterval
  const handlersRef = useRef(navigationHandlers);

  // 1. Lógica de monitoramento do fim da apresentação (AutoPlay)
  useEffect(() => {
    handlersRef.current = navigationHandlers;
    if (isAutoPlaying && !navigationHandlers.onNext) {
        setIsAutoPlaying(false);
        setStatusMessage("Fim da apresentação");
    }
  }, [navigationHandlers, isAutoPlaying]);

  // 2. Timer da Mensagem
  useEffect(() => {
    if (statusMessage) {
        const timer = setTimeout(() => setStatusMessage(null), 3000);
        return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // 3. CÁLCULO DE ESCALA PRECISO (PIXEL PERFECT)
  useEffect(() => {
    if (!containerRef.current) return;

    const updateScale = () => {
      if (containerRef.current) {
        // Pega as dimensões inteiras do container pai
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        if (width === 0 || height === 0) return;

        // Base de cálculo: 1920x1080
        const scaleX = width / 1920;
        const scaleY = height / 1080;
        
        // No modo janela, damos uma folga de 5% (0.95) para não colar nas bordas
        // No fullscreen, usamos 100% (1.0)
        const factor = isFullscreen ? 1 : 0.95; 
        const newScale = Math.min(scaleX, scaleY) * factor;
        
        setScale(newScale);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
        // RequestAnimationFrame garante que o cálculo ocorra antes do repaint
        requestAnimationFrame(updateScale);
    });
    
    resizeObserver.observe(containerRef.current);
    updateScale(); 

    return () => resizeObserver.disconnect();
  }, [isFullscreen]);

  // Transition Animation Logic
  useEffect(() => {
    if (
      currentProjection.content !== displayedProjection.content ||
      currentProjection.reference !== displayedProjection.reference ||
      currentProjection.type !== displayedProjection.type
    ) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setDisplayedProjection(currentProjection);
        setIsAnimating(false);
      }, 150); 

      return () => clearTimeout(timer);
    }
  }, [currentProjection, displayedProjection]);

  // Lógica de Auto-Play
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        if (handlersRef.current.onNext) {
          handlersRef.current.onNext();
        } else {
          setIsAutoPlaying(false);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleOpenProjector = () => {
    const width = 1280;
    const height = 720;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(
        `${window.location.protocol}//${window.location.host}${window.location.pathname}?view=projector`, 
        'ChurchPresenterProjector', 
        `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no`
    );
  };

  const BASE_WIDTH = 1920;
  const BASE_HEIGHT = 1080;

  return (
    <div className="bg-gray-950 p-2 md:p-3 border-l border-gray-800 flex flex-col h-full overflow-hidden relative">
      <div className="flex justify-between items-center mb-2 text-gray-400 shrink-0 relative z-50">
        <h3 className="font-bold flex items-center gap-2 text-[10px] md:text-xs uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isBlackout ? 'bg-yellow-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isBlackout ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
            </span>
            {isBlackout ? 'DESCANSO (LOGO)' : 'AO VIVO'}
        </h3>
        
        <div className="flex gap-3">
            {onToggleFullscreen && (
                <button 
                    onClick={onToggleFullscreen}
                    title={isFullscreen ? "Minimizar" : "Tela Cheia"}
                    className="hover:text-white cursor-pointer bg-transparent border-none p-1 flex items-center text-gray-500 hover:text-blue-400 transition-colors"
                >
                    {isFullscreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
                </button>
            )}

            <button 
                onClick={() => toggleBlackout()}
                title={isBlackout ? "Mostrar Texto" : "Ocultar Texto (Modo Descanso)"}
                className={`hover:text-white cursor-pointer bg-transparent border-none p-1 flex items-center transition-colors ${isBlackout ? 'text-yellow-500' : 'text-gray-500'}`}
            >
                {isBlackout ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>

            <button 
                onClick={handleOpenProjector}
                title="Abrir Janela do Projetor" 
                className="hover:text-white cursor-pointer bg-transparent border-none p-1 flex items-center text-blue-500 hover:text-blue-400 transition-colors"
            >
                <Cast size={22} />
            </button>
        </div>
      </div>

      {/* 
        CONTAINER PAI (FLEXBOX)
        Centraliza o Wrapper escalado.
      */}
      <div 
        ref={containerRef}
        className={`w-full relative shadow-2xl border border-gray-800 group transition-all duration-300 z-10 flex items-center justify-center overflow-hidden
            ${isFullscreen ? 'border-0 bg-black flex-1 h-full rounded-none' : 'bg-black rounded aspect-video'}`}
        style={{
            borderColor: !isFullscreen && !isBlackout ? '#ef4444' : (!isFullscreen && isBlackout ? '#eab308' : undefined)
        }}
      >
        {/* 
            WRAPPER (TAMANHO EXATO ESCALADO)
            Define o espaço físico que o projetor ocupará na tela.
            Isso permite que o Flexbox centralize este bloco corretamente.
        */}
        <div 
            style={{ 
                width: BASE_WIDTH * scale, 
                height: BASE_HEIGHT * scale,
                position: 'relative',
                flexShrink: 0 // Impede que o flexbox esmague o container
            }}
        >
            {/* 
                PROJETOR (TAMANHO REAL 1920x1080)
                Escalado usando transform-origin: top left.
                Isso alinha os pixels do topo-esquerda com o Wrapper, evitando sub-pixel rendering (blur).
            */}
            <div 
                style={{
                    width: `${BASE_WIDTH}px`,
                    height: `${BASE_HEIGHT}px`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    
                    backgroundImage: settings.bgImage ? `url(${settings.bgImage})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',

                    // REMOVIDO: will-change e backface-visibility (causam blur em texto estático)
                    // ADICIONADO: optimizeLegibility para melhor renderização de texto
                    textRendering: 'optimizeLegibility',
                    WebkitFontSmoothing: 'antialiased',
                    MozOsxFontSmoothing: 'grayscale',
                }}
                className="bg-black shadow-2xl"
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

                    {/* TEXT / LYRICS STATE */}
                    {(displayedProjection.type === ProjectionType.TEXT || displayedProjection.type === ProjectionType.LYRIC) && (
                    <div className="w-full h-full flex flex-col items-center justify-center p-[80px]">
                        <div className="flex-1 flex items-center justify-center w-full">
                            <p 
                                className="text-center text-white font-semibold drop-shadow-2xl whitespace-pre-wrap leading-tight max-w-[90%]"
                                style={{ 
                                    fontSize: `${settings.fontSize}px`, 
                                    fontFamily: 'Georgia, serif',
                                    lineHeight: 1.3,
                                    // Sombra leve ajuda a definir bordas em telas pequenas
                                    textShadow: '0 2px 4px rgba(0,0,0,0.9)' 
                                }}
                            >
                                {displayedProjection.content}
                            </p>
                        </div>
                        
                        {displayedProjection.reference && (
                            <div className="h-[100px] flex items-end">
                                <p 
                                className="text-yellow-400 font-sans font-medium tracking-wide drop-shadow-lg opacity-90"
                                style={{ 
                                    fontSize: `${settings.fontSize * 0.45}px`,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.9)'
                                }}
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
        
        {/* Overlays */}
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            Preview 1080p {isAutoPlaying && " | Auto 5s"}
        </div>

        {statusMessage && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur text-white text-xs px-3 py-1.5 rounded-full border border-white/20 animate-fade-in flex items-center gap-2 shadow-lg z-50">
                <AlertCircle size={12} className="text-yellow-400" />
                {statusMessage}
            </div>
        )}
      </div>

      {/* Control Bar (Footer) */}
      <div className={`mt-auto pt-4 pb-2 relative z-50 transition-all duration-300 ${
          isFullscreen 
            ? 'fixed bottom-8 left-1/2 -translate-x-1/2' // Removed background/border logic, now fully transparent
            : ''
      }`}>
        <div className={`flex items-center justify-center gap-4 select-none ${
            isFullscreen ? 'opacity-30 hover:opacity-100 transition-opacity duration-300' : '' // Fade effect in fullscreen
        }`}>
            
            <button 
                onClick={() => navigationHandlers.onPrev?.()}
                disabled={!navigationHandlers.onPrev}
                className={`h-12 w-16 flex items-center justify-center rounded-lg disabled:opacity-30 active:scale-95 transition-all text-white ${
                    isFullscreen 
                    ? 'bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10' // Translucent button
                    : 'border border-white/20 hover:bg-white/10 hover:border-white/50'
                }`}
            >
                <SkipBack className="w-6 h-6 fill-current" />
            </button>

            <button 
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className={`h-14 w-14 flex items-center justify-center rounded-full transition-all active:scale-95 ${
                    isAutoPlaying 
                    ? 'border-2 border-green-500 text-green-500 bg-green-500/10' 
                    : (isFullscreen
                        ? 'bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-white' // Translucent button
                        : 'border-2 border-white text-white hover:bg-white/10')
                }`}
            >
                {isAutoPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
            </button>

            <button 
                onClick={() => navigationHandlers.onNext?.()}
                disabled={!navigationHandlers.onNext}
                className={`h-12 w-16 flex items-center justify-center rounded-lg disabled:opacity-30 active:scale-95 transition-all text-white ${
                    isFullscreen 
                    ? 'bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10' // Translucent button
                    : 'border border-white/20 hover:bg-white/10 hover:border-white/50'
                }`}
            >
                <SkipForward className="w-6 h-6 fill-current" />
            </button>

        </div>
      </div>
    </div>
  );
};

export default LivePreview;