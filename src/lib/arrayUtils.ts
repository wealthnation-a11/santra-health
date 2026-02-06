// Helper function to find last index (ES2023 polyfill)
export function findLastIndex<T>(arr: T[], predicate: (value: T) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (predicate(arr[i])) return i;
  }
  return -1;
}
