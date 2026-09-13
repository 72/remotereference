/**
 * Glass is only legible when there is something behind it worth refracting.
 * A flat black app would make the material invisible.
 */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#07070a]">
      <div
        className="absolute -top-32 -left-24 h-[26rem] w-[26rem] rounded-full opacity-45 blur-3xl"
        style={{ background: "radial-gradient(circle, #1d4ed8 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-28 h-[24rem] w-[24rem] rounded-full opacity-35 blur-3xl"
        style={{ background: "radial-gradient(circle, #7e22ce 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-28 left-1/4 h-[22rem] w-[22rem] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, #0d9488 0%, transparent 70%)" }}
      />
    </div>
  );
}
