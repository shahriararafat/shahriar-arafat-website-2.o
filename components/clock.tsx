"use client";

import { useEffect, useState } from "react";
import { formatDhakaClock } from "@/lib/dhaka-time";

export function Clock() {
  const [clock, setClock] = useState<ReturnType<typeof formatDhakaClock> | null>(null);

  useEffect(() => {
    const update = () => setClock(formatDhakaClock(new Date()));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="text-right leading-tight" aria-label="Dhaka time">
      <time
        dateTime={clock?.iso}
        className="block min-w-[5.6rem] text-sm font-medium tabular-nums"
        suppressHydrationWarning
      >
        {clock?.time ?? ""}
      </time>
      <span className="block text-[11px] whitespace-nowrap text-muted">
        {clock ? (
          <>
            <span className="hidden min-[420px]:inline">{clock.dateLabel} · </span>
            Dhaka
          </>
        ) : (
          "Dhaka"
        )}
      </span>
    </div>
  );
}
