/**
 * Wrapper for fetch.
 *
 * Direct assignment as default parameter in constructor below
 * doesn't work.
 */
export function windowFetch(input: RequestInfo, init?: RequestInit) {
  return fetch(input, init);
}

export function delay(timeInSeconds: number) {
  return new Promise(resolve => {
    setTimeout(resolve, timeInSeconds * 1000);
  });
}

export function discardTimeFromDate(date: Date) {
  const result = new Date(date);

  result.setMilliseconds(0);
  result.setSeconds(0);
  result.setMinutes(0);
  result.setHours(0);

  return result;
}
