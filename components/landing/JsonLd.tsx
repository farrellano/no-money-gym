export function JsonLd() {
  const appJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NoMoneyGym',
    applicationCategory: 'HealthApplication',
    applicationSubCategory: 'Fitness',
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
    featureList: 'Custom workout routines, Video-based exercises, Tabata timer, Circuit training, Offline mode, No subscription, Voice cues, Backup export/import',
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is NoMoneyGym?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'NoMoneyGym is a free PWA that lets you create Tabata and circuit training routines using your own exercise videos. It works offline and stores all data locally on your device.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is NoMoneyGym really free?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '100% free. No paid plans, no subscriptions, no ads, no trial periods. Free forever.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do I need internet to use NoMoneyGym?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Only for the first load. After that it works completely offline as an installed PWA app.',
        },
      },
      {
        '@type': 'Question',
        name: 'Are my videos uploaded to a server?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'No. All videos and data are stored locally on your device using IndexedDB. Nothing is sent to any server.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I create a workout routine with NoMoneyGym?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your exercise videos, trim the active portion, organize by muscle group, then build circuits by selecting exercises, setting work/rest intervals, and choosing the number of rounds.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </>
  );
}
