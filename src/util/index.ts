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
 * Returns a (nested) property from the provided object or
 * the provided default value
 */
const getOrElse = <T>(defaultValue: any, props: string, obj: any): T => get(props, obj) || defaultValue;

/**
 * Returns a subset of the provided object with the specified properties
 */
const pick = <T, K extends keyof T>(props: string[], obj: T): Partial<T> => {
  const update = (acc: T, prop: K) => obj[prop] !== undefined ? Object.assign({}, acc, obj[prop]) : acc;
  return props.reduce(update, {});
};

export {
  get,
  getOrElse,
  pick,
};
