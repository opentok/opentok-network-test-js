/**
 * Returns a (nested) property from the provided object or undefined
 */
const get = (props: string, obj: object): any => {
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
const getOrElse = (defaultValue: any, props: string, obj: object): any => get(props, obj) || defaultValue;

/**
 * Returns a subset of the provided object with the specified properties
 */
const pick = (props: Array<string | number>, obj: object): object =>
  Object.keys(obj).reduce((acc, key) => obj[key] ? acc.concat(obj[key]) : acc, []);

export {
  get,
  getOrElse,
  pick,
};
