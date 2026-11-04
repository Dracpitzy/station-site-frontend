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

export const topics = [
  "General enquiry",
  "News tip",
  "Programme feedback",
  "Advertising and partnerships",
  "Technical problem",
];

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

// Sends the message. For now it only waits a moment and says yes, so the form can be built and tested.
// When the Django API exists, replace the body with a request, for example:
//
//   const res = await fetch(`${API_URL}/contact/`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(message),
//   });
//   if (!res.ok) throw new Error("The message could not be sent");
//
// The form already handles a thrown error by showing a "try again" notice.
export async function submitContact(message) {
  if (import.meta.env.DEV) console.info("[contact] demo only, this message was not sent:", message);
  await new Promise((resolve) => setTimeout(resolve, 900));
  return { ok: true };
}