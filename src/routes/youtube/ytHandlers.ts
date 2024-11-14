import ytdl from "@distube/ytdl-core";
import { YouTube } from "youtube-sr";
import path from "path";
import fs, { rm, unlink } from "fs";
import ffmpeg from "fluent-ffmpeg";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";
import type { NextFunction, Request, Response } from "express";
import type { yt } from "../../types/youtube-types";
import {
  getVideoFormats,
  getAudioFormats,
  downloadFile,
  createTempFolder,
  updateSessionProgress,
  saveInfoToJson,
  getAudioFormat_safe,
  getVideoFormat_safe,
} from "./ytHelpers";
import { agent, tempFolderName } from "../../utils/constants";

const tempFolderPath = import.meta.env.DEV
  ? tempFolderName
  : `/${tempFolderName}`;

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
      if (import.meta.env.DEV) {
        console.log("Valid youtube video url ✅\n");
      }

      // video info
      const videoInfo = await ytdl.getInfo(searchUrl, {
        playerClients: ["IOS"],
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
    } else if (YouTube.validate(searchUrl, "PLAYLIST")) {
      if (import.meta.env.DEV) {
        console.log("Valid youtube playlist url ✅\n");
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

/** open download session & create the session folder */
export const openDownloadSessionHandler = async (
  request: Request,
  response: Response<yt.Progress.ClientInfoType>
) => {
  const sessionReq = request as typeof request & yt.Progress.RequestSessionType;

  if (sessionReq.session.vidl) {
    if (import.meta.env.DEV) {
      console.log("Session already opened 🟩");
    }
  } else {
    if (import.meta.env.DEV) {
      console.log("not connected 🥺");
    }
    // init the session data
    sessionReq.session.vidl = {
      connected: true,
      clientInfo: { state: "fetch", msg: "fetching info", progress: 0 },
      progressState: {
        duration: "",
        downloadProgressState: {
          total: 0, // total files to download
          finish: 0, // downloaded files
        },
        mergeProgressState: {
          size: 0,
          timeMark: "",
        },
      },
    };
    if (import.meta.env.DEV) {
      console.log("Download Session opened 🟩");
    }
  }

  // create the session temporary folder in (/tmp)
  const { error } = createTempFolder(tempFolderPath, request.sessionID);

  if (error) {
    // failed to open the session & create the session folder
    response.sendStatus(204);
  } else {
    const clientInfo = sessionReq.session.vidl.clientInfo;
    saveInfoToJson(sessionReq.sessionID, clientInfo);
    response.status(200).json(clientInfo);
  }
};

/** check connection & logs the session id before download start */
export const downloadSessionInfoLogger = async (
  request: Request,
  _: Response,
  next: NextFunction
) => {
  const sessionReq = request as typeof request & yt.Progress.RequestSessionType;

  if (import.meta.env.DEV) {
    // console.clear();
    console.log("\n======= Session Info Start =======\n");

    if (sessionReq.session.vidl) {
      console.log("connected 😊");
    } else {
      console.log("not connected 🥺");
    }
    console.log("SessionID:", sessionReq.sessionID);
    console.log("\n======== Session Info End ========");
  }

  next();
};

/** feed the client with progress information */
export const getSessionProgressHandler = async (
  request: Request,
  response: Response<yt.Progress.ClientInfoType>
) => {
  const sessionReq = request as typeof request & yt.Progress.RequestSessionType;

  if (sessionReq.session.vidl) {
    const filePath = path.resolve(
      tempFolderPath,
      sessionReq.sessionID,
      "info.json"
    );

    try {
      fs.readFile(filePath, { encoding: "utf-8" }, (err, data) => {
        if (err) {
          if (import.meta.env.DEV) {
            console.log(`Failed to Read client info file ❓ -> ${err.message}`);
          }
          response.status(200).json({
            state: "fetch",
            msg: "fetching info",
            progress: 0,
          });
        } else {
          if (import.meta.env.DEV) {
            console.log("Read client info succesfully ✅");
          }
          response
            .status(200)
            .json(JSON.parse(data) as yt.Progress.ClientInfoType);
        }
      });
      return;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.log(
          `ERROR: occurred while reading info file -> ${(err as Error).message}`
        );
      }
    }
  }

  response.status(200).json({
    state: "error",
    msg: "session closed 💀",
    progress: 0,
  });
};

/** emitted when the response has been sent to the user */
export const downloadSessionCleaner = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  response.on("finish", () => {
    const sessionReq = request as typeof request &
      yt.Progress.RequestSessionType;
    const tempFolder = path.resolve(tempFolderPath, sessionReq.sessionID);

    if (import.meta.env.DEV) {
      console.log("\nCleaner 🧹🧹🧹🧹🧹");
    }

    // kill the session
    request.session.destroy((err) => {
      if (import.meta.env.DEV) {
        if (err) {
          console.error(`Failed to kill session -> ${err.message}`);
        } else {
          console.log("SessionID:", sessionReq.sessionID);
          console.log("Session Killed 💀");
        }
      }
    });
    // remove the whole tmp folder
    rm(tempFolder, { recursive: true, force: true }, (err) => {
      // if (import.meta.env.DEV) {
      if (err) {
        console.error(`Faild to delete the tmp folder ❓ -> ${err.message}`);
      } else {
        console.log("Temp folder deleted successfully ✅");
      }
      console.log("\n============== End ===============");
      // }
    });
  });

  next();
};

//======================= downloading =======================

/** youtube video with (url & quality) downloader */
export const ytVideoDownloadHandler = async (
  request: yt.Download.VideoDownloadRequestType,
  response: Response
) => {
  const {
    body: { searchUrl, quality },
  } = request;

  try {
    if (!ytdl.validateURL(searchUrl)) {
      response.status(200).json({
        errMsg: "Invalid youtube video url. Please try again",
        type: "none",
      });
      return;
    }

    if (import.meta.env.DEV) {
      console.log("video url is valid ✅\n");
    }

    // video info
    const videoInfo = await ytdl.getInfo(searchUrl, {
      playerClients: ["IOS"],
      agent,
    });
    const formats = videoInfo.formats;

    // filtered formats
    const targetFormat = getVideoFormat_safe(
      getVideoFormats(formats),
      quality as yt.VideoQualities
    );

    if (targetFormat === null) {
      if (import.meta.env.DEV) {
        console.log("video not exist ❌");
      }
      throw ""; // this is kind of impossible 😱❓
    }

    const audioFormat = getAudioFormats(formats)[0]; // get highest audio format

    if (import.meta.env.DEV) {
      console.log("----------------------------------");
      console.log("video quality:", targetFormat?.qualityLabel);
      console.log("audio quality:", audioFormat?.audioBitrate);
      console.log("----------------------------------");
    }

    if (audioFormat === undefined) {
      if (import.meta.env.DEV) {
        console.log("audio not exist ❌");
      }
      throw ""; // this is kind of impossible too 😱❓
    }

    const sessionReq = request as typeof request &
      yt.Progress.RequestSessionType;

    // set file count to (2 files)
    sessionReq.session.vidl.progressState.downloadProgressState.total = 2;

    const tempFolder = path.resolve(tempFolderPath, request.sessionID);
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
    if (import.meta.env.DEV) {
      console.log("\n============= Start ==============\n");
    }

    const [videoFileStatus, audioFileStatus] = (await Promise.allSettled([
      downloadFile(videoFilePath, videoInfo, targetFormat, sessionReq),
      downloadFile(audioFilePath, videoInfo, audioFormat, sessionReq),
    ])) as yt.PromiseAllSettledType[];

    if (!videoFileStatus!.value.ok || !audioFileStatus!.value.ok) {
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
        if (import.meta.env.DEV) {
          console.log("Start merging... ⚒️");
        }
      })
      .on("codecData", (codecData) => {
        // update the duration only
        const progressInfo: { duration: string } = {
          duration: (codecData as typeof codecData & { duration: string })
            .duration,
        };
        updateSessionProgress("duration", sessionReq, progressInfo);
      })
      .on("progress", ({ targetSize, timemark }) => {
        // update the mergeProgressState only
        const progressInfo: yt.Progress.MergeProgressStateType = {
          size: targetSize,
          timeMark: timemark,
        };
        updateSessionProgress("convert", sessionReq, progressInfo);
      })
      .on("end", () => {
        // delete (video & audio) files thay are no longer needed
        unlink(videoFilePath, (err) => {
          if (import.meta.env.DEV) {
            if (err) {
              console.log(`Faild to delete video file ❌ -> ${err.message}`);
            } else {
              console.log("Video File deleted successfully ✅");
            }
          }
        });
        unlink(audioFilePath, (err) => {
          if (import.meta.env.DEV) {
            if (err) {
              console.log(`Faild to delete audio file ❌ -> ${err.message}`);
            } else {
              console.log("Audio File deleted successfully ✅");
            }
          }
        });

        // send to client
        response.status(200).download(outFilePath, (err) => {
          if (err) {
            if (import.meta.env.DEV) {
              console.error(
                `Failed to send file to the client ❌ -> ${err.message}`
              );
            }
            response.sendStatus(204);
          } else {
            if (import.meta.env.DEV) {
              console.log("File sent to the client ✅");
            }
          }
        });
      })
      .on("error", (err) => {
        if (import.meta.env.DEV) {
          console.error(`Faied to send file to the user ❌ -> ${err.message}`);
        }
        response.sendStatus(204);
      });
  } catch (err) {
    response.sendStatus(204);
  }
};

