import { Reveal } from "./Reveal";

export function Archive() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0a] text-white">
      {/* Curved cap — light area arching down into dark section's top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[40vh] left-1/2 -translate-x-1/2 rounded-[50%] bg-paper"
        style={{
          width: "240vw",
          height: "60vh",
        }}
      />

      <div className="relative px-8 pt-[28vh] pb-[28vh]">
        <div className="relative mx-auto flex min-h-[320px] max-w-[1280px] items-center justify-center">
          {/* Outline italic Digital backdrop */}
          <Reveal
            variant="fade"
            duration={1600}
            as="span"
            className="serif-outline serif-outline--dark absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap"
            style={{
              fontSize: "clamp(180px, 28vw, 400px)",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            Digital
          </Reveal>

          {/* Solid Archive heading */}
          <Reveal variant="blur" duration={1400} delay={250}>
            <h2
              className="relative z-10 font-display text-white"
              style={{
                fontSize: "clamp(60px, 9vw, 124px)",
                fontWeight: 600,
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              Archive
            </h2>
          </Reveal>
        </div>
      </div>

      {/* Curved cap — light area arching up into dark section's bottom edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-[40vh] left-1/2 -translate-x-1/2 rounded-[50%] bg-paper"
        style={{
          width: "240vw",
          height: "60vh",
        }}
      />
    </section>
  );
}
