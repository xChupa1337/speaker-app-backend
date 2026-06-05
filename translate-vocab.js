const translate = require('translate-google');
const fs = require('fs');

const run = async () => {
  const content = fs.readFileSync('../speaker-app/src-vocab.ts', 'utf8');
  const dataStr = content.replace('export const vocabularyTopicsDummyData =', 'return');
  const getFn = new Function(dataStr);
  const englishTopics = getFn();
  
  // We need 15 topics with 40 words each
  const trimmedTopics = englishTopics.slice(0, 15).map(topic => ({
    ...topic,
    words: topic.words.slice(0, 40)
  }));
  
  const langs = ['es', 'fr', 'de', 'pl'];
  
  const output = [];
  
  output.push(`export const getVocabularyData = (lang: string) => {`);
  output.push(`  if (lang === "en") return ${JSON.stringify(trimmedTopics, null, 2)};`);
  
  for (const lang of langs) {
    console.log(`Translating to ${lang}...`);
    try {
      const translatedTopics = JSON.parse(JSON.stringify(trimmedTopics)); 
      
      const allTexts = [];
      for (const t of translatedTopics) {
        allTexts.push(t.title);
        for (const w of t.words) {
          allTexts.push(w.word);
          w.examples.forEach(ex => allTexts.push(ex));
        }
      }
      
      // Batch translate because Google might block large requests
      const batchSize = 100;
      let translatedTexts = [];
      
      for (let i = 0; i < allTexts.length; i += batchSize) {
        console.log(`Translating batch ${i} to ${i + batchSize}`);
        const batch = allTexts.slice(i, i + batchSize);
        const res = await translate(batch, {to: lang});
        translatedTexts = translatedTexts.concat(res);
        // Wait 1 second
        await new Promise(r => setTimeout(r, 1000));
      }
      
      let textIdx = 0;
      for (const t of translatedTopics) {
        t.title = translatedTexts[textIdx++];
        t.id = t.id.replace('en', lang); // replace en with es etc
        for (const w of t.words) {
          w.id = w.id.replace('en', lang);
          w.word = translatedTexts[textIdx++];
          for (let k = 0; k < w.examples.length; k++) {
            w.examples[k] = translatedTexts[textIdx++];
          }
          w.transcription = `/${w.word}/`; // simple fallback transcription
        }
      }
      
      output.push(`  if (lang === "${lang}") return ${JSON.stringify(translatedTopics, null, 2)};`);
    } catch(e) {
      console.log('Error in', lang, e);
    }
  }
  
  output.push(`  return [];`);
  output.push(`};`);
  
  fs.writeFileSync('../speaker-app/constants/vocab.ts', output.join('\\n'));
  console.log('Done writing vocab.ts');
};

run();
