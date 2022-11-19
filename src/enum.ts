const enumValue =
  <T>(key: string, _type: T) =>
  (value: T) => ({ [key]: value });
