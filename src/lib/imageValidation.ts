const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export type ImageValidationError = 'size' | 'type' | null;

export function validateImageFile(file: File | null): ImageValidationError {
  if (!file) return null;
  if (file.size > MAX_SIZE_MB * 1024 * 1024) return 'size';
  if (!ALLOWED_TYPES.includes(file.type)) return 'type';
  return null;
}
