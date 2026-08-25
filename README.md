# ZoTag

ZoTag restyles the tags in Zotero's item pane as clean, shaded chips inspired
by the tag presentation in Papers.

## Features

- Soft, rounded background around each tag
- Wrapped chip layout with consistent horizontal and vertical spacing
- Slightly darker background on hover or keyboard focus
- Theme-aware colors for Zotero's light and dark modes
- Small color dot for tags that have a Zotero color assignment
- Preserves tag editing, adding, and removal behavior
- No settings, network access, or library-data changes

## Install

1. Build the package with `make` or download `zotag-1.0.2.xpi`.
2. In Zotero, open **Tools → Plugins**.
3. Choose **Install Plugin From File…** from the gear menu.
4. Select the `.xpi` file.

ZoTag supports Zotero 7 through Zotero 10.

## Build and test

```sh
make test
make package
```

The package is written to `dist/zotag-1.0.2.xpi`.

## Privacy

ZoTag only adds a local stylesheet to Zotero windows. It does not read,
modify, or transmit library data.
