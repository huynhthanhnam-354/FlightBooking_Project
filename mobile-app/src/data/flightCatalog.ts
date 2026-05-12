export type CatalogFlight = {
  id: string;
  airline: string;
  code: string;
  dep: string;
  arr: string;
  duration: string;
  priceVND: number;
  premium?: boolean;
};

export const AIRLINE_COLORS: Record<string, string> = {
  VN: '#0064D2',
  VJ: '#E4002B',
  QH: '#00A651',
  BL: '#F5A623',
};

export function flightCodePrefix(code: string): string {
  return code.slice(0, 2);
}

export function durationToMinutes(duration: string): number {
  const h = duration.match(/(\d+)\s*h/);
  const m = duration.match(/(\d+)\s*m/);
  const hours = h ? parseInt(h[1], 10) : 0;
  const mins = m ? parseInt(m[1], 10) : 0;
  return hours * 60 + mins;
}

export function depToMinutes(dep: string): number {
  const [hh, mm] = dep.split(':').map((x) => parseInt(x, 10));
  return hh * 60 + mm;
}

export function filterAndSortFlights(
  flights: CatalogFlight[],
  filterKey: 'all' | 'cheap' | 'early' | 'fast' | 'biz',
  returnLegVnd = 0,
): CatalogFlight[] {
  const p = (a: CatalogFlight) => a.priceVND + returnLegVnd;
  let list = [...flights];
  switch (filterKey) {
    case 'cheap':
      return list.sort((a, b) => p(a) - p(b));
    case 'early':
      return list.sort((a, b) => depToMinutes(a.dep) - depToMinutes(b.dep));
    case 'fast':
      return list.sort((a, b) => durationToMinutes(a.duration) - durationToMinutes(b.duration));
    case 'biz':
      list = list.filter((f) => f.premium);
      return list.length ? list.sort((a, b) => p(b) - p(a)) : [...flights].sort((a, b) => p(b) - p(a));
    default:
      return list;
  }
}
