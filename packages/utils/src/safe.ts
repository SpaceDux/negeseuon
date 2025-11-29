/**
 * Safely executes an asynchronous function and returns a tuple containing the result and an error if any.
 * @param fn - The asynchronous function to execute.
 * @returns A tuple containing the result and an error if any.
 */
export const safeAsync = async <T>(
  fn: () => Promise<T>
): Promise<[T | null, Error | null]> => {
  try {
    const result = await fn();
    return [result, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
};

/**
 * Safely executes a synchronous function and returns a tuple containing the result and an error if any.
 * @param fn - The synchronous function to execute.
 * @returns A tuple containing the result and an error if any.
 */
export const safe = <T>(fn: () => T): [T | null, Error | null] => {
  try {
    const result = fn();
    return [result, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
};
