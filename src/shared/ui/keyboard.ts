/** `true` si el foco está en algo donde se escribe: ahí los atajos de una tecla no deben dispararse. */
export const isTyping = (el: EventTarget | null): boolean =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));
