
import { DictionaryData } from '../types/dictionary';

export const exportDictionaryAsText = (data: DictionaryData) => {
  let content = `${data.title}\n`;
  content += `${data.description}\n\n`;
  content += '='.repeat(50) + '\n\n';

  data.entries.forEach((entry, index) => {
    content += `${index + 1}. ${entry.word}`;
    if (entry.ipa) {
      content += ` [${entry.ipa}]`;
    }
    content += '\n';
    
    if (entry.origin) {
      content += `   Origin: ${entry.origin}\n`;
    }

    entry.definitions.forEach((def, defIndex) => {
      content += `   ${defIndex + 1}. (${def.grammaticalClass}) ${def.meaning}`;
      if (def.example) {
        content += `\n      Example: "${def.example}"`;
      }
      content += '\n';
    });
    
    content += '\n';
  });

  // Create and download the file
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.title.replace(/[^a-zA-Z0-9]/g, '_')}_dictionary.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
