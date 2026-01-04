export function getFestivalDate(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();

  // Si es antes de las 6 AM, se considera el día anterior para el lineup
  if (hours < 6) {
    date.setDate(date.getDate() - 1);
  }

  return date.toISOString().split('T')[0];
}
