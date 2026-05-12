import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CatalogFlight } from '../data/flightCatalog';

export type TripType = 'oneWay' | 'roundTrip';

type SearchContextValue = {
  tripType: TripType;
  setTripType: (t: TripType) => void;
  fromCode: string;
  toCode: string;
  setFromCode: (c: string) => void;
  setToCode: (c: string) => void;
  swapRoute: () => void;
  departureDate: string;
  setDepartureDate: (s: string) => void;
  returnDate: string;
  setReturnDate: (s: string) => void;

  roundTripReturnMinVnd: number | null;
  setRoundTripReturnMinVnd: (v: number | null) => void;
  adults: number;
  setAdults: (n: number) => void;
  selectedFlight: CatalogFlight | null;
  setSelectedFlight: (f: CatalogFlight | null) => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

function formatDdMmYyyy(d: Date): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseDdMmYyyy(s: string): Date | null {
  const m = s.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const y = parseInt(m[3], 10);
  const dt = new Date(y, mo, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo || dt.getDate() !== d) return null;
  return dt;
}

function addDaysDdMmYyyy(baseDdMmYyyy: string, days: number): string {
  const d = parseDdMmYyyy(baseDdMmYyyy);
  if (!d) return baseDdMmYyyy;
  d.setDate(d.getDate() + days);
  return formatDdMmYyyy(d);
}

/** Next calendar day — sensible default for flight search. */
function defaultDepartureDdMmYyyy(): string {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return formatDdMmYyyy(t);
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const dep0 = defaultDepartureDdMmYyyy();
  const [tripType, setTripTypeInternal] = useState<TripType>('oneWay');
  const [fromCode, setFromCode] = useState('HAN');
  const [toCode, setToCode] = useState('SGN');
  const [departureDate, setDepartureDate] = useState(dep0);
  const [returnDate, setReturnDate] = useState(() => addDaysDdMmYyyy(dep0, 7));
  const [roundTripReturnMinVnd, setRoundTripReturnMinVnd] = useState<number | null>(null);
  const [adults, setAdults] = useState(1);
  const [selectedFlight, setSelectedFlight] = useState<CatalogFlight | null>(null);

  const setTripType = useCallback((t: TripType) => {
    setTripTypeInternal(t);
    setSelectedFlight(null);
    if (t === 'oneWay') {
      setRoundTripReturnMinVnd(null);
    }
  }, []);

  useEffect(() => {
    if (tripType !== 'roundTrip') return;
    const dep = parseDdMmYyyy(departureDate);
    const ret = parseDdMmYyyy(returnDate);
    if (!dep || !ret) return;
    if (ret.getTime() <= dep.getTime()) {
      setReturnDate(addDaysDdMmYyyy(departureDate, 3));
    }
  }, [departureDate, tripType, returnDate]);

  const swapRoute = useCallback(() => {
    const f = fromCode;
    const t = toCode;
    setFromCode(t);
    setToCode(f);
  }, [fromCode, toCode]);

  const value = useMemo(
    () => ({
      tripType,
      setTripType,
      fromCode,
      toCode,
      setFromCode,
      setToCode,
      swapRoute,
      departureDate,
      setDepartureDate,
      returnDate,
      setReturnDate,
      roundTripReturnMinVnd,
      setRoundTripReturnMinVnd,
      adults,
      setAdults,
      selectedFlight,
      setSelectedFlight,
    }),
    [
      tripType,
      setTripType,
      fromCode,
      toCode,
      departureDate,
      returnDate,
      roundTripReturnMinVnd,
      adults,
      selectedFlight,
      swapRoute,
    ],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
