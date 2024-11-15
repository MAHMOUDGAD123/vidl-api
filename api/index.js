import express, { Router } from 'express';
import cors from 'cors';
import ytdl from '@distube/ytdl-core';
import { YouTube } from 'youtube-sr';
import path from 'path';
import fs, { existsSync, rm, unlink } from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import { path as path$1 } from '@ffmpeg-installer/ffmpeg';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const tempFolderName="tmp";const agent=ytdl.createAgent([{name:"__Secure-1PAPISID",value:"DM8A6ZkojiCKQegw/A44EsjH9kelop8gCj",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!1,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6945b1a8,storeId:"firefox-private",id:1},{name:"__Secure-1PSID",value:"g.a000qQgPzUgcj1c4Kx2GgkKstHLSXjoywBSQDP-EFt-vXuA4jnbJSY3xftz7RTyNthHqvHW4tQACgYKAYASARASFQHGX2MiiLgYlGkV-L92DyiR72RzwhoVAUF8yKppzGMn0bgt7qouGQ3vEhTi0076",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6945b1a8,storeId:"firefox-private",id:2},{name:"__Secure-1PSIDCC",value:"AKEyXzVl8RD24XQCLbNbS7c-49ht5qHgMnqy28kP_qOn8IakejiXXkpaulRq2m8HLus6VfPGfA",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x69178d2e,storeId:"firefox-private",id:3},{name:"__Secure-1PSIDTS",value:"sidts-CjEBQT4rX3Z7Ld0Uc0QWmtlt9sueFOPDyOhjtqgTUKbtfCRrAfiVivielePioGYg99RmEAA",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x69178d28,storeId:"firefox-private",id:4},{name:"__Secure-3PAPISID",value:"DM8A6ZkojiCKQegw/A44EsjH9kelop8gCj",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!1,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6945b1a8,storeId:"firefox-private",id:5},{name:"__Secure-3PSID",value:"g.a000qQgPzUgcj1c4Kx2GgkKstHLSXjoywBSQDP-EFt-vXuA4jnbJC9PZdyXgTRuXeyBHwUrYYAACgYKATUSARASFQHGX2MiVxeJz2tJfjwqI7pRAO7YbxoVAUF8yKoXYh9pkuMXFRrXj73MPYiG0076",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6945b1a8,storeId:"firefox-private",id:6},{name:"__Secure-3PSIDCC",value:"AKEyXzUP6Sqnwyh3gmYNZxf9xyiwNHJrMFyp_tA_N_40lgdzzqBX0Y6dSJDl_mT5AwcWgG58",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x69178d2e,storeId:"firefox-private",id:7},{name:"__Secure-3PSIDTS",value:"sidts-CjEBQT4rX3Z7Ld0Uc0QWmtlt9sueFOPDyOhjtqgTUKbtfCRrAfiVivielePioGYg99RmEAA",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x69178d28,storeId:"firefox-private",id:8},{name:"__Secure-ROLLOUT_TOKEN",value:"CLn9jrTky-XMpwEQsrH-u8_ciQMYsrH-u8_ciQM%3D",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6823a5f4,storeId:"firefox-private",id:9},{name:"APISID",value:"z9wZ8pZvmAHM7QN5/AMroO26j2ydXyaHrU",domain:".youtube.com",hostOnly:!1,path:"/",secure:!1,httpOnly:!1,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6945b1a8,storeId:"firefox-private",id:10},{name:"GPS",value:"1",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x67365efc,storeId:"firefox-private",id:11},{name:"HSID",value:"A1tl0A61vgsHllhP6",domain:".youtube.com",hostOnly:!1,path:"/",secure:!1,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6945b1a8,storeId:"firefox-private",id:12},{name:"LOGIN_INFO",value:"AFmmF2swRgIhAKOaRWvYXyfmQNp6iUSf6kg-Ws-tC6Azg2ChN6uJUkg1AiEA-q1wGDV3oEPW97JGhoLawNAJBSEwCiSSj1l4MxoFUBs:QUQ3MjNmeW9ka3JMM2YxaHZBNG5ZMk1kTzlUTV9IeXRVRjRlNGxuTm1JY2drdkxJTDNVR0tyS1Z1WFZsZW9EYzlwQ005NlJDMHpSODBLZTdkU3RTWU5MV1dxaXBOa1NhX3o1azhaUkN4THo4MXZTcVFzdFM4SXV0TFJILWw4eEI2ZXNyUlV5UWNhSERBS2VJSW5ZZEdwOFVLbVU0TTRMVkx3",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6945b1a8,storeId:"firefox-private",id:13},{name:"PREF",value:"f4=4000000&f6=40000000&tz=Africa.Cairo",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!1,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6945b1ab,storeId:"firefox-private",id:14},{name:"SAPISID",value:"DM8A6ZkojiCKQegw/A44EsjH9kelop8gCj",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!1,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6945b1a8,storeId:"firefox-private",id:15},{name:"SID",value:"g.a000qQgPzUgcj1c4Kx2GgkKstHLSXjoywBSQDP-EFt-vXuA4jnbJxZ9XxrNy9K8O3znBlCGHVQACgYKAQkSARASFQHGX2MifopZRUj_UB3cmG6MgIv1_xoVAUF8yKqcUzFQ9MpQAOc9g0PjATBw0076",domain:".youtube.com",hostOnly:!1,path:"/",secure:!1,httpOnly:!1,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6945b1a8,storeId:"firefox-private",id:16},{name:"SIDCC",value:"AKEyXzUcvyQKcOfSV-_vYPLxdFDIdqHkBN7J7YoHb5mpqOMi9FIz-nM4Kw4yaNeTRhKChP2Lfg",domain:".youtube.com",hostOnly:!1,path:"/",secure:!1,httpOnly:!1,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x69178d2e,storeId:"firefox-private",id:17},{name:"SSID",value:"Adn4G90CbioK_G80J",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6945b1a8,storeId:"firefox-private",id:18},{name:"ST-3opvp5",value:"session_logininfo=AFmmF2swRgIhAKOaRWvYXyfmQNp6iUSf6kg-Ws-tC6Azg2ChN6uJUkg1AiEA-q1wGDV3oEPW97JGhoLawNAJBSEwCiSSj1l4MxoFUBs%3AQUQ3MjNmeW9ka3JMM2YxaHZBNG5ZMk1kTzlUTV9IeXRVRjRlNGxuTm1JY2drdkxJTDNVR0tyS1Z1WFZsZW9EYzlwQ005NlJDMHpSODBLZTdkU3RTWU5MV1dxaXBOa1NhX3o1azhaUkN4THo4MXZTcVFzdFM4SXV0TFJILWw4eEI2ZXNyUlV5UWNhSERBS2VJSW5ZZEdwOFVLbVU0TTRMVkx3",domain:".youtube.com",hostOnly:!1,path:"/",secure:!1,httpOnly:!1,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x673659b3,storeId:"firefox-private",id:19},{name:"ST-l3hjtt",value:"session_logininfo=AFmmF2swRgIhAKOaRWvYXyfmQNp6iUSf6kg-Ws-tC6Azg2ChN6uJUkg1AiEA-q1wGDV3oEPW97JGhoLawNAJBSEwCiSSj1l4MxoFUBs%3AQUQ3MjNmeW9ka3JMM2YxaHZBNG5ZMk1kTzlUTV9IeXRVRjRlNGxuTm1JY2drdkxJTDNVR0tyS1Z1WFZsZW9EYzlwQ005NlJDMHpSODBLZTdkU3RTWU5MV1dxaXBOa1NhX3o1azhaUkN4THo4MXZTcVFzdFM4SXV0TFJILWw4eEI2ZXNyUlV5UWNhSERBS2VJSW5ZZEdwOFVLbVU0TTRMVkx3",domain:".youtube.com",hostOnly:!1,path:"/",secure:!1,httpOnly:!1,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x673659af,storeId:"firefox-private",id:20},{name:"ST-tladcw",value:"session_logininfo=AFmmF2swRgIhAKOaRWvYXyfmQNp6iUSf6kg-Ws-tC6Azg2ChN6uJUkg1AiEA-q1wGDV3oEPW97JGhoLawNAJBSEwCiSSj1l4MxoFUBs%3AQUQ3MjNmeW9ka3JMM2YxaHZBNG5ZMk1kTzlUTV9IeXRVRjRlNGxuTm1JY2drdkxJTDNVR0tyS1Z1WFZsZW9EYzlwQ005NlJDMHpSODBLZTdkU3RTWU5MV1dxaXBOa1NhX3o1azhaUkN4THo4MXZTcVFzdFM4SXV0TFJILWw4eEI2ZXNyUlV5UWNhSERBS2VJSW5ZZEdwOFVLbVU0TTRMVkx3",domain:".youtube.com",hostOnly:!1,path:"/",secure:!1,httpOnly:!1,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x673659af,storeId:"firefox-private",id:21},{name:"ST-xuwub9",value:"session_logininfo=AFmmF2swRgIhAKOaRWvYXyfmQNp6iUSf6kg-Ws-tC6Azg2ChN6uJUkg1AiEA-q1wGDV3oEPW97JGhoLawNAJBSEwCiSSj1l4MxoFUBs%3AQUQ3MjNmeW9ka3JMM2YxaHZBNG5ZMk1kTzlUTV9IeXRVRjRlNGxuTm1JY2drdkxJTDNVR0tyS1Z1WFZsZW9EYzlwQ005NlJDMHpSODBLZTdkU3RTWU5MV1dxaXBOa1NhX3o1azhaUkN4THo4MXZTcVFzdFM4SXV0TFJILWw4eEI2ZXNyUlV5UWNhSERBS2VJSW5ZZEdwOFVLbVU0TTRMVkx3",domain:".youtube.com",hostOnly:!1,path:"/",secure:!1,httpOnly:!1,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x673659b0,storeId:"firefox-private",id:22},{name:"VISITOR_INFO1_LIVE",value:"lynHgsfiqWU",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6823a5f4,storeId:"firefox-private",id:23},{name:"VISITOR_PRIVACY_METADATA",value:"CgJFRxIEGgAgNA%3D%3D",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!1,firstPartyDomain:"",partitionKey:null,expirationDate:0x6823a5f4,storeId:"firefox-private",id:24},{name:"YSC",value:"VKyh3hL_Ogc",domain:".youtube.com",hostOnly:!1,path:"/",secure:!0,httpOnly:!0,sameSite:"no_restriction",session:!0,firstPartyDomain:"",partitionKey:null,storeId:"firefox-private",id:25}]);const CORS_OPTIONS={origin:!0,credentials:!0,methods:["GET","POST"],optionsSuccessStatus:200};const SESSION_CONFIG={secret:"VIDL_SESSION",saveUninitialized:!1,resave:!1,name:"vidl_connected",cookie:{maxAge:6e5}};

