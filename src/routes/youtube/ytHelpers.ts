import ytdl from "@distube/ytdl-core";
import fs from "fs";
import path from "path";
import type { yt } from "@_types/youtube-types";
import { SessionInfo } from "@_utils/classes";
import { tempFolderPath, VITE_MODE } from "./ytHandlers";
import { agent } from "@_utils/constants";

/**
 * filter the (info.formats) and get all qualities:
 * { 2160p - 1440p - 1080p - 720p - 480p - 360p - 240p - 144p }
 */
export const getVideoFormats = (
  infoFormats: ytdl.videoFormat[]
): ytdl.videoFormat[] => {
  const done_set = new Set();

  return ytdl.filterFormats(infoFormats, (filter) => {
    const is8k = filter?.qualityLabel?.startsWith("4320p");
    const is2kOr4k =
      filter?.qualityLabel?.startsWith("2160p") ||
      filter?.qualityLabel?.startsWith("1440p");

    const matches =
      filter.hasVideo &&
      !filter.hasAudio &&
      !URL.parse(filter.url)!.hostname.includes("manifest") && // remove the manifest links
      (is8k || is2kOr4k || (!is8k && !is2kOr4k));

    const quality = filter.qualityLabel?.split("p")[0];
    const isAdded = done_set.has(quality);

    if (matches && !isAdded) {
      done_set.add(quality);
      return true;
    }

    return false;
  });
};

/** filter all video qualities and get a spcific quality (ex: 1080p) */
export const getVideoFormat = (
  filteredFormats: ytdl.videoFormat[],
  qLabel: yt.QualityLabel | number
): ytdl.videoFormat => {
  if (typeof qLabel === "number") {
    qLabel = qLabel.toString() as yt.QualityLabel;
  }
  return ytdl.chooseFormat(filteredFormats, {
    filter: (filter) => filter?.qualityLabel.startsWith(qLabel),
  });
};

/** filter the (info.formats) and get all audio formats */
export const getAudioFormats = (
  infoFormats: ytdl.videoFormat[]
): ytdl.videoFormat[] => {
  const done_set = new Set();

  return ytdl
    .filterFormats(infoFormats, (filter) => {
      const matches = filter.hasAudio && !filter.hasVideo;

      const key = filter.audioBitrate;
      const isAdded = done_set.has(key);

      if (matches && !isAdded) {
        done_set.add(key);
        return true;
      }

      return false;
    })
    .sort((a, b) => b.audioBitrate! - a.audioBitrate!);
};

/** to deal with non-founded quality */
export const getVideoFormat_safe = (
  formats: ytdl.videoFormat[],
  quality: yt.VideoQualities
): ytdl.videoFormat | null => {
  const safe_map = new Map<
    yt.VideoQualities,
    { up: yt.VideoQualities[] | null; down: yt.VideoQualities[] | null }
  >([
    [4320, { up: null, down: [2160, 1440, 1080, 720, 480, 360, 240, 144] }],
    [2160, { up: [4320], down: [1440, 1080, 720, 480, 360, 240, 144] }],
    [1440, { up: [2160, 4320], down: [1080, 720, 480, 360, 240, 144] }],
    [1080, { up: [1440, 2160, 4320], down: [720, 480, 360, 240, 144] }],
    [720, { up: [1080, 1440, 2160, 4320], down: [480, 360, 240, 144] }],
    [480, { up: [720, 1080, 1440, 2160, 4320], down: [360, 240, 144] }],
    [360, { up: [480, 720, 1080, 1440, 2160, 4320], down: [240, 144] }],
    [240, { up: [360, 480, 720, 1080, 1440, 2160, 4320], down: [144] }],
    [144, { up: [240, 360, 480, 720, 1080, 1440, 2160, 4320], down: null }],
  ]);

  let formatIndex = 0;

  // [1] get the ordered quality first
  formatIndex = formats.findIndex((format) =>
    format.qualityLabel.startsWith(`${quality}p`)
  );
  if (formatIndex !== -1) {
    return formats[formatIndex]!;
  }

  // if we didn't find the ordered quality (here the work starts 💀)

  // [2] go up in the (safe_map) and get the first match
  const upSearch = safe_map.get(quality)!.up;
  if (upSearch !== null) {
    for (const Q of upSearch) {
      formatIndex = formats.findIndex((format) =>
        format.qualityLabel.startsWith(`${Q}`)
      );
      if (formatIndex !== -1) {
        return formats[formatIndex]!;
      }
    }
  }

  // [3] go down in the (safe_map) and get the first match
  const downSearch = safe_map.get(quality)!.down;
  if (downSearch !== null) {
    for (const Q of downSearch) {
      formatIndex = formats.findIndex((format) =>
        format.qualityLabel.startsWith(`${Q}`)
      );
      if (formatIndex !== -1) {
        return formats[formatIndex]!;
      }
    }
  }

  return null;
};

