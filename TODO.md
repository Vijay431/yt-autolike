# TODO

## Cave 1: Build Strong Foundation
- [x] Nodejs version should be v22 and pnpm v11. Strict version usage
- [x] Audit the dependencies and fix it down to 0 vulnerabilities
- [x] sync *ignore files
- [x] Prune unwanted files
- [x] Add `AGENTS.md` file.

## Cave 2: Make Code Good (Quality & Security)
- [x] Security review the application
- [x] Data leak check
- [x] Memory leak check
- [x] Optimize the bundle
- [x] Make sure compatible to open-source, take reference from top open-source in the github.
- [x] we need to take a reference of top starred published chrome extensions for reference to architect our codebase.

## Cave 3: Make Features Work
- [x] Persistent storage for the settings
- [ ] remove the background in the logo (Provided SVG, PNG conversion needs tools)

## Cave 4: Write Good Words (Docs & Policy)
- [x] A Causual, friendly toned Readme file with more emojis, images possible
- [x] Privacy policy should say clear cut that we are not processing any data or posting to cloud.
- [x] we have to say how it differs from other extensions like auto-yt likers. we need a strong MVP / selling point for this.
- [x] Proper documentations
- [x] Make sure our extension asks user to make sure that this is purely for encouraging the community to grow.
- [x] Wordings to make sure that star, comment, raise issues, enagage with the repo, email id for any issues.

## Cave 5: Send to World (Publishing)
- [ ] Github workflow to automate the extension publishment. (Tried, but needs 'workflow' scope for token)
- [x] Required documentations to publish the extension.
- [x] use caveman skill to talk always in that mode.
- [x] use `rtk` to prepend any command, if it is not running just fallback to run the command without `rtk`
- [x] use `gh` cli
