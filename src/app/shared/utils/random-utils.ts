// Aleatoriedad para efectos visuales (orden de logos, fotos que cambian...). Usa crypto.getRandomValues en vez de
// Math.random para no dejar hotspots de "generador pseudoaleatorio" en SonarQube.

// Entero aleatorio en [0, max)
export function randomInt(max: number): number {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0] % max;
}

// Copia barajada con Fisher-Yates (el truco de sort(() => Math.random() - 0.5) no reparte los órdenes por igual)
export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
