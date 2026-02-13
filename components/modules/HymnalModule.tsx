import React, { useState, useEffect } from 'react';
import { useProjection } from '../../context/ProjectionContext';
import { ProjectionType, Hymn } from '../../types';
import { Music, Search, PlayCircle, Loader2, ArrowLeft, Mic2, ListMusic } from 'lucide-react';
import { HARPA_DATA } from '../../data/harpa';
import { HARPA_API_URLS } from '../../constants';
import { getResource, saveResource } from '../../utils/db';

const HymnalModule: React.FC = () => {
  const { setProjection, clearProjection, setNavigationHandlers } = useProjection();
  
  // Dados
  const [hymns, setHymns] = useState<Hymn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Navegação e Seleção
  const [viewMode, setViewMode] = useState<'list' | 'lyrics'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHymn, setSelectedHymn] = useState<Hymn | null>(null);

  // --- CARREGAMENTO DE DADOS ---
  const parseAndValidate = (data: any): Hymn[] => {
      let list: any[] = [];
      
      // 1. Array direto (Ex: Thiago Bodruk)
      if (Array.isArray(data)) {
          list = data;
      } 
      // 2. Objeto com chave hinos (Ex: Algumas APIs)
      else if (data && Array.isArray(data.hinos)) {
          list = data.hinos;
      }
      // 3. Objeto indexado por ID/Número (Ex: Daniel Liberato / OzzySant)
      else if (data && typeof data === 'object') {
          // Converte objeto { "1": {...}, "2": {...} } para array
          list = Object.values(data);
      }
      
      const normalized = list.map((item: any) => {
          let titulo = item.titulo || item.title || item.hino || "Sem título";
          // Remove número do título se existir (ex: "1 - Chuvas")
          if (titulo.includes(' - ')) {
             const parts = titulo.split(' - ');
             // Se a primeira parte for número, remove
             if (!isNaN(parseInt(parts[0]))) titulo = parts.slice(1).join(' - ');
          }
          
          let letra = item.letra || item.text || "";
          
          // Se não tem letra pronta, tenta montar dos versos (Formato Daniel Liberato)
          if (!letra && item.verses) {
              const parts: string[] = [];
              const chorusText = item.coro ? `[Coro]\n${item.coro.replace(/<br>/g, '\n').replace(/<br\s*\/>/g, '\n')}` : null;
              
              if (typeof item.verses === 'object') {
                  // Garante ordem numérica das chaves "1", "2", ...
                  Object.keys(item.verses)
                      .sort((a, b) => parseInt(a) - parseInt(b))
                      .forEach((key) => {
                          parts.push(String(item.verses[key]).replace(/<br>/g, '\n').replace(/<br\s*\/>/g, '\n'));
                          if (chorusText) parts.push(chorusText);
                      });
              }
              letra = parts.join('\n\n');
          }
          
          // Garante número correto
          const numero = parseInt(item.numero || (item.hino ? item.hino.split(' - ')[0] : 0));

          return {
            numero: isNaN(numero) ? 0 : numero,
            titulo: titulo.trim(),
            letra: letra
          };
      }).filter((h: any) => h.numero > 0 && h.letra.length > 0);
      
      return normalized;
  };

  const fetchWithFailover = async (urls: string[]) => {
      for (const url of urls) {
          try {
              const response = await fetch(url, { mode: 'cors' });
              if (!response.ok) continue;
              const text = await response.text();
              let rawJson;
              try { rawJson = JSON.parse(text); } catch { rawJson = new Function(`return ${text}`)(); }
              return parseAndValidate(rawJson);
          } catch (e) {
              console.warn("Harpa fetch fail:", url, e);
          }
      }
      throw new Error(`Falha no download da Harpa.`);
  };

  const loadHymns = async (forceDownload = false) => {
    setIsLoading(true);
    
    // 1. Carrega dados locais (fallback) imediatamente para não ficar vazio
    if (hymns.length === 0) {
        setHymns([...HARPA_DATA].sort((a, b) => a.numero - b.numero));
    }

    // 2. Tenta carregar do Cache (IndexedDB)
    if (!forceDownload) {
        try {
            const cached = await getResource('harpa_data');
            if (cached && cached.length > 100) {
                setHymns(cached.sort((a: any, b: any) => a.numero - b.numero));
                setIsLoading(false);
                return;
            }
        } catch (e) {}
    }

    // 3. Tenta baixar da Internet
    try {
        const validHymns = await fetchWithFailover(HARPA_API_URLS);
        if (validHymns && validHymns.length > 0) {
            await saveResource('harpa_data', validHymns);
            setHymns(validHymns.sort((a: any, b: any) => a.numero - b.numero));
        }
    } catch (err) {
        console.error("Erro ao baixar Harpa (usando local):", err);
        // O fallback local já foi setado no passo 1, mas garantimos aqui se estiver vazio
        if (hymns.length === 0) {
            setHymns(HARPA_DATA);
        }
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => { loadHymns(); }, []);

  // --- INTERAÇÃO ---

  const handleHymnSelect = (hymn: Hymn) => {
    setSelectedHymn(hymn);
    setViewMode('lyrics');
    setSearchTerm(''); // Opcional: limpar busca ao entrar
  };

  const goBack = () => {
    setViewMode('list');
    setSelectedHymn(null);
  };

  const getStanzas = (rawLyrics: string) => {
      if (!rawLyrics) return [];
      return rawLyrics.replace(/\r\n/g, '\n').split('\n\n').filter(p => p.trim().length > 0);
  };

  const handleLyricClick = (stanza: string, index: number, allStanzas: string[]) => {
    if (!selectedHymn) return;
    setProjection({
      type: ProjectionType.LYRIC,
      content: stanza,
      reference: `${selectedHymn.numero}. ${selectedHymn.titulo}`,
    });
    setNavigationHandlers({
        onNext: index < allStanzas.length - 1 ? () => handleLyricClick(allStanzas[index + 1], index + 1, allStanzas) : undefined,
        onPrev: index > 0 ? () => handleLyricClick(allStanzas[index - 1], index - 1, allStanzas) : undefined
    });
  };

  // --- RENDERIZAÇÃO ---
  
  const filteredHymns = hymns.filter(h => 
      h.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) || h.numero?.toString().includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      
      {/* HEADER PRINCIPAL */}
      <div className="px-3 py-2 border-b border-gray-800 flex justify-between items-center bg-gray-950 shrink-0 h-14">
        <div className="flex items-center gap-3">
             {viewMode === 'lyrics' ? (
                <button 
                    onClick={goBack}
                    className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                    title="Voltar"
                >
                    <ArrowLeft size={20} />
                </button>
             ) : (
                <div className="bg-purple-900/30 p-1.5 rounded-lg">
                    <Music className="w-5 h-5 text-purple-400"/>
                </div>
             )}
             
             <div className="flex flex-col justify-center">
                <h2 className="text-sm font-bold leading-none flex items-center gap-2">
                    {viewMode === 'list' ? 'HARPA CRISTÃ' : selectedHymn?.titulo}
                </h2>
                {viewMode === 'lyrics' && (
                     <span className="text-[10px] text-purple-400 font-mono">Hino {selectedHymn?.numero}</span>
                )}
             </div>
             
             {isLoading && <Loader2 size={14} className="animate-spin text-purple-500 ml-2"/>}
        </div>

        <div className="flex items-center gap-2">
            {viewMode === 'list' && (
                <div className="relative w-40 md:w-60">
                    <Search className="absolute left-2 top-2 text-gray-500" size={14} />
                    <input
                        type="text"
                        placeholder="Buscar hino..."
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded pl-8 pr-2 py-1.5 text-xs focus:outline-none focus:border-purple-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            )}
            <button 
                onClick={clearProjection}
                className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-1.5 rounded text-xs font-bold border border-red-600/30 whitespace-nowrap uppercase tracking-wider"
            >
                Limpar Tela
            </button>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="flex-1 overflow-y-auto bg-gray-900 p-2 md:p-4">
        
        {/* MODO LISTA (GRID/LIST) */}
        {viewMode === 'list' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredHymns.map((hymn) => (
                    <button
                        key={hymn.numero}
                        onClick={() => handleHymnSelect(hymn)}
                        className="flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-750 border border-gray-700/50 hover:border-purple-500/50 rounded-lg group transition-all text-left shadow-sm active:scale-[0.99]"
                    >
                        <span className="flex-shrink-0 w-10 h-10 rounded bg-gray-900 flex items-center justify-center font-bold text-lg text-purple-500 font-mono group-hover:text-purple-400 group-hover:bg-purple-900/20 transition-colors">
                            {hymn.numero}
                        </span>
                        <div className="min-w-0">
                            <span className="block text-sm font-medium text-gray-200 truncate group-hover:text-white">
                                {hymn.titulo}
                            </span>
                            <span className="block text-[10px] text-gray-500 truncate group-hover:text-gray-400">
                                Clique para abrir
                            </span>
                        </div>
                    </button>
                ))}
                
                {filteredHymns.length === 0 && !isLoading && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 opacity-50">
                        <ListMusic size={48} className="mb-2"/>
                        <p>Nenhum hino encontrado</p>
                    </div>
                )}
            </div>
        )}

        {/* MODO LETRA */}
        {viewMode === 'lyrics' && selectedHymn && (
             <div className="max-w-4xl mx-auto space-y-3 pb-10">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <Mic2 size={16} /> Selecione a estrofe para projetar
                </div>
                
                {getStanzas(selectedHymn.letra).map((stanza, idx, arr) => {
                    const isChorus = stanza.toLowerCase().includes('coro') || stanza.toLowerCase().includes('refrão');
                    return (
                        <button
                            key={idx}
                            onClick={() => handleLyricClick(stanza, idx, arr)}
                            className={`w-full text-left p-4 md:p-6 rounded-xl border transition-all duration-200 group flex gap-4 items-start shadow-sm
                                ${isChorus 
                                    ? 'bg-purple-900/10 border-purple-500/30 hover:bg-purple-900/20 hover:border-purple-500/50' 
                                    : 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                                }
                            `}
                        >
                            <div className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1
                                ${isChorus ? 'bg-purple-500 text-white' : 'bg-gray-700 text-gray-400 group-hover:text-gray-300'}
                            `}>
                                {isChorus ? 'Coro' : idx + 1}
                            </div>
                            
                            <p className={`text-base md:text-xl leading-relaxed whitespace-pre-wrap font-serif
                                ${isChorus ? 'text-purple-100' : 'text-gray-300 group-hover:text-white'}
                            `}>
                                {stanza}
                            </p>
                        </button>
                    );
                })}
             </div>
        )}
      </div>
    </div>
  );
};

export default HymnalModule;