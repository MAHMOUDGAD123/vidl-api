import { Router } from "express";
import {
  getSessionProgressHandler,
  downloadSessionCleaner,
  ytListDownloadHandler,
  ytSmartSearchHandler,
  ytVideoDownloadHandler,
  ytAudioDownloadHandler,
  videoUrlValidator,
  sessionFolderValidator,
} from "./ytHandlers";

const router: Router = Router();

// search
router.post("/smart-search", ytSmartSearchHandler);

// progress
router.post("/progress-info", getSessionProgressHandler);

/************************************ Downloads ************************************/

// video
router.post(
  "/video-download",
  videoUrlValidator,
  sessionFolderValidator,
  downloadSessionCleaner,
  ytVideoDownloadHandler
);

// audio
router.post(
  "/audio-download",
  videoUrlValidator,
  sessionFolderValidator,
  downloadSessionCleaner,
  ytAudioDownloadHandler
);

// list ❌
router.post("/list-download", ytListDownloadHandler);

export default router;
