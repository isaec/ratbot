import { App } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { AppInstance } from "@src/commands/commandInterface";

// little bit of evil typescript to extract the user type from the app
type User = Required<
  Awaited<ReturnType<AppInstance["client"]["users"]["info"]>>
>["user"];

/**
 * ensure that cached objects are not modified
 */
type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};

const userCache: Map<string, DeepReadonly<User>> = new Map();

type Result = {
  user?: DeepReadonly<User>;
};

const pendingUserCache: Map<string, Promise<Result>> = new Map();

export const getDetailsFromUserId = async (
  app: AppInstance,
  userId: string
): Promise<DeepReadonly<User> | undefined> => {
  if (userCache.has(userId)) {
    console.log("cache hit for user", { userId });
    return userCache.get(userId)!;
  }
  if (pendingUserCache.has(userId)) {
    console.log("cache hit on inflight request for user", { userId });
    return (await pendingUserCache.get(userId))?.user;
  }
  const result = app.client.users.info({
    user: userId,
  });
  pendingUserCache.set(userId, result);
  console.log("cache miss for user, caching inflight request", { userId });
  const finishedResult = await result;
  if (finishedResult.user === undefined) {
    console.error("error fetching user", { finishedResult });
    return undefined;
  }
  console.log("caching user", { userId });
  userCache.set(userId, finishedResult.user);
  pendingUserCache.delete(userId);
  return finishedResult.user;
};
