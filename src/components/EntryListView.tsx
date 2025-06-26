
import React from 'react';
import { DictionaryData, DictionaryEntry } from '../types/dictionary';
import { Plus, Trash2, Edit } from 'lucide-react';

interface EntryListViewProps {
  data: DictionaryData;
  onEditEntry: (entry: DictionaryEntry) => void;
  onAddEntry: () => void;
  onDeleteEntry: (entryId: string) => void;
  onEditMetadata: () => void;
}

const EntryListView = ({ data, onEditEntry, onAddEntry, onDeleteEntry, onEditMetadata }: EntryListViewProps) => {
  return (
    <div className="space-y-6">
      {/* Dictionary metadata section */}
      <div className="border border-gray-300 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-funnel-display text-lg font-bold">Dictionary Information</h3>
          <button
            onClick={onEditMetadata}
            className="text-blue-500 hover:text-blue-700"
          >
            <Edit size={18} />
          </button>
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-funnel-sans font-bold text-sm">Title: </span>
            <span className="font-funnel-sans text-sm">{data.title}</span>
          </div>
          <div>
            <span className="font-funnel-sans font-bold text-sm">Description: </span>
            <span className="font-funnel-sans text-sm">{data.description}</span>
          </div>
        </div>
      </div>

      {/* Entries list section */}
      <div className="border border-gray-300 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-funnel-display text-lg font-bold">Dictionary Entries ({data.entries.length})</h3>
          <button
            onClick={onAddEntry}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white rounded-lg font-funnel-sans font-bold hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            <span>Add Entry</span>
          </button>
        </div>

        <div className="space-y-2">
          {data.entries.map((entry, index) => (
            <div 
              key={entry.id} 
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onEditEntry(entry)}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ 
                      backgroundColor: entry.colorCombo === 1 ? '#F6CBB9' : 
                                     entry.colorCombo === 2 ? '#9A2A1B' :
                                     entry.colorCombo === 3 ? '#67DEA9' : '#4B5177'
                    }}
                  />
                  <div>
                    <h4 className="font-funnel-display font-bold">{entry.word}</h4>
                    {entry.ipa && (
                      <p className="font-funnel-sans text-sm text-gray-600">{entry.ipa}</p>
                    )}
                    <p className="font-funnel-sans text-xs text-gray-500">
                      {entry.definitions.length} definition{entry.definitions.length !== 1 ? 's' : ''}
                      {entry.audioUrl && ' • Audio'}
                      {entry.origin && ' • Origin included'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteEntry(entry.id);
                  }}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {data.entries.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="font-funnel-sans text-sm">No entries yet</p>
              <p className="font-funnel-sans text-xs">Click "Add Entry" to create your first dictionary entry</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntryListView;
