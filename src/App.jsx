import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import { pages } from "./routes";

const { Home, LiveTV, Radio, News, Article, Schedule, About, Contact, Lab } = pages;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="live" element={<LiveTV />} />
          <Route path="radio" element={<Radio />} />
          <Route path="news" element={<News />} />
          <Route path="news/:slug" element={<Article />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          {/* Dev-only test page for the glass. Not included in the production site. */}
          {import.meta.env.DEV && <Route path="lab" element={<Lab />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}