import type { CorsOptions } from "cors";
import type { SessionOptions } from "express-session";

export const SESSION_LIFE = 10 * 60 * 1000; // 10 minutes [ 10(m) * 60(s) * 1000(ms) ]

export const CORS_OPTIONS: CorsOptions = {
  origin: true,
  credentials: true,
  methods: ["GET", "POST"],
  optionsSuccessStatus: 200,
};

export const SESSION_CONFIG: SessionOptions = {
  secret: "VIDL_SESSION",
  saveUninitialized: false,
  resave: false,
  name: "vidl_connected",
  cookie: {
    maxAge: SESSION_LIFE,
  },
};
