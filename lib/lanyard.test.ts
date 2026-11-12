import { describe, expect, it } from "vitest";
import {
  avatarUrl,
  discordAssetUrl,
  fallbackPresence,
  formatClock,
  normalizeDiscordUserId,
  presenceFromRest,
  presenceFromSocketMessage,
  readPresence,
  safeImageUrl,
  trackProgress,
} from "./lanyard";

const username = "shahriararafat";

describe("normalizeDiscordUserId", () => {
  it("keeps a numeric snowflake and rejects anything else", () => {
    expect(normalizeDiscordUserId(" 100000000000000001 ")).toBe("100000000000000001");
    expect(normalizeDiscordUserId(undefined)).toBe("");
    expect(normalizeDiscordUserId("")).toBe("");
    expect(normalizeDiscordUserId("abc")).toBe("");
    expect(normalizeDiscordUserId("1234")).toBe("");
    expect(normalizeDiscordUserId("12 345678")).toBe("");
  });
});

describe("fallback presence", () => {
  it("returns the site username when no id is configured", () => {
    expect(fallbackPresence(username, "missing-id")).toEqual({
      mode: "fallback",
      username,
      reason: "missing-id",
    });
  });
});

describe("presenceFromRest", () => {
  it("maps a user-not-monitored response to the username fallback", () => {
    const view = presenceFromRest(
      {
        success: false,
        error: {
          code: "user_not_monitored",
          message: "User is not being monitored by Lanyard",
        },
      },
      username,
    );
    expect(view).toEqual({
      mode: "fallback",
      username,
      reason: "not-monitored",
    });
  });

  it("falls back when the payload is missing or unsuccessful", () => {
    expect(presenceFromRest(null, username).mode).toBe("fallback");
    expect(presenceFromRest({ success: false, error: { code: "nope" } }, username)).toMatchObject({
      reason: "unavailable",
    });
    expect(presenceFromRest({ success: true }, username)).toMatchObject({
      reason: "unavailable",
    });
    expect(presenceFromRest({ success: true, data: {} }, username)).toMatchObject({
      reason: "unavailable",
    });
  });

  it("reads status, names, spotify, a game, and a custom status", () => {
    const view = presenceFromRest(
      {
        success: true,
        data: {
          discord_status: "online",
          listening_to_spotify: true,
          discord_user: {
            id: "100000000000000001",
            username: "sampleuser",
            global_name: "Sample Name",
            avatar: "a_abc123",
          },
          spotify: {
            song: "Sample Track",
            artist: "Sample Artist",
            album: "Sample Album",
            album_art_url: "https://i.scdn.co/image/samplealbum",
            timestamps: { start: 1_000, end: 5_000 },
          },
          activities: [
            {
              type: 2,
              name: "Spotify",
              details: "Sample Track",
              state: "Sample Artist",
            },
            {
              type: 0,
              name: "Sample Game",
              details: "In a match",
              state: "Ranked",
              application_id: "383226320970055681",
              assets: { large_image: "565945077491433494" },
            },
            {
              type: 4,
              name: "Custom Status",
              state: "studying",
              emoji: { name: "📚", id: null },
            },
            {
              type: 4,
              name: "Custom Status",
              state: "custom emoji",
              emoji: { name: "wave", id: "999" },
            },
          ],
        },
      },
      username,
    );

    expect(view).toMatchObject({
      mode: "live",
      status: "online",
      username: "sampleuser",
      displayName: "Sample Name",
      avatarUrl:
        "https://cdn.discordapp.com/avatars/100000000000000001/a_abc123.gif?size=128",
    });
    if (view.mode !== "live") throw new Error("expected live presence");
    expect(view.activities.map((activity) => activity.kind)).toEqual([
      "spotify",
      "activity",
      "custom",
      "custom",
    ]);
    expect(view.activities[0]).toMatchObject({
      song: "Sample Track",
      artist: "Sample Artist",
      album: "Sample Album",
      albumArtUrl: "https://i.scdn.co/image/samplealbum",
      start: 1_000,
      end: 5_000,
    });
    expect(view.activities[1]).toMatchObject({
      action: "Playing",
      name: "Sample Game",
      details: "In a match",
      state: "Ranked",
      imageUrl:
        "https://cdn.discordapp.com/app-assets/383226320970055681/565945077491433494.png",
    });
    expect(view.activities[2]).toEqual({ kind: "custom", text: "studying", emoji: "📚" });
    expect(view.activities[3]).toEqual({ kind: "custom", text: "custom emoji" });
  });

  it("maps idle, dnd, and offline, and keeps an unknown status visible as offline", () => {
    for (const status of ["idle", "dnd", "offline"] as const) {
      const view = readPresence({ discord_status: status, activities: [] }, username);
      expect(view).toMatchObject({ mode: "live", status, username });
    }
    expect(readPresence({ discord_status: "invisible", activities: [] }, username)).toMatchObject({
      mode: "live",
      status: "offline",
      username,
    });
  });

  it("uses the fallback username when Discord does not send one", () => {
    expect(readPresence({ discord_status: "dnd" }, username)).toMatchObject({
      mode: "live",
      username,
      displayName: username,
    });
  });
});

