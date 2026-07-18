import { Redis } from "@upstash/redis";
import { env } from "./env.js";

export const redis = new Redis({
  url: env.redisUrl,
  token: env.redisToken,
});