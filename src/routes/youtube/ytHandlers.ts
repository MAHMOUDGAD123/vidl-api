import ytdl from "@distube/ytdl-core";
import { YouTube } from "youtube-sr";
import path from "path";
import fs, { rm, unlink } from "fs";
import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import type { NextFunction, Request, Response } from "express";
import { v7 as uuidv7 } from "uuid";
import type { yt } from "@_types/youtube-types";
import { agent, tempFolderName } from "@_utils/constants";
import { SessionInfo } from "@_utils/classes";
import {
  getVideoFormats,
  getAudioFormats,
  downloadFile,
  createSessionFolder,
  updateSessionProgress,
  saveInfoToJson,
  getAudioFormat_safe,
  getVideoFormat_safe,
  readSessionFile,
  validatePlaylistURL,
} from "./ytHelpers";

export const VITE_MODE = import.meta.env.DEV;
export const tempFolderPath = VITE_MODE ? tempFolderName : `/${tempFolderName}`;

// fix ffmpeg path error
ffmpeg.setFfmpegPath(ffmpegPath);

/** youtube smart search for a video or list */
export const ytSmartSearchHandler = async (
  request: yt.Search.SearchRequestType,
  response: yt.Search.SearchResponseType
) => {
  const {
    body: { searchUrl },
  } = request;

  try {
    // [1]: search as a video
    if (ytdl.validateURL(searchUrl)) {
      if (VITE_MODE) {
        console.log("✅ Valid youtube video url\n");
      }
      // video info
      const videoInfo = await ytdl.getInfo(searchUrl, {
        agent,
      });
      const formats = videoInfo.formats;

      // filtered formats
      const filteredVideoFormats = getVideoFormats(formats);
      const filteredAudioFormats = getAudioFormats(formats);

      response.status(200).json({
        info: {
          videoFormats: filteredVideoFormats,
          audioFormats: filteredAudioFormats,
          videoDetails: videoInfo.videoDetails,
        },
        type: "video",
      });
      // [2]: search as playlist
    } else if (YouTube.validate(validatePlaylistURL(searchUrl), "PLAYLIST")) {
      if (VITE_MODE) {
        console.log("✅ Valid youtube playlist url\n");
      }

      const listInfo = await YouTube.getPlaylist(searchUrl, {
        fetchAll: true,
        limit: Infinity,
      });

      response.status(200).json({
        info: {
          id: listInfo.id,
          videoCount: listInfo.videoCount,
          views: listInfo.views,
          channel: listInfo.channel,
          lastUpdate: listInfo.lastUpdate,
          link: listInfo.link,
          mix: listInfo.mix,
          thumbnail: listInfo.thumbnail,
          title: listInfo.title,
          type: listInfo.type,
          url: listInfo.url,
          videos: listInfo.videos,
          fake: listInfo.fake,
        },
        type: "list",
      });
      // invalid url
    } else {
      response.status(200).json({
        errMsg: "Invalid youtube url",
        type: "none",
      });
    }
  } catch (err) {
    response.status(200).json({ errMsg: (err as Error).message, type: "none" });
  }
};

/** open download session & create the session folder using (uuid) */
export const openDownloadSessionHandler = async (
  _: Request,
  response: Response<yt.Progress.OpenDownloadSessionResponse>
) => {
  // init the session data
  const sessionID = uuidv7();
  const sessionInfo = new SessionInfo(sessionID);

  // create the session temporary folder in (/tmp)
  const { error } = createSessionFolder(sessionID);

  if (error) {
    // failed to open the session & create the session folder
    response.sendStatus(206);
  } else {
    if (!saveInfoToJson(sessionID, sessionInfo.data)) {
      // if failed to save session info to file
      response.sendStatus(206);
      return;
    }

    if (VITE_MODE) {
      console.log("🟩 Download session opened");
    }

    response
      .status(200)
      .json({ sessionID, progressInfo: sessionInfo._clientInfo });
  }
};

