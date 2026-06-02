/**
 * User interface representing an application user.
 * Matches backend AppUser and AuthResponse structures.
 */
export interface User {
  id?: number;
  fullName: string;
  email: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
}

/**
 * Flight interface representing flight details.
 * Matches backend FlightResponse structure.
 */
export interface Flight {
  id: number;
  flightNumber: string;
  airlineName: string;     // corresponds to 'airline'
  originCode: string;      // corresponds to 'departureCity'
  destinationCode: string; // corresponds to 'arrivalCity'
  departureAt: string;     // corresponds to 'departureTime', ISO String
  arrivalAt: string;
  durationMinutes: number;
  basePriceVnd: number;    // corresponds to 'price'
  premiumCabin: boolean;
  availableSeats?: number; 
}

/**
 * Passenger information within a booking.
 */
export interface PassengerInfo {
  fullName: string;
  email: string;
  phone: string;
}

/**
 * Booking interface representing a flight reservation.
 * Matches backend BookingResponse structure.
 */
export interface Booking {
  id: number;
  pnr: string;             // corresponds to 'bookingCode'
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  seatNumber: string;
  passengerName: string;   // Maps to individual passenger info
  totalPriceVnd: number;   // corresponds to 'totalPrice'
  createdAt: string;       // ISO String
  flight: Flight;
  user?: User;
}
