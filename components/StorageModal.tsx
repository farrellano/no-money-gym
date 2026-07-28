'use client';

interface StorageModalProps {
  open: boolean;
  onClose: () => void;
}

export function StorageModal({ open, onClose }: StorageModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl bg-zinc-800 p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white">Almacenamiento lleno</h2>
        <p className="mt-2 text-sm text-zinc-300">
          No hay suficiente espacio para guardar este video. Elimina ejercicios
          que ya no uses desde el banco de ejercicios, o revisa el uso de
          almacenamiento en Ajustes.
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 active:bg-zinc-200"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
