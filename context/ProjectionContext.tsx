import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { ProjectionContent, ProjectionType, BroadcastMessage } from '../types';

interface NavigationHandlers {
  onNext?: () => void;
  onPrev?: () => void;
}

interface ProjectionContextType {
  currentProjection: ProjectionContent;
  setProjection: (content: ProjectionContent) => void;
  clearProjection: () => void;
  settings: {
    theme: 'dark' | 'light';
    fontSize: number;
    bgImage: string | null;
  };
  updateSettings: (newSettings: Partial<ProjectionContextType['settings']>) => void;
  
  // Novos controles de navegação e blackout
  isBlackout: boolean;
  toggleBlackout: (value?: boolean) => void;
  navigationHandlers: NavigationHandlers;
  setNavigationHandlers: (handlers: NavigationHandlers) => void;
}

const defaultProjection: ProjectionContent = {
  type: ProjectionType.IDLE,
  content: '',
};

const ProjectionContext = createContext<ProjectionContextType | undefined>(undefined);

export const ProjectionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentProjection, setCurrentProjection] = useState<ProjectionContent>(defaultProjection);
  const [isBlackout, setIsBlackout] = useState(false);
  const [navigationHandlers, setNavigationHandlersState] = useState<NavigationHandlers>({});
  
  const [settings, setSettings] = useState({
    theme: 'dark' as const,
    fontSize: 48,
    bgImage: null as string | null,
  });

  // REF para o Canal de comunicação (Evita re-renders e problemas de lifecycle)
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Refs para manter o estado atualizado para o listener do canal
  const stateRef = useRef({
    projection: currentProjection,
    settings: settings,
    isBlackout: isBlackout
  });

  useEffect(() => {
    stateRef.current = {
      projection: currentProjection,
      settings: settings,
      isBlackout: isBlackout
    };
  }, [currentProjection, settings, isBlackout]);

  useEffect(() => {
    const channel = new BroadcastChannel('church_presenter_channel');
    broadcastChannelRef.current = channel;

    // Escuta requisições de sincronia (quando a janela do projetor abre)
    channel.onmessage = (event) => {
      if (event.data.type === 'REQUEST_SYNC') {
        // Envia o estado atual imediatamente usando o REF
        try {
            channel.postMessage({
                type: 'SYNC_STATE',
                payload: stateRef.current
            } as BroadcastMessage);
        } catch (e) {
            console.warn("BroadcastChannel postMessage error:", e);
        }
      }
    };

    return () => {
        try {
            channel.close();
        } catch(e) { /* ignore */ }
        broadcastChannelRef.current = null;
    };
  }, []); 

  // Função auxiliar para transmitir mudanças
  const broadcastState = (
      proj: ProjectionContent, 
      sett: typeof settings, 
      blackout: boolean
  ) => {
      const channel = broadcastChannelRef.current;
      if (channel) {
          try {
            channel.postMessage({
                type: 'SYNC_STATE',
                payload: {
                    projection: proj,
                    settings: sett,
                    isBlackout: blackout
                }
            } as BroadcastMessage);
          } catch (error) {
            console.warn("BroadcastChannel error:", error);
          }
      }
  };

  const setProjection = (content: ProjectionContent) => {
    setCurrentProjection(content);
    // Ao projetar algo novo, remove o blackout automaticamente se estiver ativo
    let newBlackout = isBlackout;
    if (isBlackout && content.type !== ProjectionType.IDLE) {
        setIsBlackout(false);
        newBlackout = false;
    }
    broadcastState(content, settings, newBlackout);
  };

  const clearProjection = () => {
    setCurrentProjection(defaultProjection);
    setIsBlackout(false);
    setNavigationHandlersState({});
    broadcastState(defaultProjection, settings, false);
  };

  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        broadcastState(currentProjection, updated, isBlackout);
        return updated;
    });
  };

  const toggleBlackout = (value?: boolean) => {
    setIsBlackout((prev) => {
        const newValue = value !== undefined ? value : !prev;
        broadcastState(currentProjection, settings, newValue);
        return newValue;
    });
  };

  const setNavigationHandlers = (handlers: NavigationHandlers) => {
    setNavigationHandlersState(handlers);
  };

  return (
    <ProjectionContext.Provider value={{ 
        currentProjection, 
        setProjection, 
        clearProjection, 
        settings, 
        updateSettings,
        isBlackout,
        toggleBlackout,
        navigationHandlers,
        setNavigationHandlers
    }}>
      {children}
    </ProjectionContext.Provider>
  );
};

export const useProjection = () => {
  const context = useContext(ProjectionContext);
  if (!context) {
    throw new Error('useProjection must be used within a ProjectionProvider');
  }
  return context;
};