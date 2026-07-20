# AGENTS

See `CLAUDE.md` for commands, architecture, and data-integrity rules — they apply to all agents working in this repo.

## Design Context

Before designing or changing any UI, read the design context captured by `$impeccable init`:

- **`PRODUCT.md`** — strategic context. Register is **product** (the timeline is a tool that serves exploration). Primary users are curious music learners, contributors/researchers, and Rightkey funnel visitors. Personality is **scholarly & timeless**. Anti-references: generic AI/SaaS dashboards, cluttered infographics, childish/gamified edutainment, corporate/sterile UI.
- **`DESIGN.md`** — visual system (tokens + six-section spec). North Star: **"The Illuminated Almanac."** Cormorant Garamond serif for names/titles only; Karla for everything functional. One slate-blue accent (`#3d5a80`) over warm off-white (`#faf9f7`); color is information, not decoration; flat by default with soft shadow only on floating overlays.
- **`.impeccable/`** — `design.json` token sidecar and `live/config.json` for `$impeccable live` mode.

Treat `DESIGN.md` as authoritative on visual decisions and `PRODUCT.md` on strategic/voice decisions.
