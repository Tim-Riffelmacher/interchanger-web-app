/**
 * Makes a deep copy of an object.
 */
export default function deepCopy<T>(source: T): T {
  return Array.isArray(source)
    ? source.map((element) => deepCopy(element))
    : source instanceof Date
    ? new Date(source.getTime())
    : source && typeof source === "object"
    ? Object.getOwnPropertyNames(source).reduce((object, key) => {
        Object.defineProperty(
          object,
          key,
          Object.getOwnPropertyDescriptor(source, key)!
        );
        object[key] = deepCopy((source as Record<string, any>)[key]);
        return object;
      }, Object.create(Object.getPrototypeOf(source)))
    : (source as T);
}
