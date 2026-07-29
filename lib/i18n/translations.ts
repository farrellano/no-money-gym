export const translations = {
  es: {
    // Header
    appName: 'NoMoneyGym',
    navFaq: 'FAQ',
    navFeedback: 'Feedback',

    // Hero
    heroTitle: 'Arma rutinas tipo Tabata con tus propios videos',
    heroSubtitle: 'Gratis, sin suscripciones, sin nube. Tus datos se quedan en tu dispositivo.',
    heroCta: 'Comenzar',

    // FAQ
    faqTitle: 'Preguntas frecuentes',
    faqItems: [
      {
        question: '¿Mis videos se suben a algún servidor?',
        answer: 'No. Todo se guarda localmente en tu dispositivo usando IndexedDB. Nadie más tiene acceso a tus datos.',
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
        answer: 'Solo para la primera carga. Después funciona offline como app instalada.',
      },
      {
        question: '¿Qué pasa si cambio de celular?',
        answer: 'Puedes exportar un respaldo (.zip) desde Ajustes e importarlo en el nuevo dispositivo.',
      },
      {
        question: '¿De dónde saco los videos de los ejercicios?',
        answer: 'Los grabas tú o los descargas de donde prefieras y los subes desde tu dispositivo. No hay integración directa con redes sociales.',
      },
    ],

    // Feedback
    feedbackButton: '💬 Danos tu feedback',
    feedbackTitle: 'Tu feedback',
    feedbackName: 'Nombre',
    feedbackEmail: 'Email',
    feedbackRating: 'Calificación',
    feedbackComment: 'Comentario',
    feedbackSend: 'Enviar feedback',
    feedbackSending: 'Enviando...',
    feedbackThanks: '¡Gracias por tu feedback! 🙏',
    feedbackInvalidEmail: 'Email inválido',

    // Footer
    footerCredit: 'Developed by Fas and Claude',
    footerDonation: 'Si quieres aportar, puedes dejar unos satoshis en esta dirección BTC',
    footerCopy: 'Copiar',
    footerCopied: 'Copiado ✓',

    // App - Banco de ejercicios
    exercisesTitle: 'Ejercicios',
    newButton: '+ Nuevo',
    greeting: (name: string) => `Hola, ${name} 👋 ¿Qué grupo muscular trabajaremos hoy?`,
    onboardingWelcome: '¡Bienvenido! 👋',
    onboardingQuestion: '¿Cómo te llamas?',
    onboardingPlaceholder: 'Tu nombre',
    onboardingSave: 'Guardar',
    noExercises: 'No hay ejercicios aún',
    noExercisesHint: 'Toca "+ Nuevo" para agregar uno',
    // Display labels for muscle groups (DB keys are always Spanish)
    muscleGroups: ['todos', 'pierna', 'espalda', 'pecho', 'hombro', 'brazo', 'core', 'glúteo', 'cardio'],
    muscleGroupKeys: ['todos', 'pierna', 'espalda', 'pecho', 'hombro', 'brazo', 'core', 'glúteo', 'cardio'],

    // Circuit tips
    tipsTitle: 'Antes de empezar',
    tips: [
      '🧴 Ten una toalla cerca para secarte el sudor',
      '💧 Ten tu botella de agua a mano',
      '🏋️ Asegúrate de tener espacio suficiente para moverte',
      '🔊 Sube el volumen si activaste los avisos de voz',
      '🤸 Haz un calentamiento previo de 5 minutos',
    ],
    startCircuit: '▶ Iniciar circuito',

    // Timer phases
    phaseWork: 'TRABAJO',
    phaseRest: 'DESCANSO',
    phaseRoundRest: 'DESCANSO ENTRE RONDAS',
    phaseFinished: 'COMPLETADO',

    // Speech
    speechExercise: (name: string) => `Ejercicio: ${name}`,
    speechRest: 'Descanso',
    speechRoundRest: 'Descanso entre rondas',
    speechPrepare: 'Prepárate',
    speechFinished: 'Circuito terminado',
    speechLang: 'es-ES',
  },
  en: {
    // Header
    appName: 'NoMoneyGym',
    navFaq: 'FAQ',
    navFeedback: 'Feedback',

    // Hero
    heroTitle: 'Build Tabata routines with your own videos',
    heroSubtitle: 'Free, no subscriptions, no cloud. Your data stays on your device.',
    heroCta: 'Get Started',

    // FAQ
    faqTitle: 'Frequently Asked Questions',
    faqItems: [
      {
        question: 'Are my videos uploaded to any server?',
        answer: 'No. Everything is stored locally on your device using IndexedDB. No one else has access to your data.',
      },
      {
        question: 'Is it free?',
        answer: '100% free. No paid plans, no charges, no trial.',
      },
      {
        question: 'Are there subscriptions?',
        answer: 'No. No recurring charges of any kind.',
      },
      {
        question: 'Do I need internet to use it?',
        answer: 'Only for the first load. After that it works offline as an installed app.',
      },
      {
        question: 'What if I change my phone?',
        answer: 'You can export a backup (.zip) from Settings and import it on the new device.',
      },
      {
        question: 'Where do I get the exercise videos?',
        answer: 'You record them yourself or download them from wherever you prefer and upload from your device. No direct social media integration.',
      },
    ],

    // Feedback
    feedbackButton: '💬 Give us feedback',
    feedbackTitle: 'Your feedback',
    feedbackName: 'Name',
    feedbackEmail: 'Email',
    feedbackRating: 'Rating',
    feedbackComment: 'Comment',
    feedbackSend: 'Send feedback',
    feedbackSending: 'Sending...',
    feedbackThanks: 'Thanks for your feedback! 🙏',
    feedbackInvalidEmail: 'Invalid email',

    // Footer
    footerCredit: 'Developed by Fas and Claude',
    footerDonation: 'If you want to contribute, you can leave some satoshis at this BTC address',
    footerCopy: 'Copy',
    footerCopied: 'Copied ✓',

    // App - Exercise bank
    exercisesTitle: 'Exercises',
    newButton: '+ New',
    greeting: (name: string) => `Hi, ${name} 👋 What muscle group are we working today?`,
    onboardingWelcome: 'Welcome! 👋',
    onboardingQuestion: "What's your name?",
    onboardingPlaceholder: 'Your name',
    onboardingSave: 'Save',
    noExercises: 'No exercises yet',
    noExercisesHint: 'Tap "+ New" to add one',
    muscleGroups: ['All', 'Legs', 'Back', 'Chest', 'Shoulders', 'Arms', 'Core', 'Glutes', 'Cardio'],
    muscleGroupKeys: ['todos', 'pierna', 'espalda', 'pecho', 'hombro', 'brazo', 'core', 'glúteo', 'cardio'],

    // Circuit tips
    tipsTitle: 'Before you start',
    tips: [
      '🧴 Keep a towel nearby to wipe off sweat',
      '💧 Have your water bottle within reach',
      '🏋️ Make sure you have enough space to move',
      '🔊 Turn up the volume if you enabled voice cues',
      '🤸 Do a 5-minute warm-up first',
    ],
    startCircuit: '▶ Start circuit',

    // Timer phases
    phaseWork: 'WORK',
    phaseRest: 'REST',
    phaseRoundRest: 'REST BETWEEN ROUNDS',
    phaseFinished: 'COMPLETED',

    // Speech
    speechExercise: (name: string) => `Exercise: ${name}`,
    speechRest: 'Rest',
    speechRoundRest: 'Rest between rounds',
    speechPrepare: 'Get ready',
    speechFinished: 'Circuit completed',
    speechLang: 'en-US',
  },
};

export type Locale = keyof typeof translations;
export type Translations = (typeof translations)[Locale];
