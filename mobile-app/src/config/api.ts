import { Platform } from 'react-native';

const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
const fallback =
  Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://127.0.0.1:8080';

export const API_BASE_URL = (fromEnv && fromEnv.length > 0 ? fromEnv : fallback).replace(/\/$/, '');
