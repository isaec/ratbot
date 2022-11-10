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

type Immutable<T> = {
  readonly [K in keyof T]: Immutable<T[K]>;
};

const userCache: Map<string, Immutable<User>> = new Map();

export const getDetailsFromUserId = async (
  app: App<StringIndexed>,
  userId: string
) => {
  if (userCache.has(userId)) return userCache.get(userId);
  const result = await app.client.users.info({
    user: userId,
  });
  if (result.user === undefined) {
    return undefined;
  }
  userCache.set(userId, result.user);
  return result.user;
};
