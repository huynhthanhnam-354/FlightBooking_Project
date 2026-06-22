import { Platform } from 'react-native';

const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
const fallback =
  Platform.OS === 'android' ? 'http://192.168.1.3:8081' : 'http://127.0.0.1:8081';

export const API_BASE_URL = (fromEnv && fromEnv.length > 0 ? fromEnv : fallback).replace(/\/$/, '');
