const faqs = [
  {
    question: '¿Mis videos se suben a algún servidor?',
    answer:
      'No. Todo se guarda localmente en tu dispositivo usando IndexedDB. Nadie más tiene acceso a tus datos.',
  },
  {
    question: '¿Es gratis?',
    answer: '100% gratuita. Sin planes pagos, sin cobros, sin trial.',
  },
  {
    question: '¿Hay suscripciones?',
    answer: 'No. Sin cobros recurrentes de ningún tipo.',
  },
  {
    question: '¿Necesito internet para usarla?',
    answer:
      'Solo para la primera carga. Después funciona offline como app instalada.',
  },
  {
    question: '¿Qué pasa si cambio de celular?',
    answer:
      'Puedes exportar un respaldo (.zip) desde Ajustes e importarlo en el nuevo dispositivo.',
  },
  {
    question: '¿De dónde saco los videos de los ejercicios?',
    answer:
      'Los grabas tú o los descargas de donde prefieras y los subes desde tu dispositivo. No hay integración directa con redes sociales.',
  },
];

export function Faq() {
  return (
    <section className="px-4 py-12">
      <h2 className="text-2xl font-bold text-white text-center mb-8">
        Preguntas frecuentes
      </h2>
      <div className="mx-auto max-w-lg space-y-3">
        {faqs.map((faq) => (
          <details
            key={faq.question}
            className="group rounded-lg border border-zinc-800 bg-zinc-900"
          >
            <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-white list-none flex items-center justify-between">
              {faq.question}
              <span className="text-zinc-500 group-open:rotate-180 transition-transform">
                ▾
              </span>
            </summary>
            <p className="px-4 pb-3 text-sm text-zinc-400">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
