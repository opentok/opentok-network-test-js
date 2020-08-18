/**
 * @module Util
 */
/**
 * Returns a copy of an object, setting or overriding the property with the provided value
 */
export declare const assoc: (key: string, value: any, obj: Object) => Object;
/**
 * Returns a copy of an object, setting or overriding the property at the specified path
 * with the provided value.  The path should be provided as a period-delimited string.
 */
export declare const assocPath: (path: string, value: any, obj: Object) => Object;
/**
 * Returns a (nested) property from the provided object or undefined
 */
export declare const get: <T>(props: string, obj: any) => T;
/**
 * Returns a (nested) property from the provided object or the default
 * value if undefined
 */
export declare const getOr: <T>(defaultValue: any, props: string, obj: any) => T;
/**
 * Returns a subset of the provided object with the specified properties. Keys whose corresponding
 * values are undefined are not included.
 */
export declare const pick: <T extends {
    [key: string]: any;
}, K extends keyof T>(props: K[], obj: T, all?: boolean) => Partial<T>;
/**
 * Returns a subset of the provided object with the specified properties. Keys whose corresponding
 * values are undefined are included.
 */
export declare const pickAll: <T extends {
    [key: string]: any;
}, K extends keyof T>(props: K[], obj: T) => Partial<T>;
/**
 * Returns the last element from an array
 */
export declare const last: <T>(list: T[]) => T | undefined;
/**
 * Returns the nth element of an array. If a negative value is passed, the nth element from the end
 * of the array will be returned.
 */
export declare const nth: <T>(n: number, list: T[]) => T | undefined;
/**
 * Returns the first element from a list, or undefined if it doesn't exist
 */
export declare const head: <T>(list: T[]) => T | undefined;
