# Security Policy

We take the security of this project seriously and appreciate reports from the
community. This policy explains what is covered, how to report an issue, and what
to expect in return.

## Supported versions

Only the **latest** released version (the current `main` branch and the most
recent tag) is supported with security fixes. There are no long-term support
branches; please reproduce against the latest code before reporting.

| Version | Supported |
|---------|-----------|
| Latest (`main` / newest tag) | Yes |
| Anything older | No |

## Reporting a vulnerability

Please report security issues **privately**. Do not open a public issue, pull
request, or discussion for a suspected vulnerability.

Use either channel:

- **GitHub private vulnerability reporting** — open a report via the
  *Security* tab of the
  [repository](https://github.com/lukesarfas/A-Star-Maze-Algorithm-Solver)
  ("Report a vulnerability"). This is preferred.
- **Email** — [lukesarfas@icloud.com](mailto:lukesarfas@icloud.com).

A useful report includes: the affected component and version/commit, a clear
description of the issue and its impact, and steps (or a proof of concept) to
reproduce it.

## Response targets

These are good-faith targets for a personal open-source project, not contractual
guarantees:

- **Acknowledgement** — within **5 business days** of receipt.
- **Initial triage** (severity assessment and next steps) — within
  **10 business days**.

We will keep you informed as we work on a fix and will coordinate disclosure
timing with you.

## Scope

In scope:

- This repository (the Python and JavaScript implementations and their build,
  test, and CI configuration).
- The deployed applet served at **`/sites/maze/applet/`** on
  [luke.sarfas.com](https://luke.sarfas.com).

Out of scope:

- Third-party platforms and services (GitHub, the hosting provider, package
  registries) — report those to the respective vendor.
- Volumetric or denial-of-service attacks (including DDoS and traffic-flooding).
- Social engineering, phishing, or physical attacks against the maintainer or
  any infrastructure.
- Findings that require a compromised or rooted client, or a non-default,
  insecure configuration.

## Safe harbor

We will not pursue or support legal action against researchers who, in good
faith and in compliance with this policy:

- make a genuine effort to avoid privacy violations, data loss, and service
  disruption;
- access only the minimum data necessary to demonstrate an issue, and do not
  exfiltrate, modify, or retain it;
- give us a reasonable opportunity to remediate before any public disclosure.

Activity conducted consistent with this policy is considered authorised. If legal
action is initiated by a third party against you for such activity, we will make
this authorisation known. If you are unsure whether a specific action is in
scope, ask us first at [lukesarfas@icloud.com](mailto:lukesarfas@icloud.com).
