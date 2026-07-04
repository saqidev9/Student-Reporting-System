export const MONTH_OPTIONS = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

/**
 * Generates year options around the current year.
 * Default: 5 years back, 1 year forward.
 */
export function getYearOptions(yearsBack = 5, yearsForward = 1) {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let y = currentYear + yearsForward; y >= currentYear - yearsBack; y--) {
    years.push({ label: String(y), value: y });
  }
  return years;
}
