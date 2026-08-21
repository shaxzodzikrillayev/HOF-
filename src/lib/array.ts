/** Returns a new list with the element moved from one index to another. */
export function moveItem<T>(list: readonly T[], from: number, to: number): T[] {
  const result = [...list];
  const [moved] = result.splice(from, 1);
  result.splice(to, 0, moved);
  return result;
}

/** Returns a new list with two elements (by index) swapped. */
export function swapItems<T>(list: readonly T[], a: number, b: number): T[] {
  const result = [...list];
  [result[a], result[b]] = [result[b], result[a]];
  return result;
}
