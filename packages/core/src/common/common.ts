export const LoopContainer = Symbol('LoopContainer');
export const WEPBACK_PROXY = Symbol('WebpackProxy');

export function notEmpty<T>(value: T | undefined): value is T {
    return value !== undefined;
}