let tempFolderPath$1 = `/${tempFolderName}`;
const getVideoFormats = (infoFormats) => {
  let done_set = /* @__PURE__ */ new Set();
  return ytdl.filterFormats(infoFormats, (filter) => {
    let is8k = filter?.qualityLabel?.startsWith("4320p"), is2kOr4k = filter?.qualityLabel?.startsWith("2160p") || filter?.qualityLabel?.startsWith("1440p"), matches = filter.hasVideo && !URL.parse(filter.url).hostname.includes("manifest") && (is8k || is2kOr4k || !is8k && !is2kOr4k), quality = filter.qualityLabel?.split("p")[0], isAdded = done_set.has(quality);
    return !!matches && !isAdded && (done_set.add(quality), true);
  });
};
const getAudioFormats = (infoFormats) => {
  let done_set = /* @__PURE__ */ new Set();
  return ytdl.filterFormats(infoFormats, (filter) => {
    let matches = filter.hasAudio, key = filter.audioBitrate, isAdded = done_set.has(key);
    return !!matches && !isAdded && (done_set.add(key), true);
  }).sort((a, b) => b.audioBitrate - a.audioBitrate);
};
const getVideoFormat_safe = (formats, quality) => {
  let safe_map = /* @__PURE__ */ new Map([[4320, { up: null, down: [2160, 1440, 1080, 720, 480, 360, 240, 144] }], [2160, { up: [4320], down: [1440, 1080, 720, 480, 360, 240, 144] }], [1440, { up: [2160, 4320], down: [1080, 720, 480, 360, 240, 144] }], [1080, { up: [1440, 2160, 4320], down: [720, 480, 360, 240, 144] }], [720, { up: [1080, 1440, 2160, 4320], down: [480, 360, 240, 144] }], [480, { up: [720, 1080, 1440, 2160, 4320], down: [360, 240, 144] }], [360, { up: [480, 720, 1080, 1440, 2160, 4320], down: [240, 144] }], [240, { up: [360, 480, 720, 1080, 1440, 2160, 4320], down: [144] }], [144, { up: [240, 360, 480, 720, 1080, 1440, 2160, 4320], down: null }]]), formatIndex = 0;
  if (-1 !== (formatIndex = formats.findIndex((format) => format.qualityLabel.startsWith(`${quality}p`)))) return formats[formatIndex];
  let upSearch = safe_map.get(quality).up;
  if (null !== upSearch) {
    for (let Q of upSearch) if (-1 !== (formatIndex = formats.findIndex((format) => format.qualityLabel.startsWith(`${Q}`)))) return formats[formatIndex];
  }
  let downSearch = safe_map.get(quality).down;
  if (null !== downSearch) {
    for (let Q of downSearch) if (-1 !== (formatIndex = formats.findIndex((format) => format.qualityLabel.startsWith(`${Q}`)))) return formats[formatIndex];
  }
  return null;
};
const getAudioFormat_safe = (formats, quality) => {
  let safe_map = /* @__PURE__ */ new Map([[160, { up: null, down: [128, 64, 48] }], [128, { up: [160], down: [64, 48] }], [64, { up: [128, 160], down: [48] }], [48, { up: [64, 128, 160], down: null }]]), formatIndex = 0;
  if (-1 !== (formatIndex = formats.findIndex((format) => format.audioBitrate === quality))) return formats[formatIndex];
  let upSearch = safe_map.get(quality).up;
  if (null !== upSearch) {
    for (let Q of upSearch) if (-1 !== (formatIndex = formats.findIndex((format) => format.audioBitrate === Q))) return formats[formatIndex];
  }
  let downSearch = safe_map.get(quality).down;
  if (null !== downSearch) {
    for (let Q of downSearch) if (-1 !== (formatIndex = formats.findIndex((format) => format.audioBitrate === Q))) return formats[formatIndex];
  }
  return null;
};
const videoDurationInSeconds = (duration) => {
  let [hr, min, sec] = duration.split(":");
  return 3600 * +hr + 60 * +min + +sec;
};
const getMergingStateProgress = (timeMark, totalDuration) => Math.floor(videoDurationInSeconds(timeMark) / videoDurationInSeconds(totalDuration) * 100);
const getFileSize = (sizeInKB) => {
  let GB = sizeInKB / 1048576, MB = sizeInKB % 1048576 / 1024;
  return GB >>> 0 ? GB.toFixed(2) + " gb" : MB >>> 0 ? MB.toFixed(2) + " mb" : sizeInKB + " kb";
};
const createTempFolder = (targetPath, sessionID) => {
  let newPath = path.resolve(targetPath, sessionID);
  try {
    existsSync(newPath) ? false : (fs.mkdirSync(newPath, { recursive: true }), false);
  } catch (err) {
    return console.log(err.message), console.log("failed to create folder ❌"), { newPath, error: true };
  }
  return { newPath, error: false };
};
const saveInfoToJson = (sessionID, data) => {
  let filePath = path.resolve(tempFolderPath$1, sessionID, "info.json");
  try {
    fs.writeFileSync(filePath, JSON.stringify(data), { flag: "w", encoding: "utf-8" }), false;
  } catch (err) {
  }
};
const updateSessionProgress = (stage, request, progressInfo) => {
  switch (stage) {
    case "download": {
      let { total, finish } = progressInfo;
      request.session.vidl.progressState.downloadProgressState = { total, finish };
      let clientInfo = { state: "progress", msg: `preparing files (${finish}/${total})`, progress: Math.floor(finish / total * 100) };
      request.session.vidl.clientInfo = clientInfo, saveInfoToJson(request.sessionID, clientInfo);
      break;
    }
    case "convert": {
      let { size, timeMark } = progressInfo;
      request.session.vidl.progressState.mergeProgressState = { size, timeMark };
      let { duration } = request.session.vidl.progressState, clientInfo = { state: "progress", msg: `converting files (${getFileSize(size)})`, progress: getMergingStateProgress(timeMark, duration) };
      request.session.vidl.clientInfo = clientInfo, saveInfoToJson(request.sessionID, clientInfo);
      break;
    }
    case "duration":
      request.session.vidl.progressState.duration = progressInfo.duration;
  }
};
const downloadFile = (path2, videoInfo, format, request) => new Promise((resolve) => {
  let writeStream = fs.createWriteStream(path2); format.hasVideo ? "Video" : "Audio"; let failed = false;
  ytdl.downloadFromInfo(videoInfo, { format }).on("error", () => {
    failed = true, writeStream.end(), resolve({ ok: false });
  }).pipe(writeStream).on("finish", () => {
    if (!failed) {
      writeStream.end();
      let currentDownloadProgress = request.session.vidl.progressState.downloadProgressState, progressInfo = { ...currentDownloadProgress, finish: currentDownloadProgress.finish + 1 };
      updateSessionProgress("download", request, progressInfo), resolve({ ok: true });
    }
  }).on("error", (err) => {
    writeStream.end(), resolve({ ok: false });
  }).on("close", () => {
  });
});

