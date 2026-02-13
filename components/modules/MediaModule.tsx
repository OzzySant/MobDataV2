import React, { useState } from 'react';
import { useProjection } from '../../context/ProjectionContext';
import { ProjectionType } from '../../types';
import { Globe, Type, PlayCircle, ExternalLink, Eraser } from 'lucide-react';

const MediaModule: React.FC = () => {
  const { setProjection, clearProjection, setNavigationHandlers } = useProjection();
  const [searchQuery, setSearchQuery] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [title, setTitle] = useState('');

  const handleExternalSearch = (provider: 'google' | 'letras' | 'vagalume' | 'multitracks') => {
    let url = '';
    const query = encodeURIComponent(searchQuery);
    if(provider === 'google') url = `https://www.google.com/search?q=${query}+letra`;
    else if(provider === 'letras') url = `https://www.letras.mus.br/?q=${query}`;
    else if(provider === 'vagalume') url = `https://www.vagalume.com.br/search.php?q=${query}`;
    else url = `https://www.multitracks.com.br/search/?q=${query}`;
    window.open(url, '_blank');
  };

  const slides = pastedText.split(/\n\s*\n/).filter(s => s.trim().length > 0);

  const handleSlideClick = (slide: string, index: number) => {
    setProjection({ type: ProjectionType.LYRIC, content: slide, reference: title });
    setNavigationHandlers({
        onNext: index < slides.length - 1 ? () => handleSlideClick(slides[index + 1], index + 1) : undefined,
        onPrev: index > 0 ? () => handleSlideClick(slides[index - 1], index - 1) : undefined
    });
  };

  return (
    <div className="flex h-full bg-gray-800 text-gray-100 overflow-hidden">
      {/* Search Sidebar - Compacta */}
      <div className="w-[180px] lg:w-[250px] border-r border-gray-700 flex flex-col bg-gray-800/50 p-3 overflow-y-auto shrink-0">
        <h2 className="text-sm font-bold flex items-center gap-2 mb-3 text-pink-400">
            <Globe size={16} /> Pesquisa
        </h2>
        <div className="space-y-2 mb-4">
            <input
                type="text"
                placeholder="Música..."
                className="w-full bg-gray-900 border border-gray-700 text-white rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-pink-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExternalSearch('google')}
            />
            <div className="grid grid-cols-1 gap-2">
                <button onClick={() => handleExternalSearch('letras')} className="bg-gray-700 hover:bg-orange-600 text-xs py-2 rounded">Letras.mus</button>
                <button onClick={() => handleExternalSearch('vagalume')} className="bg-gray-700 hover:bg-green-600 text-xs py-2 rounded">Vagalume</button>
                <button onClick={() => handleExternalSearch('google')} className="bg-gray-700 hover:bg-blue-600 text-xs py-2 rounded">Google</button>
            </div>
        </div>
        <div className="mt-auto border-t border-gray-700 pt-2 text-[10px] text-gray-400">
            Copie a letra e cole ao lado. Separe slides com linha vazia.
        </div>
      </div>

      {/* Editor & Preview */}
      <div className="flex-1 flex flex-col bg-gray-900 p-3 lg:p-4 overflow-hidden">
        <div className="flex justify-between items-center mb-3 shrink-0">
            <h2 className="text-sm font-bold flex items-center gap-2 text-pink-400">
                <Type size={16} /> Editor
            </h2>
            <div className="flex gap-2">
                 <button onClick={() => {setPastedText(''); setTitle(''); clearProjection();}} className="text-gray-400 hover:text-white" title="Limpar Tudo"><Eraser size={16}/></button>
                 <button onClick={clearProjection} className="text-red-400 text-xs border border-red-900/50 px-2 py-0.5 rounded">Limpar Tela</button>
            </div>
        </div>

        <input
            type="text"
            placeholder="Título..."
            className="w-full bg-gray-800 border-b border-gray-700 text-white px-3 py-2 text-sm focus:outline-none mb-2 font-semibold shrink-0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex-1 flex flex-col md:flex-row gap-3 overflow-hidden min-h-0">
            <textarea
                className="flex-1 bg-gray-800 text-gray-300 p-3 text-sm rounded border border-gray-700 focus:outline-none resize-none font-mono"
                placeholder="Cole a letra aqui..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
            />
            
            <div className="flex-1 overflow-y-auto bg-gray-800/30 rounded border border-gray-700/50 p-2 space-y-2">
                {slides.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-600 text-xs">Preview</div>
                ) : (
                    slides.map((slide, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSlideClick(slide, idx)}
                            className="w-full text-left p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded flex gap-2 items-start group"
                        >
                            <span className="text-[10px] font-bold text-gray-500 mt-0.5">{idx + 1}</span>
                            <span className="text-xs text-gray-300 line-clamp-3">{slide}</span>
                            <PlayCircle size={14} className="ml-auto text-gray-600 group-hover:text-pink-400 opacity-0 group-hover:opacity-100 shrink-0" />
                        </button>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default MediaModule;