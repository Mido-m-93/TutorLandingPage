import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// RTL's automatic cleanup-after-each-test only self-registers when it detects
// a global `afterEach` (e.g. via Vitest's `test.globals: true`). This project
// does not enable that flag, so without this explicit registration, the DOM
// from one test leaks into the next test within the same file — silently
// passing single-test files while breaking multi-test files.
afterEach(() => {
  cleanup();
});
