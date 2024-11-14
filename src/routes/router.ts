import { Router } from "express";
import youtubeRouter from "./youtube/youtube";
import { openDownloadSessionHandler } from "./youtube/ytHandlers";

const router: Router = Router();

router.use((_, response, next) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, GET");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

router.get("/ods", openDownloadSessionHandler);

// routes
router.use("/youtube", youtubeRouter);

export default router;
