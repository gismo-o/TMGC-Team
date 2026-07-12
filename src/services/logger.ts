const isDevelopment = process.env.NODE_ENV !== 'production';

export const logDev = (...args: unknown[]) => {
  if (isDevelopment) {
    console.log(...args);
  }
};

export const warnDev = (...args: unknown[]) => {
  if (isDevelopment) {
    console.warn(...args);
  }
};

export const errorDev = (...args: unknown[]) => {
  if (isDevelopment) {
    console.error(...args);
  }
};
