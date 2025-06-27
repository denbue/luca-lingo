
import React from 'react';
import { Edit } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

interface HeaderProps {
  onEdit: () => void;
}

const Header = ({ onEdit }: HeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <LanguageSelector />
      <button
        onClick={onEdit}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-blue-600 transition-colors flex items-center space-x-2"
      >
        <Edit size={16} />
        <span>Edit</span>
      </button>
    </div>
  );
};

export default Header;
