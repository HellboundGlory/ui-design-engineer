export type FieldErrors<T extends string> = Partial<Record<T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function required(value: string, label: string): string | undefined {
  return value.trim().length === 0 ? `${label} is required.` : undefined;
}

export function emailError(value: string): string | undefined {
  const req = required(value, "Email");
  if (req) return req;
  if (!isValidEmail(value)) return "Enter a valid email address.";
  return undefined;
}

export function minLength(value: string, min: number, label: string): string | undefined {
  if (value.length === 0) return undefined; // let `required` own the empty case
  if (value.length < min) return `${label} must be at least ${min} characters.`;
  return undefined;
}

export function maxLength(value: string, max: number, label: string): string | undefined {
  if (value.length > max) return `${label} must be ${max} characters or fewer.`;
  return undefined;
}
