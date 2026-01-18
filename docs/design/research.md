# Research: Calorie Tracker Redesign

id: R-001
date: 2026-01-17
domain: health/wellness/nutrition

## Domain Context

**Industry:** Personal health & nutrition tracking
**Users:** Health-conscious individuals tracking daily food intake
**Emotional Goal:** Calm confidence, gentle encouragement, sustainable habits (NOT guilt/anxiety)

## Domain Experts & Legends

| Expert | Known For | Key Insight |
|--------|-----------|-------------|
| Headspace | Wellness app design | Calming illustrations, soft motion, no guilt-inducing metrics |
| Oura Ring | Health tracking | Dark mode luxury, minimal data density, premium feel |
| Noom | Behavior change | Friendly coaching tone, celebrating small wins |
| Apple Health | Data visualization | Clean gradients, ring progress, clear hierarchy |
| Zero (fasting) | Fasting tracker | Elegant arc progress, dark/warm palette, meditative |

## Prior Art

### Direct Competitors

| Product | Strength | Weakness | Steal This |
|---------|----------|----------|------------|
| MyFitnessPal | Comprehensive database | Cluttered, ad-heavy, utilitarian | Search/quick-add patterns |
| Lose It! | Friendly tone | Generic mobile UI | Celebration moments |
| Cronometer | Data accuracy | Dense, clinical feel | Macro breakdown approach |
| Zero | Beautiful arc progress | Limited to fasting | Radial progress visualization |

### Adjacent Inspiration

| Source | Domain | Pattern | Apply How |
|--------|--------|---------|-----------|
| Headspace | Meditation | Soft blob gradients, breathing animations | Background atmosphere |
| Oura | Sleep tracking | Dark luxury, glowing accents | Evening/night mode |
| Stripe Dashboard | Fintech | Gradient backgrounds, glass cards | Progress card treatment |
| Linear | Productivity | Subtle gradients, refined type | Settings/form design |

### Anti-Patterns

| Source | Failure | Lesson |
|--------|---------|--------|
| MyFitnessPal | Red "over" states create anxiety | Use warm yellows, not alarm red |
| Generic trackers | Inter + teal = forgettable | Commit to distinctive typography |
| Fitness apps | Aggressive gamification | Gentle encouragement > punishment |

## Cross-Domain Inspiration

| Domain | Source | Insight |
|--------|--------|---------|
| Architecture | Tadao Ando | Light and shadow, concrete warmth, intentional negative space |
| Industrial Design | Jasper Morrison (super normal) | Warm materials, unfussy elegance |
| Art/Visual | Japanese ceramics (wabi-sabi) | Imperfection is beautiful, organic shapes |
| Print | Kinfolk magazine | Warm photography, generous whitespace, distinctive serif type |

## Aesthetic Direction: "Warm Wellness"

> [!important] Chosen Direction
> **Kinfolk meets Headspace** — Editorial sophistication with soft, calming atmosphere.
> Premium wellness magazine aesthetic, not clinical health app.

### Signature Elements

1. **Warm cream background** with subtle grain texture (not stark white)
2. **Radial/arc progress** instead of boring horizontal bars
3. **Distinctive serif display font** for headings (Fraunces, Newsreader, or Playfair)
4. **Soft gradient orbs** as background atmosphere
5. **Warm earth palette** — sage, terracotta, cream, espresso
6. **Generous negative space** — breathe, don't cram

### Emotional Arc

| State | Emotion | Design Response |
|-------|---------|-----------------|
| Empty day | Fresh start | Clean, inviting, easy entry point |
| Tracking | Engaged flow | Smooth animations, satisfying feedback |
| Near goal | Gentle excitement | Warm glow, subtle celebration |
| Over goal | No guilt | Amber (not red), tomorrow is new |
| Complete | Accomplished | Subtle confetti or glow, not aggressive |

## Token Recommendations

### Typography

- **Display:** Fraunces (variable, optical sizing, warm personality)
  - Why: Distinctive, warm, readable, free via Google Fonts
  - Alternative: Newsreader, Playfair Display
- **Body:** Nunito Sans or DM Sans (soft, friendly, readable)
  - Why: Pairs well with serif, doesn't compete

### Color

| Token | Value | Meaning |
|-------|-------|---------|
| background | #FAF7F2 | Warm cream paper |
| surface | #FFFFFF | Card/elevated surfaces |
| primary | #5C6B54 | Sage green (calm, growth) |
| accent | #C17B5F | Terracotta (warmth, nourishment) |
| success | #7D9B76 | Soft green (achievement) |
| warning | #D4A574 | Warm amber (gentle alert) |
| text | #3D3D3D | Espresso (warm black) |
| muted | #8B8B8B | Warm gray |
| protein | #8B7355 | Warm brown |
| carbs | #C4A35A | Golden amber |
| fat | #B08D7A | Dusty rose-brown |

### Principles Derived

1. **Warmth over clinical** — This is nourishment, not hospital
2. **Calm over urgent** — Sustainable habits > anxiety spikes
3. **Editorial over app** — Magazine-quality typography and spacing
4. **Radial over linear** — Progress as satisfying arcs, not bars
5. **Celebrate, don't punish** — "Over" is amber, not angry red

## Visual Concepts

### Progress Visualization (Hero Element)

```
     ╭─────────────╮
   ╱               ╲
  │    1,847       │     ← Large radial progress ring
  │    ━━━━━       │        Thick arc shows calories
  │   of 2,000     │        Glowing when near goal
   ╲               ╱
     ╰─────────────╯

   P ████░░  C ███░░░  F ██░░░░
      72g       180g      45g

   ← Mini arcs or pill bars for macros
```

### Card Treatment

- Subtle shadow with warm tint
- 1px border in cream/sage
- Generous padding (20-24px)
- Rounded corners (16-20px)

### Background Atmosphere

- Warm cream base (#FAF7F2)
- Large soft gradient orb (sage → terracotta, very low opacity)
- Subtle noise/grain texture overlay
- No harsh lines or stark contrasts
