import express, { type Express, type Response, type Request } from "express";
import cors from "cors";
import routes from "./routes/router";
import cookieParser from "cookie-parser";
import { CORS_OPTIONS } from "./utils/constants";

const app: Express = express();

// use
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false, limit: "10mb" }));
app.use(cookieParser());
app.use(cors(CORS_OPTIONS));
app.use("/api", routes);

app.get("/", async (_: Request, response: Response) => {
  response.status(200).json({
    msg: "Welcome to VIDL API",
  });
});

app.get("*", async (_, response: Response) => {
  response.sendStatus(404);
});

if (import.meta.env.DEV) {
  console.log("Development Mode ✅");
}

if (import.meta.env.PROD) {
  // console.log("Production Mode ✅");
  const PORT = process.env.PORT ?? 3000;
  app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
  });
}

export const viteNodeApp = app; // for vite-node plugin
export default app; // for vercel deployment
