# Privacy Policy: Unsnitch

_Last updated: 29 October 2026_

Unsnitch is a browser extension that removes tracking parameters from X (Twitter) links. **It does not collect, transmit, sell or share any personal data or usage data.**

## What Unsnitch stores

Only two settings, kept in your browser's own extension storage:

| Data | Where | Purpose |
| --- | --- | --- |
| On/off switch (`true`/`false`) | `storage.sync` | Remembers whether cleaning is enabled. If you have browser sync turned on, your browser (Google or Mozilla) syncs this one value between your devices. Unsnitch never receives it. |
| Number of links cleaned | `storage.local` | Shows the "N links unsnitched" counter. It never leaves your device. |

Unsnitch never stores the links you copy, the pages you visit, your clipboard contents or anything about your X account.

## What Unsnitch does not do

- It makes no network requests of any kind.
- It has no analytics, telemetry, crash reporting or ads.
- It loads no remote code. Everything it runs ships inside the extension package.
- It doesn't read your clipboard. It only *writes* a cleaned link when you copy one or use **Copy clean link** / **Clean & copy**.
- It doesn't run on any website other than `x.com` and `twitter.com` (and their subdomains).

## Permissions

- **storage:** saves the two values above.
- **contextMenus:** adds the right-click **Copy clean link** item on X links.
- **clipboardWrite:** writes the cleaned link to your clipboard when you ask it to.
- **Access to x.com and twitter.com:** needed to clean links as they are copied or shared and to tidy the address bar on those sites.

## Data shared with third parties

None.

## Children

Unsnitch collects no data from anyone, including children.

## Changes

If this policy changes, the update will be published in this file in the [public repository](https://github.com/xBrokkr/unsnitch/blob/main/PRIVACY.md), and the date above will change.

## Contact

Open an issue at <https://github.com/xBrokkr/unsnitch/issues>.
