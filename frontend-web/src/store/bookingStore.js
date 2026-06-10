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
  selectedReturnFlight: null,
  selectedSeats: [],
  passengerInfo: {
    fullName: '',
    email: '',
    phone: ''
  },
  totalPrice: 0
}

export const useBookingStore = create((set) => ({
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
