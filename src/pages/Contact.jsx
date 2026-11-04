import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import PageBand from "../components/PageBand";
import { Icon } from "../components/Icons";
import { station } from "../data/config";
import { MESSAGE_MAX, contactInfo, submitContact, topics, validateContact } from "../data/contact";
import "../styles/contact.css";

const EMPTY = { name: "", email: "", topic: topics[0], message: "", website: "" };
const ORDER = ["name", "email", "message"];

function FieldError({ id, text }) {
  return (
    <p className="field__error" id={id} hidden={!text}>
      {text}
    </p>
  );
}

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const thanksRef = useRef(null);

  useEffect(() => {
    document.title = `Contact | ${station.name}`;
  }, []);

  // After sending, move focus to the thank-you so screen readers announce it.
  useEffect(() => {
    if (status === "sent") thanksRef.current?.focus();
  }, [status]);

  const change = (name) => (e) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [name]: value }));
    // A field stops being marked wrong as soon as the visitor starts fixing it
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const fieldProps = (name) => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    onChange: change(name),
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
  });

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;

    const found = validateContact(values);
    setErrors(found);
    const first = ORDER.find((key) => found[key]);
    if (first) {
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    if (values.website) {
      // A person never sees the hidden field, so a program filled it in. Pretend it worked.
      setStatus("sent");
      return;
    }

    setStatus("sending");
    try {
      await submitContact({
        name: values.name.trim(),
        email: values.email.trim(),
        topic: values.topic,
        message: values.message.trim(),
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  function reset() {
    setValues(EMPTY);
    setErrors({});
    setStatus("idle");
  }

  const firstName = values.name.trim().split(" ")[0];

  return (
    <>
      <PageBand eyebrow="Contact" title="Get in touch">
        Questions, news tips, feedback on a programme or a problem with the stream. We read every message.
      </PageBand>

      <div className="container contact">
        <div className="contact__form">
          {status === "sent" ? (
            <div className="contact__thanks">
              <span className="contact__check" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="30" height="30">
                  <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h2 tabIndex={-1} ref={thanksRef}>
                Thank you{firstName ? `, ${firstName}` : ""}
              </h2>
              <p>Your message is on its way to the team. If it needs a reply, we will write to you at {values.email.trim()}.</p>
              <div className="contact__thanks-actions">
                <button type="button" className="btn btn--primary" onClick={reset}>
                  Send another message
                </button>
                <Link to="/" className="btn btn--soft">
                  Back to home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <h2 className="contact__title">Send us a message</h2>

              {status === "error" && (
                <p className="contact__alert" role="alert">
                  Sorry, your message could not be sent. Please try again, or write to us at {contactInfo.email}.
                </p>
              )}

              <div className="field-row">
                <div className="field">
                  <label htmlFor="contact-name">Your name</label>
                  <input {...fieldProps("name")} type="text" autoComplete="name" required />
                  <FieldError id="contact-name-error" text={errors.name} />
                </div>
                <div className="field">
                  <label htmlFor="contact-email">Email address</label>
                  <input {...fieldProps("email")} type="email" autoComplete="email" inputMode="email" required />
                  <FieldError id="contact-email-error" text={errors.email} />
                </div>
              </div>

              <div className="field">
                <label htmlFor="contact-topic">What is it about?</label>
                <select {...fieldProps("topic")}>
                  {topics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="contact-message">Your message</label>
                <textarea {...fieldProps("message")} rows={6} maxLength={MESSAGE_MAX + 200} required />
                <div className="field__foot">
                  <FieldError id="contact-message-error" text={errors.message} />
                  <span className="field__count" aria-hidden="true">
                    {values.message.length} / {MESSAGE_MAX}
                  </span>
                </div>
              </div>

              {/* Hidden from people. Bots fill it in. */}
              <div className="contact__hp" aria-hidden="true">
                <label htmlFor="contact-website">Leave this empty</label>
                <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={change("website")} />
              </div>

              <button type="submit" className="btn btn--primary contact__send" disabled={status === "sending"}>
                <Icon name="mail" size={18} />
                {status === "sending" ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>

        <aside className="contact__info" aria-label="Contact details">
          <dl className="info-card">
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
            </dd>
            <dt>Newsroom and news tips</dt>
            <dd>
              <a href={`mailto:${contactInfo.newsroom}`}>{contactInfo.newsroom}</a>
            </dd>
          </dl>

          <dl className="info-card">
            <dt>Phone</dt>
            <dd>
              <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}>{contactInfo.phone}</a>
            </dd>
            <dt>Office hours</dt>
            <dd>{contactInfo.hours}</dd>
          </dl>

          <dl className="info-card">
            <dt>Visit the studio</dt>
            <dd>
              {contactInfo.address.map((line, i) => (
                <span key={line}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </dd>
            <dt>On air</dt>
            <dd>
              {station.name} Radio {station.frequency}, and ITV on TV, 24 hours a day
            </dd>
          </dl>

          <div className="info-card">
            <p className="info-card__label">Follow us</p>
            <ul className="socials">
              {contactInfo.socials.map((s) => (
                <li key={s.name}>
                  <a href={s.href}>{s.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}