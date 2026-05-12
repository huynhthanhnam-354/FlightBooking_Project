import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export type FlightTrackingDto = {
  flightIata: string;
  status: string | null;
  lat: number | null;
  lng: number | null;
  altM: number | null;
  speedKmh: number | null;
  headingDeg: number | null;
  depIata: string | null;
  arrIata: string | null;
  depLat: number | null;
  depLng: number | null;
  arrLat: number | null;
  arrLng: number | null;
  updatedUnix: number | null;
};

export async function fetchFlightTracking(flightIata: string): Promise<FlightTrackingDto> {
  const { data } = await axios.get<FlightTrackingDto>(`${API_BASE_URL}/api/flight-tracking`, {
    params: { flightIata: flightIata.trim().toUpperCase() },
    timeout: 25000,
  });
  return data;
}

export type FlightTrackingExample = {
  flightIata: string;
  status: string | null;
  depIata: string | null;
  arrIata: string | null;
};

export async function fetchFlightTrackingExamples(limit = 15): Promise<FlightTrackingExample[]> {
  const { data } = await axios.get<FlightTrackingExample[]>(`${API_BASE_URL}/api/flight-tracking/examples`, {
    params: { limit },
    timeout: 35000,
  });
  return Array.isArray(data) ? data : [];
}
