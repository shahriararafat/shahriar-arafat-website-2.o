"use client";

import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { copyText } from "@/lib/copy-text";
import {
  fallbackPresence,
  formatClock,
  normalizeDiscordUserId,
  presenceFromRest,
  presenceFromSocketMessage,
  trackProgress,
  type Activity,
  type LanyardView,
  type PresenceStatus,
  type SpotifyActivity,
} from "@/lib/lanyard";

const userId = normalizeDiscordUserId(process.env.NEXT_PUBLIC_DISCORD_USER_ID);

const statusLabel: Record<PresenceStatus, string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do not disturb",
  offline: "Offline",
};

const dotClass: Record<PresenceStatus, string> = {
  online: "bg-online",
  idle: "bg-idle",
  dnd: "bg-dnd",
  offline: "bg-offline",
};

const railClass: Record<PresenceStatus, string> = {
  online: "border-l-online",
  idle: "border-l-idle",
  dnd: "border-l-dnd",
  offline: "border-l-offline",
};

export function DiscordCard() {
  const [view, setView] = useState<LanyardView | null>(() =>
    userId ? null : fallbackPresence(site.discordUsername, "missing-id"),
  );

  useEffect(() => {
    if (!userId) return;
    let stopped = false;
    let socket: WebSocket | null = null;
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    let restTimer: ReturnType<typeof setInterval> | undefined;
    let restActive = false;

    const apply = (next: LanyardView) => {
      if (!stopped) setView(next);
    };

    const stopHeartbeat = () => {
      if (heartbeat) clearInterval(heartbeat);
      heartbeat = undefined;
    };

    const pullRest = async () => {
      try {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
        const payload: unknown = await response.json();
        const next = presenceFromRest(payload, site.discordUsername);
        apply(next);
        if (next.mode === "fallback" && next.reason === "not-monitored" && restTimer) {
          clearInterval(restTimer);
          restTimer = undefined;
        }
      } catch {
        apply(fallbackPresence(site.discordUsername, "unavailable"));
      }
    };

    const startRest = () => {
      if (restActive || stopped) return;
      restActive = true;
      stopHeartbeat();
      socket?.close();
      void pullRest();
      restTimer = setInterval(() => void pullRest(), 30_000);
    };

    try {
      socket = new WebSocket("wss://api.lanyard.rest/socket");
    } catch {
      startRest();
    }

    if (!socket) {
      return () => {
        stopped = true;
        stopHeartbeat();
        if (restTimer) clearInterval(restTimer);
      };
    }

    socket.addEventListener("message", (event) => {
      if (typeof event.data !== "string") return;
      let parsed: unknown;
      try {
        parsed = JSON.parse(event.data);
      } catch {
        return;
      }
      const effect = presenceFromSocketMessage(parsed, userId, site.discordUsername);
      if (effect.type === "hello") {
        stopHeartbeat();
        heartbeat = setInterval(() => {
          if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ op: 3 }));
          }
        }, effect.heartbeatMs);
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
        }
        return;
      }
      if (effect.type !== "presence") return;
      apply(effect.view);
      if (effect.view.mode === "fallback" && effect.view.reason === "not-monitored") {
        stopped = true;
        stopHeartbeat();
        socket?.close();
      }
    });

    socket.addEventListener("error", () => startRest());
    socket.addEventListener("close", () => {
      if (!stopped) startRest();
    });

    return () => {
      stopped = true;
      stopHeartbeat();
      if (restTimer) clearInterval(restTimer);
      socket?.close();
    };
  }, []);

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface" aria-busy={view === null}>
      <div
        className={`border-l-4 p-4 sm:p-5 ${
          view?.mode === "live" ? railClass[view.status] : "border-l-brass"
        }`}
      >
        <p className="text-xs tracking-[0.16em] text-brass uppercase">Discord</p>
        {view === null ? <LoadingState /> : null}
        {view?.mode === "fallback" ? <FallbackState /> : null}
        {view?.mode === "live" ? <LiveState view={view} /> : null}
      </div>
    </article>
  );
}

function LoadingState() {
  return (
    <div className="mt-4">
      <div className="h-7 w-40 rounded-md bg-surface-2" />
      <p className="mt-3 text-sm text-muted">Loading status…</p>
    </div>
  );
}

