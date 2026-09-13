import type { CSSProperties } from "react";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { DeviceFrame } from "./shell/DeviceFrame";
import { AmbientBackground } from "./shell/AmbientBackground";
import { ChromeProvider } from "./shell/chrome";
import { Header } from "./shell/Header";
import { TabBar } from "./shell/TabBar";
import { findPrototype } from "./registry";
import Home from "./screens/Home";
import Gallery from "./screens/Gallery";

function PrototypeRoute() {
  const { slug } = useParams();
  const entry = findPrototype(slug);
  if (!entry) return <Navigate to="/" replace />;
  return <entry.Screen />;
}

export default function App() {
  return (
    <DeviceFrame>
      <ChromeProvider>
        {/* Screens read these to clear the floating bars they scroll beneath. */}
        <div
          className="relative h-full overflow-hidden"
          style={
            {
              "--chrome-top": "calc(var(--safe-top, 0px) + 3.25rem)",
              "--chrome-bottom": "calc(min(var(--safe-bottom, 0px), 1rem) + 5.5rem)",
            } as CSSProperties
          }
        >
          <AmbientBackground />

          {/* Content runs edge to edge; the bars float above it. */}
          <main className="absolute inset-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/p/:slug" element={<PrototypeRoute />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          <Header />
          <TabBar />
        </div>
      </ChromeProvider>
    </DeviceFrame>
  );
}
