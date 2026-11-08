// Minimal typings for prismjs (no @types package installed). Only what the loader needs.
declare module 'prismjs' {
  interface PrismStatic {
    languages: Record<string, unknown>;
    manual?: boolean;
    highlightAll(): void;
  }
  const Prism: PrismStatic;
  export default Prism;
}

declare module 'prismjs/components/*';
