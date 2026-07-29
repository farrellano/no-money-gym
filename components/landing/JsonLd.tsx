export function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NoMoneyGym',
    applicationCategory: 'HealthApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'Create custom Tabata and circuit training routines using your own exercise videos. Free, offline, no subscriptions. Crea rutinas personalizadas tipo Tabata con tus propios videos.',
    url: 'https://nomoneygym.com',
    inLanguage: ['es', 'en'],
    applicationSubCategory: 'Fitness',
    featureList: 'Custom workout routines, Video-based exercises, Tabata timer, Circuit training, Offline mode, No subscription',
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
