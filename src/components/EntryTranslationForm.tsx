
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface EntryTranslationFormProps {
  entryId: string;
  onBack: () => void;
}

const EntryTranslationForm = ({ entryId, onBack }: EntryTranslationFormProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="font-funnel-display text-lg font-bold">Back to Translation List</h3>
      </div>

      <h2 className="font-funnel-display text-2xl font-bold">Edit Entry Translation</h2>
      
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="font-funnel-sans text-sm text-gray-600">
          Entry translation form for entry ID: {entryId}
        </p>
        <p className="font-funnel-sans text-sm text-gray-500 mt-2">
          This component will be implemented to handle entry translations.
        </p>
      </div>
    </div>
  );
};

export default EntryTranslationForm;