/** feed the client with progress information */
export const getSessionProgressHandler = async (
  request: yt.Download.VideoDownloadRequestType,
  response: Response<yt.Progress.ClientInfoType>
) => {
  const {
    body: { sessionID },
  } = request;

  const filePath = path.resolve(tempFolderPath, sessionID, "info.json");

  // read the session file asynchronously
  fs.readFile(filePath, { encoding: "utf-8" }, (err, data) => {
    if (err) {
      if (VITE_MODE) {
        console.log(`🟥 Failed to read client info file -> ${err.message}`);
      }
      response.status(200).json({
        state: "error",
        msg: "session closed 💀",
        progress: 0,
      });
    } else {
      if (VITE_MODE) {
        console.log("🟩 Read client info succesfully");
      }
      const sessionInfo = JSON.parse(data) as yt.Progress.SessionInfoType;
      response.status(200).json(sessionInfo.clientInfo);
    }
  });
};

/** emitted when the response has been sent to the user */
export const downloadSessionCleaner = async (
  request: yt.Download.VideoDownloadRequestType,
  response: Response,
  next: NextFunction
) => {
  const {
    body: { sessionID },
  } = request;

  response.on("finish", () => {
    const tempFolder = path.resolve(tempFolderPath, sessionID);

    if (VITE_MODE) {
      console.log("\nCleaner 🧹🧹🧹🧹🧹");
    }

    // remove the whole tmp folder
    rm(tempFolder, { recursive: true, force: true }, (err) => {
      if (VITE_MODE) {
        if (err) {
          console.error(`🟥 Faild to delete the tmp folder -> ${err.message}`);
        } else {
          console.log("🟩 Temp folder deleted successfully");
        }
        console.log("\n============== End ===============");
      }
    });
  });

  next();
};

//======================= downloading =======================

/**
 * not used yet in client ❌
 * --------------------------------------
 * response status code:
 * 201 => invalid video url
 * 202 => session folder doesn't exist
 * 203 => failed to read session info file
 * 204 => failed to save session info to file
 * 205 => failed to download files
 * 206 => failed to open a download session
 * --------------------------------------
 */

/** validate the video url before download */
export const videoUrlValidator = (
  request: yt.Download.VideoDownloadRequestType,
  response: Response,
  next: NextFunction
) => {
  const {
    body: { searchUrl },
  } = request;

  try {
    if (!ytdl.validateURL(searchUrl)) {
      if (VITE_MODE) {
        console.log(`🟥 Invalid video url\n`);
      }
      response.sendStatus(201);
      return;
    }
  } catch (err) {
    if (VITE_MODE) {
      console.log(`🟥 ERROR: ${(err as Error).message}\n`);
    }
    response.sendStatus(201);
    return;
  }

  if (VITE_MODE) {
    console.log("🟩 Video url is valid\n");
  }

  next();
};

/** confirm that session folder is exists before download */
export const sessionFolderValidator = (
  request: yt.Download.VideoDownloadRequestType,
  response: Response,
  next: NextFunction
) => {
  const {
    body: { sessionID },
  } = request;

  try {
    const sessionFolderPath = path.resolve(tempFolderPath, sessionID);

    if (!fs.existsSync(sessionFolderPath)) {
      if (VITE_MODE) {
        console.log(`🟥 Session folder doesn't exist\n`);
      }
      response.sendStatus(202);
      return;
    }
  } catch (err) {
    if (VITE_MODE) {
      console.log(`🟥 ERROR: ${(err as Error).message}\n`);
    }
    response.sendStatus(202);
    return;
  }

  if (VITE_MODE) {
    console.log("🟩 Session folder exists\n");
  }

  next();
};

