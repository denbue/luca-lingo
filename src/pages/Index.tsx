import React, { useState } from 'react';
import DictionaryEntry from '../components/DictionaryEntry';
import PinEntry from '../components/PinEntry';
import EditForm from '../components/EditForm';
import LanguageSelector from '../components/LanguageSelector';
import SystemLanguageTest from '../components/SystemLanguageTest';
import { Edit } from 'lucide-react';
import { useDictionary } from '../hooks/useDictionary';
import { useTranslatedContent } from '../hooks/useTranslatedContent';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';

const DictionaryContent = () => {
  const { data, loading, saveData, refetch } = useDictionary();
  const { currentLanguage } = useLanguage();
  const { translatedData, loading: translationLoading, forceRefresh, originLabel } = useTranslatedContent(data, currentLanguage);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

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

  const handleSave = async (newData: any) => {
    try {
      await saveData(newData);
      setShowEditForm(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleRefreshData = async () => {
    console.log('Refreshing dictionary data and translations...');
    await refetch();
    forceRefresh();
  };

  const isLoading = loading || translationLoading;
  const displayData = translatedData || data;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9F7' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="font-funnel-sans text-lg">Loading dictionary...</p>
        </div>
      </div>
    );
  }

  if (!displayData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F8F9F7' }}>
        <div className="text-center">
          <p className="font-funnel-sans text-lg mb-4">Failed to load dictionary</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F9F7' }}>
      <div className="p-5">
        {/* Language selector and Edit button */}
        <div className="flex justify-between mb-4">
          <LanguageSelector />
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
            {displayData.title}
          </h1>
          <p className="font-funnel-sans text-base font-light" style={{ color: '#000000' }}>
            {displayData.description}
          </p>
        </header>

        {/* Dictionary entries */}
        <div className="space-y-0">
          {displayData.entries.map((entry) => (
            <DictionaryEntry key={entry.id} entry={entry} />
          ))}
        </div>
      </div>

      {/* System Language Test Component - Hidden for now */}
      {/* <SystemLanguageTest /> */}

      {/* PIN Entry Modal */}
      {showPinEntry && (
        <PinEntry onSuccess={handlePinSuccess} onCancel={handlePinCancel} />
      )}

      {/* Edit Form Modal */}
      {showEditForm && data && (
        <EditForm
          data={data}
          onSave={handleSave}
          onCancel={handleEditCancel}
          onRefreshData={handleRefreshData}
        />
      )}
    </div>
  );
};

const Index = () => {
  return (
    <LanguageProvider>
      <DictionaryContent />
    </LanguageProvider>
  );
};

export default Index;
