// Time ago calculation
export function timeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff/60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)} hr ago`;
  return `${Math.floor(diff/86400)} days ago`;
}

// Shorten product name for table display
export function shortProductName(name, maxLen = 18) {
  if (!name) return "-";
  if (name.length <= maxLen) return name;
  return name.slice(0, maxLen) + "...";
}