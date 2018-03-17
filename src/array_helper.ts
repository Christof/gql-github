export function flatten<T>(arrayOfArrays: T[][]): T[] {
  return [].concat.apply([], arrayOfArrays);
}

export function unique<T>(arrayWithDuplicates: T[]): T[] {
  return [...new Set(arrayWithDuplicates)];
}
