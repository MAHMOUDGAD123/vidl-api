var X = Object.defineProperty;
var K = (o, e, s) =>
  e in o
    ? X(o, e, { enumerable: !0, configurable: !0, writable: !0, value: s })
    : (o[e] = s);
var E = (o, e, s) => K(o, typeof e != "symbol" ? e + "" : e, s);
import b, { Router as j } from "express";
import Z from "cors";
import p from "@distube/ytdl-core";
import { YouTube as W } from "youtube-sr";
import l from "path";
import y, { unlink as R } from "fs";
import N from "fluent-ffmpeg";
import { path as Y } from "@ffmpeg-installer/ffmpeg";
import { v7 as M } from "uuid";
import $ from "cookie-parser";
const H = "tmp",
  z = [
    {
      name: "__Secure-1PAPISID",
      value: "HVjFUOMrZMkGxgez/AgbxjuP_JFP4nyYxV",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !1,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1773215260,
      storeId: "firefox-private",
      id: 1,
    },
    {
      name: "__Secure-1PSID",
      value:
        "g.a000tAgPzRTDuccyjTLEG4E32HRmP62Us8oGg5rp-PXONxQHXhmVmPrYH_BNPWN1KPEND3guRwACgYKAQ8SARASFQHGX2MiVbA1vYEd6CgZTVIaiAk0QRoVAUF8yKqO5DlonsJG8To22ViZaEQM0076",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1773215260,
      storeId: "firefox-private",
      id: 2,
    },
    {
      name: "__Secure-1PSIDCC",
      value:
        "AKEyXzWsh8hkY-z3JG9uK8wYmLiWO2Cc2Gig-0cbmb-68AV4lCAP1RLHTZkmWuYpoct55b1Q",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1770191265,
      storeId: "firefox-private",
      id: 3,
    },
    {
      name: "__Secure-1PSIDTS",
      value:
        "sidts-CjIBmiPuTf16uJIF6U_PjHnYL4IczY2OwI3LlideC3Q1k4ShJS9i_ehruFwQXcf91uh57xAA",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1770191260,
      storeId: "firefox-private",
      id: 4,
    },
    {
      name: "__Secure-3PAPISID",
      value: "HVjFUOMrZMkGxgez/AgbxjuP_JFP4nyYxV",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !1,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1773215260,
      storeId: "firefox-private",
      id: 5,
    },
    {
      name: "__Secure-3PSID",
      value:
        "g.a000tAgPzRTDuccyjTLEG4E32HRmP62Us8oGg5rp-PXONxQHXhmVLRXEX0qkP4JkrIHSOMhGCwACgYKAUoSARASFQHGX2MidOC2X65Yf0V00aRT_aZrNRoVAUF8yKqZaLVAjfqaUEGJJWGtvIu20076",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1773215260,
      storeId: "firefox-private",
      id: 6,
    },
    {
      name: "__Secure-3PSIDCC",
      value:
        "AKEyXzWlq7ViiBIhNs28ZxLQogqhOqFUW-6oa1n4L2tCSBVcO6Yh4XfRpGQOcYbcWYX98917aA",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1770191265,
      storeId: "firefox-private",
      id: 7,
    },
    {
      name: "__Secure-3PSIDTS",
      value:
        "sidts-CjIBmiPuTf16uJIF6U_PjHnYL4IczY2OwI3LlideC3Q1k4ShJS9i_ehruFwQXcf91uh57xAA",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1770191260,
      storeId: "firefox-private",
      id: 8,
    },
    {
      name: "__Secure-ROLLOUT_TOKEN",
      value: "COrgoumth7ikTxDz88i8w6mLAxjz88i8w6mLAw%3D%3D",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1754207234,
      storeId: "firefox-private",
      id: 9,
    },
    {
      name: "APISID",
      value: "mUn_gw2dR8-PjLM1/A4LgIpucDG_NbYbaC",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !1,
      httpOnly: !1,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1773215260,
      storeId: "firefox-private",
      id: 10,
    },
    {
      name: "GPS",
      value: "1",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1738657034,
      storeId: "firefox-private",
      id: 11,
    },
    {
      name: "HSID",
      value: "Ae1rgcI5onNAIiv2A",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !1,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1773215260,
      storeId: "firefox-private",
      id: 12,
    },
    {
      name: "LOGIN_INFO",
      value:
        "AFmmF2swRQIgbPu3k7WnIcCEmBFkmtsaNZCZm8b9ALC-6SViWcFj5qICIQC2shkKtwW9-8zlSvOeSRy4s4D646VLU8OeJGynp5hWCw:QUQ3MjNmeUFvTDE5UFpPek9oaGEyMlRhZW5rbE00TVBsNE1aZEJqNS1ueUY2WWU0SmJEN3Y0N2J6N3NyOGhneWNJY3BxTml4VC1nSkFoQms3OVg3SkpXRjR5anNXcGVxRXZQQjlHei1CeDFSQVZnamo2UElsR3pJSDBBanRQOGV1Tm10OUtVank1d2Q3bmFPWmdXTXhSd20zUURPUFUwSUN3",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1773215260,
      storeId: "firefox-private",
      id: 13,
    },
    {
      name: "PREF",
      value: "f4=4000000&f6=40000000&tz=Africa.Cairo",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !1,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1773215263,
      storeId: "firefox-private",
      id: 14,
    },
    {
      name: "SAPISID",
      value: "HVjFUOMrZMkGxgez/AgbxjuP_JFP4nyYxV",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !1,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1773215260,
      storeId: "firefox-private",
      id: 15,
    },
    {
      name: "SID",
      value:
        "g.a000tAgPzRTDuccyjTLEG4E32HRmP62Us8oGg5rp-PXONxQHXhmVmns9IBftyjxXEE4aaR9SkAACgYKASQSARASFQHGX2MitCEM2PRGnaW2hNvltLigJBoVAUF8yKpxPX503ODZ6ByO_K3u6PM90076",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !1,
      httpOnly: !1,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1773215260,
      storeId: "firefox-private",
      id: 16,
    },
    {
      name: "SIDCC",
      value:
        "AKEyXzUjfgFFAu87wvVNv1RWZWAXi_WtQhHjxZ4q65CI_I48RSmG2Ftj015HnnqY-rWwajA-cA",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !1,
      httpOnly: !1,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1770191265,
      storeId: "firefox-private",
      id: 17,
    },
    {
      name: "SSID",
      value: "AtfS1VgjVpVuVpslA",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1773215260,
      storeId: "firefox-private",
      id: 18,
    },
    {
      name: "ST-3opvp5",
      value:
        "session_logininfo=AFmmF2swRQIgbPu3k7WnIcCEmBFkmtsaNZCZm8b9ALC-6SViWcFj5qICIQC2shkKtwW9-8zlSvOeSRy4s4D646VLU8OeJGynp5hWCw%3AQUQ3MjNmeUFvTDE5UFpPek9oaGEyMlRhZW5rbE00TVBsNE1aZEJqNS1ueUY2WWU0SmJEN3Y0N2J6N3NyOGhneWNJY3BxTml4VC1nSkFoQms3OVg3SkpXRjR5anNXcGVxRXZQQjlHei1CeDFSQVZnamo2UElsR3pJSDBBanRQOGV1Tm10OUtVank1d2Q3bmFPWmdXTXhSd20zUURPUFUwSUN3",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !1,
      httpOnly: !1,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1738655267,
      storeId: "firefox-private",
      id: 19,
    },
    {
      name: "ST-l3hjtt",
      value:
        "session_logininfo=AFmmF2swRQIgbPu3k7WnIcCEmBFkmtsaNZCZm8b9ALC-6SViWcFj5qICIQC2shkKtwW9-8zlSvOeSRy4s4D646VLU8OeJGynp5hWCw%3AQUQ3MjNmeUFvTDE5UFpPek9oaGEyMlRhZW5rbE00TVBsNE1aZEJqNS1ueUY2WWU0SmJEN3Y0N2J6N3NyOGhneWNJY3BxTml4VC1nSkFoQms3OVg3SkpXRjR5anNXcGVxRXZQQjlHei1CeDFSQVZnamo2UElsR3pJSDBBanRQOGV1Tm10OUtVank1d2Q3bmFPWmdXTXhSd20zUURPUFUwSUN3",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !1,
      httpOnly: !1,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1738655267,
      storeId: "firefox-private",
      id: 20,
    },
    {
      name: "ST-tladcw",
      value:
        "session_logininfo=AFmmF2swRQIgbPu3k7WnIcCEmBFkmtsaNZCZm8b9ALC-6SViWcFj5qICIQC2shkKtwW9-8zlSvOeSRy4s4D646VLU8OeJGynp5hWCw%3AQUQ3MjNmeUFvTDE5UFpPek9oaGEyMlRhZW5rbE00TVBsNE1aZEJqNS1ueUY2WWU0SmJEN3Y0N2J6N3NyOGhneWNJY3BxTml4VC1nSkFoQms3OVg3SkpXRjR5anNXcGVxRXZQQjlHei1CeDFSQVZnamo2UElsR3pJSDBBanRQOGV1Tm10OUtVank1d2Q3bmFPWmdXTXhSd20zUURPUFUwSUN3",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !1,
      httpOnly: !1,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1738655267,
      storeId: "firefox-private",
      id: 21,
    },
    {
      name: "ST-xuwub9",
      value:
        "session_logininfo=AFmmF2swRQIgbPu3k7WnIcCEmBFkmtsaNZCZm8b9ALC-6SViWcFj5qICIQC2shkKtwW9-8zlSvOeSRy4s4D646VLU8OeJGynp5hWCw%3AQUQ3MjNmeUFvTDE5UFpPek9oaGEyMlRhZW5rbE00TVBsNE1aZEJqNS1ueUY2WWU0SmJEN3Y0N2J6N3NyOGhneWNJY3BxTml4VC1nSkFoQms3OVg3SkpXRjR5anNXcGVxRXZQQjlHei1CeDFSQVZnamo2UElsR3pJSDBBanRQOGV1Tm10OUtVank1d2Q3bmFPWmdXTXhSd20zUURPUFUwSUN3",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !1,
      httpOnly: !1,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1738655269,
      storeId: "firefox-private",
      id: 22,
    },
    {
      name: "VISITOR_INFO1_LIVE",
      value: "_52riHsiYpw",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1754207260,
      storeId: "firefox-private",
      id: 23,
    },
    {
      name: "VISITOR_PRIVACY_METADATA",
      value: "CgJFRxIEGgAgRA%3D%3D",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !1,
      firstPartyDomain: "",
      partitionKey: null,
      expirationDate: 1754207260,
      storeId: "firefox-private",
      id: 24,
    },
    {
      name: "YSC",
      value: "g8M2h2Jahfo",
      domain: ".youtube.com",
      hostOnly: !1,
      path: "/",
      secure: !0,
      httpOnly: !0,
      sameSite: "no_restriction",
      session: !0,
      firstPartyDomain: "",
      partitionKey: null,
      storeId: "firefox-private",
      id: 25,
    },
  ],
  O = p.createAgent(z),
  q = {
    origin: [/https:\/\/vidl-client.vercel.app/, /http:\/\/localhost:\d{4}/],
    credentials: !0,
    methods: ["GET", "POST"],
    optionsSuccessStatus: 200,
  };
