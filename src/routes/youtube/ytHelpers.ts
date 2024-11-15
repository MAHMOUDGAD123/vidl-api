import ytdl from "@distube/ytdl-core";
import type { yt } from "../../types/youtube-types";
import fs, { existsSync } from "fs";
import path from "path";
import { tempFolderName } from "../../utils/constants";

const tempFolderPath = import.meta.env.DEV
  ? tempFolderName
  : `/${tempFolderName}`;

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

export const getMergingStateProgress = (
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

/** create a new folder with name as _sessionID_ at ( targetPath ) */
export const createTempFolder = (
  targetPath: string,
  sessionID: string
): { newPath: string; error: boolean } => {
  const newPath = path.resolve(targetPath, sessionID);

  try {
    if (existsSync(newPath)) {
      if (import.meta.env.DEV) {
        console.log(`[${newPath}] folder already exists ❓`);
      }
    } else {
      fs.mkdirSync(newPath, { recursive: true });
      if (import.meta.env.DEV) {
        console.log(`Session folder created successfully ✅ [${newPath}]`);
      }
    }
  } catch (err) {
    console.log((err as Error).message);
    console.log("failed to create folder ❌");
    return { newPath, error: true };
  }
  return { newPath, error: false };
};

/** used to save progress client info to json file */
export const saveInfoToJson = (sessionID: string, data: any) => {
  const filePath = path.resolve(tempFolderPath, sessionID, "info.json");

  try {
    fs.writeFileSync(filePath, JSON.stringify(data), {
      flag: "w",
      encoding: "utf-8",
    });

    if (import.meta.env.DEV) {
      console.log("Write client info succesfully to (info.json) ✅");
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.log(
        `ERROR: occurred while writing data to (info.json) ❓ -> ${
          (err as Error).message
        }`
      );
    }
  }
};

/** update the session progress info and prepare it for the client request */
export const updateSessionProgress = (
  stage: yt.Progress.ProgressStagesType,
  request: yt.Download.VideoDownloadRequestType,
  progressInfo: unknown
) => {
  const sessionReq = request as typeof request & yt.Progress.RequestSessionType;

  switch (stage) {
    case "download": {
      const { total, finish } =
        progressInfo as yt.Progress.DownloadProgressStateType;
      sessionReq.session.vidl.progressState.downloadProgressState = {
        total,
        finish,
      };
      const clientInfo: yt.Progress.ClientInfoType = {
        state: "progress",
        msg: `preparing files (${finish}/${total})`,
        progress: Math.floor((finish / total) * 100),
      };
      sessionReq.session.vidl.clientInfo = clientInfo;
      saveInfoToJson(sessionReq.sessionID, clientInfo);
      break;
    }

    case "convert": {
      const { size, timeMark } =
        progressInfo as yt.Progress.MergeProgressStateType;
      sessionReq.session.vidl.progressState.mergeProgressState = {
        size,
        timeMark,
      };
      const { duration } = sessionReq.session.vidl.progressState;
      const clientInfo: yt.Progress.ClientInfoType = {
        state: "progress",
        msg: `converting files (${getFileSize(size)})`,
        progress: getMergingStateProgress(timeMark, duration),
      };
      sessionReq.session.vidl.clientInfo = clientInfo;
      saveInfoToJson(sessionReq.sessionID, clientInfo);
      break;
    }

    case "duration": {
      sessionReq.session.vidl.progressState.duration = (
        progressInfo as { duration: string }
      ).duration;
      break;
    }
  }

  if (import.meta.env.DEV) {
    console.clear();
    console.log("---------------------------------------------");
    console.log("progress-state:", sessionReq.session.vidl.progressState);
    console.log("client-info:", sessionReq.session.vidl.clientInfo);
    console.log("---------------------------------------------");
  }
};

/** download the file (video | audio) */
export const downloadFile = (
  path: string,
  videoInfo: ytdl.videoInfo,
  format: ytdl.videoFormat,
  request: yt.Download.VideoDownloadRequestType
): Promise<{ ok: boolean }> => {
  return new Promise((resolve) => {
    const writeStream = fs.createWriteStream(path);
    const type = format.hasVideo ? "Video" : "Audio";
    const sessionReq = request as typeof request &
      yt.Progress.RequestSessionType;
    let failed = false;

    ytdl
      .downloadFromInfo(videoInfo, { format: format })
      .on("error", () => {
        if (import.meta.env.DEV) {
          console.log(`Error: ytdl failed to download ${type} file ❓`);
        }
        failed = true;
        writeStream.end(); // stop the stream
        resolve({ ok: false });
      })
      .pipe(writeStream)
      .on("finish", () => {
        if (!failed) {
          writeStream.end(); // stop the stream
          // only update the downloadProgressState (finish) property
          const currentDownloadProgress =
            sessionReq.session.vidl.progressState.downloadProgressState;
          const progressInfo: yt.Progress.DownloadProgressStateType = {
            ...currentDownloadProgress,
            finish: currentDownloadProgress.finish + 1,
          };
          updateSessionProgress("download", request, progressInfo);
          if (import.meta.env.DEV) {
            console.log(`${type} downloaded successfully ⬇️`);
          }
          resolve({ ok: true });
        }
      })
      .on("error", (err) => {
        if (import.meta.env.DEV) {
          console.log(`${type} write failed ❌ -> (${err.message})`);
        }
        writeStream.end(); // stop the stream
        resolve({ ok: false });
      })
      .on("close", () => {
        if (import.meta.env.DEV) {
          console.log(`${type} stream closed ✅`);
          console.log("--------------------------");
        }
      });
  });
};
