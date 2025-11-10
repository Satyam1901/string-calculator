export class NegativeNumberError extends Error {
  negatives: number[];
  constructor(negatives: number[]) {
    super(`Negatives not allowed: ${negatives.join(', ')}`);
    this.name = 'NegativeNumberError';
    this.negatives = negatives;
  }
}
function escapeForRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
export function add(input?: string | null): number {
  if (input === undefined || input === null) return 0;

  const trimmed = input.trim();
  if (trimmed === '') return 0;

  let numbersPart = trimmed;
  const delimiters: string[] = [',', '\n'];
  if (numbersPart.startsWith('//')) {
    const newlineIndex = numbersPart.indexOf('\n');
    const header = numbersPart.slice(2, newlineIndex === -1 ? undefined : newlineIndex);
    numbersPart = newlineIndex === -1 ? '' : numbersPart.slice(newlineIndex + 1);
    const multiMatch = header.match(/\[(.+?)\]/g);
    if (multiMatch) {
      multiMatch.forEach((m) => {
        const delim = m.slice(1, -1);
        delimiters.push(delim);
      });
    } else if (header.length > 0) {
      delimiters.push(header);
    }
  }
  const delimRegex = new RegExp(delimiters.map(escapeForRegex).join('|'), 'g');
  const tokens = numbersPart
    .split(delimRegex)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  const nums: number[] = tokens.map((t) => {
    const n = Number(t);
    if (Number.isNaN(n)) {
      throw new Error(`Invalid number: ${t}`);
    }
    return n;
  });
  const negatives = nums.filter((n) => n < 0);
  if (negatives.length) throw new NegativeNumberError(negatives);
  const filtered = nums.filter((n) => n <= 1000);
  const sum = filtered.reduce((a, b) => a + b, 0);
  return sum;
}
