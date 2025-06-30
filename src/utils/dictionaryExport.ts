
import { DictionaryData } from '../types/dictionary';

export const exportDictionaryAsText = (data: DictionaryData) => {
  let content = `DICTIONARY_TITLE: ${data.title}\n`;
  content += `DICTIONARY_TITLE_TRANSLATION: [ADD YOUR TRANSLATION HERE]\n\n`;
  
  content += `DICTIONARY_DESCRIPTION: ${data.description}\n`;
  content += `DICTIONARY_DESCRIPTION_TRANSLATION: [ADD YOUR TRANSLATION HERE]\n\n`;
  
  content += `--- ENTRIES ---\n\n`;

  data.entries.forEach((entry, index) => {
    content += `ENTRY_${index + 1}_WORD: ${entry.word}\n`;
    
    if (entry.origin) {
      content += `ENTRY_${index + 1}_ORIGIN: ${entry.origin}\n`;
      content += `ENTRY_${index + 1}_ORIGIN_TRANSLATION: [ADD YOUR TRANSLATION HERE]\n`;
    } else {
      content += `ENTRY_${index + 1}_ORIGIN: \n`;
      content += `ENTRY_${index + 1}_ORIGIN_TRANSLATION: [ADD YOUR TRANSLATION HERE]\n`;
    }
    
    entry.definitions.forEach((def, defIndex) => {
      const defNum = defIndex + 1;
      content += `ENTRY_${index + 1}_DEF_${defNum}_CLASS: ${def.grammaticalClass}\n`;
      content += `ENTRY_${index + 1}_DEF_${defNum}_CLASS_TRANSLATION: [ADD YOUR TRANSLATION HERE]\n`;
      content += `ENTRY_${index + 1}_DEF_${defNum}_MEANING: ${def.meaning}\n`;
      content += `ENTRY_${index + 1}_DEF_${defNum}_MEANING_TRANSLATION: [ADD YOUR TRANSLATION HERE]\n`;
      
      if (def.example) {
        content += `ENTRY_${index + 1}_DEF_${defNum}_EXAMPLE: ${def.example}\n`;
        content += `ENTRY_${index + 1}_DEF_${defNum}_EXAMPLE_TRANSLATION: [ADD YOUR TRANSLATION HERE]\n`;
      } else {
        content += `ENTRY_${index + 1}_DEF_${defNum}_EXAMPLE: \n`;
        content += `ENTRY_${index + 1}_DEF_${defNum}_EXAMPLE_TRANSLATION: [ADD YOUR TRANSLATION HERE]\n`;
      }
    });
    content += '\n';
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_translation_template.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
