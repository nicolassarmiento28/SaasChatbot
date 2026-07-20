// Detección de idioma por palabras clave (specs/04-bot-config.md §6).
// ponytail: los mensajes de chat suelen ser frases muy cortas ("¿Hacen
// delivery?", "What are your hours?"), donde los detectores estadísticos
// de n-gramas (franc/franc-min) fallan sistemáticamente — se probó
// directamente y clasifican mal frases cortas en inglés/español como
// neerlandés/portugués. Un heurístico de palabras frecuentes por idioma
// es más preciso en este caso concreto. Si ningún idioma tiene más
// coincidencias que el resto, no se fuerza ninguno (fallback genérico).
const LANGUAGE_KEYWORDS: Record<string, string[]> = {
  inglés: ['the', 'what', 'when', 'where', 'how', 'you', 'your', 'hours', 'is', 'are', 'do', 'does', 'can', 'please', 'thanks', 'thank', 'hello', 'hi', 'have', 'open', 'closed'],
  español: ['qué', 'que', 'cuál', 'cual', 'cómo', 'como', 'dónde', 'donde', 'cuándo', 'cuando', 'hola', 'gracias', 'tienen', 'tienes', 'hacen', 'puedo', 'ustedes', 'favor', 'horario', 'abierto', 'cerrado'],
  portugués: ['qual', 'quais', 'como', 'onde', 'quando', 'olá', 'obrigado', 'obrigada', 'vocês', 'fazem', 'horário', 'aberto', 'fechado', 'você'],
  francés: ['quel', 'quelle', 'comment', 'où', 'quand', 'bonjour', 'merci', 'vous', 'avez', 'heures', 'ouvert', 'fermé'],
  alemán: ['wie', 'wann', 'wo', 'was', 'sie', 'haben', 'danke', 'hallo', 'öffnungszeiten', 'geöffnet', 'geschlossen'],
  italiano: ['quale', 'come', 'dove', 'quando', 'ciao', 'grazie', 'avete', 'orario', 'aperto', 'chiuso'],
};

export function detectLanguageName(text: string): string | null {
  const words = text.toLowerCase().match(/[\p{L}]+/gu) ?? [];
  if (words.length === 0) return null;
  const wordSet = new Set(words);

  let best: string | null = null;
  let bestScore = 0;
  let tie = false;

  for (const [language, keywords] of Object.entries(LANGUAGE_KEYWORDS)) {
    const score = keywords.filter((k) => wordSet.has(k)).length;
    if (score > bestScore) {
      best = language;
      bestScore = score;
      tie = false;
    } else if (score === bestScore && score > 0) {
      tie = true;
    }
  }

  return bestScore > 0 && !tie ? best : null;
}
