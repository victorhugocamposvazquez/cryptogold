/** CRYPTOHOST transfer reference — formato CGD-XXXXXX */
export function generateTransferId(): string {
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CGD-${suffix}`;
}
