import { App } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

// cutdown types cause i cant import the real ones
type Profile = {
  api_app_id?: string;
  display_name?: string;
  display_name_normalized?: string;
  email?: string;
  first_name?: string;
  guest_invited_by?: string;
  last_name?: string;
  phone?: string;
  pronouns?: string;
  real_name?: string;
  real_name_normalized?: string;
};

type User = {
  id?: string;
  is_admin?: boolean;
  is_app_user?: boolean;
  is_bot?: boolean;
  is_email_confirmed?: boolean;
  is_invited_user?: boolean;
  is_restricted?: boolean;
  is_stranger?: boolean;
  is_ultra_restricted?: boolean;
  is_workflow_bot?: boolean;
  locale?: string;
  name?: string;
  profile?: Profile;
  real_name?: string;
  team_id?: string;
};

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
  app: App<StringIndexed>,
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
