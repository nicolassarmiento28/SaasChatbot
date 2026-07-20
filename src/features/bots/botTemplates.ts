import type { BotTone } from './systemPrompt';

export interface BotTemplateFaq {
  title: string;
  content: string;
}

export interface BotTemplate {
  id: string;
  label: string;
  tone: BotTone;
  faqs: BotTemplateFaq[];
}

// Plantillas por rubro (specs/03-onboarding.md §4, specs/04-bot-config.md §3).
// El contenido de cada FAQ es un placeholder editable — el dueño del negocio
// completa los datos reales antes de guardar o después desde la base de conocimiento.
export const BOT_TEMPLATES: BotTemplate[] = [
  {
    id: 'restaurante',
    label: 'Restaurante',
    tone: 'amigable',
    faqs: [
      { title: '¿Cuál es el horario de atención?', content: 'Completa con el horario real de tu restaurante.' },
      { title: '¿Hacen delivery?', content: 'Indica si ofreces delivery y en qué zonas.' },
      { title: '¿Tienen opciones vegetarianas?', content: 'Describe las opciones vegetarianas de tu menú.' },
      { title: '¿Cómo hago una reserva?', content: 'Explica el proceso para reservar una mesa.' },
      { title: '¿Cuál es la dirección y hay estacionamiento?', content: 'Indica la dirección y disponibilidad de estacionamiento.' },
    ],
  },
  {
    id: 'clinica',
    label: 'Clínica',
    tone: 'formal',
    faqs: [
      { title: '¿Cuáles son los horarios de atención?', content: 'Completa con los horarios reales de la clínica.' },
      { title: '¿Qué especialidades están disponibles?', content: 'Lista las especialidades médicas que ofreces.' },
      { title: '¿Cómo agendo una cita?', content: 'Explica el proceso para agendar una cita.' },
      { title: '¿Qué seguros y convenios aceptan?', content: 'Indica los seguros y convenios aceptados.' },
      { title: '¿Qué hago en caso de urgencia?', content: 'Explica el procedimiento a seguir en caso de urgencia.' },
    ],
  },
  {
    id: 'tienda_online',
    label: 'Tienda online',
    tone: 'amigable',
    faqs: [
      { title: '¿Qué métodos de pago aceptan?', content: 'Lista los métodos de pago disponibles.' },
      { title: '¿Cuáles son los tiempos de envío?', content: 'Indica los tiempos de envío estimados.' },
      { title: '¿Cuál es la política de devoluciones?', content: 'Describe la política de devoluciones.' },
      { title: '¿Cómo verifico el stock de un producto?', content: 'Explica cómo consultar disponibilidad de stock.' },
      { title: '¿Tienen descuentos o promociones vigentes?', content: 'Indica las promociones vigentes.' },
    ],
  },
  {
    id: 'inmobiliaria',
    label: 'Inmobiliaria',
    tone: 'formal',
    faqs: [
      { title: '¿Qué tipos de propiedad tienen disponibles?', content: 'Lista los tipos de propiedad disponibles.' },
      { title: '¿En qué zonas o comunas operan?', content: 'Indica las zonas o comunas donde operan.' },
      { title: '¿Cómo contacto a un agente?', content: 'Explica cómo contactar a un agente.' },
      { title: '¿Cómo agendo una visita?', content: 'Explica el proceso para agendar una visita.' },
      { title: '¿Qué opciones de financiamiento tienen?', content: 'Describe las opciones de financiamiento disponibles.' },
    ],
  },
];
