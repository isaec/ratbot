interface EnumValueObj<N extends string, T = false> {
  name: N;
  param: T;
}

type ParamEnumValue<N extends string, P> = (param: P) => EnumValueObj<N, P>;

type NamedEnumValue<N extends string> = EnumValueObj<N, false>;

type EnumValue<N extends string, P> = ParamEnumValue<N, P> | NamedEnumValue<N>;

const makeEnumValue = <N extends string, P>(
  name: N,
  param: P
): EnumValueObj<N, P> => ({
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

const makeEnum = <
  Obj extends {
    [P in keyof Obj]: EnumValue<P extends string ? P : never, any>;
  }
>(
  obj: Readonly<Obj>
) => obj;

const testEnum = makeEnum({
  Success: val("Success"),
  Error: val("Error"),
  Message: val("Message", ""),
});

// type TestEnum = EnumValues<typeof testEnum>;
