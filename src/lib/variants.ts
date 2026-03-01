export const SKEW_VARIANTS = [
    'before:skew-y-0 hover:before:-skew-y-0 hover:before:-translate-y-1',
    'before:-skew-y-0 hover:before:skew-y-0 hover:before:-translate-y-1',
    'before:skew-y-1 hover:before:-skew-y-1 hover:before:-translate-y-1',
    'before:-skew-y-1 hover:before:skew-y-1 hover:before:-translate-y-1',
] as const;

export type SkewVariant = (typeof SKEW_VARIANTS)[number];

export function randomSkewClass(variants: readonly SkewVariant[] = SKEW_VARIANTS): SkewVariant {
    const index = Math.floor(Math.random() * variants.length);
    return variants[index];
}
