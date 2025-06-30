
import React from 'react';
import { ArrowLeft, FileText, Upload, Download } from 'lucide-react';
import { DictionaryData } from '../types/dictionary';
import { exportDictionaryAsText } from '../utils/dictionaryExport';

interface EditModeSelectorProps {
  data: DictionaryData;
  onSelectEditDictionary: () => void;
  onSelectManageTranslations: () => void;
  onSelectImportGerman: () => void;
  onSelectImportPortuguese: () => void;
  onCancel: () => void;
}

const EditModeSelector = ({ 
  data, 
  onSelectEditDictionary, 
  onSelectManageTranslations, 
  onSelectImportGerman,
  onSelectImportPortuguese,
  onCancel 
}: EditModeSelectorProps) => {
  const handleExport = () => {
    exportDictionaryAsText(data);
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
        <h3 className="font-funnel-display text-lg font-bold">Back</h3>
      </div>

      <h2 className="font-funnel-display text-2xl font-bold">Choose editing mode</h2>

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

        <button
          onClick={handleExport}
          className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
        >
          <div className="flex items-center">
            <Download className="mr-3 h-5 w-5" />
            <div>
              <h4 className="font-funnel-display font-bold mb-2">Export Dictionary</h4>
              <p className="font-funnel-sans text-sm text-gray-600">
                Download the English dictionary and all entries as a text file.
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={onSelectImportGerman}
          className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
        >
          <div className="flex items-center">
            <Upload className="mr-3 h-5 w-5" />
            <div>
              <h4 className="font-funnel-display font-bold mb-2">Import German Translations</h4>
              <p className="font-funnel-sans text-sm text-gray-600">
                Upload a JSON file with German translations for dictionary entries and metadata.
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={onSelectImportPortuguese}
          className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 text-left"
        >
          <div className="flex items-center">
            <Upload className="mr-3 h-5 w-5" />
            <div>
              <h4 className="font-funnel-display font-bold mb-2">Import Portuguese Translations</h4>
              <p className="font-funnel-sans text-sm text-gray-600">
                Upload a JSON file with Portuguese translations for dictionary entries and metadata.
              </p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default EditModeSelector;
