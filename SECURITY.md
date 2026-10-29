# Security Policy

Unsnitch runs on every X page you visit, so security bugs matter even though the extension is small.

## Supported versions

Only the latest release gets fixes.

## Reporting a vulnerability

**Please don't open a public issue.** Report it privately through [GitHub Security Advisories](https://github.com/xBrokkr/unsnitch/security/advisories/new).

Please include:
- the browser and version, and the Unsnitch version
- steps to reproduce, or a proof of concept
- the impact (for example, a page script that can make Unsnitch write arbitrary clipboard content, change the URL while the extension is disabled, or read extension storage)

You'll get a reply within 7 days. Once a fix ships, you'll be credited in the changelog unless you'd rather not be.

## In scope

- `extension/` (content scripts, background, popup), `userscript/` and the web cleaner in `site/`.
- Ways a web page could tamper with the cleaner, the bridge between the two content-script worlds, or the clipboard.
- Any code path that makes a network request or loads remote code. There shouldn't be any.

## Out of scope

- Tracking parameters Unsnitch doesn't remove yet. Please report those with the [new tracking parameter](https://github.com/xBrokkr/unsnitch/issues/new?template=new-tracker-param.yml) template.
- Tracking done by X through anything other than link parameters.
