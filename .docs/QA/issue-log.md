# Issue log

Updated 2026-11-17. One row per problem found in usability testing (U01–U10, 28–29 Oct 2026) or in code review. Tester codes only; no names.

Severity scale: **High** = blocks the core workflow or a security or privacy risk; **Medium** = the user needs help or loses time but can finish; **Low** = cosmetic, a wish, or a data gap.

Status: **Fixed** = fix commit on `main` and retest passed; **Mitigated** = partly addressed, retest not done; **Open** = no fix yet.

## From usability testing

Source for every row: [`user-test-results-2026-11-02.md` §3.3 and §7](user-test-results-2026-11-02.md) and the per-tester tables in [`user-test-sheet-evidence.md`](user-test-sheet-evidence.md).

| ID | Found by | Problem | Severity | Fix commit | Retest | Status |
|---|---|---|---|---|---|---|
| UT-01 | U05, UAT-04 | Undo button ("get the previous dish back") is hard to find on a small screen; tester needed a hint (92.33 s) | Medium | — | Not retested | Open |
| UT-02 | U10, UAT-02 | Button to open the card's details was below the visible area; tester needed a hint to scroll | Medium | — | Not retested | Open |
| UT-03 | 1 tester, OPEN3 | Tapping the map area moves to the next screen at once | Medium | — | Not retested | Open |
| UT-04 | 1 tester, UAT-08 case 1 | Unclear why the app suggested a different taste after a no-match (automatic adjustment message) | Low | — | Not retested | Open |
| UT-05 | 1 tester, UAT-02 | Details of one dish did not show | Low | — | Dish not identified in the form; cannot reproduce yet | Open — needs the dish name |
| UT-06 | 1 tester, OPEN3 | Other taste options hidden under "see more" were not noticed | Low | — | Not retested | Open |
| UT-07 | 1 tester, OPEN3 | No loading indicator while waiting for results | Low | — | Not retested | Open |
| UT-08 | 1 tester, UAT-01; 3 testers, OPEN3 | Some 4-condition choices found no dish; testers asked for more dishes and food types | Low | `98f9ba0` (58 more dishes gained photos, so 224 of 418 dishes can now be recommended, up from 166; `docs/verification.md` lines 2002–2004); production catalog seeded 2026-11-16 by the manual `Seed production catalog` workflow | Not retested with users | Mitigated |

## From code review and security review

| ID | Found in | Problem | Severity | Fix commit | Retest | Status |
|---|---|---|---|---|---|---|
| SR-01 | OWASP Top 10 review, 2026-11-08 | No rate limit on login, registration or recommendations; foreign-origin writes not blocked | High | `9a0dc70` (PR #104) | Live local API: 11th login in 15 min returns 429; foreign-origin write returns 403 (`docs/verification.md` §OWASP, around line 1995) | Fixed |
| SR-02 | Same review | 21 known dependency advisories | Medium | `9a0dc70` | `pnpm audit`: 21 before, 2 after; the 2 left are build-time only and accepted (`docs/verification.md` line 1992) | Fixed (2 accepted) |
| SR-03 | Flood test written during SR-01 | Rate-limiter pruning rescanned the whole store on every request above 10,000 keys | Medium | `9a0dc70` | 60,000-key flood test passes; pruning runs at most once per window (`docs/verification.md` line 1994) | Fixed |
| SR-04 | Production seed run, 2026-11-16 | Seed workflow failed: it tried to read administrator secrets it has no access to | Medium | `0f78482` (PR #106) | Re-run of the workflow succeeded | Fixed |
| SR-05 | Production seed re-run, 2026-11-16 | Seed workflow failed: Prisma client not generated | Medium | `92b9449` (PR #107) | Re-run succeeded: 639 created, 1 updated, 765 unchanged | Fixed |

## Next actions

UT-01, UT-02 and UT-03 are the three Medium usability findings still open. Fixing them changes screens, so the design change must be approved in `docs/02-design/` first (`AGENTS.md`), then fixed, then retested with at least one tester. Record the fix commit and retest result in this table.
