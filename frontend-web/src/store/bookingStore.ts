import { create } from 'zustand'
import { Flight, PassengerInfo } from '../types/flight'

interface SearchParams {
  from: string;
  to: string;
  date: string;
  passengers: number;
  tripType: 'roundtrip' | 'oneway';
  cabinClass: 'economy' | 'business';
}

interface BookingState {
  searchParams: SearchParams;
  selectedFlight: Flight | null;
  selectedReturnFlight: Flight | null;
  selectedSeats: string[];
  passengerInfo: PassengerInfo;
  totalPrice: number;
  
  setSearchParams: (params: Partial<SearchParams>) => void;
  setSelectedFlight: (flight: Flight | null) => void;
  setSelectedReturnFlight: (flight: Flight | null) => void;
  setSelectedSeats: (seats: string[]) => void;
  toggleSeat: (seatId: string) => void;
  updatePassengerInfo: (info: Partial<PassengerInfo>) => void;
  setTotalPrice: (price: number) => void;
  resetStore: () => void;
}

const initialState = {
  searchParams: {
    from: '',
    to: '',
    date: '',
    passengers: 1,
    tripType: 'roundtrip' as const,
    cabinClass: 'economy' as const
  },
  selectedFlight: null,
  selectedReturnFlight: null,
  selectedSeats: [],
  passengerInfo: {
    fullName: '',
    email: '',
    phone: ''
  },
  totalPrice: 0
}

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setSearchParams: (params) => set((state) => ({
    searchParams: { ...state.searchParams, ...params }
  })),

  setSelectedFlight: (flight) => set({ selectedFlight: flight }),

  setSelectedReturnFlight: (flight) => set({ selectedReturnFlight: flight }),

  setSelectedSeats: (newSeats) => set(() => {
    return { selectedSeats: newSeats };
  }),

  toggleSeat: (seatId) => set((state) => ({
    selectedSeats: state.selectedSeats.includes(seatId)
      ? state.selectedSeats.filter(s => s !== seatId)
      : [...state.selectedSeats, seatId]
  })),

  updatePassengerInfo: (info) => set((state) => ({
    passengerInfo: { ...state.passengerInfo, ...info }
  })),

  setTotalPrice: (price) => set({ totalPrice: price }),

  resetStore: () => set(initialState),
}))
