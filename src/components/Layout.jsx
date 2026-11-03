import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import MiniPlayer from "./MiniPlayer";
import ScrollToTop from "./ScrollToTop";

export default function Layout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main>
        <Suspense fallback={<div className="page-fallback" />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <MiniPlayer />
    </>
  );
}