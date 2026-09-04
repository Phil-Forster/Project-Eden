# The Planet Crafter Achievement Tracker — Project Eden

Version **0.1.0**

A read-only Windows desktop achievement tracker for all **55 current Steam achievements** in **The Planet Crafter** (Steam App ID `1284190`). Project Eden follows the same Steam-first architecture and bespoke current-user installer/uninstaller framework as Project Island, Gone, Drive and Float.

## Core behaviour

- Steam is authoritative for locked/unlocked achievement state.
- Local Steamworks state is read through The Planet Crafter's installed `steam_api64.dll` when available.
- Steam schema data may provide exact numeric counters where Steam exposes a reliable stat.
- Optional saves under `%USERPROFILE%\AppData\LocalLow\MijuGames\Planet Crafter` are read-only context only.
- The tracker never modifies game files, Steam data or save files.
- Bespoke installer/uninstaller UI; NSIS is silent deployment machinery only.
- Current-user installation under `%LOCALAPPDATA%\Programs\The Planet Crafter Achievement Tracker`; no routine UAC prompt.
- Installer Finish waits for the application splash to appear before closing.
- Uninstall cleanup runs hidden with no terminal flash.
- `RELEASE` contains only the current Setup executable.

## Development

Run `START-WINDOWS.bat` for development. Run `BUILD-WINDOWS.bat` for the Windows x64 bespoke installer build.

## Project identity

**Project Eden** uses a deep-space charcoal, terraforming violet and biosphere teal visual language with original planetary artwork.
