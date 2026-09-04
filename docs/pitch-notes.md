# Groww Pulse — Pitch Notes

## 30-Second Pitch

"Every watchlist shows you *what* changed. Groww Pulse shows you what changed *relative to why you're actually holding that stock*. You tell us your thesis — waiting for profitability, a breakout target, whatever — and instead of showing you every tick, we tell you the moment your specific reason for caring gets validated or challenged, with the source headline right next to our read on it. We used AI only for the one place judgment is genuinely needed — classifying a headline against your thesis — and plain arithmetic everywhere else, so nothing in this app is a black box."

## Key Differentiators

1. **Thesis-driven watchlist** — not just price tracking
2. **Meaningful Change Score** — filters noise, surfaces signal
3. **AI used surgically** — classification only, not open-ended reasoning
4. **Transparency** — every AI verdict shown with source headline
5. **Breakout targets use arithmetic, not AI** — stronger engineering story

## Architecture Decisions Worth Mentioning

- Thesis categories are **fixed enums**, not freeform text → classification is reliable
- `breakout_target` uses **plain number comparison** → more trustworthy than AI for this case
- Change Score is **rule-based, fully explainable** → every number is defensible to judges
- `scored_events` is the universal "something happened" table → simple feed query
- `thesis_matches` is separate → watchlist works even without thesis (graceful degradation)
