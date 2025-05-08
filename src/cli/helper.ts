import { existsSync, readFileSync } from 'fs';
import { error } from './printer';

export function readFileSafe(path: string): string | null {
  if (!existsSync(path)) {
    error(`File not found: ${path}`);
    return null;
  }
  return readFileSync(path, 'utf-8').toString();
}
