import '@testing-library/jest-dom/vitest';

// jsdom does not implement scrollIntoView; PersonBar calls it on focus, which otherwise
// throws asynchronously from click-driven tests (e.g. App.test.tsx person dialog).
Element.prototype.scrollIntoView = () => {};
