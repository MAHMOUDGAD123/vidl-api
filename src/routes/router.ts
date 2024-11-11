import { Router } from "express";
import youtubeRouter from "./youtube/youtube";
import { openDownloadSessionHandler } from "./youtube/ytHandlers";

const router: Router = Router();

router.get("/ods", openDownloadSessionHandler);

// routes
router.use("/youtube", youtubeRouter);

export default router;
