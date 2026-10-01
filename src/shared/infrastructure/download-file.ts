/** Entrega un texto al usuario como archivo descargable (Blob + `<a download>`). */
export const downloadFile = (filename: string, content: string): void => {
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
