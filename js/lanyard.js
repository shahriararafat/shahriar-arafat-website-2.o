(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.Lanyard = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const STATUSES = new Set(["online", "idle", "dnd", "offline"]);
  const ACTION_BY_TYPE = {
    0: "Playing",
    1: "Streaming",
    2: "Listening",
    3: "Watching",
    5: "Competing",
  };
  const ALLOWED_IMAGE_HOSTS = new Set([
    "i.scdn.co",
    "cdn.discordapp.com",
    "media.discordapp.net",
  ]);

  function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  function stringField(value) {
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  function numberField(value) {
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
  }

  function normalizeDiscordUserId(value) {
    const trimmed = value == null ? "" : String(value).trim();
    return /^\d{5,22}$/.test(trimmed) ? trimmed : "";
  }

  function fallbackPresence(username, reason) {
    return { mode: "fallback", username: username, reason: reason };
  }

  function safeImageUrl(url) {
    if (!url) return undefined;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "https:") return undefined;
      if (parsed.username || parsed.password) return undefined;
      if (!ALLOWED_IMAGE_HOSTS.has(parsed.hostname)) return undefined;
      return parsed.href;
    } catch (error) {
      return undefined;
    }
  }

  function discordAssetUrl(applicationId, image) {
    if (!image) return undefined;
    if (image.startsWith("mp:")) {
      return safeImageUrl("https://media.discordapp.net/" + image.slice(3));
    }
    if (image.startsWith("spotify:")) {
      return safeImageUrl("https://i.scdn.co/image/" + image.slice("spotify:".length));
    }
    if (image.startsWith("https://") || image.startsWith("http://")) {
      return safeImageUrl(image);
    }
    if (applicationId && /^\d+$/.test(applicationId) && /^[a-zA-Z0-9_-]+$/.test(image)) {
      return safeImageUrl(
        "https://cdn.discordapp.com/app-assets/" + applicationId + "/" + image + ".png",
      );
    }
    return undefined;
  }

  function avatarUrl(userId, avatar) {
    if (!userId || !avatar || !/^\d+$/.test(userId)) return undefined;
    if (!/^[a-zA-Z0-9_]+$/.test(avatar)) return undefined;
    const extension = avatar.startsWith("a_") ? "gif" : "png";
    return safeImageUrl(
      "https://cdn.discordapp.com/avatars/" + userId + "/" + avatar + "." + extension + "?size=128",
    );
  }

  function trackProgress(start, end, now) {
    if (!(end > start)) return { ratio: 0, elapsed: 0, duration: 0 };
    const duration = end - start;
    const elapsed = Math.min(duration, Math.max(0, now - start));
    return { ratio: elapsed / duration, elapsed: elapsed, duration: duration };
  }

  function formatClock(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  function readActivities(data) {
    const activities = [];
    const spotify = isRecord(data.spotify) ? data.spotify : null;
    let spotifyAdded = false;

    if (data.listening_to_spotify === true && spotify) {
      const song = stringField(spotify.song);
      const artist = stringField(spotify.artist);
      if (song && artist) {
        const timestamps = isRecord(spotify.timestamps) ? spotify.timestamps : undefined;
        activities.push({
          kind: "spotify",
          song: song,
          artist: artist,
          album: stringField(spotify.album),
          albumArtUrl: safeImageUrl(stringField(spotify.album_art_url)),
          start: timestamps ? numberField(timestamps.start) : undefined,
          end: timestamps ? numberField(timestamps.end) : undefined,
        });
        spotifyAdded = true;
      }
    }

    const rawActivities = Array.isArray(data.activities) ? data.activities : [];
    for (const item of rawActivities) {
      if (!isRecord(item)) continue;
      const type = numberField(item.type);
      const name = stringField(item.name);
      if (type === 2 && spotifyAdded && name && name.toLowerCase() === "spotify") continue;
      if (type === 4) {
        const text = stringField(item.state);
        if (!text) continue;
        const emoji = isRecord(item.emoji) ? item.emoji : undefined;
        const emojiName = emoji ? stringField(emoji.name) : undefined;
        activities.push({
          kind: "custom",
          text: text,
          emoji: emojiName && !stringField(emoji && emoji.id) ? emojiName : undefined,
        });
        continue;
      }
      const action = type === undefined ? undefined : ACTION_BY_TYPE[type];
      if (!action || !name) continue;
      const assets = isRecord(item.assets) ? item.assets : undefined;
      activities.push({
        kind: "activity",
        action: action,
        name: name,
        details: stringField(item.details),
        state: stringField(item.state),
        imageUrl: discordAssetUrl(
          stringField(item.application_id),
          assets ? stringField(assets.large_image) : undefined,
        ),
      });
    }
    return activities;
  }

  function readPresence(data, fallbackUsername) {
    if (!isRecord(data)) return fallbackPresence(fallbackUsername, "unavailable");
    const statusRaw = stringField(data.discord_status);
    if (!statusRaw) return fallbackPresence(fallbackUsername, "unavailable");
    const status = STATUSES.has(statusRaw) ? statusRaw : "offline";
    const user = isRecord(data.discord_user) ? data.discord_user : undefined;
    const username = (user && stringField(user.username)) || fallbackUsername;
    const displayName =
      (user && (stringField(user.global_name) || stringField(user.display_name))) || username;
    return {
      mode: "live",
      status: status,
      username: username,
      displayName: displayName,
      avatarUrl: avatarUrl(user ? stringField(user.id) : undefined, user ? stringField(user.avatar) : undefined),
      activities: readActivities(data),
    };
  }

  function presenceFromRest(payload, fallbackUsername) {
    if (!isRecord(payload)) return fallbackPresence(fallbackUsername, "unavailable");
    if (payload.success === false) {
      const error = isRecord(payload.error) ? payload.error : undefined;
      if (stringField(error && error.code) === "user_not_monitored") {
        return fallbackPresence(fallbackUsername, "not-monitored");
      }
      return fallbackPresence(fallbackUsername, "unavailable");
    }
    if (payload.success !== true) return fallbackPresence(fallbackUsername, "unavailable");
    return readPresence(payload.data, fallbackUsername);
  }

  function extractPresence(data, userId) {
    if (!isRecord(data)) return undefined;
    if (typeof data.discord_status === "string") return data;
    const nested = data[userId];
    if (isRecord(nested) && typeof nested.discord_status === "string") return nested;
    return undefined;
  }

  function presenceFromSocketMessage(message, userId, fallbackUsername) {
    if (!isRecord(message)) return { type: "ignore" };
    const op = numberField(message.op);
    if (op === 1) {
      const data = isRecord(message.d) ? message.d : undefined;
      const interval = data ? numberField(data.heartbeat_interval) : undefined;
      return { type: "hello", heartbeatMs: interval && interval >= 1000 ? interval : 30000 };
    }
    if (op !== 0) return { type: "ignore" };
    const eventName = stringField(message.t);
    if (eventName !== "INIT_STATE" && eventName !== "PRESENCE_UPDATE") return { type: "ignore" };
    const presence = extractPresence(message.d, userId);
    if (!presence) {
      if (eventName === "INIT_STATE") {
        return { type: "presence", view: fallbackPresence(fallbackUsername, "not-monitored") };
      }
      return { type: "ignore" };
    }
    return { type: "presence", view: readPresence(presence, fallbackUsername) };
  }

  return {
    normalizeDiscordUserId: normalizeDiscordUserId,
    fallbackPresence: fallbackPresence,
    safeImageUrl: safeImageUrl,
    discordAssetUrl: discordAssetUrl,
    avatarUrl: avatarUrl,
    trackProgress: trackProgress,
    formatClock: formatClock,
    readPresence: readPresence,
    presenceFromRest: presenceFromRest,
    presenceFromSocketMessage: presenceFromSocketMessage,
  };
});
