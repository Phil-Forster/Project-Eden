# The Planet Crafter Achievement Tracker — Project Eden

Version **0.1.8**

A read-only Windows desktop achievement tracker for all **55 current Steam achievements** in **The Planet Crafter** (Steam App ID `1284190`). Project Eden follows the same Steam-first architecture and bespoke current-user installer/uninstaller framework as Project Island, Gone, Drive and Float.

## Core behaviour

- Steam is authoritative for locked/unlocked achievement state.
- Local Steamworks state is read through The Planet Crafter's installed `steam_api64.dll` when available.
- Exact numeric counters are shown only when Steam exposes an unambiguous achievement-specific stat. The Planet Crafter commonly exposes achievement state without numeric counters; this is normal and is no longer presented as an actionable warning.
- Optional saves under `%USERPROFILE%\AppData\LocalLow\MijuGames\Planet Crafter` are read-only context only.
- The tracker never modifies game files, Steam data or save files.
- Bespoke installer/uninstaller UI; NSIS is silent deployment machinery only.
- Current-user installation under `%LOCALAPPDATA%\Programs\The Planet Crafter Achievement Tracker`; no routine UAC prompt.
- Installer Finish waits for the application splash to appear before closing.
- Uninstall cleanup runs hidden with no terminal flash.
- `RELEASE` contains only the current Setup executable.
- A dedicated completion banner is displayed only when Steam resolves the catalogue at 100% (all 55 achievements unlocked, none unknown).
- Header and card imagery is cropped responsively with preserved aspect ratio; artwork is never stretched to fill UI regions.

## Development

Run `START-WINDOWS.bat` for development. Run `BUILD-WINDOWS.bat` for the Windows x64 bespoke installer build.

## Project identity

**Project Eden** uses a deep-space charcoal and terraforming-violet shell with restrained biosphere green, cyan and warm terraforming accents. The approved hexagonal terraforming-world mark is the canonical project identity. The completion dial now uses the same core geometry as the other trackers with Eden-specific detailing, while thirty dedicated 16:9 environment scenes provide separate fifteen-image open- and closed-card artwork banks.
