import React from 'react';
import { Book, Music, Image as ImageIcon, Settings, MonitorPlay } from 'lucide-react';

interface SidebarProps {
  currentModule: string;
  onModuleChange: (module: 'bible' | 'hymn' | 'media' | 'settings') => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentModule, onModuleChange }) => {
  const navItems = [
    { id: 'bible', icon: Book, label: 'Bíblia' },
    { id: 'hymn', icon: Music, label: 'Harpa' },
    { id: 'media', icon: ImageIcon, label: 'Mídia' },
    { id: 'settings', icon: Settings, label: 'Config' },
  ];

  return (
    <div className="w-16 lg:w-20 xl:w-24 2xl:w-28 bg-gray-900 border-r border-gray-800 flex flex-col items-center py-4 xl:py-6 gap-4 xl:gap-6 z-20 shadow-lg shrink-0 transition-all duration-300">
      <div className="text-blue-500 mb-2 lg:mb-4 xl:mb-6">
        <MonitorPlay className="w-7 h-7 lg:w-9 lg:h-9 xl:w-10 xl:h-10" />
      </div>
      
      {navItems.map((item) => {
        const isActive = currentModule === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onModuleChange(item.id as any)}
            className={`flex flex-col items-center justify-center w-12 h-12 lg:w-16 lg:h-16 xl:w-20 xl:h-20 rounded-xl transition-all duration-200 group ${
              isActive 
                ? 'bg-blue-600 text-white shadow-blue-900/50 shadow-lg' 
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
            title={item.label}
          >
            <item.icon className={`mb-0.5 w-5 h-5 lg:w-6 lg:h-6 xl:w-8 xl:h-8 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
            <span className="text-[9px] lg:text-[10px] xl:text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Sidebar;