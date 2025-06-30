
import { DictionaryData } from '../types/dictionary';

export const exportDictionaryAsText = (data: DictionaryData) => {
  let content = `${data.title}\n`;
  content += `${data.description}\n\n`;
  content += `--- DICTIONARY ENTRIES ---\n\n`;

  data.entries.forEach((entry, index) => {
    content += `${index + 1}. ${entry.word}\n`;
    if (entry.ipa) {
      content += `   IPA: ${entry.ipa}\n`;
    }
    if (entry.origin) {
      content += `   Origin: ${entry.origin}\n`;
    }
    
    entry.definitions.forEach((def, defIndex) => {
      content += `   ${defIndex + 1}. [${def.grammaticalClass}] ${def.meaning}\n`;
      if (def.example) {
        content += `      Example: ${def.example}\n`;
      }
    });
    content += '\n';
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_dictionary.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
