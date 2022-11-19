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

const enumNames = <Obj>(obj: Obj) => {
  const refObj = {};
  for (const name of Object.keys(obj)) {
    refObj[name] = name;
  }
  return refObj as { [P in keyof Obj]: P };
};

type CapitalizeAny<T> = T extends string ? Capitalize<T> : never;

export const makeEnum = <
  Obj extends {
    [P in CapitalizeAny<keyof Obj>]: EnumValue<
      P extends string ? P : never,
      any
    >;
  }
>(
  obj: Obj
) => ({ ...obj, names: enumNames(obj) });

type ExtractEnumObj<T> = T extends ParamEnumValueFn<string, unknown>
  ? ReturnType<T>
  : T extends NamedEnumValue<string>
  ? T
  : never;

export type EnumValues<
  Obj extends {
    [P in keyof Obj]: P extends "names"
      ? Record<string, string>
      : EnumValue<P extends string ? P : never, any>;
  }
> = ExtractEnumObj<Obj[keyof Obj]>;

/**
 * assert that a switch statement is exhaustive over an enum
 * @param p the enum being matched on
 */
export function assertExhaustiveSwitch(p: never): never;
export function assertExhaustiveSwitch(val: { name: string; param?: unknown }) {
  throw new Error(`Unknown enum value name: ${val.name}\nparam: ${val.param}`);
}