/** filter all audio qualities and get a spcific audioBitrate (ex: 160) */
export const getAudioFormat = (
  filteredFormats: ytdl.videoFormat[],
  bitrate: number
): ytdl.videoFormat => {
  return ytdl.chooseFormat(filteredFormats, {
    filter: (filter) => filter?.audioBitrate === bitrate,
  });
};

/** to deal with non-founded quality */
export const getAudioFormat_safe = (
  formats: ytdl.videoFormat[],
  quality: yt.AudioQualities
): ytdl.videoFormat | null => {
  const safe_map = new Map<
    yt.AudioQualities,
    { up: yt.AudioQualities[] | null; down: yt.AudioQualities[] | null }
  >([
    [160, { up: null, down: [128, 64, 48] }],
    [128, { up: [160], down: [64, 48] }],
    [64, { up: [128, 160], down: [48] }],
    [48, { up: [64, 128, 160], down: null }],
  ]);

  let formatIndex = 0;

  // [1] get the ordered quality first
  formatIndex = formats.findIndex((format) => format.audioBitrate === quality);
  if (formatIndex !== -1) {
    return formats[formatIndex]!;
  }

  // if we didn't find the ordered quality (here the work starts 💀)

  // [2] go up in the (safe_map) and get the first match
  const upSearch = safe_map.get(quality)!.up;
  if (upSearch !== null) {
    for (const Q of upSearch) {
      formatIndex = formats.findIndex((format) => format.audioBitrate === Q);
      if (formatIndex !== -1) {
        return formats[formatIndex]!;
      }
    }
  }

  // [3] go down in the (safe_map) and get the first match
  const downSearch = safe_map.get(quality)!.down;
  if (downSearch !== null) {
    for (const Q of downSearch) {
      formatIndex = formats.findIndex((format) => format.audioBitrate === Q);
      if (formatIndex !== -1) {
        return formats[formatIndex]!;
      }
    }
  }

  return null;
};

export const videoDurationInSeconds = (duration: string): number => {
  // hh:mm:ss.xx
  const [hr, min, sec] = duration.split(":") as [string, string, string];
  return +hr * 60 * 60 + +min * 60 + +sec;
};

export const getConvertingStateProgress = (
  timeMark: string,
  totalDuration: string
) => {
  return Math.floor(
    (videoDurationInSeconds(timeMark) / videoDurationInSeconds(totalDuration)) *
      100
  );
};

export const getFileSize = (sizeInKB: number) => {
  const GB_KB = 1024 * 1024;
  const MB_KB = 1024;

  const GB = sizeInKB / GB_KB;
  const MB = (sizeInKB % GB_KB) / MB_KB;

  return GB >>> 0
    ? GB.toFixed(2) + " gb"
    : MB >>> 0
    ? MB.toFixed(2) + " mb"
    : sizeInKB + " kb";
};

export const isVideoFormat = (quality: number) => {
  return new Set([4320, 2160, 1440, 1080, 720, 480, 360, 240, 144]).has(
    quality
  );
};

/** create a new folder with name as _sessionID_ at ( tempFolderPath ) */
export const createSessionFolder = (
  sessionID: string
): { sessionFolderPath: string; error: boolean } => {
  const sessionFolderPath = path.resolve(tempFolderPath, sessionID);

  try {
    if (fs.existsSync(sessionFolderPath)) {
      throw new Error(`[${sessionFolderPath}] folder already exists`);
    } else {
      fs.mkdirSync(sessionFolderPath, { recursive: true });

      if (VITE_MODE) {
        console.log(
          `🟩 Session folder created successfully [${sessionFolderPath}]`
        );
      }
    }
  } catch (err) {
    if (VITE_MODE) {
      console.log(`🟥 ${(err as Error).message}`);
      console.log("🟥 Failed to create session folder");
    }
    return { sessionFolderPath, error: true };
  }
  return { sessionFolderPath, error: false };
};