function FallbackState() {
  const [notice, setNotice] = useState("");

  return (
    <div className="mt-3">
      <p className="font-serif text-3xl leading-none">{site.discordUsername}</p>
      <button
        type="button"
        className="mt-4 inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm hover:bg-background"
        onClick={async () => {
          const copied = await copyText(site.discordUsername);
          setNotice(copied ? "Copied username" : "Could not copy the username");
        }}
      >
        Copy username
      </button>
      <p role="status" className="mt-2 min-h-5 text-sm text-muted">
        {notice}
      </p>
    </div>
  );
}

function LiveState({ view }: { view: Extract<LanyardView, { mode: "live" }> }) {
  return (
    <div className="mt-3">
      <div className="flex items-center gap-3">
        {view.avatarUrl ? (
          // Discord avatars are third-party and sometimes animated.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={view.avatarUrl}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-full object-cover"
          />
        ) : null}
        <div>
          <p className="flex items-center gap-2 text-sm">
            <span className={`size-2.5 rounded-full ${dotClass[view.status]}`} aria-hidden="true" />
            <span className="sr-only">Status: </span>
            {statusLabel[view.status]}
          </p>
          <p className="font-serif text-2xl leading-tight">{view.displayName}</p>
          {view.username !== view.displayName ? (
            <p className="text-sm text-muted">{view.username}</p>
          ) : null}
        </div>
      </div>
      {view.activities.length > 0 ? (
        <ul className="mt-4 space-y-3">
          {view.activities.map((activity, index) => (
            <li key={activityKey(activity, index)} className="rounded-xl bg-background/70 p-3">
              <ActivityRow activity={activity} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function activityKey(activity: Activity, index: number): string {
  if (activity.kind === "spotify") return `spotify-${activity.song}-${activity.artist}`;
  if (activity.kind === "custom") return `custom-${activity.text}-${index}`;
  return `activity-${activity.action}-${activity.name}-${index}`;
}

function ActivityRow({ activity }: { activity: Activity }) {
  if (activity.kind === "spotify") return <SpotifyRow activity={activity} />;
  if (activity.kind === "custom") {
    return (
      <p>
        {activity.emoji ? <span aria-hidden="true">{activity.emoji} </span> : null}
        {activity.text}
      </p>
    );
  }
  return (
    <div className="flex gap-3">
      {activity.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={activity.imageUrl}
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-lg object-cover"
        />
      ) : null}
      <div>
        <p className="text-xs tracking-[0.14em] text-muted uppercase">{activity.action}</p>
        <p className="font-medium">{activity.name}</p>
        {activity.details ? <p className="text-sm">{activity.details}</p> : null}
        {activity.state ? <p className="text-sm text-muted">{activity.state}</p> : null}
      </div>
    </div>
  );
}

function SpotifyRow({ activity }: { activity: SpotifyActivity }) {
  const hasRange =
    activity.start !== undefined && activity.end !== undefined && activity.end > activity.start;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!hasRange) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [hasRange]);

  const progress =
    hasRange && activity.start !== undefined && activity.end !== undefined
      ? trackProgress(activity.start, activity.end, now)
      : null;

  return (
    <div>
      <div className="flex gap-3">
        {activity.albumArtUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activity.albumArtUrl}
            alt=""
            width={56}
            height={56}
            className="size-14 rounded-lg object-cover"
          />
        ) : null}
        <div className="min-w-0">
          <p className="text-xs tracking-[0.14em] text-muted uppercase">Listening · Spotify</p>
          <p className="truncate font-medium">{activity.song}</p>
          <p className="truncate text-sm text-muted">{activity.artist}</p>
          {activity.album ? <p className="truncate text-xs text-muted">{activity.album}</p> : null}
        </div>
      </div>
      {progress ? (
        <div className="mt-3">
          <div
            role="progressbar"
            aria-label="Spotify track progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress.ratio * 100)}
            className="h-1 overflow-hidden rounded-full bg-surface-2"
          >
            <div className="h-full bg-brass" style={{ width: `${progress.ratio * 100}%` }} />
          </div>
          <p className="mt-1 flex justify-between text-xs text-muted tabular-nums">
            <span>{formatClock(progress.elapsed)}</span>
            <span>{formatClock(progress.duration)}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
