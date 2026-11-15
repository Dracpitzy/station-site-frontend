// "42 min left", or "1h 5m left" once it is an hour or more
export const timeLeft = (min) => (min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m left` : `${min} min left`);