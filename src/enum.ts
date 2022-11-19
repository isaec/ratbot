interface EnumValue<N extends string, T = false> {
  name: N;
  param: T;
}

type ParamEnumValue<N extends string, P> = (param: P) => EnumValue<N, P>;

type NamedEnumValue<N extends string> = EnumValue<N, false>;

const makeEnumValue = <N extends string, P>(
  name: N,
  param: P
): EnumValue<N, P> => ({
  name,
  param,
});

export function val<N extends string>(name: N): NamedEnumValue<N>;
export function val<N extends string, P>(
  name: N,
  param: P
): ParamEnumValue<N, P>;
export function val<N extends string, P>(name: N, param?: P) {
  return param === undefined
    ? makeEnumValue(name, false)
    : (param: P) => makeEnumValue(name, param);
}

const testEnum = {
  Success: val("Success"),
  Error: val("Error"),
  Message: val("Message", ""),
};
