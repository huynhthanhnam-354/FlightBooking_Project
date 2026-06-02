import { create } from 'zustand'

const initialState = {
  searchParams: {
    from: '',
    to: '',
    date: '',
    passengers: 1,
    tripType: 'roundtrip',
    cabinClass: 'economy'
  },
  selectedFlight: null,
  selectedSeats: [],
  passengerInfo: {
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    passport: '',
  },
  totalPrice: 0,
}

export const useBookingStore = create((set) => ({
  ...initialState,

  // Actions
  setSearchParams: (params) => set((state) => ({
    searchParams: { ...state.searchParams, ...params }
  })),

  selectFlight: (flight) => set({
    selectedFlight: flight,
    selectedSeats: [], // Reset seats when a new flight is picked
    totalPrice: flight?.price || 0
  }),

  toggleSeat: (seatId) => set((state) => {
    const isSelected = state.selectedSeats.includes(seatId);
    const newSeats = isSelected 
      ? state.selectedSeats.filter(id => id !== seatId)
      : [...state.selectedSeats, seatId];
    
    return { selectedSeats: newSeats };
  }),

  updatePassengerInfo: (info) => set((state) => ({
    passengerInfo: { ...state.passengerInfo, ...info }
  })),

  setTotalPrice: (price) => set({ totalPrice: price }),

  resetStore: () => set(initialState),
}))
