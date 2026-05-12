import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'skybook_auth_token';
const PROFILE_KEY = 'skybook_user_profile';

export async function saveAuthToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function clearAuthToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function saveUserProfile(json: string): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, json);
}

export async function getUserProfile(): Promise<string | null> {
  return AsyncStorage.getItem(PROFILE_KEY);
}

export async function clearUserProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
}

export async function clearSession(): Promise<void> {
  await clearAuthToken();
  await clearUserProfile();
}
