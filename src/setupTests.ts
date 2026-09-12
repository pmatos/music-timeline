import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrollIntoView; PersonBar calls it on focus, which otherwise
// throws asynchronously from click-driven tests (e.g. App.test.tsx person dialog).
Element.prototype.scrollIntoView = () => {};

// jsdom does not implement ResizeObserver; TimelineView uses it to track container width.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver =
  ResizeObserverStub as unknown as typeof ResizeObserver;
