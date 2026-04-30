export type TimelineState = 'WAITING' | 'TAKEOFF' | 'IN_AIR' | 'LANDED';

export type TrackingPoint = {
  lat: number;
  lng: number;
  type: 'departure' | 'current' | 'arrival';
};

export type TrackingTimelineItem = {
  key: TimelineState;
  label: string;
  done: boolean;
  at: string | null;
};

export type FlightTrackingData = {
  flight: {
    iata: string;
    airline: string;
    departure: { iata: string; time: string; lat: number; lng: number };
    arrival: { iata: string; time: string; lat: number; lng: number };
  };
  status: {
    providerStatus: string;
    timelineState: TimelineState;
    labelVi: string;
    updatedAt: string;
  };
  route: {
    points: TrackingPoint[];
  };
  timeline: TrackingTimelineItem[];
};

/**
 * Mock shaped close to future backend response (which maps from AirLabs).
 */
export async function getMockFlightTracking(): Promise<FlightTrackingData> {
  await new Promise((resolve) => setTimeout(resolve, 450));

  return {
    flight: {
      iata: 'VN213',
      airline: 'Vietnam Airlines',
      departure: {
        iata: 'HAN',
        time: '2026-05-01T08:00:00+07:00',
        lat: 21.2187,
        lng: 105.8042,
      },
      arrival: {
        iata: 'SGN',
        time: '2026-05-01T10:10:00+07:00',
        lat: 10.8188,
        lng: 106.6519,
      },
    },
    status: {
      providerStatus: 'active',
      timelineState: 'IN_AIR',
      labelVi: 'Dang bay',
      updatedAt: new Date().toISOString(),
    },
    route: {
      points: [
        { lat: 21.2187, lng: 105.8042, type: 'departure' },
        { lat: 17.1234, lng: 107.9911, type: 'current' },
        { lat: 10.8188, lng: 106.6519, type: 'arrival' },
      ],
    },
    timeline: [
      { key: 'WAITING', label: 'Dang cho', done: true, at: '2026-05-01T07:30:00+07:00' },
      { key: 'TAKEOFF', label: 'Da cat canh', done: true, at: '2026-05-01T08:12:00+07:00' },
      { key: 'IN_AIR', label: 'Dang bay', done: true, at: '2026-05-01T08:20:00+07:00' },
      { key: 'LANDED', label: 'Da ha canh', done: false, at: null },
    ],
  };
}

