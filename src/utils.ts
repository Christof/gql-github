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
