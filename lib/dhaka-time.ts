const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  weekday: "short",
  day: "numeric",
  month: "short",
});

export function formatDhakaClock(date: Date): {
  time: string;
  dateLabel: string;
  iso: string;
} {
  return {
    time: timeFormatter.format(date).replace(/[\u202f\u00a0]/g, ""),
    dateLabel: dateFormatter.format(date).replace(/[\u202f\u00a0]/g, " "),
    iso: date.toISOString(),
  };
}