let tempFolderPath = `/${tempFolderName}`;
ffmpeg.setFfmpegPath(path$1);
const ytSmartSearchHandler = async (request, response) => {
  let { body: { searchUrl } } = request;
  try {
    if (ytdl.validateURL(searchUrl)) {
      let videoInfo = await ytdl.getInfo(searchUrl, { playerClients: ["IOS"], agent }), formats = videoInfo.formats, filteredVideoFormats = getVideoFormats(formats), filteredAudioFormats = getAudioFormats(formats);
      response.status(200).json({ info: { videoFormats: filteredVideoFormats, audioFormats: filteredAudioFormats, videoDetails: videoInfo.videoDetails }, type: "video" });
    } else if (YouTube.validate(searchUrl, "PLAYLIST")) {
      let listInfo = await YouTube.getPlaylist(searchUrl, { fetchAll: true, limit: 1 / 0 });
      response.status(200).json({ info: { id: listInfo.id, videoCount: listInfo.videoCount, views: listInfo.views, channel: listInfo.channel, lastUpdate: listInfo.lastUpdate, link: listInfo.link, mix: listInfo.mix, thumbnail: listInfo.thumbnail, title: listInfo.title, type: listInfo.type, url: listInfo.url, videos: listInfo.videos, fake: listInfo.fake }, type: "list" });
    } else response.status(200).json({ errMsg: "Invalid youtube url", type: "none" });
  } catch (err) {
    response.status(200).json({ errMsg: err.message, type: "none" });
  }
};
const openDownloadSessionHandler = async (request, response) => {
  request.session.vidl ? false : (request.session.vidl = { connected: true, clientInfo: { state: "fetch", msg: "fetching info", progress: 0 }, progressState: { duration: "", downloadProgressState: { total: 0, finish: 0 }, mergeProgressState: { size: 0, timeMark: "" } } }, false);
  let { error } = createTempFolder(tempFolderPath, request.sessionID);
  if (error) response.sendStatus(204);
  else {
    let clientInfo = request.session.vidl.clientInfo;
    saveInfoToJson(request.sessionID, clientInfo), response.status(200).json(clientInfo);
  }
};
const downloadSessionInfoLogger = async (request, _, next) => {
  next();
};
const getSessionProgressHandler = async (request, response) => {
  if (request.session.vidl) {
    let filePath = path.resolve(tempFolderPath, request.sessionID, "info.json");
    try {
      fs.readFile(filePath, { encoding: "utf-8" }, (err, data) => {
        err ? (false, response.status(200).json({ state: "fetch", msg: "fetching info", progress: 0 })) : (false, response.status(200).json(JSON.parse(data)));
      });
      return;
    } catch (err) {
    }
  }
  response.status(200).json({ state: "error", msg: "session closed 💀", progress: 0 });
};
const downloadSessionCleaner = async (request, response, next) => {
  response.on("finish", () => {
    let tempFolder = path.resolve(tempFolderPath, request.sessionID);
    request.session.destroy((err) => {
    }), rm(tempFolder, { recursive: true, force: true }, (err) => {
    });
  }), next();
};
const ytVideoDownloadHandler = async (request, response) => {
  let { body: { searchUrl, quality } } = request;
  try {
    if (!ytdl.validateURL(searchUrl)) {
      response.status(200).json({ errMsg: "Invalid youtube video url. Please try again", type: "none" });
      return;
    }
    let videoInfo = await ytdl.getInfo(searchUrl, { playerClients: ["IOS"], agent }), formats = videoInfo.formats, targetFormat = getVideoFormat_safe(getVideoFormats(formats), quality);
    if (null === targetFormat) throw false, "";
    let audioFormat = getAudioFormats(formats)[0];
    if (false, void 0 === audioFormat) throw false, "";
    request.session.vidl.progressState.downloadProgressState.total = 2;
    let tempFolder = path.resolve(tempFolderPath, request.sessionID), videoFilePath = path.resolve(tempFolder, `video.${targetFormat.container}`), audioFilePath = path.resolve(tempFolder, `audio.${audioFormat.container}`);
    let [videoFileStatus, audioFileStatus] = await Promise.allSettled([downloadFile(videoFilePath, videoInfo, targetFormat, request), downloadFile(audioFilePath, videoInfo, audioFormat, request)]);
    if (!videoFileStatus.value.ok || !audioFileStatus.value.ok) {
      response.sendStatus(205);
      return;
    }
    let outFilePath = path.resolve(tempFolder, "output.mp4");
    ffmpeg(videoFilePath).format("mp4").audioBitrate(audioFormat.audioBitrate).mergeAdd(audioFilePath).saveToFile(outFilePath).on("start", () => {
    }).on("codecData", (codecData) => {
      let progressInfo = { duration: codecData.duration };
      updateSessionProgress("duration", request, progressInfo);
    }).on("progress", ({ targetSize, timemark }) => {
      updateSessionProgress("convert", request, { size: targetSize, timeMark: timemark });
    }).on("end", () => {
      unlink(videoFilePath, (err) => {
      }), unlink(audioFilePath, (err) => {
      }), response.status(200).download(outFilePath, (err) => {
        err ? (false, response.sendStatus(204)) : false;
      });
    }).on("error", (err) => {
      false, response.sendStatus(204);
    });
  } catch (err) {
    response.sendStatus(204);
  }
};
const ytAudioDownloadHandler = async (request, response) => {
  let { body: { searchUrl, quality } } = request;
  try {
    if (!ytdl.validateURL(searchUrl)) {
      response.status(200).json({ errMsg: "Invalid youtube video url. Please try again", type: "none" });
      return;
    }
    let videoInfo = await ytdl.getInfo(searchUrl, { playerClients: ["IOS"], agent }), formats = videoInfo.formats, targetFormat = getAudioFormat_safe(getAudioFormats(formats), quality);
    if (null === targetFormat) throw false, "";
    request.session.vidl.progressState.downloadProgressState.total = 1;
    let tempFolder = path.resolve(tempFolderPath, request.sessionID), audioFilePath = path.resolve(tempFolder, `audio.${targetFormat.container}`);
    if (false, !(await downloadFile(audioFilePath, videoInfo, targetFormat, request)).ok) {
      response.sendStatus(204);
      return;
    }
    let outFilePath = path.resolve(tempFolder, "output.mp3");
    ffmpeg(audioFilePath).format("mp3").audioBitrate(targetFormat.audioBitrate).saveToFile(outFilePath).on("start", () => {
    }).on("codecData", (codecData) => {
      let progressInfo = { duration: codecData.duration };
      updateSessionProgress("duration", request, progressInfo);
    }).on("progress", ({ targetSize, timemark }) => {
      updateSessionProgress("convert", request, { size: targetSize, timeMark: timemark });
    }).on("end", () => {
      unlink(audioFilePath, (err) => {
      }), response.status(200).download(outFilePath, (err) => {
        if (err) {
          false, response.sendStatus(204);
          return;
        }
      });
    }).on("error", (err) => {
      false, response.sendStatus(204);
    });
  } catch (err) {
    response.sendStatus(204);
  }
};
const ytListDownloadHandler = async (request, response) => {
  let { body: { listUrl } } = request;
  response.status(200).json({ listUrl });
};

