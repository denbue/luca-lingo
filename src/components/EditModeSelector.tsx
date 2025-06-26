
import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface EditModeSelectorProps {
  onSelectEditDictionary: () => void;
  onSelectManageTranslations: () => void;
  onCancel: () => void;
}

const EditModeSelector = ({ onSelectEditDictionary, onSelectManageTranslations, onCancel }: EditModeSelectorProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={20} />
        </button>
        <h3 className="font-funnel-display text-lg font-bold">Choose editing mode</h3>
      </div>

      <div className="space-y-4">
        <button
          onClick={onSelectEditDictionary}
          className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
        >
          <h4 className="font-funnel-display font-bold mb-2">Edit Dictionary</h4>
          <p className="font-funnel-sans text-sm text-gray-600">
            Add, edit, and delete dictionary entries. Manage dictionary information.
          </p>
        </button>

        <button
          onClick={onSelectManageTranslations}
          className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
        >
          <h4 className="font-funnel-display font-bold mb-2">Manage Translations</h4>
          <p className="font-funnel-sans text-sm text-gray-600">
            Translate dictionary information and entry definitions to German and Portuguese.
          </p>
        </button>
      </div>
    </div>
  );
};

export default EditModeSelector;
