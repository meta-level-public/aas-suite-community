import { vi } from 'vitest';
export default {
  getType: vi.fn(() => 'application/octet-stream'),
  getExtension: vi.fn(() => 'bin'),
};
