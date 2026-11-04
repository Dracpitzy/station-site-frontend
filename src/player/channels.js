// Only one broadcast sounds at a time. Whoever starts takes over,
// and the one that was playing is stopped. TV and radio both use this,
// so neither has to import the other.

const stoppers = new Map();
let owner = null;

// Each player says how it can be stopped.
export function register(name, stop) {
  stoppers.set(name, stop);
}

// Called when a player really starts. The previous owner, if any, is stopped.
export function claim(name) {
  const previous = owner;
  owner = name;
  if (previous && previous !== name) stoppers.get(previous)?.();
}

// Called when a player stops by itself.
export function release(name) {
  if (owner === name) owner = null;
}

export const activeChannel = () => owner;