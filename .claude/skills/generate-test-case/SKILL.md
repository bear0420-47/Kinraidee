---
name: generate-test-case
description: Create draft Kinraidee test cases and a Requirement Traceability Matrix from functional, non-functional, and legal requirements. Use for test design, not automated test implementation or execution.
---

# Generate Kinraidee Test Cases

Read `AGENTS.md`, `.docs/01-requirements/intent.md`, the current specification under `.docs/01-requirements/01-spec/`, `.docs/01-requirements/backlog.md`, `.docs/plan.md`, and `.docs/rule.md`.
Read `.docs/02-design/feature-list.md` and relevant approval records to identify deferred or unresolved scope.

## Outputs

- `.docs/03-test/test-cases.md`: draft cases and numbered questions about ambiguous or missing criteria.
- `.docs/03-test/requirement-traceability-matrix.md`: every F/NFR/LR requirement mapped to case IDs, source clauses, backlog IDs, and coverage gaps.

## Rules

- Cover Functional, Non-functional, and Legal requirements, including relevant positive, negative, boundary, and state-transition cases.
- Each case contains ID, Requirement IDs, Preconditions, Test Data, Steps, Expected Result, Priority, and Test Type.
- Derive expected results and NFR thresholds from cited requirements, not prototype behavior. Preserve source priorities; mark missing priorities as unspecified.
- Track Draft approval status, Deferred release scope, and Conditional applicability separately; these can overlap. Record conditional triggers and pending human decisions without deciding legal applicability.
- Include deferred and conditional requirements in the matrix. Report missing legal-rule mappings without inventing requirement IDs.
- Record ambiguities as numbered questions linked to affected cases. Do not invent acceptance criteria; mark coverage partial or missing when expected results cannot be determined.
- Use synthetic, non-identifying test data. Keep case IDs unique and stable, and check that all matrix references resolve.
- Keep outputs Draft and execution status Not run. Do not claim test success or legal compliance.
- Do not write automated tests, execute tests, or modify application code, source requirements, or approval status.
- Follow `AGENTS.md` when updating evidence, including archiving approved versions before replacement.

Finish with links to both documents, case counts, coverage gaps, and questions needing human decisions.
