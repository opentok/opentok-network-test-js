
/**
 * Returns a (nested) property from the provided object or undefined
 * @param {String} props - A comma-delimited string of keys
 * @param {Object} obj
 * @returns {*}
 */
const get = (props, obj = null) => {
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
 * @param {*} defaultValue - The value to return if the property is not found
 * @param {String} props - A comma-delimited string of keys
 * @param {Object} obj
 * @returns {*}
 */
const getOrElse = (defaultValue, props, obj = null) => get(props, obj) || defaultValue;

/**
 * Returns a subset of the provided object with the specified properties
 * @param {Array} props
 * @param {Object} obj
 * @returns {Object}
 */
const pick = (props, obj) => Object.keys(obj).reduce((acc, key) => obj[key] ? acc.concat(obj[key]) : acc, []);

module.exports = {
  get,
  getOrElse,
  pick,
};
