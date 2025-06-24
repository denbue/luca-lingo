import React, { useState, useEffect } from 'react';
import { DictionaryData } from '../types/dictionary';
import { initialData } from '../data/initialData';
import DictionaryEntry from '../components/DictionaryEntry';
import PinEntry from '../components/PinEntry';
import EditForm from '../components/EditForm';
import { Edit } from 'lucide-react';

const Index = () => {
  const [data, setData] = useState<DictionaryData>(initialData);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('lucas-dictionary');
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  const saveData = (newData: DictionaryData) => {
    setData(newData);
    localStorage.setItem('lucas-dictionary', JSON.stringify(newData));
    setShowEditForm(false);
  };

  const handleEditClick = () => {
    setShowPinEntry(true);
  };

  const handlePinSuccess = () => {
    setShowPinEntry(false);
    setShowEditForm(true);
  };

  const handlePinCancel = () => {
    setShowPinEntry(false);
  };

  const handleEditCancel = () => {
    setShowEditForm(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9F7' }}>
      <div className="p-5">
        {/* Edit button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleEditClick}
            className="opacity-20 hover:opacity-40 transition-opacity duration-200"
            style={{ color: '#000000' }}
          >
            <Edit size={18} />
          </button>
        </div>

        {/* Header */}
        <header className="pt-24 pb-10">
          <h1 className="font-funnel-display text-5xl font-bold mb-4" style={{ color: '#000000' }}>
            {data.title}
          </h1>
          <p className="font-funnel-sans text-base font-light" style={{ color: '#000000' }}>
            {data.description}
          </p>
        </header>

        {/* Dictionary entries */}
        <div className="space-y-0">
          {data.entries.map((entry) => (
            <DictionaryEntry key={entry.id} entry={entry} />
          ))}
        </div>
      </div>

      {/* PIN Entry Modal */}
      {showPinEntry && (
        <PinEntry onSuccess={handlePinSuccess} onCancel={handlePinCancel} />
      )}

      {/* Edit Form Modal */}
      {showEditForm && (
        <EditForm
          data={data}
          onSave={saveData}
          onCancel={handleEditCancel}
        />
      )}
    </div>
  );
};

export default Index;
