# How to Restore the Side Panel Layout

This file documents how to reverse the Tinder-style card stack back to the original side-panel + list layout.

## What Was Removed

The original layout had:
- A **left side panel** (1/3 width) containing:
  - A `PollForm` at the top for creating polls inline
  - A scrollable list of `PollCard` components below
- A **toggle notch** button to show/hide the panel
- A **main content area** showing the selected `PollView` or a placeholder message

## Files to Revert

### `App.jsx`
- **Remove**: `PollCardStack` import, `Modal` import, `createModalOpen` state, `handleIndexChange`
- **Remove**: The `<Modal>` block and `<PollCardStack>` usage
- **Re-add**: Imports for `PollCard`, `ScrollArea`, `Box`, `ActionIcon`, `IconChevronLeft/Right`
- **Re-add**: `panelOpen` state (default to `!isDirectPollUrl`)
- **Re-add**: Side panel `<aside>` with `PollForm` and `PollCard` list
- **Re-add**: Toggle notch `<ActionIcon>` with chevron icons
- **Re-add**: `<Routes>` in the main content area:
  - `/` → placeholder text
  - `/poll/:id` → `<PollView>`
- **Re-add**: Helper components `PollFormWrapper`, `PollListItems`, `PollViewRoute`

### `App.css`
- **Re-add** styles:
  ```css
  .side-panel { width: 33.333%; min-width: 280px; max-width: 420px; ... border-inline-end: 1px solid ... }
  .create-poll-box { flex-shrink: 0; border-bottom: ... }
  .poll-list-scroll { flex: 1; min-height: 0; }
  .poll-list-item { border: ...; border-radius: ...; }
  .panel-toggle { display: flex; align-items: flex-start; padding-top: 12px; }
  [dir="ltr"] .toggle-btn { border-radius: 0 ... ... 0; border-left: none; }
  [dir="rtl"] .toggle-btn { border-radius: ... 0 0 ...; border-right: none; }
  .main-content { flex: 1; display: flex; align-items: center; justify-content: center; }
  ```
- **Change** `.app-layout` back to `display: flex; position: relative;` (remove centering)

### Files That Can Stay
- `PollCardStack.jsx` / `PollCardStack.css` — unused but harmless to keep
- `PollCard.jsx` / `PollCard.css` — still needed for the list view
- `PollView.jsx` — used in both layouts unchanged
- All i18n keys — extra keys are harmless

## Git Reference
To find the exact pre-card-stack code, look at the git history for the commit before "Tinder-style card stack" was introduced.
