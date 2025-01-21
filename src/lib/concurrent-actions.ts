export function createConcurrentAction<T, U extends unknown[]>(
    action: (...args: U) => Promise<T>
) {
    return async (...args: U) => [action(...args)] as const;
}

export async function runConcurrentAction<T>(
    result: Promise<readonly [Promise<T>]>
) {
    return (await result)[0];
}