/** youtube video downloader */
export const ytVideoDownloadHandler = async (
  request: yt.Download.VideoDownloadRequestType,
  response: Response
) => {
  const {
    body: { searchUrl, quality, sessionID },
  } = request;

  try {
    // get video info
    const videoInfo = await ytdl.getInfo(searchUrl, {
      agent,
    });
    const formats = videoInfo.formats;

    // filtered formats
    const targetFormat = getVideoFormat_safe(
      getVideoFormats(formats),
      quality as yt.VideoQualities
    );

    if (targetFormat === null) {
      // this is kind of impossible 😱❓(just to be more safe)
      throw new Error("Video format doesn't exist");
    }

    // get highest audio format (160k) default if exists
    const audioFormat = getAudioFormats(formats)[0];

    if (VITE_MODE) {
      console.log("----------------------------------");
      console.log("video quality:", targetFormat?.qualityLabel);
      console.log("audio quality:", audioFormat?.audioBitrate);
      console.log("----------------------------------");
    }

    if (audioFormat === undefined) {
      // this is kind of impossible too 😱❓(just to be more safe)
      throw new Error("Audio format doesn't exist");
    }

    const result = readSessionFile(sessionID);

    if (!result.success) {
      if (VITE_MODE) {
        console.log("🟥 Failed to read session info file");
      }
      response.sendStatus(203);
      return;
    }

    const sessionInfo = new SessionInfo(result.sessionInfo!);
    // set file count to (2 files)
    sessionInfo.___total = 2;

    if (!saveInfoToJson(sessionID, sessionInfo.data)) {
      if (VITE_MODE) {
        console.log("🟥 Failed to save new session info to file");
      }
      response.sendStatus(204);
      return;
    }

    const tempFolder = path.resolve(tempFolderPath, sessionID);
    const videoFilePath = path.resolve(
      tempFolder,
      `video.${targetFormat.container}`
    );
    const audioFilePath = path.resolve(
      tempFolder,
      `audio.${audioFormat.container}`
    );

    // download
    // -----------------------------------------------------
    if (VITE_MODE) {
      console.log("\n============= Start ==============\n");
    }

    const [videoFileStatus, audioFileStatus] = (await Promise.allSettled([
      downloadFile(videoFilePath, videoInfo, targetFormat, sessionID),
      downloadFile(audioFilePath, videoInfo, audioFormat, sessionID),
    ])) as yt.PromiseAllSettledType[];

    if (!videoFileStatus!.value.ok || !audioFileStatus!.value.ok) {
      if (VITE_MODE) {
        console.log("🟥 Failed to download files");
      }
      response.sendStatus(205);
      return;
    }

    const outFilePath = path.resolve(tempFolder, `output.mp4`);

    // merge video & audio in one file
    ffmpeg(videoFilePath)
      .format("mp4")
      .audioBitrate(audioFormat.audioBitrate!)
      .mergeAdd(audioFilePath)
      .saveToFile(outFilePath)
      .on("start", () => {
        if (VITE_MODE) {
          console.log("⚒️  Start converting...");
        }
      })
      .on("codecData", (codecData) => {
        // update the duration only
        const progressInfo: { duration: string } = {
          duration: (codecData as typeof codecData & { duration: string })
            .duration,
        };
        updateSessionProgress("duration", sessionID, progressInfo);
      })
      .on("progress", ({ targetSize, timemark }) => {
        // update the convertProgressState only
        const progressInfo: yt.Progress.ConvertProgressStateType = {
          size: targetSize,
          timeMark: timemark,
        };
        updateSessionProgress("convert", sessionID, progressInfo);
      })
      .on("end", () => {
        // delete (video & audio) files thay are no longer needed
        unlink(videoFilePath, (err) => {
          if (VITE_MODE) {
            if (err) {
              console.log(`🟥 Faild to delete video file -> ${err.message}`);
            } else {
              console.log("🟩 Video File deleted successfully");
            }
          }
        });
        unlink(audioFilePath, (err) => {
          if (VITE_MODE) {
            if (err) {
              console.log(`🟥 Faild to delete audio file -> ${err.message}`);
            } else {
              console.log("🟩 Audio File deleted successfully");
            }
          }
        });

        // send to client
        response.status(200).download(outFilePath, (err) => {
          if (err) {
            if (VITE_MODE) {
              console.error(
                `🟥 Failed to send file to the client -> ${err.message}`
              );
            }
            response.sendStatus(205);
            return;
          }
          if (VITE_MODE) {
            console.log("🟩 File sent to the client");
          }
        });
      })
      .on("error", (err) => {
        if (VITE_MODE) {
          console.error(`🟥 Failed to send file to the user -> ${err.message}`);
        }
        response.sendStatus(205);
      });
  } catch (err) {
    if (VITE_MODE) {
      console.log(`🟥 ERROR: ${(err as Error).message}`);
    }
    response.sendStatus(205);
  }
};

