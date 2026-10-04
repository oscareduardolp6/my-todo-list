/** Copia un texto al portapapeles (requiere contexto seguro y un gesto del usuario). */
export const copyText = (text: string): Promise<void> => navigator.clipboard.writeText(text);
