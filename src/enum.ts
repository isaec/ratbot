interface ParamEnumValue<N extends string, T = false> {
  name: N;
  param: T;
}

type ParamEnumValueFn<N extends string, P> = (param: P) => ParamEnumValue<N, P>;

type NamedEnumValue<N extends string> = { name: N };

type EnumValue<N extends string, P> =
  | ParamEnumValueFn<N, P>
  | NamedEnumValue<N>;

export function val<N extends string>(name: N): NamedEnumValue<N>;
export function val<N extends string, P>(
  name: N,
  param: P
): ParamEnumValueFn<N, P>;
export function val<N extends string, P>(name: N, param?: P) {
  return param === undefined
    ? { name }
    : (param: P) => ({
        name,
        param,
      });
}

export const makeEnum = <
  Obj extends {
    [P in keyof Obj]: EnumValue<P extends string ? P : never, any>;
  }
>(
  obj: Readonly<Obj>
) => obj;

type ExtractEnumObj<T> = T extends ParamEnumValueFn<infer N, infer P>
  ? ReturnType<T>
  : T extends NamedEnumValue<infer N>
  ? T
  : never;

export type EnumValues<
  Obj extends {
    [P in keyof Obj]: EnumValue<P extends string ? P : never, any>;
  }
> = ExtractEnumObj<Obj[keyof Obj]>;

// testing it out

const testEnum = makeEnum({
  Success: val("Success"),
  Error: val("Error"),
  Message: val("Message", ""),
  Number: val("Number", 0),
});
type TestEnum = EnumValues<typeof testEnum>;

const processTestEnum = (testEnum: TestEnum) => {
  switch (testEnum.name) {
    case "Success":
      testEnum;
      return "Success";
    case "Error":
      return "Error";
    case "Message":
      testEnum;
      return testEnum.param;
    case "Number":
      return testEnum.param;
  }
};
