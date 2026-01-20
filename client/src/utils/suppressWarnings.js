// Suppress React DevTools and other development warnings
if (process.env.NODE_ENV === 'development') {
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    // Suppress specific warnings
    const message = args[0];
    if (
      typeof message === 'string' && (
        message.includes('React DevTools') ||
        message.includes('React Router Future Flag Warning') ||
        message.includes('v7_startTransition') ||
        message.includes('v7_relativeSplatPath')
      )
    ) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}
