/**
 * Converts backend list data ({id, name}) into {label, value}
 * options that Select/FilterBar expects.
 */
export function toOptions(list = [], labelKey = "name", valueKey = "id") {
  return list.map((item) => ({
    label: item[labelKey],
    value: item[valueKey],
  }));
}
