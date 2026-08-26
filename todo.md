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

# Remove map full-screen control

- [x] Remove the map full-screen button and related state/imports.
- [x] Verify the map layout remains intact and save a checkpoint.

# Update from supplied prompt

- [x] Read the new prompt and extract concrete website requirements.
- [x] Implement the requested content, layout, and interaction changes.
- [x] Verify responsive presentation, build health, and functional behavior.
- [ ] Save the updated project checkpoint and report it.

# Prompt compliance follow-up

- [x] Wire the dashboard LEWS Prototype Risk Score to the backend risk engine and expose its four input contributions.
- [x] Add arbitrary map-click location selection with nearest-event distance and selected-point analysis.
- [x] Add a dedicated Data Sources section for NASA EONET, ISRO/Bhuvan, and the LEWS Risk Engine.
- [x] Add explicit API failure/no-events fallback states and tests for demo/live transitions.
- [x] Re-run type-check, build, tests, and responsive visual verification before checkpoint.

# Final compliance fixes

- [x] Surface rainfall, terrain, historical landslide, and recent-event inputs as explicit backend risk-engine contribution rows.
- [x] Align advisory and status copy with prototypeRiskScore and prototypeRiskLevel.
- [x] Add UI-level coverage for DEMO, live-data, empty-feed, and failure-fallback transitions.

# Final verification corrections

- [x] Replace remaining prototype-risk messaging that still uses local zone tier/score values.
- [x] Include client-side tests in Vitest and execute DEMO, live, empty-feed, and fallback states.
- [x] Verify the corrected dashboard and save the next checkpoint.

# Final verification corrections

- [x] Replace remaining prototype-risk messaging that still uses local zone tier/score values.
- [x] Include client-side tests in Vitest and execute DEMO, live, empty-feed, and fallback states.
- [x] Verify the corrected dashboard and save the next checkpoint.

# Final status labeling correction

- [x] Clearly label zone-list scores and map marker tiers as simulated sensor state rather than backend prototype risk.
- [x] Re-run the audit, checks, and visual verification, then save a checkpoint.
