export function flatten<T>(arrayOfArrays: T[][]): T[] {
  return [].concat.apply([], arrayOfArrays);
}

export function unique<T>(arrayWithDuplicates: T[]): T[] {
  return [...new Set(arrayWithDuplicates)];
}

export function sum(array: number[]) {
  return array.reduce((sum, value) => sum + value, 0);
}

export function runningAverage(data: number[], neighbours: number) {
  return data.map((entry, index) => {
    const group = [entry];
    for (let offset = 1; offset <= neighbours; ++offset) {
      group.push(data[index + offset]);
      group.push(data[index - offset]);
    }

    let count = 0;
    let sum = 0;
    for (let value of group) {
      if (value === undefined) continue;

      ++count;
      sum += value;
    }

    return sum / count;
  });
}
