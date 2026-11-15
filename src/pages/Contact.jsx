import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import ContactIcon from "../components/ContactIcons";
import { Icon } from "../components/Icons";
import { station } from "../data/config";
import { photoProps } from "../data/images";
import { DEMO_MODE, MESSAGE_MAX, contactInfo, submitContact, topics, validateContact } from "../data/contact";
import { preloadProps } from "../routes";
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
  const [wasDemo, setWasDemo] = useState(false);
  const thanksRef = useRef(null);
  const photo = photoProps("studio", [800, 1280, 1920]);

  useEffect(() => {
    document.title = `Contact | ${station.name}`;
  }, []);

  // After sending, move focus to the result so screen readers announce it.
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
      setWasDemo(DEMO_MODE);
      setStatus("sent");
      return;
    }

    setStatus("sending");
    try {
      const result = await submitContact({
        name: values.name.trim(),
        email: values.email.trim(),
        topic: values.topic,
        message: values.message.trim(),
      });
      setWasDemo(result.demo);
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
    <div className="contactpage">
      <img className="contactpage__bg" {...photo} alt="" sizes="100vw" fetchPriority="high" decoding="async" />
      <div className="contactpage__shade" aria-hidden="true" />

      <div className="container">
        {/* Opening */}
        <header className="chero">
          <p className="chero__label">Contact ITV</p>
          <h1>Let’s talk.</h1>
          <p className="chero__intro">
            Questions, news tips, feedback on a programme or a problem with the stream. We read every message.
          </p>
        </header>

        <div className="cmain">
          {/* Contact details */}
          <div className="cinfo">
            <ul className="cdetails">
              <li>
                <ContactIcon name="mail" />
                <div>
                  <span className="cdetails__label">Email</span>
                  <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                </div>
              </li>
              <li>
                <ContactIcon name="mail" />
                <div>
                  <span className="cdetails__label">Newsroom and news tips</span>
                  <a href={`mailto:${contactInfo.newsroom}`}>{contactInfo.newsroom}</a>
                </div>
              </li>
              <li>
                <ContactIcon name="phone" />
                <div>
                  <span className="cdetails__label">Phone</span>
                  <a href={`tel:${contactInfo.phone.replace(/\s/g, "")}`}>{contactInfo.phone}</a>
                </div>
              </li>
              <li>
                <ContactIcon name="pin" />
                <div>
                  <span className="cdetails__label">Studio</span>
                  <span className="cdetails__value">
                    {contactInfo.address.map((line, i) => (
                      <span key={line}>
                        {i > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </span>
                </div>
              </li>
              <li>
                <ContactIcon name="clock" />
                <div>
                  <span className="cdetails__label">Office hours</span>
                  <span className="cdetails__value">{contactInfo.hours}</span>
                </div>
              </li>
            </ul>

            <div className="csocial">
              <span className="cdetails__label">Follow us</span>
              <ul>
                {contactInfo.socials.map((s) => (
                  <li key={s.name}>
                    <a
                      href={s.href}
                      aria-label={s.name}
                      {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <ContactIcon name={s.name} size={20} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* The form, on frosted glass */}
          <div className="cform">
            {status === "sent" ? (
              <div className="cthanks">
                <span className="cthanks__check" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="30" height="30">
                    <path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {wasDemo ? (
                  <>
                    <h2 tabIndex={-1} ref={thanksRef}>
                      Demo only, nothing was sent
                    </h2>
                    <p>This form is not connected to the station yet. Once it is, messages sent here will reach the team.</p>
                  </>
                ) : (
                  <>
                    <h2 tabIndex={-1} ref={thanksRef}>
                      Thank you{firstName ? `, ${firstName}` : ""}
                    </h2>
                    <p>Your message has been sent. If it needs a reply, we will write to you at {values.email.trim()}.</p>
                  </>
                )}
                <button type="button" className="btn btn--white" onClick={reset}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <h2 className="cform__title">Send us a message</h2>
                <p className="cform__lede">Tell us what it is about and we will point it at the right team.</p>

                {DEMO_MODE && <p className="cform__demo">Demo mode: messages are not sent yet.</p>}

                {status === "error" && (
                  <p className="cform__alert" role="alert">
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
                <div className="cform__hp" aria-hidden="true">
                  <label htmlFor="contact-website">Leave this empty</label>
                  <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={change("website")} />
                </div>

                <button type="submit" className="btn btn--primary cform__send" disabled={status === "sending"}>
                  <Icon name="mail" size={18} />
                  {status === "sending" ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Closing */}
        <div className="cclose">
          <p>We are on air 24 hours a day.</p>
          <div className="cclose__links">
            <Link to="/live" className="btn btn--white" {...preloadProps("LiveTV")}>
              Watch live
            </Link>
            <Link to="/radio" className="btn cclose__ghost" {...preloadProps("Radio")}>
              Listen live
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}