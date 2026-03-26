# Button Menu Primary — Design Spec & QA Checklist

Source: Paper.Design node `9O3-0`

## Overview
Navigation buttons (Works, About, Contact) with hover tags that reveal subtitles. Selected state inverts colors to accent.

## Desktop Structure
```
Container (flex column, gap: 2px)
├── Button "Works" + Tag "& BITS"
├── Button "About" + Tag "WHY / HOW / WHAT"
└── Button "Contact" + Tag "LET'S TALK"
```

Each button:
```
Button (flex, align-start, gap: 8px)
├── Text label
└── Tag (optional, appears on hover/selected)
    └── Tag text
```

## Mobile Structure
```
Container (flex column, 334px wide)
├── Button "Works" (justify space-between) + Tag "& BITS" (right)
├── Divider (paddingInline 12px, 1px, opacity 0.1)
├── Button "About" (justify space-between) + Tag "WHY / HOW / WHAT" (right)
├── Divider
└── Button "Contact" (justify space-between) + Tag "LET'S TALK" (right)
```

## Typography

### Desktop
- Button text: Inter Tight SemiBold, 24px/32px
- Tag text: Stick No Bills, SemiBold 600, 16px/20px

### Mobile
- Button text: Inter Tight SemiBold, 40px/48px
- Tag text: Stick No Bills, SemiBold 600, 16px/20px

## Button States — Desktop

| Property | Idle | Hover | Selected |
|----------|------|-------|----------|
| Padding | 10px 12px | 10px 12px | 10px 12px |
| Border-radius | 10px | 10px | 10px |
| Background | transparent | rgba(10,10,10,0.10) | #0A0A0A (solid black) |
| Text color | #000000 | #000000 | #00ED9A → var(--accent) |
| Tag visible | no | yes | yes |
| Tag bg | — | #000000 | #00ED9A → var(--accent) |
| Tag text color | — | #00ED9A → var(--accent) | #000000 |
| Container gap | 2px | 2px | 2px |

### Tag (badge)
- Padding: 2px top, 0 bottom, 4px left/right
- Border-radius: 4px
- Font: "Stick No Bills" SemiBold 600, 16px/20px
- Hover state: black bg, accent text
- Selected state: accent bg, black text (inverted!)

## Button States — Mobile

| Property | Idle | Tap (selected) |
|----------|------|----------------|
| Padding | 12px | 12px |
| Border-radius | 12px | 12px |
| Background | transparent | linear-gradient(#000000) + box-shadow 0 0 0 1px #000000 |
| Text color | #000000 | #00ED9A → var(--accent) |
| Tag visible | yes (always) | yes |
| Tag bg (idle) | #000000 | — |
| Tag bg (tapped) | — | #00ED9A → var(--accent) |
| Tag text (idle) | #00ED9A via gradient | — |
| Tag text (tapped) | — | #000000 |
| Dividers | opacity 0.1 | same pattern as secondary |
| Layout | justify space-between | justify space-between |

### Mobile differences from desktop
- Tags always visible (right-aligned)
- Larger text: 40px vs 24px
- Larger padding: 12px vs 10px
- Larger border-radius: 12px vs 10px
- Dividers between items (same as ButtonMenuSecondary pattern)
- No hover state — only tap

## Tag subtitles
| Button | Tag text |
|--------|----------|
| Works | & BITS |
| About | WHY / HOW / WHAT |
| Contact | LET'S TALK |

## Color token note
All green (#00ED9A) values = var(--accent). Must update dynamically when user switches accent color.

## Behavior
- Desktop hover: tag slides in/appears next to button text
- Desktop selected: bg goes black, text + tag invert to accent
- Mobile tap: item goes black bg, text turns accent, tag inverts — then menu closes and page scrolls to section

## Visual QA Checklist

### Desktop Idle
- [ ] All 3 buttons visible (Works, About, Contact)
- [ ] No tags visible
- [ ] No background on buttons
- [ ] Text: Inter Tight SemiBold 24px, black
- [ ] Container gap 2px between items

### Desktop Hover (each item)
- [ ] Hovered button: bg rgba(10,10,10,0.10)
- [ ] Tag appears with black bg, accent text
- [ ] Tag font: Stick No Bills 16px SemiBold
- [ ] Tag padding: 2px/0/4px/4px, border-radius 4px
- [ ] Other buttons: no change

### Desktop Selected (each item)
- [ ] Selected button: bg solid #0A0A0A (black)
- [ ] Text color: var(--accent)
- [ ] Tag: accent bg, black text (inverted from hover)
- [ ] Other buttons: remain idle

### Mobile Idle
- [ ] All 3 buttons with tags visible (right-aligned)
- [ ] Tags: black bg, accent text
- [ ] Text: 40px/48px SemiBold
- [ ] Dividers between items (opacity 0.1)

### Mobile Tap (each item)
- [ ] Tapped button: black bg + 1px black border
- [ ] Text: accent color
- [ ] Tag inverts: accent bg, black text
- [ ] Menu closes after tap
- [ ] Page scrolls to section

### Color sync
- [ ] All accent colors update when theme changes
- [ ] Selected state accent matches current theme
- [ ] Tags accent matches current theme