/** youtube audio with (url & quality) only downloader */
export const ytAudioDownloadHandler = async (
  request: yt.Download.VideoDownloadRequestType,
  response: Response
) => {
  const {
    body: { searchUrl, quality },
  } = request;

  try {
    if (!ytdl.validateURL(searchUrl)) {
      response.status(200).json({
        errMsg: "Invalid youtube video url. Please try again",
        type: "none",
      });
      return;
    }

    if (import.meta.env.DEV) {
      console.log("video url is valid ✅\n");
    }

    // video info
    const videoInfo = await ytdl.getInfo(searchUrl, {
      playerClients: ["IOS"],
      agent,
    });
    const formats = videoInfo.formats;

    // filtered formats
    const targetFormat = getAudioFormat_safe(
      getAudioFormats(formats),
      quality as yt.AudioQualities
    );

    if (targetFormat === null) {
      if (import.meta.env.DEV) {
        console.log("video not exist ❌");
      }
      throw ""; // this is kind of impossible 😱❓
    }

    const sessionReq = request as typeof request &
      yt.Progress.RequestSessionType;

    // set file count to (1 files)
    sessionReq.session.vidl.progressState.downloadProgressState.total = 1;

    const tempFolder = path.resolve(tempFolderPath, request.sessionID);
    const audioFilePath = path.resolve(
      tempFolder,
      `audio.${targetFormat.container}`
    );

    // download
    // -----------------------------------------------------
    if (import.meta.env.DEV) {
      console.log("\n============= Start ==============\n");
    }

    const audioFileStatus = (await downloadFile(
      audioFilePath,
      videoInfo,
      targetFormat,
      sessionReq
    )) as { ok: boolean };

    if (!audioFileStatus.ok) {
      response.sendStatus(204);
      return;
    }

    const outFilePath = path.resolve(tempFolder, `output.mp3`);

    // merge video & audio in one file
    ffmpeg(audioFilePath)
      .format("mp3")
      .audioBitrate(targetFormat.audioBitrate!)
      .saveToFile(outFilePath)
      .on("start", () => {
        if (import.meta.env.DEV) {
          console.log("start converting... ⚒️");
        }
      })
      .on("codecData", (codecData) => {
        // update the duration only
        const progressInfo: { duration: string } = {
          duration: (codecData as typeof codecData & { duration: string })
            .duration,
        };
        updateSessionProgress("duration", sessionReq, progressInfo);
      })
      .on("progress", ({ targetSize, timemark }) => {
        // update the mergeProgressState only
        const progressInfo: yt.Progress.MergeProgressStateType = {
          size: targetSize,
          timeMark: timemark,
        };
        updateSessionProgress("convert", sessionReq, progressInfo);
      })
      .on("end", () => {
        // delete audio file thay are no longer needed
        unlink(audioFilePath, (err) => {
          if (import.meta.env.DEV) {
            if (err) {
              console.error(`Faild to delete audio file ❌ -> ${err.message}`);
            } else {
              console.log("Audio File deleted successfully ✅");
            }
          }
        });

        // send to client
        response.status(200).download(outFilePath, (err) => {
          if (err) {
            if (import.meta.env.DEV) {
              console.error(
                `Failed to send file to the client ❌ -> ${err.message}`
              );
            }
            response.sendStatus(204);
            return;
          }
          if (import.meta.env.DEV) {
            console.log("File sent to the client ✅");
          }
        });
      })
      .on("error", (err) => {
        if (import.meta.env.DEV) {
          console.error(`Faied to send file to the user ❌ -> ${err.message}`);
        }
        response.sendStatus(204);
      });
  } catch (err) {
    response.sendStatus(204);
  }
};

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
