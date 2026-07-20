import { describe, expect, it } from 'vitest';
import { detectLanguageName } from '../supabase/functions/chat/languageDetect';

describe('detectLanguageName', () => {
  it('detects English on short common chat phrases', () => {
    expect(detectLanguageName('What are your opening hours?')).toBe('inglés');
    expect(detectLanguageName('Do you have delivery?')).toBe('inglés');
  });

  it('detects Spanish on short common chat phrases', () => {
    expect(detectLanguageName('¿Hacen delivery?')).toBe('español');
    expect(detectLanguageName('¿Cuál es el horario de atención?')).toBe('español');
  });

  it('detects Portuguese and French', () => {
    expect(detectLanguageName('Qual é o horário de funcionamento?')).toBe('portugués');
    expect(detectLanguageName('Quel est votre horaire?')).toBe('francés');
  });

  it('returns null when no language scores above zero', () => {
    expect(detectLanguageName('12345 !!!')).toBeNull();
  });

  it('returns null on a tie between languages', () => {
    // "como" es palabra clave tanto en portugués como en italiano.
    expect(detectLanguageName('como')).toBeNull();
  });
});
