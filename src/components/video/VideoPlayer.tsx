import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";
import type { PlaybackSource } from "../../types/playback";
import { formatClock } from "../../utils/clock";

const SPEEDS = [1, 1.5, 2] as const;
const HIDE_CONTROLS_MS = 2500;
const MAX_REFRESHES = 2;

interface Props {
  source: PlaybackSource;
  // Where to continue (seconds). Read once per (re)attach; ignored when it is
  // at the very end.
  startAt?: number;
  poster?: string;
  autoPlay?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  // Fired while playing and after seeking, with the current position.
  onTimeUpdate?: (positionSec: number) => void;
  onEnded?: () => void;
  // Called when the URL stopped working (e.g. the signed URL expired) so the
  // caller can fetch a fresh one. The player resumes where it was.
  onSourceExpired?: () => Promise<unknown>;
  className?: string;
}

type Failure = {
  url: string;
  attempt: number;
  kind: "playback" | "unsupported";
};
type WebkitVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

// A video player with its own controls: play/pause, volume, speed
// (1x/1.5x/2x), fullscreen, plus loading, buffering and error states. Plays
// HLS (.m3u8) through hls.js (natively on Safari) and plain files directly.
export default function VideoPlayer({
  source,
  startAt = 0,
  poster,
  autoPlay = false,
  onPlayingChange,
  onTimeUpdate,
  onEnded,
  onSourceExpired,
  className,
}: Props) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const resumeAtRef = useRef(startAt);
  const resumePlayingRef = useRef(autoPlay);
  const refreshesRef = useRef(0);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Bump to attach the same URL again (the "try again" button).
  const [attempt, setAttempt] = useState(0);
  const [readyUrl, setReadyUrl] = useState<string | null>(null);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [playing, setPlaying] = useState(false);
  const [buffering, setBuffering] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [active, setActive] = useState(true);
  const [focused, setFocused] = useState(false);

  const failed =
    failure?.url === source.url && failure.attempt === attempt ? failure : null;
  const loading = readyUrl !== source.url && !failed;

  // The URL stopped working: get a fresh one (a couple of times), then give up.
  const recover = useCallback(async () => {
    const video = videoRef.current;
    if (video && Number.isFinite(video.currentTime) && video.currentTime > 0) {
      resumeAtRef.current = video.currentTime;
    }
    resumePlayingRef.current = video ? !video.paused : false;
    if (onSourceExpired && refreshesRef.current < MAX_REFRESHES) {
      refreshesRef.current += 1;
      try {
        await onSourceExpired();
        // Attach again even if the new URL happens to be identical.
        setAttempt((n) => n + 1);
        return;
      } catch {
        // could not get a new URL: show the error below
      }
    }
    setFailure({ url: source.url, attempt, kind: "playback" });
  }, [onSourceExpired, source.url, attempt]);
  const recoverRef = useRef(recover);
  useEffect(() => {
    recoverRef.current = recover;
  });

  // Connects the video element to the source, and tears it down again.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;
    let hls: import("hls.js").default | null = null;
    const fail = (kind: Failure["kind"]) =>
      setFailure({ url: source.url, attempt, kind });
    const nativeHls = video.canPlayType("application/vnd.apple.mpegurl") !== "";

    const attachHls = async () => {
      // Loaded on demand: plain files never download the HLS library.
      const { default: Hls } = await import("hls.js");
      if (cancelled) return;
      if (!Hls.isSupported()) return fail("unsupported");

      const player = new Hls({
        startPosition: resumeAtRef.current > 0 ? resumeAtRef.current : -1,
      });
      hls = player;
      let networkRetries = 0;
      let mediaRetries = 0;
      player.on(Hls.Events.FRAG_LOADED, () => {
        networkRetries = 0;
        mediaRetries = 0;
      });
      player.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) return;
        const status = data.response?.code;
        if (status === 401 || status === 403) return void recoverRef.current();
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR && networkRetries < 3) {
          networkRetries += 1;
          return player.startLoad();
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && mediaRetries < 2) {
          mediaRetries += 1;
          return player.recoverMediaError();
        }
        void recoverRef.current();
      });
      player.loadSource(source.url);
      player.attachMedia(video);
    };

    if (source.kind === "hls" && !nativeHls) void attachHls();
    else video.src = source.url;

    return () => {
      cancelled = true;
      hls?.destroy();
      video.removeAttribute("src");
      video.load();
    };
  }, [source.url, source.kind, attempt]);

  // Fullscreen is changed by the browser too (Esc), so follow its events.
  useEffect(() => {
    const onChange = () =>
      setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  useEffect(() => () => clearTimeout(hideTimerRef.current), []);

  // Controls stay visible while paused and fade out after a moment of no
  // activity while playing.
  const reveal = () => {
    setActive(true);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setActive(false), HIDE_CONTROLS_MS);
  };
  const showControls = !playing || active || focused || !!failed;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => undefined);
    else video.pause();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) video.muted = !video.muted;
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    const video = videoRef.current as WebkitVideo | null;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (container?.requestFullscreen)
        await container.requestFullscreen();
      else video?.webkitEnterFullscreen?.(); // iPhone Safari
    } catch {
      // the browser refused fullscreen: nothing to do
    }
  };

  const retry = () => {
    refreshesRef.current = 0;
    if (onSourceExpired) void recover();
    else setAttempt((n) => n + 1);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Let buttons and sliders handle their own keys.
    if (e.target !== containerRef.current && e.target !== videoRef.current)
      return;
    const handled = {
      " ": togglePlay,
      k: togglePlay,
      m: toggleMute,
      f: () => void toggleFullscreen(),
    }[e.key];
    if (!handled) return;
    e.preventDefault();
    handled();
    reveal();
  };

  const position = time;
  const iconButton = "text-white hover:bg-white/20 hover:text-white";

  return (
    <div
      ref={containerRef}
      dir="ltr"
      role="group"
      aria-label={t("player.label")}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerMove={reveal}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
      }}
      className={cn(
        "relative isolate aspect-video w-full overflow-hidden bg-black text-white outline-none focus-visible:ring-2 focus-visible:ring-ring [&:fullscreen]:aspect-auto [&:fullscreen]:h-full",
        className,
      )}
    >
      <video
        ref={videoRef}
        className="size-full object-contain"
        dir="ltr"
        poster={poster}
        playsInline
        preload="metadata"
        autoPlay={autoPlay}
        onClick={togglePlay}
        onDoubleClick={() => void toggleFullscreen()}
        onLoadedMetadata={(e) => {
          const video = e.currentTarget;
          setDuration(video.duration);
          const at = resumeAtRef.current;
          // Continue where the learner stopped, unless that was the very end.
          if (
            at > 0 &&
            Number.isFinite(video.duration) &&
            at < video.duration - 1
          ) {
            video.currentTime = at;
            setTime(at);
          }
          resumeAtRef.current = 0;
        }}
        onCanPlay={(e) => {
          setReadyUrl(source.url);
          setBuffering(false);
          if (resumePlayingRef.current) {
            resumePlayingRef.current = false;
            void e.currentTarget.play().catch(() => undefined);
          }
        }}
        onPlay={() => {
          setPlaying(true);
          onPlayingChange?.(true);
          reveal();
        }}
        onPause={() => {
          setPlaying(false);
          onPlayingChange?.(false);
        }}
        onPlaying={() => {
          setBuffering(false);
          refreshesRef.current = 0;
        }}
        onWaiting={() => setBuffering(true)}
        onEnded={() => {
          setPlaying(false);
          onEnded?.();
        }}
        onTimeUpdate={(e) => {
          const current = e.currentTarget.currentTime;
          setTime(current);
          onTimeUpdate?.(current);
        }}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => {
          setVolume(e.currentTarget.volume);
          setMuted(e.currentTarget.muted);
        }}
        onRateChange={(e) => setRate(e.currentTarget.playbackRate)}
        onError={(e) => {
          // Clearing the source on cleanup also raises an error: ignore it.
          if (!e.currentTarget.currentSrc) return;
          void recover();
        }}
      />

      {(loading || buffering) && !failed && (
        <div
          role="status"
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30"
        >
          <Loader2
            aria-hidden
            className="size-10 animate-spin motion-reduce:animate-none"
          />
          <span className="sr-only">
            {loading ? t("player.loading") : t("player.buffering")}
          </span>
        </div>
      )}

      {failed && (
        <div
          role="alert"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 p-4 text-center"
        >
          <p className="max-w-sm text-sm">
            {failed.kind === "unsupported"
              ? t("player.unsupported")
              : t("player.error")}
          </p>
          {failed.kind === "playback" && (
            <Button type="button" variant="secondary" size="sm" onClick={retry}>
              <RotateCcw /> {t("player.retry")}
            </Button>
          )}
        </div>
      )}

      {!playing && !loading && !failed && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Button
            type="button"
            size="icon-lg"
            className="pointer-events-auto size-14 rounded-full bg-black/60 text-white hover:bg-black/80"
            aria-label={t("player.play")}
            onClick={togglePlay}
          >
            <Play className="size-6" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 space-y-1 bg-linear-to-t from-black/80 to-transparent px-3 pt-10 pb-2 transition-opacity duration-200 motion-reduce:transition-none",
          showControls ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none h-1 w-full overflow-hidden rounded-full bg-white/30"
        >
          <div
            className="h-full bg-white"
            style={{
              width: `${
                duration > 0 && Number.isFinite(duration)
                  ? Math.min(100, (position / duration) * 100)
                  : 0
              }%`,
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={iconButton}
            aria-label={playing ? t("player.pause") : t("player.play")}
            onClick={togglePlay}
          >
            {playing ? <Pause /> : <Play />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={iconButton}
            aria-label={
              muted || volume === 0 ? t("player.unmute") : t("player.mute")
            }
            onClick={toggleMute}
          >
            {muted || volume === 0 ? <VolumeX /> : <Volume2 />}
          </Button>
          <Slider
            aria-label={t("player.volume")}
            className="hidden w-20 sm:flex"
            dir="ltr"
            min={0}
            max={100}
            step={1}
            value={[muted ? 0 : Math.round(volume * 100)]}
            onValueChange={([v]) => {
              const video = videoRef.current;
              if (!video) return;
              video.volume = v / 100;
              video.muted = v === 0;
            }}
          />

          <span className="ms-2 text-xs tabular-nums" aria-hidden>
            {formatClock(Math.floor(position))} /{" "}
            {formatClock(Number.isFinite(duration) ? Math.floor(duration) : 0)}
          </span>

          <div className="flex-1" />

          <div
            role="group"
            aria-label={t("player.speed")}
            className="flex items-center"
          >
            {SPEEDS.map((speed) => (
              <Button
                key={speed}
                type="button"
                variant="ghost"
                size="xs"
                aria-pressed={rate === speed}
                className={cn(
                  iconButton,
                  "tabular-nums",
                  rate === speed && "bg-white/25",
                )}
                onClick={() => {
                  const video = videoRef.current;
                  if (video) video.playbackRate = speed;
                }}
              >
                {speed}x
              </Button>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={iconButton}
            aria-label={
              fullscreen ? t("player.exitFullscreen") : t("player.fullscreen")
            }
            onClick={() => void toggleFullscreen()}
          >
            {fullscreen ? <Minimize /> : <Maximize />}
          </Button>
        </div>
      </div>
    </div>
  );
}
