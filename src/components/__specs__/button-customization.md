# Button Customization — Design Spec & QA Checklist

Source: Paper.Design node `9H5-0`

## Overview
Floating icon button (palette icon) for accent color switching. Dark bg, rounded square, accent-colored icon.

## Structure
```
Button (flex, center, center)
└── SVG Icon (24×24)
```

## States

| Property | Idle | Hover (desktop) | Press (desktop) | Tap (mobile) |
|----------|------|-----------------|-----------------|--------------|
| Size | 64×64 | 72×72 | 72×72 | 72×72 |
| Border-radius | 24px | 28px | 28px | 28px |
| Background | #000000 | #000000 | #000000 | #000000 |
| Border | 1px solid #000000 | 1px solid #000000 | 1px solid #000000 | 1px solid #000000 |
| Opacity | 1 | 1 | 0.9 | 1 |
| Box-shadow | 0px 4px 10px #0D0D0D1F | 0px 4px 10px #0D0D0D1F | 0px 2px 3px #0D0D0D1F | 0px 4px 10px #0D0D0D1F |
| Backdrop-filter | blur(10px) | blur(10px) | blur(10px) | blur(10px) |
| Icon size | 24×24 | 24×24 | 24×24 | 24×24 |
| Icon color | var(--accent) | var(--accent) | var(--accent) | var(--accent) |

## Key Interactions

### Hover (desktop only)
- Button grows from 64→72px (NOT via scale — size/padding increases)
- Border-radius grows from 24→28px proportionally
- Icon stays 24×24 (does NOT grow)
- Shadow unchanged
- Transition: ~200ms ease-out

### Press (desktop :active)
- Same size as hover (72×72)
- Opacity drops to 0.9
- Shadow shrinks: 4px 10px → 2px 3px (button "presses in")
- Creates physical press feeling

### Tap (mobile :active)
- Same as hover visually (72×72, same shadow)
- No opacity change (mobile tap = hover, not press)

## Implementation Notes
- Use width/height transition, NOT transform: scale() — icon must stay 24px
- Shadow color #0D0D0D1F = rgba(13, 13, 13, 0.12)
- Green icon color = var(--accent), updates when user switches theme
- Gate hover with `@media (hover: hover) and (pointer: fine)`

## Visual QA Checklist

### Idle
- [ ] Size exactly 64×64
- [ ] Border-radius 24px
- [ ] Black background
- [ ] Shadow: 0 4px 10px rgba(13,13,13,0.12)
- [ ] Icon 24×24 in accent color
- [ ] Icon centered

### Hover (desktop)
- [ ] Size grows to 72×72
- [ ] Border-radius grows to 28px
- [ ] Icon stays 24×24 (NOT scaled)
- [ ] Shadow unchanged
- [ ] Smooth size transition (~200ms)

### Press (desktop)
- [ ] Size stays 72×72
- [ ] Opacity 0.9
- [ ] Shadow shrinks to 0 2px 3px
- [ ] Feels like physical press

### Mobile
- [ ] No hover effect on touch
- [ ] Tap: grows to 72×72 (same as hover)
- [ ] No opacity change on tap

### Color sync
- [ ] Icon color matches current accent
- [ ] Icon color updates when accent changes
