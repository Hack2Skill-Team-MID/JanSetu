/**
 * Cast an Express req.query value (string | string[] | ParsedQs) to string | undefined.
 * This is needed because TypeScript types req.query as string | string[] | ParsedQs.
 */
export const qs = (val: unknown): string | undefined =>
  typeof val === 'string' ? val : undefined;
