import Dexie, { type EntityTable } from 'dexie';

export interface VideoRecord {
  id: string;
  blob: Blob;
  duracionTotal: number;
  createdAt: Date;
}

export interface EjercicioRecord {
  id: string;
  nombre: string;
  grupoMuscular: string;
  videoId: string;
  startSec: number;
  endSec: number;
  createdAt: Date;
}

export interface CircuitoEjercicio {
  ejercicioId: string;
  duracionSeg: number;
  descansoSeg: number;
}

export interface CircuitoRecord {
  id: string;
  nombre: string;
  rondas: number;
  ejercicios: CircuitoEjercicio[];
  createdAt: Date;
}

export interface ConfigRecord {
  id: string;
  vozActivada: boolean;
  sonidosActivados: boolean;
  vozLang: string;
}

const db = new Dexie('NoMoneyGymDB') as Dexie & {
  videos: EntityTable<VideoRecord, 'id'>;
  ejercicios: EntityTable<EjercicioRecord, 'id'>;
  circuitos: EntityTable<CircuitoRecord, 'id'>;
  config: EntityTable<ConfigRecord, 'id'>;
};

db.version(1).stores({
  videos: 'id, createdAt',
  ejercicios: 'id, grupoMuscular, videoId, createdAt',
  circuitos: 'id, createdAt',
  config: 'id',
});

export { db };
