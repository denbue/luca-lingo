
import React, { useState } from 'react';
import { DictionaryData } from '../types/dictionary';
import { ArrowLeft } from 'lucide-react';

interface MetadataEditViewProps {
  data: DictionaryData;
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
}

const MetadataEditView = ({ data, onSave, onCancel }: MetadataEditViewProps) => {
  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }
    onSave(title, description);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="font-funnel-display text-lg font-bold">Edit Dictionary Information</h3>
      </div>

      <div className="border border-gray-300 rounded-lg p-4 space-y-4">
        <div>
          <label className="block font-funnel-sans font-bold mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg font-funnel-sans"
            placeholder="Enter dictionary title"
          />
        </div>
        
        <div>
          <label className="block font-funnel-sans font-bold mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg font-funnel-sans h-20"
            placeholder="Enter dictionary description"
          />
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          className="flex-1 p-3 bg-green-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-green-600 transition-colors"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="flex-1 p-3 bg-gray-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default MetadataEditView;
