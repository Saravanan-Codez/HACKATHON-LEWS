# Follow-up verification

- [x] Inspect the TinySpark SVG target and confirm why the visual editor reported no changes.
- [x] Add visible numeric annotations behind each zone sparkline without disrupting the sparkline stroke.
- [x] Run type-check, production build, and visual verification.
- [x] Save a new checkpoint and report the version to the user.

# Sparkline composition refinement

- [x] Separate the background risk number from the status/score row in each zone item.
- [x] Keep the sparkline as a distinct visual layer while making the number readable behind it.
- [x] Verify desktop and mobile rendering, then save a checkpoint.

# Zone-list simplification

- [x] Remove the small zone-list sparkline graphs and background numbers.
- [x] Keep the zone status and risk score readable with compact row spacing.
- [x] Verify the simplified layout and save a checkpoint.

# Dedicated sparkline column

- [x] Restore a compact SVG sparkline in a dedicated right-hand column for each zone row.
- [x] Keep the status and risk-score column separate from the graph column.
- [x] Verify desktop and mobile rendering, then save a checkpoint.

# Map and notification refinements

- [x] Add richer map detail and a visible full-screen map control.
- [x] Make the demo SMS and demo call actions show clear confirmation messages.
- [x] Verify desktop/mobile layout and interactions, then save a checkpoint.

# Visual editor deletion follow-up

- [x] Inspect the element reported at Home.tsx line 55 and identify the intended section.
- [x] Apply the deletion manually if the target is still present.
- [x] Verify the remaining layout and save a checkpoint.

# Restore map section

- [x] Restore the map panel and full-screen interaction state.
- [x] Restore map detail markup and ensure the existing styles apply.
- [x] Verify the dashboard layout and save a checkpoint.

# Restore pre-overhaul LEWS

- [x] Roll back to the stable pre-overhaul checkpoint f6b4b346.
- [x] Verify the original console layout, detailed map, sparklines, and notification demo behavior.
- [ ] Save the restored state as the current checkpoint and report it.
