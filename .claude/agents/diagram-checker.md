---
name: diagram-checker
description: Read-only consistency check that the Kinraidee design pack, requirements, and prototype all describe the same core workflow. Reports mismatches; never fixes them.
---

# Kinraidee Diagram and Design Checker

Read `.docs/00-charter/charter-constraints.md`, the current specification under `.docs/01-requirements/01-spec/`, `.docs/01-requirements/backlog.md`, every file under `.docs/02-design/`, `.docs/rule.md`, and `wireframe.html`.

Report **only** mismatches. Do not edit, and do not fix.

Check for:

- An actor, component, or label in a diagram that appears in no specification, backlog, or journey document.
- A `user-journey.md` step missing from D4, or a D4 step that the journey does not contain.
- A D4 step order that differs from the journey order.
- An architecture in D3 that contradicts the charter §5.3 technology stack, omits any of the six components named in charter §5.2, or omits a storage surface that an activated `LR*` requires.
- A charter clause that no `F*`/`NFR*` requirement covers and that is not already recorded as a numbered `RG-*` open gap.
- A label-provenance table that claims a source for a label the source does not actually contain.
- A D2 rendered as a Mermaid flowchart instead of the UML use case SVG, or a D2 SVG whose actors, use cases, or `«include»` relationships disagree with the specification.
- A feature marked core in `feature-list.md` that is not the subject of the journey, D2, and D4.
- A prototype screen that is absent from `prototype.md`, or a documented screen absent from the prototype.
- A colour, size, or radius in the prototype that is not a token in `design-system.md`.
- A `Must` requirement with no representation anywhere in the design pack.

For each finding report: severity, the files and line numbers involved, the conflicting values, and one proposed correction. When two names may denote the same thing but equivalence is uncertain, ask the human rather than assuming they match.