/** youtube audio downloader */
export const ytAudioDownloadHandler = async (
  request: yt.Download.VideoDownloadRequestType,
  response: Response
) => {
  const {
    body: { searchUrl, quality, sessionID },
  } = request;

  try {
    // get video info
    const videoInfo = await ytdl.getInfo(searchUrl, {
      agent,
    });
    const formats = videoInfo.formats;

    // filtered formats
    const targetFormat = getAudioFormat_safe(
      getAudioFormats(formats),
      quality as yt.AudioQualities
    );

    if (targetFormat === null) {
      // this is kind of impossible 😱❓(just to be more safe)
      throw new Error("Audio format doesn't exist");
    }

    const result = readSessionFile(sessionID);

    if (!result.success) {
      if (VITE_MODE) {
        console.log("🟥 Failed to read session info file");
      }
      response.sendStatus(203);
      return;
    }

    const sessionInfo = new SessionInfo(result.sessionInfo!);
    // set file count to (1 files)
    sessionInfo.___total = 1;

    if (!saveInfoToJson(sessionID, sessionInfo.data)) {
      if (VITE_MODE) {
        console.log("🟥 Failed to save new session info to file");
      }
      response.sendStatus(204);
      return;
    }

    const tempFolder = path.resolve(tempFolderPath, sessionID);
    const audioFilePath = path.resolve(
      tempFolder,
      `audio.${targetFormat.container}`
    );

    // download
    // -----------------------------------------------------
    if (VITE_MODE) {
      console.log("\n============= Start ==============\n");
    }

    const audioFileStatus = (await downloadFile(
      audioFilePath,
      videoInfo,
      targetFormat,
      sessionID
    )) as { ok: boolean };

    if (!audioFileStatus.ok) {
      if (VITE_MODE) {
        console.log("🟥 Failed to download audio file");
      }
      response.sendStatus(205);
      return;
    }

    const outFilePath = path.resolve(tempFolder, `output.mp3`);

    // merge video & audio in one file
    ffmpeg(audioFilePath)
      .format("mp3")
      .audioBitrate(targetFormat.audioBitrate!)
      .saveToFile(outFilePath)
      .on("start", () => {
        if (VITE_MODE) {
          console.log("⚒️  Start converting...");
        }
      })
      .on("codecData", (codecData) => {
        // update the duration only
        const progressInfo: { duration: string } = {
          duration: (codecData as typeof codecData & { duration: string })
            .duration,
        };
        updateSessionProgress("duration", sessionID, progressInfo);
      })
      .on("progress", ({ targetSize, timemark }) => {
        // update the mergeProgressState only
        const progressInfo: yt.Progress.ConvertProgressStateType = {
          size: targetSize,
          timeMark: timemark,
        };
        updateSessionProgress("convert", sessionID, progressInfo);
      })
      .on("end", () => {
        // delete audio file thay are no longer needed
        unlink(audioFilePath, (err) => {
          if (VITE_MODE) {
            if (err) {
              console.log(`🟥 Faild to delete audio file -> ${err.message}`);
            } else {
              console.log("🟩 Audio File deleted successfully");
            }
          }
        });

        // send to client
        response.status(200).download(outFilePath, (err) => {
          if (err) {
            if (VITE_MODE) {
              console.error(
                `🟥 Failed to send file to the client -> ${err.message}`
              );
            }
            response.sendStatus(205);
            return;
          }
          if (VITE_MODE) {
            console.log("🟩 File sent to the client");
          }
        });
      })
      .on("error", (err) => {
        if (VITE_MODE) {
          console.error(`🟥 Failed to send file to the user -> ${err.message}`);
        }
        response.sendStatus(205);
      });
  } catch (err) {
    if (VITE_MODE) {
      console.log(`🟥 BAD ERROR`);
      console.log(`🟥 ERROR: ${(err as Error).message}`);
    }
    response.sendStatus(205);
  }
};

// not used ❌
// maybe used to download a compressed playlist in the future
/** youtube list downloader */
export const ytListDownloadHandler = async (
  request: yt.Download.ListDownloadRequestType,
  response: Response
) => {
  const {
    body: { listUrl },
  } = request;

  response.status(200).json({ listUrl });
};
