/**
 * Buffers events and processes them in batches
 */
export function bufferWatchEvents<T>(
  delay: number,
  callback: (events: T[]) => void
): (event: T) => void {
  let buffer: T[] = [];
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (event: T) => {
    buffer.push(event);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      callback(buffer);
      buffer = [];
      timeoutId = null;
    }, delay);
  };
}
