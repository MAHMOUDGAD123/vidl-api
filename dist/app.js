import _, { Router as R } from "express";
import A from "cors";
import m from "@distube/ytdl-core";
import { YouTube as M } from "youtube-sr";
import c from "path";
import y, { existsSync as $, rm as T, unlink as P } from "fs";
import B from "fluent-ffmpeg";
import { path as U } from "@ffmpeg-installer/ffmpeg";
import V from "cookie-parser";
import C from "express-session";
const j = (o) => {
    const s = new Set();
    return m.filterFormats(o, (t) => {
      var d, l, S, f;
      const e =
          (d = t == null ? void 0 : t.qualityLabel) == null
            ? void 0
            : d.startsWith("4320p"),
        n =
          ((l = t == null ? void 0 : t.qualityLabel) == null
            ? void 0
            : l.startsWith("2160p")) ||
          ((S = t == null ? void 0 : t.qualityLabel) == null
            ? void 0
            : S.startsWith("1440p")),
        a =
          t.hasVideo &&
          !URL.parse(t.url).hostname.includes("manifest") &&
          (e || n || (!e && !n)),
        r = (f = t.qualityLabel) == null ? void 0 : f.split("p")[0],
        i = s.has(r);
      return a && !i ? (s.add(r), !0) : !1;
    });
  },
  D = (o) => {
    const s = new Set();
    return m
      .filterFormats(o, (t) => {
        const e = t.hasAudio,
          n = t.audioBitrate,
          a = s.has(n);
        return e && !a ? (s.add(n), !0) : !1;
      })
      .sort((t, e) => e.audioBitrate - t.audioBitrate);
  },
  N = (o, s) => {
    const t = new Map([
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
    let e = 0;
    if (
      ((e = o.findIndex((r) => r.qualityLabel.startsWith(`${s}p`))), e !== -1)
    )
      return o[e];
    const n = t.get(s).up;
    if (n !== null) {
      for (const r of n)
        if (
          ((e = o.findIndex((i) => i.qualityLabel.startsWith(`${r}`))),
          e !== -1)
        )
          return o[e];
    }
    const a = t.get(s).down;
    if (a !== null) {
      for (const r of a)
        if (
          ((e = o.findIndex((i) => i.qualityLabel.startsWith(`${r}`))),
          e !== -1)
        )
          return o[e];
    }
    return null;
  },
  W = (o, s) => {
    const t = new Map([
      [160, { up: null, down: [128, 64, 48] }],
      [128, { up: [160], down: [64, 48] }],
      [64, { up: [128, 160], down: [48] }],
      [48, { up: [64, 128, 160], down: null }],
    ]);
    let e = 0;
    if (((e = o.findIndex((r) => r.audioBitrate === s)), e !== -1)) return o[e];
    const n = t.get(s).up;
    if (n !== null) {
      for (const r of n)
        if (((e = o.findIndex((i) => i.audioBitrate === r)), e !== -1))
          return o[e];
    }
    const a = t.get(s).down;
    if (a !== null) {
      for (const r of a)
        if (((e = o.findIndex((i) => i.audioBitrate === r)), e !== -1))
          return o[e];
    }
    return null;
  },
  O = (o) => {
    const [s, t, e] = o.split(":");
    return +s * 60 * 60 + +t * 60 + +e;
  },
  q = (o, s) => Math.floor((O(o) / O(s)) * 100),
  G = (o) => {
    const e = o / 1048576,
      n = (o % 1048576) / 1024;
    return e >>> 0
      ? e.toFixed(2) + " gb"
      : n >>> 0
      ? n.toFixed(2) + " mb"
      : o + " kb";
  },
  H = (o, s) => {
    const t = c.resolve(o, s);
    try {
      $(t) || y.mkdirSync(t);
    } catch {
      return { newPath: t, error: !0 };
    }
    return { newPath: t, error: !1 };
  },
  b = (o, s) => {
    const t = c.resolve("temp", o, "info.json");
    try {
      y.writeFileSync(t, JSON.stringify(s), { flag: "w", encoding: "utf-8" });
    } catch {}
  },
  w = (o, s, t) => {
    const e = s;
    switch (o) {
      case "download": {
        const { total: n, finish: a } = t;
        e.session.vidl.progressState.downloadProgressState = {
          total: n,
          finish: a,
        };
        const r = {
          state: "progress",
          msg: `preparing files (${a}/${n})`,
          progress: Math.floor((a / n) * 100),
        };
        (e.session.vidl.clientInfo = r), b(e.sessionID, r);
        break;
      }
      case "convert": {
        const { size: n, timeMark: a } = t;
        e.session.vidl.progressState.mergeProgressState = {
          size: n,
          timeMark: a,
        };
        const { duration: r } = e.session.vidl.progressState,
          i = {
            state: "progress",
            msg: `converting files (${G(n)})`,
            progress: q(a, r),
          };
        (e.session.vidl.clientInfo = i), b(e.sessionID, i);
        break;
      }
      case "duration": {
        e.session.vidl.progressState.duration = t.duration;
        break;
      }
    }
  },
  k = (o, s, t, e) =>
    new Promise((n) => {
      const a = y.createWriteStream(o);
      t.hasVideo;
      const r = e;
      let i = !1;
      m.downloadFromInfo(s, { format: t })
        .on("error", () => {
          (i = !0), a.end(), n({ ok: !1 });
        })
        .pipe(a)
        .on("finish", () => {
          if (!i) {
            a.end();
            const d = r.session.vidl.progressState.downloadProgressState,
              l = { ...d, finish: d.finish + 1 };
            w("download", e, l), n({ ok: !0 });
          }
        })
        .on("error", (d) => {
          a.end(), n({ ok: !1 });
        })
        .on("close", () => {});
    });
B.setFfmpegPath(U);
const E = async (o, s) => {
    const {
      body: { searchUrl: t },
    } = o;
    try {
      if (m.validateURL(t)) {
        const e = await m.getInfo(t, { playerClients: ["IOS"] }),
          n = e.formats,
          a = j(n),
          r = D(n);
        s.status(200).json({
          info: {
            videoFormats: a,
            audioFormats: r,
            videoDetails: e.videoDetails,
          },
          type: "video",
        });
      } else if (M.validate(t, "PLAYLIST")) {
        const e = await M.getPlaylist(t, { fetchAll: !0, limit: 1 / 0 });
        s.status(200).json({
          info: {
            id: e.id,
            videoCount: e.videoCount,
            views: e.views,
            channel: e.channel,
            lastUpdate: e.lastUpdate,
            link: e.link,
            mix: e.mix,
            thumbnail: e.thumbnail,
            title: e.title,
            type: e.type,
            url: e.url,
            videos: e.videos,
            fake: e.fake,
          },
          type: "list",
        });
      } else
        s.status(200).json({ errMsg: "Invalid youtube url", type: "none" });
    } catch (e) {
      s.status(200).json({ errMsg: e.message, type: "none" });
    }
  },
  z = async (o, s) => {
    const t = o;
    t.session.vidl ||
      (t.session.vidl = {
        connected: !0,
        clientInfo: { state: "fetch", msg: "fetching info", progress: 0 },
        progressState: {
          duration: "",
          downloadProgressState: { total: 0, finish: 0 },
          mergeProgressState: { size: 0, timeMark: "" },
        },
      });
    const { error: e } = H("temp", o.sessionID);
    e && s.sendStatus(204);
    const n = t.session.vidl.clientInfo;
    b(t.sessionID, n), s.status(200).json(n);
  },
  Q = async (o, s, t) => {
    t();
  },
  J = async (o, s) => {
    const t = o;
    if (t.session.vidl) {
      const e = c.resolve("temp", t.sessionID, "info.json");
      try {
        y.readFile(e, { encoding: "utf-8" }, (n, a) => {
          n
            ? s
                .status(200)
                .json({ state: "fetch", msg: "fetching info", progress: 0 })
            : s.status(200).json(JSON.parse(a));
        });
        return;
      } catch {}
    }
    s.status(200).json({
      state: "error",
      msg: "session closed 💀",
      progress: 0,
    });
  },
  L = async (o, s, t) => {
    s.on("finish", () => {
      const e = o,
        n = c.resolve("temp", e.sessionID);
      o.session.destroy((a) => {}),
        T(n, { recursive: !0, force: !0 }, (a) => {});
    }),
      t();
  },
  K = async (o, s) => {
    const {
      body: { searchUrl: t, quality: e },
    } = o;
    try {
      if (!m.validateURL(t)) {
        s.status(200).json({
          errMsg: "Invalid youtube video url. Please try again",
          type: "none",
        });
        return;
      }
      const n = await m.getInfo(t, { playerClients: ["IOS"] }),
        a = n.formats,
        r = N(j(a), e);
      if (r === null) throw "";
      const i = D(a)[0];
      if (i === void 0) throw "";
      const d = o;
      d.session.vidl.progressState.downloadProgressState.total = 2;
      const l = c.resolve("temp", o.sessionID),
        S = c.resolve(l, `video.${r.container}`),
        f = c.resolve(l, `audio.${i.container}`),
        [p, h] = await Promise.allSettled([k(S, n, r, d), k(f, n, i, d)]);
      if (!p.value.ok || !h.value.ok) {
        s.sendStatus(205);
        return;
      }
      const I = c.resolve(l, "output.mp4");
      B(S)
        .format("mp4")
        .audioBitrate(i.audioBitrate)
        .mergeAdd(f)
        .saveToFile(I)
        .on("start", () => {})
        .on("codecData", (g) => {
          const F = { duration: g.duration };
          w("duration", d, F);
        })
        .on("progress", ({ targetSize: g, timemark: F }) => {
          w("convert", d, { size: g, timeMark: F });
        })
        .on("end", () => {
          P(S, (g) => {}),
            P(f, (g) => {}),
            s.status(200).download(I, (g) => {
              g && s.sendStatus(204);
            });
        })
        .on("error", (g) => {
          s.sendStatus(204);
        });
    } catch {
      s.sendStatus(204);
    }
  },
  Y = async (o, s) => {
    const {
      body: { searchUrl: t, quality: e },
    } = o;
    try {
      if (!m.validateURL(t)) {
        s.status(200).json({
          errMsg: "Invalid youtube video url. Please try again",
          type: "none",
        });
        return;
      }
      const n = await m.getInfo(t, { playerClients: ["IOS"] }),
        a = n.formats,
        r = W(D(a), e);
      if (r === null) throw "";
      const i = o;
      i.session.vidl.progressState.downloadProgressState.total = 1;
      const d = c.resolve("temp", o.sessionID),
        l = c.resolve(d, `audio.${r.container}`);
      if (!(await k(l, n, r, i)).ok) {
        s.sendStatus(204);
        return;
      }
      const f = c.resolve(d, "output.mp3");
      B(l)
        .format("mp3")
        .audioBitrate(r.audioBitrate)
        .saveToFile(f)
        .on("start", () => {})
        .on("codecData", (p) => {
          const h = { duration: p.duration };
          w("duration", i, h);
        })
        .on("progress", ({ targetSize: p, timemark: h }) => {
          w("convert", i, { size: p, timeMark: h });
        })
        .on("end", () => {
          P(l, (p) => {}),
            s.status(200).download(f, (p) => {
              if (p) {
                s.sendStatus(204);
                return;
              }
            });
        })
        .on("error", (p) => {
          s.sendStatus(204);
        });
    } catch {
      s.sendStatus(204);
    }
  },
  X = async (o, s) => {
    const {
      body: { listUrl: t },
    } = o;
    s.status(200).json({ listUrl: t });
  },
  v = R();
v.post("/smart-search", E);
v.get("/progress-info", J);
v.use(Q);
v.post("/video-download", L, K);
v.post("/audio-download", L, Y);
v.post("/list-download", L, X);
var Z = v;
const x = R();
x.get("/ods", z);
x.use("/youtube", Z);
var ee = x;
const te = 10 * 60 * 1e3,
  se = {
    origin: !0,
    credentials: !0,
    methods: ["GET", "POST"],
    optionsSuccessStatus: 200,
  },
  oe = {
    secret: "VIDL_SESSION",
    saveUninitialized: !1,
    resave: !1,
    name: "vidl_connected",
    cookie: { maxAge: te },
  },
  u = _();
u.use(_.json({ limit: "10mb" }));
u.use(_.urlencoded({ extended: !1, limit: "10mb" }));
u.use(V());
u.use(C(oe));
u.use(A(se));
u.use("/api", ee);
u.get("/", async (o, s) => {
  s.status(200).json({ msg: "Welcome to VIDL API" });
});
u.get("*", async (o, s) => {
  s.sendStatus(404);
});
{
  console.log("Production Mode ✅");
  const o = process.env.PORT ?? 3e3;
  u.listen(o, () => {
    console.log(`Server Running On Port ${o}`);
  });
}
const ge = u;
var Se = u;
export { Se as default, ge as viteNodeApp };
