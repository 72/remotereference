import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { prototypes } from "../registry";
import { useChrome } from "../shell/chrome";
import { snappy } from "../motion/springs";

export default function Home() {
  const navigate = useNavigate();
  useChrome({ title: "Prototypes" }, []);

  return (
    <div
      className="scrollbar-none h-full overflow-y-auto overscroll-contain px-4"
      style={{
        paddingTop: "calc(var(--chrome-top) + 0.5rem)",
        paddingBottom: "var(--chrome-bottom)",
      }}
    >
      <p className="mb-4 px-1 text-[13px] leading-snug text-white/45">
        Interaction studies. Each one targets a specific fidelity objective.
      </p>

      <div className="flex flex-col gap-3">
        {prototypes.map((p) => (
          <motion.button
            key={p.slug}
            type="button"
            onClick={() => navigate(`/p/${p.slug}`)}
            whileTap={{ scale: 0.975 }}
            transition={snappy}
            className="glass overflow-hidden rounded-[var(--radius-card)] text-left"
          >
            <div
              className="m-1.5 h-24 rounded-[var(--radius-inset)]"
              style={{
                backgroundImage: `linear-gradient(135deg, ${p.accent[0]}, ${p.accent[1]})`,
              }}
            />
            <div className="px-4 pt-2 pb-4">
              <h2 className="text-[16px] font-semibold tracking-tight">{p.title}</h2>
              <p className="mt-1 text-[13px] leading-snug text-white/55">{p.blurb}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.objectives.map((o) => (
                  <span
                    key={o}
                    className="rounded-full bg-white/12 px-2.5 py-[3px] text-[10px] font-medium text-white/70"
                  >
                    {o}
                  </span>
                ))}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
