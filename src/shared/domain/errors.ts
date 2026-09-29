/* Canal de error de los casos de uso: los que tocan IO devuelven
   `Either<TodoError, A>` en vez de lanzar, así el tipo dice qué puede fallar.
   El `match` ocurre en el slice de zustand, el único punto de run. */

export type TodoError =
  | { readonly _tag: 'PersistenceError'; readonly cause: unknown }
  | { readonly _tag: 'ValidationError'; readonly message: string };

export const persistenceError = (cause: unknown): TodoError => ({ _tag: 'PersistenceError', cause });

export const validationError = (message: string): TodoError => ({ _tag: 'ValidationError', message });

/** Texto que ve el usuario en el toast. */
export const messageFor = (error: TodoError): string => {
  switch (error._tag) {
    case 'PersistenceError':
      return 'No se pudo guardar el cambio. Se reintentará al recuperar conexión.';
    case 'ValidationError':
      return error.message;
  }
};