class D {
  constructor(e) {
    E(this, "$sessionInfo", {
      sessionID: "",
      clientInfo: { state: "fetch", msg: "fetching info", progress: 0 },
      progressState: {
        duration: "",
        downloadProgressState: { total: 0, finish: 0 },
        convertProgressState: { size: 0, timeMark: "" },
      },
    });
    typeof e == "string"
      ? (this.$sessionInfo.sessionID = e)
      : (this.$sessionInfo = e);
  }
  set data(e) {
    this.$sessionInfo = e;
  }
  get data() {
    return this.$sessionInfo;
  }
  set _clientInfo(e) {
    this.$sessionInfo.clientInfo = e;
  }
  get _clientInfo() {
    return this.$sessionInfo.clientInfo;
  }
  set __duration(e) {
    this.$sessionInfo.progressState.duration = e;
  }
  get __duration() {
    return this.$sessionInfo.progressState.duration;
  }
  set __downloadProgressState(e) {
    this.$sessionInfo.progressState.downloadProgressState = e;
  }
  get __downloadProgressState() {
    return this.$sessionInfo.progressState.downloadProgressState;
  }
  set ___total(e) {
    this.$sessionInfo.progressState.downloadProgressState.total = e;
  }
  get ___total() {
    return this.$sessionInfo.progressState.downloadProgressState.total;
  }
  set ___finish(e) {
    this.$sessionInfo.progressState.downloadProgressState.finish = e;
  }
  get ___finish() {
    return this.$sessionInfo.progressState.downloadProgressState.finish;
  }
  set __convertProgressState(e) {
    this.$sessionInfo.progressState.convertProgressState = e;
  }
  get __convertProgressState() {
    return this.$sessionInfo.progressState.convertProgressState;
  }
}
const G = (o) => {
    const e = new Set();
    return p.filterFormats(o, (s) => {
      var c, h, S, f;
      const t =
          (c = s == null ? void 0 : s.qualityLabel) == null
            ? void 0
            : c.startsWith("4320p"),
        n =
          ((h = s == null ? void 0 : s.qualityLabel) == null
            ? void 0
            : h.startsWith("2160p")) ||
          ((S = s == null ? void 0 : s.qualityLabel) == null
            ? void 0
            : S.startsWith("1440p")),
        a =
          s.hasVideo &&
          !s.hasAudio &&
          !URL.parse(s.url).hostname.includes("manifest") &&
          (t || n || (!t && !n)),
        r = (f = s.qualityLabel) == null ? void 0 : f.split("p")[0],
        i = e.has(r);
      return a && !i ? (e.add(r), !0) : !1;
    });
  },
  k = (o) => {
    const e = new Set();
    return p
      .filterFormats(o, (s) => {
        const t = s.hasAudio && !s.hasVideo,
          n = s.audioBitrate,
          a = e.has(n);
        return t && !a ? (e.add(n), !0) : !1;
      })
      .sort((s, t) => t.audioBitrate - s.audioBitrate);
  },
  ee = (o, e) => {
    const s = new Map([
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
    let t = 0;
    if (
      ((t = o.findIndex((r) => r.qualityLabel.startsWith(`${e}p`))), t !== -1)
    )
      return o[t];
    const n = s.get(e).up;
    if (n !== null) {
      for (const r of n)
        if (
          ((t = o.findIndex((i) => i.qualityLabel.startsWith(`${r}`))),
          t !== -1)
        )
          return o[t];
    }
    const a = s.get(e).down;
    if (a !== null) {
      for (const r of a)
        if (
          ((t = o.findIndex((i) => i.qualityLabel.startsWith(`${r}`))),
          t !== -1)
        )
          return o[t];
    }
    return null;
  },
  te = (o, e) => {
    const s = new Map([
      [160, { up: null, down: [128, 64, 48] }],
      [128, { up: [160], down: [64, 48] }],
      [64, { up: [128, 160], down: [48] }],
      [48, { up: [64, 128, 160], down: null }],
    ]);
    let t = 0;
    if (((t = o.findIndex((r) => r.audioBitrate === e)), t !== -1)) return o[t];
    const n = s.get(e).up;
    if (n !== null) {
      for (const r of n)
        if (((t = o.findIndex((i) => i.audioBitrate === r)), t !== -1))
          return o[t];
    }
    const a = s.get(e).down;
    if (a !== null) {
      for (const r of a)
        if (((t = o.findIndex((i) => i.audioBitrate === r)), t !== -1))
          return o[t];
    }
    return null;
  },
  T = (o) => {
    const [e, s, t] = o.split(":");
    return +e * 60 * 60 + +s * 60 + +t;
  },
  se = (o, e) => Math.floor((T(o) / T(e)) * 100),
  oe = (o) => {
    const t = o / 1048576,
      n = (o % 1048576) / 1024;
    return t >>> 0
      ? t.toFixed(2) + " gb"
      : n >>> 0
      ? n.toFixed(2) + " mb"
      : o + " kb";
  },
  ne = (o) => {
    const e = l.resolve(I, o);
    try {
      if (y.existsSync(e)) throw new Error(`[${e}] folder already exists`);
      y.mkdirSync(e, { recursive: !0 }),
        console.log(`🟩 Session folder created successfully [${e}]`);
    } catch {
      return { sessionFolderPath: e, error: !0 };
    }
    return { sessionFolderPath: e, error: !1 };
  },
  w = (o, e) => {
    const s = l.resolve(I, o, "info.json");
    try {
      y.writeFileSync(s, JSON.stringify(e), { flag: "w", encoding: "utf-8" });
    } catch (t) {
      return (
        console.log(
          `🟥 ERROR: occurred while writing data to (info.json) -> ${t.message}`
        ),
        !1
      );
    }
    return !0;
  },
  x = (o) => {
    try {
      const e = l.resolve(I, o, "info.json");
      return {
        success: !0,
        sessionInfo: JSON.parse(y.readFileSync(e, { encoding: "utf-8" })),
      };
    } catch (e) {
      return (
        console.log(`🟥 Failed to read session info file -> ${e.message}`),
        { success: !1 }
      );
    }
  },
  C = (o) => {
    const e = l.resolve(I, o);
    y.existsSync(e) && y.rm(e, { recursive: !0, force: !0 }, (s) => {});
  },
  P = (o, e, s) => {
    const t = x(e);
    if (t.success) {
      const n = new D(t.sessionInfo);
      switch (o) {
        case "download": {
          n.___finish = n.___finish + 1;
          const { total: a, finish: r } = n.__downloadProgressState;
          n._clientInfo = {
            state: "progress",
            msg: `preparing...(${r}/${a})`,
            progress: Math.floor((r / a) * 100),
          };
          break;
        }
        case "convert": {
          const { size: a, timeMark: r } = s;
          (n.__convertProgressState = { size: a, timeMark: r }),
            (n._clientInfo = {
              state: "progress",
              msg: `converting...(${oe(a)})`,
              progress: se(r, n.__duration),
            });
          break;
        }
        case "duration": {
          n.__duration = s.duration;
          break;
        }
      }
      w(e, n.data);
    }
  },
  V = (o, e, s, t) =>
    new Promise((n) => {
      const a = y.createWriteStream(o);
      s.hasVideo;
      let r = !1;
      p.downloadFromInfo(e, { format: s, agent: O })
        .on("error", (i) => {
          (r = !0), a.end(), n({ ok: !1 });
        })
        .pipe(a)
        .on("finish", () => {
          r || (a.end(), P("download", t), n({ ok: !0 }));
        })
        .on("error", (i) => {
          a.end(), n({ ok: !1 });
        })
        .on("close", () => {});
    }),
  ae = (o) => {
    const e = new URL(o);
    return e.searchParams.delete("si"), e.href;
  },
  I = `/${H}`;
N.setFfmpegPath(Y);
const re = async (o, e) => {
    const {
      body: { searchUrl: s },
    } = o;
    try {
      if (p.validateURL(s)) {
        const t = await p.getInfo(s, { agent: O }),
          n = t.formats,
          a = G(n),
          r = k(n);
        e.status(200).json({
          info: {
            videoFormats: a,
            audioFormats: r,
            videoDetails: t.videoDetails,
          },
          type: "video",
        });
      } else if (W.validate(ae(s), "PLAYLIST")) {
        const t = await W.getPlaylist(s, { fetchAll: !0, limit: 1 / 0 });
        e.status(200).json({
          info: {
            id: t.id,
            videoCount: t.videoCount,
            views: t.views,
            channel: t.channel,
            lastUpdate: t.lastUpdate,
            link: t.link,
            mix: t.mix,
            thumbnail: t.thumbnail,
            title: t.title,
            type: t.type,
            url: t.url,
            videos: t.videos,
            fake: t.fake,
          },
          type: "list",
        });
      } else
        e.status(200).json({ errMsg: "Invalid youtube url", type: "none" });
    } catch (t) {
      e.status(200).json({ errMsg: t.message, type: "none" });
    }
  },
  ie = async (o, e) => {
    const s = M(),
      t = new D(s),
      { error: n } = ne(s);
    if (n) e.sendStatus(206);
    else {
      if (!w(s, t.data)) {
        e.sendStatus(206);
        return;
      }
      e.status(200).json({ sessionID: s, progressInfo: t._clientInfo });
    }
  },
  le = async (o, e) => {
    const {
        body: { sessionID: s },
      } = o,
      { success: t, sessionInfo: n } = x(s);
    t
      ? e.status(200).json(n.clientInfo)
      : e
          .status(200)
          .json({ state: "error", msg: "session closed 💀", progress: 0 });
  },
  B = async (o, e, s) => {
    const {
        body: { sessionID: t },
      } = o,
      n = () => C(t);
    e.on("finish", n), s();
  },
  J = (o, e, s) => {
    const {
      body: { searchUrl: t },
    } = o;
    try {
      if (!p.validateURL(t)) {
        e.sendStatus(201);
        return;
      }
    } catch {
      e.sendStatus(201);
      return;
    }
    s();
  },
  L = (o, e, s) => {
    const {
      body: { sessionID: t },
    } = o;
    try {
      const n = l.resolve(I, t);
      if (!y.existsSync(n)) {
        e.sendStatus(202);
        return;
      }
    } catch {
      e.sendStatus(202);
      return;
    }
    s();
  },
  ue = async (o, e) => {
    const {
      body: { searchUrl: s, quality: t, sessionID: n },
    } = o;
    try {
      const a = await p.getInfo(s, { agent: O }),
        r = a.formats,
        i = ee(G(r), t);
      if (i === null) throw new Error("Video format doesn't exist");
      const c = k(r)[0];
      if (c === void 0) throw new Error("Audio format doesn't exist");
      const h = x(n);
      if (!h.success) {
        e.sendStatus(203);
        return;
      }
      const S = new D(h.sessionInfo);
      if (((S.___total = 2), !w(n, S.data))) {
        e.sendStatus(204);
        return;
      }
      const f = l.resolve(I, n),
        F = l.resolve(f, `video.${i.container}`),
        g = l.resolve(f, `audio.${c.container}`),
        [u, _] = await Promise.allSettled([V(F, a, i, n), V(g, a, c, n)]);
      if (!u.value.ok || !_.value.ok) {
        e.sendStatus(205);
        return;
      }
      const U = l.resolve(f, "output.mp4");
      N(F)
        .format("mp4")
        .audioBitrate(c.audioBitrate)
        .mergeAdd(g)
        .saveToFile(U)
        .on("start", () => {})
        .on("codecData", (d) => {
          const A = { duration: d.duration };
          P("duration", n, A);
        })
        .on("progress", ({ targetSize: d, timemark: A }) => {
          P("convert", n, { size: d, timeMark: A });
        })
        .on("end", () => {
          R(F, (d) => {}),
            R(g, (d) => {}),
            e.status(200).download(U, (d) => {
              if (d) {
                console.error(
                  `🟥 Failed to send file to the client -> ${d.message}`
                ),
                  C(n),
                  e.sendStatus(205);
                return;
              }
            });
        })
        .on("error", (d) => {
          e.sendStatus(205);
        });
    } catch {
      e.sendStatus(205);
    }
  },
  de = async (o, e) => {
    const {
      body: { searchUrl: s, quality: t, sessionID: n },
    } = o;
    try {
      const a = await p.getInfo(s, { agent: O }),
        r = a.formats,
        i = te(k(r), t);
      if (i === null) throw new Error("Audio format doesn't exist");
      const c = x(n);
      if (!c.success) {
        e.sendStatus(203);
        return;
      }
      const h = new D(c.sessionInfo);
      if (((h.___total = 1), !w(n, h.data))) {
        e.sendStatus(204);
        return;
      }
      const S = l.resolve(I, n),
        f = l.resolve(S, `audio.${i.container}`);
      if (!(await V(f, a, i, n)).ok) {
        e.sendStatus(205);
        return;
      }
      const g = l.resolve(S, "output.mp3");
      N(f)
        .format("mp3")
        .audioBitrate(i.audioBitrate)
        .saveToFile(g)
        .on("start", () => {})
        .on("codecData", (u) => {
          const _ = { duration: u.duration };
          P("duration", n, _);
        })
        .on("progress", ({ targetSize: u, timemark: _ }) => {
          P("convert", n, { size: u, timeMark: _ });
        })
        .on("end", () => {
          R(f, (u) => {}),
            e.status(200).download(g, (u) => {
              if (u) {
                console.error(
                  `🟥 Failed to send file to the client -> ${u.message}`
                ),
                  C(n),
                  e.sendStatus(205);
                return;
              }
            });
        })
        .on("error", (u) => {
          e.sendStatus(205);
        });
    } catch {
      e.sendStatus(205);
    }
  },
  v = j();
v.post("/smart-search", re);
v.post("/progress-info", le);
v.post("/video-download", J, L, B, ue);
v.post("/audio-download", J, L, B, de);
var ce = v;
const Q = j();
Q.get("/ods", ie);
Q.use("/youtube", ce);
var fe = Q;
const m = b();
m.use(b.json({ limit: "10mb" }));
m.use(b.urlencoded({ extended: !1, limit: "10mb" }));
m.use($());
m.use(Z(q));
m.use("/api", fe);
m.get("/", async (o, e) => {
  e.status(200).json({ msg: "Welcome to VIDL API" });
});
m.get("*", async (o, e) => {
  e.sendStatus(404);
});
{
  const o = process.env.PORT ?? 3e3;
  m.listen(o, () => {});
}
const De = m;
var we = m;
export { we as default, De as viteNodeApp };

exports.handler = async (event, context) => {
  try {
    // Handle CORS
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
    };

    // Handle OPTIONS request for CORS preflight
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers,
      };
    }

    // Your main API logic here
    return {
      statusCode: 200,
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "API is working!",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
