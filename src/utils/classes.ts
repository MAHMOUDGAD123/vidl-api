import type { yt } from "@_types/youtube-types";

/** session info class */
export class SessionInfo {
  private $sessionInfo: yt.Progress.SessionInfoType = {
    sessionID: "",
    clientInfo: { state: "fetch", msg: "fetching info", progress: 0 },
    progressState: {
      duration: "",
      downloadProgressState: {
        total: 0, // total files to download
        finish: 0, // downloaded files
      },
      convertProgressState: {
        size: 0,
        timeMark: "",
      },
    },
  };

  constructor(sessionID_Or_SessionInfo: string | yt.Progress.SessionInfoType) {
    if (typeof sessionID_Or_SessionInfo === "string") {
      this.$sessionInfo.sessionID = sessionID_Or_SessionInfo;
    } else {
      this.$sessionInfo = sessionID_Or_SessionInfo;
    }
  }

  set data(info: yt.Progress.SessionInfoType) {
    this.$sessionInfo = info;
  }
  get data() {
    return this.$sessionInfo;
  }

  set _clientInfo(info: yt.Progress.ClientInfoType) {
    this.$sessionInfo.clientInfo = info;
  }
  get _clientInfo() {
    return this.$sessionInfo.clientInfo;
  }

  set __duration(dur: string) {
    this.$sessionInfo.progressState.duration = dur;
  }
  get __duration() {
    return this.$sessionInfo.progressState.duration;
  }

  //------------------------------ download Progress Start ------------------------------
  set __downloadProgressState(state: yt.Progress.DownloadProgressStateType) {
    this.$sessionInfo.progressState.downloadProgressState = state;
  }
  get __downloadProgressState() {
    return this.$sessionInfo.progressState.downloadProgressState;
  }

  set ___total(n: number) {
    this.$sessionInfo.progressState.downloadProgressState.total = n;
  }
  get ___total() {
    return this.$sessionInfo.progressState.downloadProgressState.total;
  }

  set ___finish(n: number) {
    this.$sessionInfo.progressState.downloadProgressState.finish = n;
  }
  get ___finish() {
    return this.$sessionInfo.progressState.downloadProgressState.finish;
  }
  //------------------------------- download Progress End -------------------------------

  set __convertProgressState(state: yt.Progress.ConvertProgressStateType) {
    this.$sessionInfo.progressState.convertProgressState = state;
  }
  get __convertProgressState() {
    return this.$sessionInfo.progressState.convertProgressState;
  }
}
