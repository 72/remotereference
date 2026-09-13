import { Navigate, Route, Routes, useParams } from "react-router-dom";
import { DeviceFrame } from "./shell/DeviceFrame";
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
        {/* Header and TabBar sit outside <Routes> — they never unmount. */}
        <div className="flex h-full flex-col bg-black">
          <Header />
          <main className="relative min-h-0 flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/p/:slug" element={<PrototypeRoute />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <TabBar />
        </div>
      </ChromeProvider>
    </DeviceFrame>
  );
}
