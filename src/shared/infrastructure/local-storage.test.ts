import { createLocalCollection, createLocalValue } from './local-storage';

type Item = { id: string; n: number };
const KEY = 'test.items';

beforeEach(() => localStorage.clear());

describe('createLocalCollection', () => {
  it('siembra la primera vez y no vuelve a sembrar aunque la lista quede vacía', async () => {
    const seed = vi.fn(() => [{ id: 'a', n: 1 }]);
    const repo = createLocalCollection<Item>(KEY, seed);
    const seen: Item[][] = [];
    repo.subscribe((items) => seen.push(items));
    expect(seen.at(-1)).toEqual([{ id: 'a', n: 1 }]);

    await repo.remove('a');
    expect(seen.at(-1)).toEqual([]);

    // "Recarga": otra instancia sobre el mismo localStorage.
    const reloaded = createLocalCollection<Item>(KEY, seed);
    reloaded.subscribe((items) => seen.push(items));
    expect(seen.at(-1)).toEqual([]);
    expect(seed).toHaveBeenCalledTimes(1);
  });

  it('save inserta o reemplaza por id y avisa a los suscriptores; el unsubscribe corta', async () => {
    const repo = createLocalCollection<Item>(KEY);
    const onData = vi.fn();
    const unsubscribe = repo.subscribe(onData);

    await repo.save({ id: 'a', n: 1 });
    await repo.saveMany([
      { id: 'a', n: 2 },
      { id: 'b', n: 3 },
    ]);
    expect(onData).toHaveBeenLastCalledWith([
      { id: 'a', n: 2 },
      { id: 'b', n: 3 },
    ]);

    unsubscribe();
    await repo.save({ id: 'c', n: 4 });
    expect(onData).toHaveBeenCalledTimes(3);
    expect(JSON.parse(localStorage.getItem(KEY) ?? '[]')).toHaveLength(3);
  });

  it('lo guardado corrupto o con otra forma se reemplaza por la semilla', () => {
    localStorage.setItem(KEY, '{no es json');
    const repo = createLocalCollection<Item>(KEY, () => [{ id: 's', n: 0 }]);
    const onData = vi.fn();
    repo.subscribe(onData);
    expect(onData).toHaveBeenCalledWith([{ id: 's', n: 0 }]);

    localStorage.setItem('otra', '{"id":"x"}');
    const other = createLocalCollection<Item>('otra');
    const onOther = vi.fn();
    other.subscribe(onOther);
    expect(onOther).toHaveBeenCalledWith([]);
  });

  it('recoge los cambios hechos desde otra pestaña (evento storage)', () => {
    const repo = createLocalCollection<Item>(KEY);
    const onData = vi.fn();
    repo.subscribe(onData);

    localStorage.setItem(KEY, JSON.stringify([{ id: 'z', n: 9 }]));
    window.dispatchEvent(new StorageEvent('storage', { key: KEY, storageArea: localStorage }));

    expect(onData).toHaveBeenLastCalledWith([{ id: 'z', n: 9 }]);
  });
});

describe('createLocalValue sin storage', () => {
  it('sigue funcionando en memoria', () => {
    const value = createLocalValue<number[]>(KEY, () => [1], (r): r is number[] => Array.isArray(r), null);
    const onData = vi.fn();
    value.subscribe(onData);
    value.set([1, 2]);
    expect(onData).toHaveBeenLastCalledWith([1, 2]);
    expect(value.get()).toEqual([1, 2]);
  });
});
