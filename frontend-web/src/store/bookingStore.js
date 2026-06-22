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

  toggleSeat: (seatId) => set((state) => {
    const isSelected = state.selectedSeats.includes(seatId);
    const passengerCount = state.searchParams.passengers || 1;

    // 1. Nếu đang chọn lại ghế đã chọn -> Bỏ chọn (Dùng cho cả 1 hoặc nhiều khách)
    if (isSelected) {
      return { selectedSeats: state.selectedSeats.filter(s => s !== seatId) };
    }

    // 2. Nếu là 1 khách -> Tự động thay thế ghế cũ bằng ghế mới
    if (passengerCount === 1) {
      return { selectedSeats: [seatId] };
    }

    // 3. Nếu nhiều khách -> Kiểm tra giới hạn
    if (state.selectedSeats.length < passengerCount) {
      return { selectedSeats: [...state.selectedSeats, seatId] };
    }

    // 4. Vượt quá giới hạn (sẽ được xử lý hiển thị Toast ở Component)
    return state;
  }),

  updatePassengerInfo: (info) => set((state) => ({
    passengerInfo: { ...state.passengerInfo, ...info }
  })),

  setTotalPrice: (price) => set({ totalPrice: price }),

  resetStore: () => set(initialState),
}))
