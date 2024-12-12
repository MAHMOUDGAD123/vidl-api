import { Response, Request } from "express";
import type ytdl from "@distube/ytdl-core";
import type { Playlist } from "youtube-sr";

export namespace yt {
  // -------------------------- Search Start --------------------------------
  namespace Search {
    type SearchRequestType = Request<any, any, { searchUrl: string }>;
    type VideoInfo = {
      videoFormats: ytdl.videoFormat[];
      audioFormats: ytdl.videoFormat[];
      videoDetails: ytdl.MoreVideoDetails;
    };

    // list info
    // ---------------------------------------------------------
    type Thumbnail = {
      id?: string;
      width: number;
      height: number;
      url?: string;
    };

    interface VideoStreamingData {
      expiresInSeconds: string;
      formats: VideoStreamingFormat[];
      adaptiveFormats: VideoStreamingFormatAdaptive[];
    }
    interface VideoStreamingFormat {
      itag: number;
      mimeType: string;
      bitrate: number;
      width: number;
      height: number;
      lastModified: string;
      contentLength: string;
      quality: string;
      fps: number;
      qualityLabel: string;
      projectionType: string;
      averageBitrate: number;
      audioQuality: string;
      approxDurationMs: string;
      audioSampleRate: string;
      audioChannels: number;
      signatureCipher: string;
    }
    interface VideoStreamingFormatAdaptive extends VideoStreamingFormat {
      initRange?: {
        start: string;
        end: string;
      };
      indexRange?: {
        start: string;
        end: string;
      };
      colorInfo?: {
        primaries: string;
        transferCharacteristics?: string;
        matrixCoefficients?: string;
      };
      highReplication?: boolean;
      loudnessDb?: number;
    }

    type MusicInfo = {
      title: string;
      cover: string;
      artist: string;
      album: string;
    };

    type Video = {
      id?: string;
      title?: string;
      description?: string;
      durationFormatted: string;
      duration: number;
      uploadedAt?: string;
      views: number;
      thumbnail?: Thumbnail;
      channel?: Channel;
      likes: number;
      dislikes: number;
      live: boolean;
      private: boolean;
      tags: string[];
      nsfw: boolean;
      shorts: boolean;
      unlisted: boolean;
      music: MusicInfo[];
      streamingData?: VideoStreamingData | null;
      url: string;
      shorts_url?: string;
      type: "video";
      ratings?: {
        likes: 0;
        dislikes: 0;
      };
    };

    type ListInfo = {
      id?: string;
      videoCount?: number;
      views?: number;
      channel?: Channel;
      lastUpdate?: string;
      link?: string;
      mix?: boolean;
      fake: boolean;
      thumbnail?: Thumbnail;
      title?: string;
      type?: string;
      url?: string;
      videos: Video[];
    };
    // ---------------------------------------------------------

    type SearchResponseType = Response<{
      info?: ListInfo | VideoInfo;
      type: "video" | "list" | "none";
      errMsg?: string;
    }>;
  }
  // --------------------------- Search End ---------------------------------

  // -------------------------- Download Start -----------------------------------
  namespace Download {
    // video | audio
    type VideoDownloadRequestData = {
      searchUrl: string;
      quality: number;
      sessionID: string;
    };
    type VideoDownloadRequestType = Request<any, any, VideoDownloadRequestData>;

    // list (not used ❌)
    // ----------------------------------------------------
    type ListDownloadRequestData = { listUrl: string };
    type ListDownloadRequestType = Request<any, any, ListDownloadRequestData>;
    // ----------------------------------------------------
  }
  // --------------------------- Download End ------------------------------------

  // ---------------------------- Progress Start ----------------------------------
  namespace Progress {
    type OpenDownloadSessionResponse = {
      sessionID: string;
      progressInfo: ClientInfoType;
    };

    type ProgressStagesType = "download" | "convert" | "duration";
    type ClientInfoStateType = "fetch" | "progress" | "error";

    type ClientInfoType = {
      state: ClientInfoStateType; // progress state
      msg: string;
      progress: number;
    };

    type DownloadProgressStateType = {
      total: number; // total files to download
      finish: number; // downloaded files
    };
    type ConvertProgressStateType = {
      size: number; // current ffmpeg progress (targetsize)
      timeMark: string; // current ffmpeg progress (timemark)
    };
    type ProgressStateType = {
      duration: string; // file total time (hh:mm:ss.xx)
      downloadProgressState: DownloadProgressStateType;
      convertProgressState: ConvertProgressStateType;
    };

    type SessionInfoType = {
      sessionID: string;
      clientInfo: ClientInfoType;
      progressState: ProgressStateType;
    };
  }
  // ----------------------------- Progress End -----------------------------------

  type VideoQualities = 4320 | 2160 | 1440 | 1080 | 720 | 480 | 360 | 240 | 144;
  type AudioQualities = 160 | 128 | 64 | 48;

  type QualityLabel =
    | "144p"
    | "144p 15fps"
    | "144p60 HDR"
    | "240p"
    | "240p60 HDR"
    | "270p"
    | "360p"
    | "360p60 HDR"
    | "480p"
    | "480p60 HDR"
    | "720p"
    | "720p60"
    | "720p60 HDR"
    | "1080p"
    | "1080p60"
    | "1080p60 HDR"
    | "1440p"
    | "1440p60"
    | "1440p60 HDR"
    | "2160p"
    | "2160p60"
    | "2160p60 HDR"
    | "4320p"
    | "4320p60";

  type PromiseAllSettledType = {
    status: "fulfilled" | "rejected";
    value: { ok: boolean };
  };
}
