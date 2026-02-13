import React, { useState, useEffect } from 'react';
import { BIBLE_VERSIONS, BIBLE_API_URLS } from '../../constants';
import { useProjection } from '../../context/ProjectionContext';
import { ProjectionType, BibleBook } from '../../types';
import { Search, BookOpen, Loader2, CheckCircle2, ArrowLeft, Grid3X3, List } from 'lucide-react';
import { getResource, saveResource } from '../../utils/db';
import { BIBLE_NVI } from '../../data/bible_nvi';
import { BIBLE_ACF } from '../../data/bible_acf';
import { BIBLE_AA } from '../../data/bible_aa';

type ViewMode = 'books' | 'chapters' | 'verses';

const BibleModule: React.FC = () => {
  const { setProjection, clearProjection, setNavigationHandlers } = useProjection();
  
  // Dados e Estado Geral
  const [version, setVersion] = useState<string>('nvi');
  const [activeBibleData, setActiveBibleData] = useState<BibleBook[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  // Navegação
  const [viewMode, setViewMode] = useState<ViewMode>('books');
  const [selectedBookIndex, setSelectedBookIndex] = useState<number | null>(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- CARREGAMENTO DE DADOS (Igual ao anterior) ---
  const fetchWithFailover = async (urls: string[]) => {
    let lastError: any = null;
    for (const url of urls) {
        try {
            const response = await fetch(url, { mode: 'cors' });
            if (response.ok) return await response.json();
        } catch (e) { lastError = e; }
    }
    throw new Error(`Todas as fontes falharam.`);
  };

  const loadData = async (forceDownload = false) => {
    setIsLoading(true);
    let localFile: BibleBook[] = [];
    switch (version) {
      case 'nvi': localFile = BIBLE_NVI; break;
      case 'acf': localFile = BIBLE_ACF; break;
      case 'aa': localFile = BIBLE_AA; break;
    }

    if (localFile.length > 5) {
      setActiveBibleData(localFile);
      setIsLoading(false);
      return;
    }

    if (!forceDownload) {
        try {
            const cached = await getResource(`bible_${version}`);
            if (cached && Array.isArray(cached) && cached.length > 5) {
                setActiveBibleData(cached);
                setIsLoading(false);
                return;
            }
        } catch (e) {}
    }

    setDownloadStatus("Buscando...");
    const urls = BIBLE_API_URLS[version] || [];
    try {
      const json = await fetchWithFailover(urls);
      if (!Array.isArray(json)) throw new Error("Inválido");
      await saveResource(`bible_${version}`, json);
      setActiveBibleData(json);
      setDownloadStatus(null);
    } catch (err) {
      setDownloadStatus("Offline");
      setActiveBibleData(localFile);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [version]);

  // --- LÓGICA DE NAVEGAÇÃO ---

  const selectBook = (index: number) => {
    setSelectedBookIndex(index);
    setViewMode('chapters');
    setSearchTerm(''); // Limpa busca ao entrar
  };

  const selectChapter = (index: number) => {
    setSelectedChapterIndex(index);
    setViewMode('verses');
  };

  const goBack = () => {
    if (viewMode === 'verses') {
      setViewMode('chapters');
      setSelectedChapterIndex(null);
    } else if (viewMode === 'chapters') {
      setViewMode('books');
      setSelectedBookIndex(null);
    }
  };

  const handleVerseClick = (verseText: string, verseNum: number, currentVersesList: string[]) => {
    if (selectedBookIndex === null || selectedChapterIndex === null) return;
    const book = activeBibleData[selectedBookIndex];
    if (!book) return;

    setProjection({
      type: ProjectionType.TEXT,
      content: verseText,
      reference: `${book.name} ${selectedChapterIndex + 1}:${verseNum}`,
    });

    const hasNext = verseNum < currentVersesList.length;
    const hasPrev = verseNum > 1;

    setNavigationHandlers({
        onNext: hasNext ? () => handleVerseClick(currentVersesList[verseNum], verseNum + 1, currentVersesList) : undefined,
        onPrev: hasPrev ? () => handleVerseClick(currentVersesList[verseNum - 2], verseNum - 1, currentVersesList) : undefined
    });
  };

  // --- HELPER VISUAL (CORES) ---
  const getBookStyle = (index: number) => {
    // Velho Testamento
    if (index < 5) return 'bg-amber-700 hover:bg-amber-600 border-amber-800'; // Pentateuco
    if (index < 17) return 'bg-orange-700 hover:bg-orange-600 border-orange-800'; // Históricos
    if (index < 22) return 'bg-red-800 hover:bg-red-700 border-red-900'; // Poéticos
    if (index < 27) return 'bg-fuchsia-800 hover:bg-fuchsia-700 border-fuchsia-900'; // Profetas Maiores
    if (index < 39) return 'bg-pink-700 hover:bg-pink-600 border-pink-800'; // Profetas Menores
    // Novo Testamento
    if (index < 44) return 'bg-blue-700 hover:bg-blue-600 border-blue-800'; // Evangelhos
    if (index < 57) return 'bg-emerald-700 hover:bg-emerald-600 border-emerald-800'; // Cartas Paulo
    if (index < 65) return 'bg-teal-600 hover:bg-teal-500 border-teal-700'; // Cartas Gerais
    return 'bg-yellow-600 hover:bg-yellow-500 border-yellow-700'; // Apocalipse
  };

  const getAbbreviation = (book: BibleBook) => {
      if (book.abbrev && book.abbrev.length <= 3) return book.abbrev.toUpperCase();
      return book.name.substring(0, 2).toUpperCase();
  };

  // --- RENDERIZAÇÃO ---
  
  const filteredBooks = activeBibleData.map((b, i) => ({...b, originalIndex: i})).filter(
      b => b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           b.abbrev.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentBook = selectedBookIndex !== null ? activeBibleData[selectedBookIndex] : null;
  const currentChapters = currentBook ? currentBook.chapters : [];
  const currentVerses = (currentBook && selectedChapterIndex !== null) 
    ? currentBook.chapters[selectedChapterIndex] 
    : [];

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* HEADER PRINCIPAL */}
      <div className="px-3 py-2 border-b border-gray-800 flex justify-between items-center bg-gray-950 shrink-0 h-14">
        <div className="flex items-center gap-3">
            {viewMode !== 'books' ? (
                <button 
                    onClick={goBack}
                    className="p-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors"
                    title="Voltar"
                >
                    <ArrowLeft size={20} />
                </button>
            ) : (
                 <BookOpen className="w-6 h-6 text-blue-500"/> 
            )}

            <div className="flex flex-col justify-center">
                <h2 className="text-sm font-bold leading-none flex items-center gap-2">
                    {viewMode === 'books' && "BÍBLIA"}
                    {viewMode === 'chapters' && currentBook?.name}
                    {viewMode === 'verses' && `${currentBook?.name} ${selectedChapterIndex! + 1}`}
                </h2>
                {viewMode === 'books' && (
                    <span className="text-[10px] text-gray-500">Selecione um livro</span>
                )}
            </div>

            {/* Seletor de Versão (Só aparece na home ou canto) */}
            {viewMode === 'books' && (
                <select 
                    value={version} 
                    onChange={(e) => setVersion(e.target.value)}
                    className="ml-2 bg-gray-800 text-xs border border-gray-700 rounded px-2 py-1 focus:outline-none focus:border-blue-500 text-gray-300"
                >
                    {BIBLE_VERSIONS.map(v => (
                        <option key={v.id} value={v.id}>{v.id.toUpperCase()}</option>
                    ))}
                </select>
            )}
        </div>
        
        <div className="flex items-center gap-2">
            {/* Campo de Busca (Só na tela de livros) */}
            {viewMode === 'books' && (
                <div className="relative hidden md:block w-40 lg:w-60">
                    <Search className="absolute left-2 top-2 text-gray-500" size={14} />
                    <input 
                        type="text" 
                        placeholder="Buscar livro..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 text-white rounded pl-8 pr-2 py-1.5 text-xs border border-gray-700 focus:outline-none focus:border-blue-500"
                    />
                </div>
            )}
            
            <button 
                onClick={clearProjection}
                className="bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-1.5 rounded text-xs font-bold border border-red-600/30 whitespace-nowrap uppercase tracking-wider transition-colors"
            >
                Limpar Tela
            </button>
        </div>
      </div>

      {/* ÁREA DE CONTEÚDO PRINCIPAL (OCUPA TUDO) */}
      <div className="flex-1 overflow-y-auto bg-gray-900 p-2 md:p-4">
        
        {/* MODO 1: GRADE DE LIVROS (TABELA PERIÓDICA) */}
        {viewMode === 'books' && (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {filteredBooks.map((book) => (
                    <button
                        key={book.abbrev}
                        onClick={() => selectBook(book.originalIndex)}
                        className={`aspect-square flex flex-col items-center justify-center p-2 rounded-lg shadow-lg border-b-4 transition-transform active:scale-95 ${getBookStyle(book.originalIndex)}`}
                    >
                        <span className="text-2xl md:text-3xl font-black text-white/95 tracking-tighter drop-shadow-md">
                            {getAbbreviation(book)}
                        </span>
                        <span className="text-[10px] md:text-xs font-medium text-white/80 mt-1 text-center leading-tight truncate w-full px-1">
                            {book.name}
                        </span>
                    </button>
                ))}
                {filteredBooks.length === 0 && (
                    <div className="col-span-full text-center text-gray-500 mt-10">
                        Nenhum livro encontrado.
                    </div>
                )}
            </div>
        )}

        {/* MODO 2: GRADE DE CAPÍTULOS */}
        {viewMode === 'chapters' && currentBook && (
            <div className="flex flex-col h-full">
                 <div className="mb-4 flex items-center gap-2 text-gray-400 text-sm">
                    <Grid3X3 size={16} /> Selecione o capítulo
                 </div>
                 <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-3">
                    {currentChapters.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => selectChapter(idx)}
                            className="aspect-square flex items-center justify-center bg-gray-800 hover:bg-blue-600 border border-gray-700 hover:border-blue-500 rounded-lg text-lg md:text-xl font-bold text-gray-300 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                            {idx + 1}
                        </button>
                    ))}
                 </div>
            </div>
        )}

        {/* MODO 3: LISTA DE VERSÍCULOS */}
        {viewMode === 'verses' && currentBook && (
            <div className="flex flex-col h-full max-w-5xl mx-auto">
                 <div className="mb-4 flex items-center gap-2 text-gray-400 text-sm">
                    <List size={16} /> Selecione o versículo para projetar
                 </div>
                 <div className="space-y-2">
                    {currentVerses.map((verseText, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleVerseClick(verseText, idx + 1, currentVerses)}
                            className="w-full text-left p-4 bg-gray-800 hover:bg-gray-750 border border-gray-700/50 hover:border-blue-500/50 rounded-lg group transition-all duration-150 flex gap-4 items-start shadow-sm active:bg-gray-700"
                        >
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center border border-gray-700 group-hover:border-blue-500 group-hover:text-blue-400 transition-colors">
                                <span className="font-bold text-sm text-gray-500 group-hover:text-blue-400">{idx + 1}</span>
                            </div>
                            <p className="text-gray-300 group-hover:text-white text-base md:text-lg leading-relaxed pt-0.5">
                                {verseText}
                            </p>
                        </button>
                    ))}
                 </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default BibleModule;