describe("presenceFromSocketMessage", () => {
  it("reads the heartbeat interval", () => {
    expect(
      presenceFromSocketMessage({ op: 1, d: { heartbeat_interval: 41250 } }, "1", username),
    ).toEqual({ type: "hello", heartbeatMs: 41250 });
    expect(presenceFromSocketMessage({ op: 1, d: {} }, "1", username)).toEqual({
      type: "hello",
      heartbeatMs: 30_000,
    });
  });

  it("reads a single-user init state and a presence update", () => {
    const presence = {
      discord_status: "dnd",
      discord_user: { username: "phin", global_name: "Phineas", id: "100000000000000009" },
      activities: [],
    };
    const init = presenceFromSocketMessage(
      { op: 0, t: "INIT_STATE", d: presence },
      "100000000000000009",
      username,
    );
    expect(init).toMatchObject({
      type: "presence",
      view: { mode: "live", status: "dnd", displayName: "Phineas", username: "phin" },
    });

    const update = presenceFromSocketMessage(
      { op: 0, t: "PRESENCE_UPDATE", d: { ...presence, discord_status: "idle" } },
      "100000000000000009",
      username,
    );
    expect(update).toMatchObject({
      type: "presence",
      view: { status: "idle" },
    });
  });

  it("reads the map form and treats a missing init user as not monitored", () => {
    const mapped = presenceFromSocketMessage(
      {
        op: 0,
        t: "INIT_STATE",
        d: {
          "100000000000000009": {
            discord_status: "online",
            discord_user: { username: "phin" },
            activities: [],
          },
        },
      },
      "100000000000000009",
      username,
    );
    expect(mapped).toMatchObject({
      type: "presence",
      view: { mode: "live", status: "online", username: "phin" },
    });

    expect(
      presenceFromSocketMessage({ op: 0, t: "INIT_STATE", d: {} }, "100000000000000009", username),
    ).toEqual({
      type: "presence",
      view: fallbackPresence(username, "not-monitored"),
    });
  });

  it("ignores malformed messages and empty presence updates", () => {
    expect(presenceFromSocketMessage(null, "1", username)).toEqual({ type: "ignore" });
    expect(presenceFromSocketMessage({ op: 4 }, "1", username)).toEqual({ type: "ignore" });
    expect(presenceFromSocketMessage({ op: 0, t: "PRESENCE_UPDATE", d: {} }, "1", username)).toEqual({
      type: "ignore",
    });
  });
});

describe("image urls and playback", () => {
  it("builds Discord asset urls and drops unsafe ones", () => {
    expect(discordAssetUrl(undefined, "mp:external/hash/https/i.scdn.co/image/abc")).toBe(
      "https://media.discordapp.net/external/hash/https/i.scdn.co/image/abc",
    );
    expect(discordAssetUrl(undefined, "spotify:ab67616d0000b273sample")).toBe(
      "https://i.scdn.co/image/ab67616d0000b273sample",
    );
    expect(safeImageUrl("http://i.scdn.co/image/abc")).toBeUndefined();
    expect(safeImageUrl("https://evil.example/image.png")).toBeUndefined();
    expect(safeImageUrl("https://user:pass@i.scdn.co/image/abc")).toBeUndefined();
    expect(avatarUrl("not-an-id", "abc")).toBeUndefined();
    expect(avatarUrl("100000000000000001", "abc123")).toBe(
      "https://cdn.discordapp.com/avatars/100000000000000001/abc123.png?size=128",
    );
  });

  it("clamps track progress and formats the clock", () => {
    expect(trackProgress(0, 1_000, 500)).toEqual({ ratio: 0.5, elapsed: 500, duration: 1_000 });
    expect(trackProgress(1_000, 2_000, 100)).toEqual({ ratio: 0, elapsed: 0, duration: 1_000 });
    expect(trackProgress(0, 1_000, 5_000)).toEqual({ ratio: 1, elapsed: 1_000, duration: 1_000 });
    expect(trackProgress(5, 5, 5)).toEqual({ ratio: 0, elapsed: 0, duration: 0 });
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(65_000)).toBe("1:05");
    expect(formatClock(-20)).toBe("0:00");
  });
});
