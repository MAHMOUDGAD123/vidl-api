import { createCache } from "cache-manager";
import { CACHE } from "@/utils/constants";

export const memCache = createCache({
  ttl: CACHE.TTL,
});
