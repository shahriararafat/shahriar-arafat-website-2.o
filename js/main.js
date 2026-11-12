(function () {
  var body = document.body;
  var email = body.getAttribute("data-email");
  var discordUsername = body.getAttribute("data-discord-username");
  var userId = Lanyard.normalizeDiscordUserId(
    (document.querySelector('meta[name="discord-user-id"]') || {}).content,
  );
  var statusLabel = {
    online: "Online",
    idle: "Idle",
    dnd: "Do not disturb",
    offline: "Offline",
  };

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function copyText(value) {
    if (!navigator.clipboard) return Promise.resolve(false);
    return navigator.clipboard.writeText(value).then(
      function () { return true; },
      function () { return false; },
    );
  }

  function jumpTo(id) {
    var target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch (error) {}
    var button = document.getElementById("theme-toggle");
    if (!button) return;
    var next = theme === "dark" ? "light" : "dark";
    button.textContent = theme === "dark" ? "Dark" : "Light";
    button.setAttribute("aria-label", "Switch to " + next + " theme");
  }

  function initTheme() {
    applyTheme(currentTheme());
    document.getElementById("theme-toggle").addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  }

  function initClock() {
    var time = document.getElementById("clock-time");
    var date = document.getElementById("clock-date");
    var timeFormat = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dhaka",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    var dateFormat = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dhaka",
      weekday: "short",
      day: "numeric",
      month: "short",
    });
    function tick() {
      var now = new Date();
      time.dateTime = now.toISOString();
      time.textContent = timeFormat.format(now).replace(/[\u202f\u00a0]/g, "");
      date.textContent = dateFormat.format(now).replace(/[\u202f\u00a0]/g, " ");
    }
    tick();
    window.setInterval(tick, 1000);
  }

  function initPalette() {
    var dialog = document.getElementById("command-palette");
    var input = document.getElementById("command-input");
    var list = document.getElementById("command-list");
    var notice = document.getElementById("command-notice");
    var active = 0;
    var visible = [];

    var commands = [{ id: "top", group: "Navigate", label: "Top", run: function () { jumpTo("top"); } }];
    document.querySelectorAll("nav a").forEach(function (link) {
      commands.push({
        id: link.getAttribute("href").slice(1),
        group: "Navigate",
        label: link.textContent,
        run: function () { jumpTo(link.getAttribute("href").slice(1)); },
      });
    });
    commands.push(
      {
        id: "copy-email",
        group: "Actions",
        label: "Copy email",
        hint: email,
        keepOpen: true,
        run: function () {
          return copyText(email).then(function (ok) {
            notice.textContent = ok ? "Copied email" : "Could not copy the email";
          });
        },
      },
      {
        id: "copy-discord",
        group: "Actions",
        label: "Copy Discord username",
        hint: discordUsername,
        keepOpen: true,
        run: function () {
          return copyText(discordUsername).then(function (ok) {
            notice.textContent = ok ? "Copied Discord username" : "Could not copy the username";
          });
        },
      },
      {
        id: "resume",
        group: "Actions",
        label: "Open resume",
        run: function () { window.open("Shahriar-Arafat-Resume.pdf", "_blank", "noopener,noreferrer"); },
      },
      {
        id: "theme",
        group: "Actions",
        label: currentTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme",
        run: function () { applyTheme(currentTheme() === "dark" ? "light" : "dark"); },
      },
    );
    document.querySelectorAll(".socials a").forEach(function (link) {
      commands.push({
        id: "social-" + link.textContent.trim(),
        group: "Social",
        label: "Open " + link.childNodes[0].textContent.trim(),
        hint: link.href,
        run: function () { window.open(link.href, "_blank", "noopener,noreferrer"); },
      });
    });

    function render() {
      var query = input.value.trim().toLowerCase();
      visible = commands.filter(function (command) {
        return (command.label + " " + (command.hint || "")).toLowerCase().indexOf(query) !== -1;
      });
      if (active > visible.length - 1) active = Math.max(visible.length - 1, 0);
      list.textContent = "";
      if (!visible.length) {
        var empty = document.createElement("p");
        empty.className = "empty";
        empty.style.padding = "1.5rem 0.75rem";
        empty.textContent = "No matching commands";
        list.appendChild(empty);
        input.removeAttribute("aria-activedescendant");
        return;
      }
      ["Navigate", "Actions", "Social"].forEach(function (group) {
        var items = visible.filter(function (command) { return command.group === group; });
        if (!items.length) return;
        var wrap = document.createElement("div");
        wrap.setAttribute("role", "group");
        wrap.setAttribute("aria-label", group);
        var label = document.createElement("p");
        label.className = "command-group-label";
        label.textContent = group;
        wrap.appendChild(label);
        items.forEach(function (command) {
          var index = visible.indexOf(command);
          var row = document.createElement("div");
          row.className = "command";
          row.id = "command-" + command.id;
          row.setAttribute("role", "option");
          row.setAttribute("aria-selected", index === active ? "true" : "false");
          var name = document.createElement("span");
          name.textContent = command.label;
          row.appendChild(name);
          if (command.hint) {
            var hint = document.createElement("small");
            hint.textContent = command.hint.replace(/^https?:\/\//, "");
            row.appendChild(hint);
          }
          row.addEventListener("mouseenter", function () {
            if (active === index) return;
            active = index;
            list.querySelectorAll(".command").forEach(function (item) {
              item.setAttribute("aria-selected", item === row ? "true" : "false");
            });
            input.setAttribute("aria-activedescendant", row.id);
          });
          row.addEventListener("mousedown", function (event) { event.preventDefault(); });
          row.addEventListener("click", function () { run(command); });
          wrap.appendChild(row);
        });
        list.appendChild(wrap);
      });
      input.setAttribute("aria-activedescendant", "command-" + visible[active].id);
    }

    function run(command) {
      if (!command) return;
      Promise.resolve(command.run()).then(function () {
        if (!command.keepOpen) dialog.close();
      });
    }

    function openPalette() {
      if (dialog.open) {
        dialog.close();
        return;
      }
      commands.forEach(function (command) {
        if (command.id === "theme") {
          command.label = currentTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme";
        }
      });
      input.value = "";
      notice.textContent = "";
      active = 0;
      dialog.showModal();
      render();
      input.focus();
    }

    document.getElementById("command-open").addEventListener("click", openPalette);
    input.addEventListener("input", function () { active = 0; render(); });
    input.addEventListener("keydown", function (event) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        if (!visible.length) return;
        active = event.key === "ArrowDown"
          ? Math.min(active + 1, visible.length - 1)
          : Math.max(active - 1, 0);
        render();
        var selected = document.getElementById("command-" + visible[active].id);
        if (selected) selected.scrollIntoView({ block: "nearest" });
      } else if (event.key === "Enter") {
        event.preventDefault();
        run(visible[active]);
      }
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
    window.addEventListener("keydown", function (event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPalette();
      }
    });
  }

  function initProjects() {
    var dialog = document.getElementById("project-dialog");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".project-card"));
    var filters = document.querySelectorAll("[data-filter]");
    var empty = document.getElementById("project-empty");

    function applyFilter(name) {
      var shown = 0;
      cards.forEach(function (card) {
        var match = name === "All" || card.getAttribute("data-category") === name;
        card.hidden = !match;
        if (match) shown += 1;
      });
      empty.hidden = shown !== 0;
      filters.forEach(function (button) {
        button.setAttribute("aria-pressed", button.getAttribute("data-filter") === name ? "true" : "false");
      });
    }

    filters.forEach(function (button) {
      button.addEventListener("click", function () { applyFilter(button.getAttribute("data-filter")); });
    });

    function fillList(node, values) {
      node.textContent = "";
      values.forEach(function (value) {
        var item = document.createElement("li");
        item.textContent = value;
        node.appendChild(item);
      });
    }

    document.getElementById("project-list").addEventListener("click", function (event) {
      var button = event.target.closest("button[data-title]");
      if (!button) return;
      document.getElementById("project-dialog-category").textContent = button.getAttribute("data-category") || "";
      document.getElementById("project-dialog-title").textContent = button.getAttribute("data-title") || "";
      var image = document.getElementById("project-dialog-image");
      image.src = button.getAttribute("data-image") || "";
      image.alt = button.getAttribute("data-alt") || "";
      var description = document.getElementById("project-dialog-description");
      description.textContent = button.getAttribute("data-description") || "";
      description.hidden = !description.textContent;
      var links = document.getElementById("project-dialog-links");
      links.textContent = "";
      [["data-live", "Live site"], ["data-github", "GitHub"]].forEach(function (pair) {
        var href = button.getAttribute(pair[0]);
        if (!href) return;
        var anchor = document.createElement("a");
        anchor.className = pair[0] === "data-live" ? "button-brass" : "button";
        anchor.href = href;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = pair[1];
        links.appendChild(anchor);
      });
      links.hidden = !links.childElementCount;
      var tech = document.getElementById("project-dialog-tech");
      var techValues = (button.getAttribute("data-tech") || "").split(",").map(function (item) { return item.trim(); }).filter(Boolean);
      fillList(tech.querySelector("ul"), techValues);
      tech.hidden = techValues.length === 0;
      var features = document.getElementById("project-dialog-features");
      var featureValues = (button.getAttribute("data-features") || "").split("|").map(function (item) { return item.trim(); }).filter(Boolean);
      fillList(features.querySelector("ul"), featureValues);
      features.hidden = featureValues.length === 0;
      dialog.showModal();
      document.getElementById("project-dialog-title").focus();
    });

    document.getElementById("project-close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
  }

  function initContact() {
    var form = document.getElementById("contact-form");
    var error = document.getElementById("form-error");
    var success = document.getElementById("form-success");
    var submit = document.getElementById("form-submit");

    function messageFrom(payload) {
      if (!payload || typeof payload !== "object") return "The message could not be sent. Email me directly instead.";
      if (typeof payload.error === "string" && payload.error.trim()) return payload.error.trim();
      if (Array.isArray(payload.errors)) {
        var messages = payload.errors.map(function (item) {
          return item && typeof item.message === "string" ? item.message.trim() : "";
        }).filter(Boolean);
        if (messages.length) return messages.join(" ");
      }
      return "The message could not be sent. Email me directly instead.";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (submit.disabled) return;
      submit.disabled = true;
      submit.textContent = "Sending…";
      error.hidden = true;
      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      }).then(function (response) {
        return response.json().catch(function () { return null; }).then(function (payload) {
          if (!response.ok) throw new Error(messageFrom(payload));
          form.reset();
          form.hidden = true;
          success.hidden = false;
        });
      }).catch(function (reason) {
        error.textContent = reason && reason.message && reason.message !== "Failed to fetch"
          ? reason.message
          : "Could not send the message. Check your connection, or email me directly.";
        error.hidden = false;
      }).then(function () {
        submit.disabled = false;
        submit.textContent = "Send message";
      });
    });

    document.getElementById("form-again").addEventListener("click", function () {
      success.hidden = true;
      form.hidden = false;
    });
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function initDiscord() {
    var card = document.getElementById("discord-card");
    var slot = document.getElementById("discord-body");
    var progressTimer;

    document.getElementById("copy-discord").addEventListener("click", function () {
      copyText(discordUsername).then(function (ok) {
        document.getElementById("copy-discord-note").textContent = ok ? "Copied username" : "Could not copy the username";
      });
    });

    if (!userId) return;

    function showFallback() {
      card.setAttribute("data-presence", "");
      slot.textContent = "";
      slot.appendChild(el("p", "discord-name", discordUsername));
      var button = el("button", "button", "Copy username");
      button.type = "button";
      button.style.marginTop = "1rem";
      var note = el("p", "copy-note", "");
      note.setAttribute("role", "status");
      button.addEventListener("click", function () {
        copyText(discordUsername).then(function (ok) {
          note.textContent = ok ? "Copied username" : "Could not copy the username";
        });
      });
      slot.appendChild(button);
      slot.appendChild(note);
    }

    function showLoading() {
      slot.textContent = "";
      var bar = el("div");
      bar.style.cssText = "height:1.75rem;width:10rem;margin-top:1rem;border-radius:0.4rem;background:var(--surface-2)";
      slot.appendChild(bar);
      slot.appendChild(el("p", "copy-note", "Loading status…"));
    }

    function activityNode(activity) {
      var item = el("li", "activity");
      if (activity.kind === "custom") {
        item.appendChild(el("p", "", (activity.emoji ? activity.emoji + " " : "") + activity.text));
        return item;
      }
      if (activity.imageUrl || activity.albumArtUrl) {
        var image = document.createElement("img");
        image.src = activity.albumArtUrl || activity.imageUrl;
        image.alt = "";
        image.width = 48;
        image.height = 48;
        item.appendChild(image);
      }
      var copy = el("div");
      if (activity.kind === "spotify") {
        copy.appendChild(el("p", "activity-kicker", "Listening · Spotify"));
        copy.appendChild(el("p", "", activity.song));
        copy.appendChild(el("p", "discord-user", activity.artist));
        if (activity.album) copy.appendChild(el("p", "discord-user", activity.album));
        if (activity.start != null && activity.end != null && activity.end > activity.start) {
          var track = el("div", "track");
          var bar = el("div", "track-bar");
          bar.setAttribute("role", "progressbar");
          bar.setAttribute("aria-label", "Spotify track progress");
          bar.setAttribute("aria-valuemin", "0");
          bar.setAttribute("aria-valuemax", "100");
          var fill = document.createElement("span");
          bar.appendChild(fill);
          var times = el("p", "track-times");
          var elapsed = el("span");
          var duration = el("span");
          times.appendChild(elapsed);
          times.appendChild(duration);
          track.appendChild(bar);
          track.appendChild(times);
          function paint() {
            var progress = Lanyard.trackProgress(activity.start, activity.end, Date.now());
            fill.style.width = (progress.ratio * 100) + "%";
            bar.setAttribute("aria-valuenow", String(Math.round(progress.ratio * 100)));
            elapsed.textContent = Lanyard.formatClock(progress.elapsed);
            duration.textContent = Lanyard.formatClock(progress.duration);
          }
          paint();
          progressTimer = window.setInterval(paint, 1000);
          copy.appendChild(track);
        }
      } else {
        copy.appendChild(el("p", "activity-kicker", activity.action));
        copy.appendChild(el("p", "", activity.name));
        if (activity.details) copy.appendChild(el("p", "", activity.details));
        if (activity.state) copy.appendChild(el("p", "discord-user", activity.state));
      }
      item.appendChild(copy);
      return item;
    }

    function showLive(view) {
      window.clearInterval(progressTimer);
      card.setAttribute("data-presence", view.status);
      slot.textContent = "";
      var identity = el("div", "identity");
      if (view.avatarUrl) {
        var avatar = document.createElement("img");
        avatar.className = "avatar";
        avatar.src = view.avatarUrl;
        avatar.alt = "";
        avatar.width = 40;
        avatar.height = 40;
        identity.appendChild(avatar);
      }
      var names = el("div");
      var status = el("p", "status-line");
      var dot = el("span", "dot");
      dot.setAttribute("data-presence", view.status);
      dot.setAttribute("aria-hidden", "true");
      status.appendChild(dot);
      status.appendChild(document.createTextNode(statusLabel[view.status] || "Offline"));
      names.appendChild(status);
      names.appendChild(el("p", "discord-name", view.displayName));
      if (view.username !== view.displayName) names.appendChild(el("p", "discord-user", view.username));
      identity.appendChild(names);
      slot.appendChild(identity);
      if (view.activities.length) {
        var list = el("ul", "activities");
        view.activities.forEach(function (activity) { list.appendChild(activityNode(activity)); });
        slot.appendChild(list);
      }
    }

    function apply(view) {
      if (!view || view.mode !== "live") showFallback();
      else showLive(view);
    }

    showLoading();
    var stopped = false;
    var socket = null;
    var heartbeat;
    var restTimer;
    var restActive = false;

    function stopHeartbeat() {
      window.clearInterval(heartbeat);
      heartbeat = undefined;
    }

    function pullRest() {
      fetch("https://api.lanyard.rest/v1/users/" + userId)
        .then(function (response) { return response.json(); })
        .then(function (payload) {
          var next = Lanyard.presenceFromRest(payload, discordUsername);
          if (!stopped) apply(next);
          if (next.mode === "fallback" && next.reason === "not-monitored") {
            window.clearInterval(restTimer);
          }
        })
        .catch(function () {
          if (!stopped) showFallback();
        });
    }

    function startRest() {
      if (restActive || stopped) return;
      restActive = true;
      stopHeartbeat();
      if (socket) socket.close();
      pullRest();
      restTimer = window.setInterval(pullRest, 30000);
    }

    try {
      socket = new WebSocket("wss://api.lanyard.rest/socket");
    } catch (error) {
      startRest();
      return;
    }

    socket.addEventListener("message", function (event) {
      if (typeof event.data !== "string") return;
      var parsed;
      try { parsed = JSON.parse(event.data); } catch (error) { return; }
      var effect = Lanyard.presenceFromSocketMessage(parsed, userId, discordUsername);
      if (effect.type === "hello") {
        stopHeartbeat();
        heartbeat = window.setInterval(function () {
          if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ op: 3 }));
        }, effect.heartbeatMs);
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userId } }));
        }
        return;
      }
      if (effect.type !== "presence" || stopped) return;
      apply(effect.view);
      if (effect.view.mode === "fallback" && effect.view.reason === "not-monitored") {
        stopped = true;
        stopHeartbeat();
        socket.close();
      }
    });
    socket.addEventListener("error", startRest);
    socket.addEventListener("close", function () {
      if (!stopped) startRest();
    });
  }

  initTheme();
  initClock();
  initPalette();
  initProjects();
  initContact();
  initDiscord();
})();
