export function waitImmediate() {
  return new Promise(resolve => {
    setImmediate(resolve);
  });
}
