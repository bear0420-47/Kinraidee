# GitHub Issue Tracker Workflow

Use the GitHub MCP server for issue and pull-request work in this repository. This file is the tracker workflow consumed by review skills and repository agents.

## Repository

- Owner: `bear0420-47`
- Repository: `Kinraidee`
- Default branch: `main`

## Read Workflow

1. Call `mcp__github__get_me` before other GitHub MCP operations to establish the authenticated user.
2. Read one issue with `mcp__github__issue_read` using `method: "get"`.
3. Read issue discussion with `method: "get_comments"` when comments may contain approvals, decisions, deviations, or implementation notes.
4. For a targeted lookup, use `mcp__github__search_issues` or `mcp__github__search_pull_requests`. Keep the query limited to search criteria and pass sorting through the tool's `sort` and `order` fields.
5. Read a pull request with `mcp__github__pull_request_read` using:
   - `method: "get"` for base/head, merge state, body, and linked issue context.
   - `method: "get_files"` or `method: "get_diff"` for implementation scope.
   - `method: "get_check_runs"` and `method: "get_status"` for CI state.
   - `method: "get_reviews"` and `method: "get_review_comments"` for human and automated review state.
6. Paginate list, comment, file, review, and search results until all relevant pages have been read.

## Finding The Originating Specification

For branch or pull-request review, resolve the specification in this order:

1. Extract issue references such as `#42` or `Closes #42` from commits and the pull-request body.
2. Fetch each referenced issue with `mcp__github__issue_read` using `method: "get"`.
3. Fetch comments when the issue mentions approval, an implementation note, or an accepted deviation.
4. Treat the issue body plus explicit human decisions in its comments as the GitHub specification source.
5. Cross-check the issue's traceability references against the repository requirements, plan, design, data model, and legal rules required by `AGENTS.md`.

## Completion Check

An issue is ready to close only when all applicable conditions hold:

- Its implementation pull request is merged into `main`, directly or through a later stacked pull request.
- The merged code satisfies the issue acceptance criteria and required tests.
- `docs/verification.md` records exact results.
- `docs/REVIEW.md` has no unresolved blocking finding.
- Required human approvals are present.
- No dependency or follow-up explicitly required by the issue remains incomplete.

Do not infer completion only from a merged feature-branch pull request. For stacked work, confirm that the final commits are ancestors of `main` or that a later pull request carried them into `main`.

## Write Workflow

- Do not create, edit, close, reopen, label, assign, or comment on an issue unless the user has authorized that mutation.
- Before creating an issue, call `mcp__github__list_issue_types` when the repository belongs to an organization, then search for duplicates.
- Add a normal issue or pull-request conversation comment with `mcp__github__add_issue_comment`.
- Update an issue with `mcp__github__issue_write`.
- When closing an issue, always set `state_reason`:
  - `completed` when the accepted work is delivered.
  - `not_planned` when the issue is intentionally rejected, duplicated, or superseded.
- Before creating a pull request, read `.github/pull_request_template.md` and search for an existing open pull request from the same head branch.
- Use `Closes #<issue>` only when the pull request targets `main` and should close the issue after merge. Stacked pull requests targeting feature branches do not reliably auto-close issues.

## Safety And Evidence

- Never post secrets, raw survey responses, email addresses, precise GPS coordinates, or unnecessary personal data.
- Keep implementation decisions in the designated repository evidence files; GitHub comments may link to them but do not replace them.
- Report the issue/PR number, URL, state, base branch, head branch, merge commit or head SHA, checks, and unresolved blockers when handing work back to the user.
- A merged pull request and an open issue can coexist because of stacked bases, delayed automation, or a reopened issue. Verify the implementation on `main` before recommending manual closure.
