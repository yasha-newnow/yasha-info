# ButtonMenuSecondary — Design Spec & QA Checklist

Source: Paper.Design file `01KM3WTYHJ6H6EGFPQTQ2RCE2N`, node `99I-0`

## Structure

```
Container (flex column, gap: 0, full width)
├── ButtonItem[0]
├── Divider[0]
├── ButtonItem[1]
├── Divider[1]
└── ButtonItem[2]
```

No divider after the last item.

## Button Item

| Property | Value |
|----------|-------|
| display | flex |
| justify-content | space-between |
| align-items | center |
| padding | 12px |
| gap | 8px |
| border-radius | 8px |
| width | 100% |
| font | Inter Tight Medium, 16px, weight 500, line-height 24px |
| text color | #0E0E0E (--foreground) |
| icon size | 20x20 |
| icon color | #0E0E0E |

## Divider

| Property | Value |
|----------|-------|
| wrapper padding | 0 12px (horizontal only) |
| line height | 1px |
| line color | #0E0E0E |
| line opacity (idle) | 0.1 |
| line opacity (hidden) | 0 |
| transition | opacity 150ms ease |

## Interactive States

### Desktop

| State | Background | Box-shadow | Adjacent dividers |
|-------|-----------|------------|-------------------|
| Idle | transparent | none | opacity 0.1 |
| Hover | rgba(0,0,0,0.10) | 0 0 0 1px rgba(0,0,0,0.10) | opacity 0 |
| Press (:active) | rgba(0,0,0,0.15) | 0 0 0 1px rgba(0,0,0,0.15) | opacity 0 |

### Mobile

| State | Background | Box-shadow | Adjacent dividers |
|-------|-----------|------------|-------------------|
| Idle | transparent | none | opacity 0.1 |
| Tap (:active) | rgba(0,0,0,0.10) | 0 0 0 1px rgba(0,0,0,0.10) | opacity 0 |

No :hover on mobile (use `@media (hover: hover)` gate).

## Divider Hiding Logic

Position-based, not item-specific:

- **First item** active → divider[0] hides (the one below it)
- **Middle item** active → divider[index-1] AND divider[index] hide (above and below)
- **Last item** active → divider[last] hides (the one above it)

## Visual QA Checklist

### Idle State
- [ ] No background on any button
- [ ] All dividers visible at opacity 0.1
- [ ] Dividers inset 12px from edges (not full width)
- [ ] Text is Inter Tight Medium 16px
- [ ] Icons 20x20, aligned right

### Desktop Hover (each item)
- [ ] Hovered item: bg rgba(0,0,0,0.10), box-shadow 1px, border-radius 8px
- [ ] First item hover: only divider below hides
- [ ] Middle item hover: both adjacent dividers hide
- [ ] Last item hover: only divider above hides
- [ ] Non-hovered items: no visual change
- [ ] Divider opacity transitions smoothly (not instant)

### Desktop Press (each item)
- [ ] Pressed item: bg rgba(0,0,0,0.15), box-shadow 1px
- [ ] Same divider hiding as hover

### Mobile Tap (each item)
- [ ] No hover effect on touch devices
- [ ] Tap: same visual as desktop hover
- [ ] Same divider hiding logic

### Cross-check with Paper
- [ ] Compare idle screenshot with Paper node 949-0
- [ ] Compare hover states with Paper nodes 959-0, 96O-0, 983-0
- [ ] Compare press states with Paper nodes 967-0, 97M-0, 991-0
- [ ] Compare mobile tap with Paper nodes 95Q-0, 975-0, 98K-0
