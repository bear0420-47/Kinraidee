# GitHub snapshot — 2026-11-17

Counts for repository `bear0420-47/Kinraidee`, taken on 2026-11-17 with the commands below. Re-run them to check or refresh; the numbers will grow after this date.

## Numbers

| Item | Count | Command |
|---|---:|---|
| Commits on `main` (all) | 218 | `git rev-list --count origin/main` |
| Commits on `main` (excluding merge commits) | 156 | `git rev-list --count --no-merges origin/main` |
| Merge commits on `main` | 62 | `git rev-list --count --merges origin/main` |
| Commits across all branches | 230 | `git rev-list --count --all` |
| First commit | 2026-08-27 | `git log --reverse --format=%as origin/main \| head -1` |
| Issues (all) | 50 | `gh issue list -s all -L 200` |
| Issues closed | 48 | same, `state = CLOSED` |
| Issues open | 2 (#50, #60) | same, `state = OPEN` |
| Issues labelled `Must have` | 13 (#6–#18), all closed | same, label filter |
| Issues closed by a linked pull request | 25 | `closingIssuesReferences` of each PR |
| Pull requests (all) | 54 | `gh pr list -s all -L 300` |
| Pull requests merged | 53 | same, `state = MERGED` |
| Pull requests open | 1 (#95) | same, `state = OPEN` |

Non-merge commits by month: Aug 2, Sep 50, Oct 97, Nov 7 (`git log origin/main --no-merges --format=%as`).

Per-issue list (number, state, dates, labels, title, closing PR): [`github-issues-2026-11-17.csv`](github-issues-2026-11-17.csv).

## Notes

- An earlier slide figure of "50 issues, 46 solved, 4 open" predates this snapshot. Use 48 closed and 2 open from this file.
- Issues #6–#25 were closed together on 2026-09-24 when the backlog moved to implementation issues; they have no linked pull request.
- Counts include work done with AI coding agents; see `CLAUDE.md` for how the team used them. Git history does not record which commits an agent drafted, so this file does not split the counts by human or agent.