/** used to save session info to json file */
export const saveInfoToJson = (
  sessionID: string,
  data: yt.Progress.SessionInfoType
) => {
  const filePath = path.resolve(tempFolderPath, sessionID, "info.json");

  try {
    fs.writeFileSync(filePath, JSON.stringify(data), {
      flag: "w",
      encoding: "utf-8",
    });

    if (VITE_MODE) {
      console.log("🟩 Write client info succesfully to (info.json)");
    }
  } catch (err) {
    if (VITE_MODE) {
      console.log(
        `🟥 ERROR: occurred while writing data to (info.json) -> ${
          (err as Error).message
        }`
      );
    }
    return false;
  }
  return true;
};

export const readSessionFile = (
  sessionID: string
): { success: boolean; sessionInfo?: yt.Progress.SessionInfoType } => {
  try {
    const filePath = path.resolve(tempFolderPath, sessionID, "info.json");
    const sessionInfo = JSON.parse(
      fs.readFileSync(filePath, { encoding: "utf-8" })
    ) as yt.Progress.SessionInfoType;

    if (VITE_MODE) {
      console.log("🟩 Read session info succesfully");
    }

    return { success: true, sessionInfo };
  } catch (err) {
    if (VITE_MODE) {
      console.log(
        `🟥 Failed to read session info file -> ${(err as Error).message}`
      );
    }
    return { success: false };
  }
};

/** update the session progress info and prepare it for the client request */
export const updateSessionProgress = (
  stage: yt.Progress.ProgressStagesType,
  sessionID: string,
  progressInfo?: unknown
) => {
  const result = readSessionFile(sessionID);

  if (result.success) {
    const newSessionInfo = new SessionInfo(result.sessionInfo!);

    switch (stage) {
      case "download": {
        // update the downloadProgressState (finish) property
        newSessionInfo.___finish = newSessionInfo.___finish + 1;
        const { total, finish } = newSessionInfo.__downloadProgressState;

        // update the clientInfo
        newSessionInfo._clientInfo = {
          state: "progress",
          msg: `preparing...(${finish}/${total})`,
          progress: Math.floor((finish / total) * 100),
        };
        break;
      }

      case "convert": {
        const { size, timeMark } =
          progressInfo as yt.Progress.ConvertProgressStateType;
        newSessionInfo.__convertProgressState = {
          size,
          timeMark,
        };
        newSessionInfo._clientInfo = {
          state: "progress",
          msg: `converting...(${getFileSize(size)})`,
          progress: getConvertingStateProgress(
            timeMark,
            newSessionInfo.__duration
          ),
        };
        break;
      }

      case "duration": {
        newSessionInfo.__duration = (
          progressInfo as { duration: string }
        ).duration;
        break;
      }
    }

    saveInfoToJson(sessionID, newSessionInfo.data);

    if (VITE_MODE) {
      // console.clear();
      console.log("---------------------------------------------");
      console.log("progress-state:", newSessionInfo.data.progressState);
      console.log("client-info:", newSessionInfo.data.clientInfo);
      console.log("---------------------------------------------");
    }
  }
};

/** download the file (video | audio) */
export const downloadFile = (
  path: string,
  videoInfo: ytdl.videoInfo,
  format: ytdl.videoFormat,
  sessionID: string
): Promise<{ ok: boolean }> => {
  return new Promise((resolve) => {
    const writeStream = fs.createWriteStream(path);
    const type = format.hasVideo ? "Video" : "Audio";
    let failed = false;

    ytdl
      .downloadFromInfo(videoInfo, { format, agent })
      .on("error", (err) => {
        if (VITE_MODE) {
          console.log(
            `🟥 ${err.message} - ytdl failed to download ${type} file`
          );
        }
        failed = true;
        writeStream.end(); // stop the stream
        resolve({ ok: false });
      })
      .pipe(writeStream)
      .on("finish", () => {
        if (!failed) {
          writeStream.end(); // stop the stream
          updateSessionProgress("download", sessionID);
          if (VITE_MODE) {
            console.log(`⬇️  ${type} downloaded successfully`);
          }
          resolve({ ok: true });
        }
      })
      .on("error", (err) => {
        if (VITE_MODE) {
          console.log(`🟥 ${type} stream write failed -> (${err.message})`);
        }
        writeStream.end(); // stop the stream
        resolve({ ok: false });
      })
      .on("close", () => {
        if (VITE_MODE) {
          console.log(`🟩 ${type} stream closed`);
          console.log("--------------------------");
        }
      });
  });
};

// https://youtube.com/playlist?list=PLTo6svdhIL1cxS4ffGueFpVCF756ip-ab❌&si=06EBBYniIiqklSMr❌
/** remove the (si) part from the query string */
export const validatePlaylistURL = (url: string) => {
  const _URL = new URL(url);
  _URL.searchParams.delete("si");
  return _URL.href;
};
