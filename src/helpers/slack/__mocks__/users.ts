import { vi } from "vitest";
import type { getDetailsFromUserId as realGetDetailsFromUserId } from "../users";
type GetDetailsFromUserIdFunction = typeof realGetDetailsFromUserId;

export const getDetailsFromUserId: GetDetailsFromUserIdFunction = async (
  app,
  userId
) => {
  return {
    id: "U",
  };
};
