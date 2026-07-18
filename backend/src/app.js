import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "./config/passport.js";

import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import orgRoutes from "./routes/org.routes.js";
import inviteRoutes from "./routes/invite.routes.js";
import inviteAcceptRoutes from "./routes/inviteAccept.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { issueCsrfCookie } from "./middleware/csrf.js";

const app = express();

// Render (and Vercel) sit behind a reverse proxy — without this, req.ip
// resolves to the proxy's internal address for every request, which
// breaks the per-IP rate limiter in middleware/rateLimiter.js.
app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true, // required so the browser sends/receives cookies cross-origin
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize()); // no passport.session() — we don't use Passport sessions, see config/passport.js

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Issues a readable CSRF cookie on every request so the frontend always
// has a fresh token available to echo back in X-CSRF-Token on mutations.
app.use(issueCsrfCookie);

app.use("/api/auth", authRoutes);
app.use("/api/org", orgRoutes);
app.use("/api/org", inviteRoutes); // shares the /api/org/:slug prefix with orgRoutes
app.use("/api/invite", inviteAcceptRoutes);
app.use("/api/user", userRoutes);

// Must be the last middleware registered
app.use(errorHandler);

export default app;