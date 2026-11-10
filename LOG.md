# 0.1.8 — 04/09/2026

- pulled the Eden terraformation phase dots closer to the dial so they follow the gauge curve more naturally
- removed the boxed active-state treatment from the achievement filters so only the underline denotes the live selection
- retained the footer metadata alignment nudge and propagated the same footer treatment in this increment
- preserved the Eden icon optical-size fixes from v0.1.7

# 0.1.7 — 04/09/2026

- enlarged the rendered Project Eden badge in the main splash/loading screen so it matches the optical weight of the other project icons
- enlarged the Eden badge in the universal footer so it no longer reads smaller than the other tracker marks
- enlarged the Eden badge in other rendered badge contexts, including the completion banner and deployment UI header, to keep sizing consistent
- retained the approved footer, filter styling and corrected terraformation phase dial geometry from v0.1.6

# 0.1.6 — 04/09/2026

- refined the Eden terraformation phase markers so the 15 dots follow a cleaner, evenly spaced lower arc
- aligned BARREN / FLORA / COMPLETE directly to the anchor markers for a more balanced instrument layout
- retained the approved footer, filter controls, shortcut icon scale and all other v0.1.4 polish without change

# 0.1.4 — 04/09/2026

## Shared interface polish

- Rebuilt the universal footer metadata row with cleaner spacing, lighter typography and better-balanced column widths.
- Replaced the generic GitHub glyph with the GitHub mark and upgraded the Project, Author and Portfolio symbols.
- Ensured the full `philforster.co.uk` portfolio address remains visible at desktop footer widths.
- Removed hard-coded teal footer chrome and made borders/backgrounds derive from each tracker's own palette.
- Retained the project/game badge geometry unchanged in the footer.
- Reworked the All / Unlocked / Locked / Unknown controls into compact instrument-style filters with meaningful state icons and state-aware active accents.
- Replaced the two generic orange/green dial accents with a subtle 15-stage terraformation phase rail.
- Added restrained `BARREN`, `FLORA` and `COMPLETE` anchor labels while keeping the live achievement gauge unchanged.
- Increased the optical size of the Windows shortcut/app icon without changing the footer/project badge artwork.

# 0.1.3 — 04/09/2026

- Replaced the previous Project Eden card-art bank with all thirty generated Eden environment scenes from the approved generation pass: fifteen closed/opposing-card assets and fifteen open-dossier assets.
- Normalised every card image to 1600×900 using aspect-preserving crop/cover processing; no scene is stretched.
- Replaced the app background, header, splash, installer hero and uninstaller hero with high-resolution text-free scenes from the same approved Eden artwork set.
- Re-applied the approved hexagonal terraforming-world image as the canonical Project Eden identity across app/window/taskbar/shortcut, footer, splash, installer and uninstaller branding. Normal UI/control icons remain unaffected.
- Simplified the completion dial again to the shared tracker gauge geometry; Eden now uses only restrained warm-terrain and biosphere accent marks outside the live fill.
- Enhanced the existing 100% completion-only banner with Eden environment artwork while preserving strict all-unlocked/no-unknown gating.
- Retained the blended full-width header treatment and text-free application background, so no hard image edge or baked top-right copy is present.
- Updated tests, README and all version metadata for this iteration.

# 0.1.2 — 04/09/2026

- Adopted the approved hexagonal terraforming-world artwork as the canonical Project Eden identity icon across the app, window/taskbar/shortcut assets, splash/footer mark and bespoke installer/uninstaller branding.
- Added twenty 1600×900 achievement-card environment assets: ten closed/opposing-card scenes and ten open-dossier scenes. All assets preserve 16:9 geometry; no image is stretched to fit.
- Split card artwork handling into dedicated open and closed image banks so expanded dossiers and their opposing cards no longer reuse the same scene pool.
- Replaced the bespoke planetary-transformation dial with the common tracker completion-gauge geometry, retaining only restrained Eden terraforming accents and a small seed/leaf marker.
- Rebuilt the Project Eden header treatment so the high-resolution scene fills via `cover` beneath a full-width blend layer, removing the hard vertical image edge without distorting the artwork.
- Replaced the application background that contained baked-in top-right copy with a clean text-free scene.
- Added a dedicated 100% completion banner. It is rendered only when every achievement is unlocked and no achievement state remains unknown.
- Added separate high-quality installer and uninstaller hero artwork and mode-aware deployment-shell selection.
- Updated README, version metadata and deployment metadata for this iteration.

# 0.1.1 — 04/09/2026

- Replaced the inherited Pacific Drive-style completion gauge with a Project Eden planetary terraforming instrument.
- Protected all stage labels from the live completion fill and added barren / sky / green / life visual stages.
- Removed the misleading “start The Planet Crafter once, then refresh” warning when Steam provides achievement states but no numeric stats.
- Exact numeric progress now accepts only an unambiguous achievement-specific relationship parsed from Steam schema data; copied cross-game stat-name heuristics were removed.
- Reworked telemetry so unavailable exact counters are reported neutrally as “Not exposed” while Steam locked/unlocked state remains authoritative.
- Replaced the generic Project Eden badge/icon with a hexagonal planetary terraforming mark aligned with the other Project tracker identities.
- Updated application, shortcut, installer and uninstaller icon assets from the new badge.
- Replaced the generic illustrated Project Eden backgrounds with a realistic twelve-scene terraforming artwork set plus refreshed app background, header, splash and deployment hero artwork.
- Updated README and version metadata for this iteration.

# 0.1.0 — 04/09/2026

- Initial Project Eden build for The Planet Crafter.
- Added all 55 current Steam achievements, including cumulative crafting and Terra Token targets where applicable.
- Added Steam App ID 1284190 discovery and local Steamworks/schema integration.
- Added read-only discovery of The Planet Crafter JSON saves under MijuGames\Planet Crafter.
- Added original Project Eden badge, splash, header, background and twelve terraforming achievement scenes.
- Added shared Bespoke Deployment Shell v2.0.4 with current-user installation, splash-ready installer handoff and hidden uninstall cleanup.
- Added Project Eden-specific installer/uninstaller skin and icons.

