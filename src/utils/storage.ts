import AsyncStorage from "@react-native-async-storage/async-storage";

/** Every call is wrapped so a storage failure never crashes the app: persistence is optional. */
export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore: saving is a convenience only
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export async function clearAll(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys);
  } catch {
    // ignore
  }
}

export const KEYS = {
  teams: "volleysim.teams",
  settings: "volleysim.settings",
  recent: "volleysim.recent",
  match: "volleysim.match",
  plans: "volleysim.plans",
};
