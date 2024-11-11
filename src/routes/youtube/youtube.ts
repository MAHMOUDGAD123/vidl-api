import { Router } from "express";
import {
  getSessionProgressHandler,
  downloadSessionInfoLogger,
  downloadSessionCleaner,
  ytListDownloadHandler,
  ytSmartSearchHandler,
  ytVideoDownloadHandler,
  ytAudioDownloadHandler,
} from "./ytHandlers";

const router: Router = Router();

// search
router.post("/smart-search", ytSmartSearchHandler);

// progress
router.get("/progress-info", getSessionProgressHandler);

// log the session information before download
router.use(downloadSessionInfoLogger);

// cleaner
// router.use(downloadSessionCleaner);

/* Downloads */

// video
router.post("/video-download", downloadSessionCleaner, ytVideoDownloadHandler);

// audio
router.post("/audio-download", downloadSessionCleaner, ytAudioDownloadHandler);

// list ❌
router.post("/list-download", downloadSessionCleaner, ytListDownloadHandler);

export default router;
