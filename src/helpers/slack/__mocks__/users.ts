import type { getDetailsFromUserId as realGetDetailsFromUserId } from "../users";
type GetDetailsFromUserIdFunction = typeof realGetDetailsFromUserId;

const fakeUsers = [
  ["U1ABCD", { id: "U1ABCD", name: "ian", real_name: "Ian Last" }],
  ["U2ABCD", { id: "U2ABCD", name: "andy51", real_name: "Andy Something" }],
  ["U3ABCD", { id: "U3ABCD", name: "mark", real_name: "Mark EEEE" }],
  ["U4ABCD", { id: "U4ABCD", name: "taylor", real_name: "Taylor Woo!" }],
  ["U5ABCD", { id: "U5ABCD", name: "jasmine", real_name: "Jasmine" }],
  ["U6ABCD", { id: "U6ABCD", name: "isaac", real_name: "Isaac" }],
  ["U7ABCD", { id: "U7ABCD", name: "zach", real_name: "Zach" }],
  ["U8ABCD", { id: "U8ABCD", name: "james" }],
  ["U9ABCD", { id: "U9ABCD" }],
] as const;

type FakeUser = typeof fakeUsers[number][0];

const fakeUserMap = new Map<
  FakeUser,
  Awaited<ReturnType<GetDetailsFromUserIdFunction>>
>(fakeUsers);

export const fakeUserIdEnum = Object.fromEntries(
  Array.from(fakeUserMap.keys()).map((id) => [id, id])
) as Readonly<Record<FakeUser, FakeUser>>;
export const fakeUserIdArray = Array.from(fakeUserMap.keys()) as Readonly<
  FakeUser[]
>;

export const getDetailsFromUserId: GetDetailsFromUserIdFunction = async (
  app,
  userId
) => {
  return {
    id: "U",
  };
};
