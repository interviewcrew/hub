/**
 * Generates a consistent, valid UUID v4 string based on a numeric seed.
 * This is useful for creating predictable IDs in tests.
 * @param seed A number to base the UUID on.
 * @returns A valid UUID string that conforms to the v4 format.
 */
export const generateMockUuid = (seed: number): string => {
  const seedStr = seed.toString().padStart(12, '0');
  // This format complies with the UUID v4 standard structure.
  return `00000000-0000-4000-8000-${seedStr}`;
};
