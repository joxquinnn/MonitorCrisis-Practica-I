/** PRNG determinista (mulberry32) para que los datos mock sean estables entre recargas. */
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Elige un elemento de `items` con probabilidad proporcional a su peso. */
export function pickWeighted<T>(items: Array<[T, number]>, rand: () => number): T {
  const total = items.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = rand() * total;
  for (const [item, weight] of items) {
    cursor -= weight;
    if (cursor <= 0) return item;
  }
  // Alcanzable sólo por redondeo de punto flotante; devuelve el último elemento.
  return items[items.length - 1]![0];
}