let router$1=Router();router$1.post("/smart-search",ytSmartSearchHandler),router$1.get("/progress-info",getSessionProgressHandler),router$1.use(downloadSessionInfoLogger),router$1.post("/video-download",downloadSessionCleaner,ytVideoDownloadHandler),router$1.post("/audio-download",downloadSessionCleaner,ytAudioDownloadHandler),router$1.post("/list-download",downloadSessionCleaner,ytListDownloadHandler);

let router=Router();router.get("/ods",openDownloadSessionHandler),router.use("/youtube",router$1);

let app = express();
if (app.use(express.json({ limit: "10mb" })), app.use(express.urlencoded({ extended: false, limit: "10mb" })), app.use(cookieParser()), app.use(session(SESSION_CONFIG)), app.use(cors(CORS_OPTIONS)), app.use("/api", router), app.get("/", async (_, response) => {
  response.status(200).json({ msg: "Welcome to VIDL API" });
}), app.get("*", async (_, response) => {
  response.sendStatus(404);
}), true) {
  console.log("Production Mode ✅");
  let PORT = process.env.PORT ?? 3e3;
  app.listen(PORT, () => {
    console.log(`Server Running On Port ${PORT}`);
  });
}
const viteNodeApp = app;

export { app as default, viteNodeApp };
