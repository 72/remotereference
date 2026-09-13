/**
 * Glass needs something behind it worth refracting — a flat ground makes the
 * material invisible. In light mode these have to stay far softer than their
 * dark-mode equivalents: on a warm off-white ground, saturated washes read as
 * decoration rather than as light.
 */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-canvas">
      <div
        className="absolute -top-28 -left-20 h-[24rem] w-[24rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, #cfe0f7 0%, transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-24 h-[22rem] w-[22rem] rounded-full opacity-45 blur-3xl"
        style={{ background: "radial-gradient(circle, #f3dcd0 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-24 left-1/5 h-[20rem] w-[20rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, #d8e6dc 0%, transparent 70%)" }}
      />
    </div>
  );
}
