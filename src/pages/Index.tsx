
import React, { useState } from 'react';
import { useDictionary } from '@/hooks/useDictionary';
import { DictionaryData } from '@/types/dictionary';
import EditForm from '@/components/EditForm';
import Header from '@/components/Header';
import DictionaryContent from '@/components/DictionaryContent';
import { LanguageProvider } from '../contexts/LanguageContext';

const Index = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  const { data, loading, saveData, refetch } = useDictionary();

  const handleEdit = () => {
    setShowEditForm(true);
  };

  const handleSave = async (newData: DictionaryData) => {
    try {
      await saveData(newData);
      setShowEditForm(false);
      refetch();
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen bg-global-bg">
        <div className="px-5 py-8">
          <Header onEdit={handleEdit} />
          
          <DictionaryContent 
            data={data}
            loading={loading}
          />
          
          {showEditForm && data && (
            <EditForm 
              data={data} 
              onSave={handleSave} 
              onCancel={handleCancelEdit} 
            />
          )}
        </div>
      </div>
    </LanguageProvider>
  );
};

export default Index;
