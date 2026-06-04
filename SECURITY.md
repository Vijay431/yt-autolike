# Security Policy

## Supported Versions

Security fixes are provided for the latest released version and the current
`dev` branch.

## Reporting A Vulnerability

Please report vulnerabilities privately by emailing the maintainer listed in
`package.json`. Do not open a public issue for security-sensitive findings.

Include:

- affected version or commit
- browser and operating system
- steps to reproduce
- expected and actual behavior
- any relevant screenshots or logs with secrets removed

## No Secrets

Do not commit extension store credentials, API tokens, browser profiles,
private keys, cookies, or exported user data. If a secret is exposed, revoke it
before opening a PR.
