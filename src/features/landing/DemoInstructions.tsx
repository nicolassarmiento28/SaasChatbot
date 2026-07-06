const EXAMPLE_QUESTIONS = [
  '¿Cuál es el horario?',
  '¿Tienen opciones vegetarianas?',
  '¿Hacen delivery?',
  '¿Cómo hago una reserva?',
];

export function DemoInstructions() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px' }}>
      <div className="lp-info-card">
        <p className="lp-eyebrow" style={{ marginBottom: 6 }}>
          demo_restaurante
        </p>
        <p style={{ color: 'var(--lp-info-desc)', marginBottom: 10 }}>
          Este bot de prueba responde preguntas típicas de un restaurante (horario, menú,
          reservas, delivery, alergias). Escríbele como lo haría un cliente:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {EXAMPLE_QUESTIONS.map((question) => (
            <span
              key={question}
              className="lp-mono lp-info-tag"
              style={{
                fontSize: 12,
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              {question}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
