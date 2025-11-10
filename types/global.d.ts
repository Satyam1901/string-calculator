/// <reference types="vitest/globals" />
/// <reference types="@testing-library/jest-dom" />

declare module 'jest-axe' {
  export interface AxeResults {
    violations: any[];
  }
  export function axe(node: HTMLElement | Document | string): Promise<AxeResults>;
}
