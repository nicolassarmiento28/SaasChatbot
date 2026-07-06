-- Reconfigura el bot demo existente (VITE_DEMO_BOT_ID) como "demo_restaurante":
-- persona de restaurante + FAQs típicas, para que la demo de la landing
-- (01-landing.md) tenga un caso de uso concreto y reconocible.

update public.bots
set
  name = 'demo_restaurante',
  tone = 'amigable',
  system_prompt = 'Eres demo_restaurante, el asistente virtual de atención al cliente de un restaurante. Responde de manera cálida, amigable y empática. Usa únicamente la base de conocimiento provista para responder.'
where id = '94e8fca7-3cf0-4571-8991-e5c8f07dd2ab';

delete from public.knowledge_sources where bot_id = '94e8fca7-3cf0-4571-8991-e5c8f07dd2ab';

insert into public.knowledge_sources (bot_id, type, title, content) values
  ('94e8fca7-3cf0-4571-8991-e5c8f07dd2ab', 'faq', 'Horario',
   'Abrimos todos los días de 12:00 a 23:00, incluyendo festivos.'),
  ('94e8fca7-3cf0-4571-8991-e5c8f07dd2ab', 'faq', 'Reservas',
   'Aceptamos reservas por teléfono o por este chat, indicando fecha, hora y número de personas. Para grupos de más de 8 personas recomendamos reservar con 24h de anticipación.'),
  ('94e8fca7-3cf0-4571-8991-e5c8f07dd2ab', 'faq', 'Menú y especialidades',
   'Nuestra especialidad es la parrilla a la brasa y las pastas caseras. Tenemos menú del día de lunes a viernes al mediodía y carta completa el resto del tiempo.'),
  ('94e8fca7-3cf0-4571-8991-e5c8f07dd2ab', 'faq', 'Opciones vegetarianas y alergias',
   'Tenemos varias opciones vegetarianas y veganas marcadas en la carta. Si tienes alguna alergia o intolerancia, avísanos al hacer el pedido y adaptamos el plato.'),
  ('94e8fca7-3cf0-4571-8991-e5c8f07dd2ab', 'faq', 'Ubicación',
   'Estamos en el centro de la ciudad, a 5 minutos caminando de la plaza principal. Tenemos parqueadero propio para clientes.'),
  ('94e8fca7-3cf0-4571-8991-e5c8f07dd2ab', 'faq', 'Delivery y para llevar',
   'Hacemos entregas a domicilio en un radio de 5 km a través de nuestra propia app y de las plataformas habituales de delivery. También puedes pedir para recoger en el local.'),
  ('94e8fca7-3cf0-4571-8991-e5c8f07dd2ab', 'faq', 'Métodos de pago',
   'Aceptamos efectivo, tarjeta de crédito/débito y pagos por transferencia o billetera digital.');
