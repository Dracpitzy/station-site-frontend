// Placeholders. Replace with the station's real details before going live.
export const contactInfo = {
  email: "hello@itv.example",
  newsroom: "newsroom@itv.example",
  phone: "+234 000 000 0000",
  address: ["ITV House, Studio Road", "Lagos, Nigeria"],
  hours: "Monday to Friday, 8:00 AM to 6:00 PM",
  socials: [
    { name: "Facebook", href: "#" },
    { name: "X", href: "#" },
    { name: "Instagram", href: "#" },
    { name: "YouTube", href: "#" },
  ],
};

export const topics = ["General enquiries", "Newsroom", "Advertising", "Technical support", "Partnerships"];

export const MESSAGE_MAX = 1000;
const MESSAGE_MIN = 10;

// Checks the form and returns a message for every field that is wrong. An empty object means all is well.
export function validateContact(values) {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const message = values.message.trim();

  if (name.length < 2) errors.name = "Please tell us your name.";

  if (!email) errors.email = "Please enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "That email address does not look right.";

  if (!message) errors.message = "Please write your message.";
  else if (message.length < MESSAGE_MIN) errors.message = "Your message is a little short. Please add a few more words.";
  else if (message.length > MESSAGE_MAX) errors.message = `Please keep your message under ${MESSAGE_MAX.toLocaleString("en-US")} characters.`;

  return errors;
}

// Where messages go. Set VITE_API_URL (for example in a .env file) to the address of the station's API,
// and the form posts each message as JSON to <that address>/contact/. Without it the form runs in demo mode:
// it checks the message and says plainly that nothing was sent.
const API_URL = import.meta.env.VITE_API_URL;
export const DEMO_MODE = !API_URL;

// Sends the message. Resolves with { demo } on success and throws if the message could not be sent.
export async function submitContact(message) {
  if (DEMO_MODE) {
    if (import.meta.env.DEV) console.info("[contact] demo mode, this message was not sent:", message);
    await new Promise((resolve) => setTimeout(resolve, 900));
    return { demo: true };
  }

  const response = await fetch(`${API_URL.replace(/\/$/, "")}/contact/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message),
  });
  if (!response.ok) throw new Error("The message could not be sent");
  return { demo: false };
}