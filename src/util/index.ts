/**
 * @module Util
 */

/**
 * Returns a (nested) property from the provided object or undefined
 */
const get = <T>(props: string, obj: any): T => {
  let result = Object.assign({}, obj);
  const properties = typeof props === 'string' ? props.split('.') : props;
  properties.some((p) => {
    result = result[p];
    return (result === undefined);
  });
  return result;
};

/**
 * Returns a (nested) property from the provided object or the default
 * value if undefined
 */
const getOrElse = <T>(defaultValue: any, props: string, obj: any): T => get(props, obj) || defaultValue;

/**
 * Returns a subset of the provided object with the specified properties. Keys whose corresponding
 * values are undefined are not included.
 */
const pick =
  <T extends { [key: string]: any }, K extends keyof T>(
    props: K[],
    obj: T,
    all: boolean = false): Partial<T> => {
    const update = (acc: object, prop: string): Partial<T> =>
      obj[prop] !== undefined || all ? { ...acc, [prop]: obj[prop] } : acc;
    return props.reduce(update, {});
  };

/**
 * Returns a subset of the provided object with the specified properties. Keys whose corresponding
 * values are undefined are included.
 */
const pickAll = <T extends { [key: string]: any }, K extends keyof T>(props: K[], obj: T): Partial<T> =>
  pick(props, obj, true);

export {
  get,
  getOrElse,
  pick,
  pickAll,
};
