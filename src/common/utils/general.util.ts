export function generateRandomNumber(length: number) {
  return Math.floor(
    Math.pow(10, length - 1) +
      Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1),
  );
}

export function generateReference(prefix: string = 'TRX') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`.toLocaleUpperCase();
}

export function parseBigIntFromObject(value: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(value).map(([key, value]) => [key, parseBigInt(value)]),
  );
}

export function parseBigInt(value: any) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return typeof value === 'bigint' ? Number(value) : value;
}
