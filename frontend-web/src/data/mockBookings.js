// Sample bookings for My Flights Dashboard
const MOCK_BOOKINGS = [
  {
    id: 'bkg_001',
    pnr: 'PNRABC',
    airline: 'VietAir',
    flightNumber: 'VJ123',
    from: 'SGN',
    to: 'HAN',
    depart: '2026-05-10 08:30',
    arrive: '2026-05-10 10:15',
    status: 'upcoming', // upcoming | completed | cancelled
    paymentStatus: 'paid', // paid | pending
    price: 1490000
  },
  {
    id: 'bkg_002',
    pnr: 'PNRDEF',
    airline: 'Pacific Air',
    flightNumber: 'PA456',
    from: 'DAD',
    to: 'SGN',
    depart: '2026-04-11 15:20',
    arrive: '2026-04-11 16:40',
    status: 'completed',
    paymentStatus: 'paid',
    price: 890000
  },
  {
    id: 'bkg_003',
    pnr: 'PNRGHI',
    airline: 'Skyways',
    flightNumber: 'SW789',
    from: 'SGN',
    to: 'KUL',
    depart: '2026-03-20 21:00',
    arrive: '2026-03-20 23:10',
    status: 'completed',
    paymentStatus: 'paid',
    price: 1250000
  },
  {
    id: 'bkg_004',
    pnr: 'PNRJKL',
    airline: 'VietAir',
    flightNumber: 'VJ555',
    from: 'HAN',
    to: 'SGN',
    depart: '2026-06-01 06:00',
    arrive: '2026-06-01 07:50',
    status: 'upcoming',
    paymentStatus: 'pending',
    price: 1590000
  },
  {
    id: 'bkg_005',
    pnr: 'PNRMNO',
    airline: 'BudgetFly',
    flightNumber: 'BF321',
    from: 'SGN',
    to: 'DAD',
    depart: '2025-12-10 09:30',
    arrive: '2025-12-10 10:00',
    status: 'cancelled',
    paymentStatus: 'paid',
    price: 350000
  }
]

export default MOCK_BOOKINGS
