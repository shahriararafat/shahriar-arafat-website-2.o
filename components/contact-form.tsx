"use client";

import { useState, type FormEvent } from "react";
import { site } from "@/content/site";

type FormStatus = "idle" | "submitting" | "success" | "error";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function errorMessage(payload: unknown): string {
  if (!isRecord(payload)) return "The message could not be sent. Email me directly instead.";
  if (typeof payload.error === "string" && payload.error.trim()) return payload.error.trim();
  if (Array.isArray(payload.errors)) {
    const messages = payload.errors
      .map((item) => (isRecord(item) && typeof item.message === "string" ? item.message.trim() : ""))
      .filter(Boolean);
    if (messages.length > 0) return messages.join(" ");
  }
  return "The message could not be sent. Email me directly instead.";
}

const fieldClass =
  "w-full rounded-xl border border-line bg-background px-3 py-3 text-base text-foreground outline-none placeholder:text-muted";

export function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "submitting") return;
    const form = event.currentTarget;
    setStatus("submitting");
    setError("");
    try {
      const response = await fetch(site.contact.endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      let payload: unknown = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
      if (!response.ok) {
        setStatus("error");
        setError(errorMessage(payload));
        return;
      }
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
      setError("Could not send the message. Check your connection, or email me directly.");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="font-serif text-3xl">Message sent</h3>
        <p className="mt-3 text-muted">Thanks. Your message is on its way.</p>
        <button
          type="button"
          className="mt-6 inline-flex min-h-11 items-center rounded-full border border-line px-4 text-sm hover:bg-background"
          onClick={() => setStatus("idle")}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form action={site.contact.endpoint} method="POST" onSubmit={onSubmit} className="grid gap-4">
      {status === "error" ? (
        <p role="alert" className="rounded-xl border border-line bg-surface-2 px-3 py-3 text-sm">
          {error}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            disabled={status === "submitting"}
            className={fieldClass}
          />
        </div>
        <div className="grid gap-2">
          <label htmlFor="email" className="text-sm">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={status === "submitting"}
            className={fieldClass}
          />
        </div>
      </div>
      <div className="grid gap-2">
        <label htmlFor="message" className="text-sm">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={6}
          disabled={status === "submitting"}
          className={fieldClass}
        />
      </div>
      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-brass px-5 text-sm font-medium text-brass-ink disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
