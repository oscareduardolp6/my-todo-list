import { onSnapshot, setDoc } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
import { userDoc } from '../../../shared/infrastructure/firestore-collection';
import { asString } from '../../../shared/infrastructure/firestore-parse';
import { DEFAULT_SETTINGS, isTheme } from '../domain/settings';
import type { Settings } from '../domain/settings';
import type { SettingsRepository } from '../domain/ports';

/** Un único documento: `todo/{uid}/meta/settings`. */
const [COLLECTION, ID] = ['meta', 'settings'] as const;

export const settingsFromDoc = (data: DocumentData | undefined): Settings =>
  data
    ? {
        theme: isTheme(data.theme) ? data.theme : DEFAULT_SETTINGS.theme,
        accent: asString(data.accent, DEFAULT_SETTINGS.accent),
        weekStartsOn: data.weekStartsOn === 0 ? 0 : 1,
      }
    : DEFAULT_SETTINGS;

export const firestoreSettingsRepository: SettingsRepository = {
  subscribe: (onData, onError) =>
    onSnapshot(userDoc(COLLECTION, ID), (snap) => onData(settingsFromDoc(snap.data())), onError),
  save: (settings) => setDoc(userDoc(COLLECTION, ID), settings),
};
