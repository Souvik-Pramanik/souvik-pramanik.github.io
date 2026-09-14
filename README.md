# Souvik Pramanik — Cloud & DevOps Portfolio

A high-interaction, static portfolio focused on Souvik's transition toward Cloud / DevOps Engineering.

## Included
- Digital OS / Recruiter / Developer view modes
- Interactive terminal with `github` command
- Live GitHub profile, repository and public-activity integration
- GitHub refresh control with API fallback state
- DevOps skill network and engineering status dashboard
- Career timeline, existing technical-work case files and credentials
- Reserved profile-photo slot
- Reserved first dedicated DevOps project slot
- Responsive layout and reduced-motion support

## Live GitHub integration
The site reads public data from GitHub's REST API in the visitor's browser for:
- profile name, bio, repository/follower/following counts
- public repositories sorted by recent update
- repository language, stars, forks and update age
- recent public events

No GitHub token is embedded in the site.

## Local run
Serve this folder with any static HTTP server, for example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Notes
The portfolio intentionally does not invent a dedicated DevOps project or a profile photo. Those areas are reserved for the user's future assets.
