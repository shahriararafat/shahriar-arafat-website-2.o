const test = require("node:test");
const assert = require("node:assert/strict");
const Lanyard = require("./lanyard.js");

const username = "shahriararafat";

test("normalizeDiscordUserId keeps a snowflake and rejects anything else", function () {
  assert.equal(Lanyard.normalizeDiscordUserId(" 100000000000000001 "), "100000000000000001");
  assert.equal(Lanyard.normalizeDiscordUserId(undefined), "");
  assert.equal(Lanyard.normalizeDiscordUserId(""), "");
  assert.equal(Lanyard.normalizeDiscordUserId("abc"), "");
  assert.equal(Lanyard.normalizeDiscordUserId("1234"), "");
});

test("fallback presence uses the site username", function () {
  assert.deepEqual(Lanyard.fallbackPresence(username, "missing-id"), {
    mode: "fallback",
    username: username,
    reason: "missing-id",
  });
});

test("user-not-monitored becomes the username fallback", function () {
  assert.deepEqual(
    Lanyard.presenceFromRest(
      {
        success: false,
        error: { code: "user_not_monitored", message: "User is not being monitored by Lanyard" },
      },
      username,
    ),
    { mode: "fallback", username: username, reason: "not-monitored" },
  );
});

test("broken payloads fall back", function () {
  assert.equal(Lanyard.presenceFromRest(null, username).mode, "fallback");
  assert.equal(Lanyard.presenceFromRest({ success: false, error: { code: "nope" } }, username).reason, "unavailable");
  assert.equal(Lanyard.presenceFromRest({ success: true }, username).reason, "unavailable");
  assert.equal(Lanyard.presenceFromRest({ success: true, data: {} }, username).reason, "unavailable");
});

test("reads status, spotify, a game, and a custom status", function () {
  const view = Lanyard.presenceFromRest(
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
          timestamps: { start: 1000, end: 5000 },
        },
        activities: [
          { type: 2, name: "Spotify", details: "Sample Track", state: "Sample Artist" },
          {
            type: 0,
            name: "Sample Game",
            details: "In a match",
            state: "Ranked",
            application_id: "383226320970055681",
            assets: { large_image: "565945077491433494" },
          },
          { type: 4, name: "Custom Status", state: "studying", emoji: { name: "📚", id: null } },
          { type: 4, name: "Custom Status", state: "custom emoji", emoji: { name: "wave", id: "999" } },
        ],
      },
    },
    username,
  );

  assert.equal(view.mode, "live");
  assert.equal(view.status, "online");
  assert.equal(view.username, "sampleuser");
  assert.equal(view.displayName, "Sample Name");
  assert.equal(
    view.avatarUrl,
    "https://cdn.discordapp.com/avatars/100000000000000001/a_abc123.gif?size=128",
  );
  assert.deepEqual(
    view.activities.map(function (activity) {
      return activity.kind;
    }),
    ["spotify", "activity", "custom", "custom"],
  );
  assert.equal(view.activities[0].song, "Sample Track");
  assert.equal(view.activities[0].albumArtUrl, "https://i.scdn.co/image/samplealbum");
  assert.equal(
    view.activities[1].imageUrl,
    "https://cdn.discordapp.com/app-assets/383226320970055681/565945077491433494.png",
  );
  assert.deepEqual(view.activities[2], { kind: "custom", text: "studying", emoji: "📚" });
  assert.deepEqual(view.activities[3], { kind: "custom", text: "custom emoji", emoji: undefined });
});

test("maps idle, dnd, offline, and unknown status", function () {
  ["idle", "dnd", "offline"].forEach(function (status) {
    const view = Lanyard.readPresence({ discord_status: status, activities: [] }, username);
    assert.equal(view.status, status);
    assert.equal(view.username, username);
  });
  assert.equal(Lanyard.readPresence({ discord_status: "invisible", activities: [] }, username).status, "offline");
  assert.equal(Lanyard.readPresence({ discord_status: "dnd" }, username).displayName, username);
});

test("socket hello, init state, and missing user", function () {
  assert.deepEqual(Lanyard.presenceFromSocketMessage({ op: 1, d: { heartbeat_interval: 41250 } }, "1", username), {
    type: "hello",
    heartbeatMs: 41250,
  });
  assert.equal(Lanyard.presenceFromSocketMessage({ op: 1, d: {} }, "1", username).heartbeatMs, 30000);

  const init = Lanyard.presenceFromSocketMessage(
    {
      op: 0,
      t: "INIT_STATE",
      d: {
        discord_status: "dnd",
        discord_user: { username: "phin", global_name: "Phineas", id: "100000000000000009" },
        activities: [],
      },
    },
    "100000000000000009",
    username,
  );
  assert.equal(init.view.status, "dnd");
  assert.equal(init.view.displayName, "Phineas");

  const mapped = Lanyard.presenceFromSocketMessage(
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
  assert.equal(mapped.view.username, "phin");

  assert.equal(
    Lanyard.presenceFromSocketMessage({ op: 0, t: "INIT_STATE", d: {} }, "100000000000000009", username).view.reason,
    "not-monitored",
  );
  assert.deepEqual(Lanyard.presenceFromSocketMessage(null, "1", username), { type: "ignore" });
  assert.deepEqual(Lanyard.presenceFromSocketMessage({ op: 0, t: "PRESENCE_UPDATE", d: {} }, "1", username), {
    type: "ignore",
  });
});

test("image urls and playback", function () {
  assert.equal(
    Lanyard.discordAssetUrl(undefined, "mp:external/hash/https/i.scdn.co/image/abc"),
    "https://media.discordapp.net/external/hash/https/i.scdn.co/image/abc",
  );
  assert.equal(
    Lanyard.discordAssetUrl(undefined, "spotify:ab67616d0000b273sample"),
    "https://i.scdn.co/image/ab67616d0000b273sample",
  );
  assert.equal(Lanyard.safeImageUrl("http://i.scdn.co/image/abc"), undefined);
  assert.equal(Lanyard.safeImageUrl("https://evil.example/image.png"), undefined);
  assert.equal(Lanyard.safeImageUrl("https://user:pass@i.scdn.co/image/abc"), undefined);
  assert.deepEqual(Lanyard.trackProgress(0, 1000, 500), { ratio: 0.5, elapsed: 500, duration: 1000 });
  assert.deepEqual(Lanyard.trackProgress(0, 1000, 5000), { ratio: 1, elapsed: 1000, duration: 1000 });
  assert.equal(Lanyard.formatClock(65000), "1:05");
  assert.equal(Lanyard.formatClock(-20), "0:00");
});
