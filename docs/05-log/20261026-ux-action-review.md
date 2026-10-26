# UX Action Review — 2026-10-26

Status: source-based review and proposed refinement; not an approval or an implementation record.

The human requested a UX review because the flow requires too many button presses. This review covers the existing React anonymous meal workflow. Browser interaction and timed usability testing were not available; counts below describe the source path, not measured completion time.

## Findings

1. **High — repeated progression actions.** `ChoiceStep` stores a radio selection, then requires a separate Next button. For four questions, this creates four extra pointer actions. Source: `src/web/src/pages/meal/components/ChoiceStep.tsx`; `MealPage.tsx` separates every `onChoose` from `onNext`.
2. **High — editing one answer repeats subsequent questions.** `ConditionSummary` calls `onEdit(step)`, wired directly to `go`. The shared `next` function always advances to the following question rather than returning to the summary. Editing the budget can require passing taste, food type, and zone again even though those answers remain valid. Source: `ConditionSummary.tsx` and `MealPage.tsx`.
3. **Medium — result navigation has several competing actions.** Reveal-all, edit conditions, restart, and per-card actions share the result view. Give reveal/selection the strongest emphasis, keep editing secondary, and keep restart visually quiet and clearly labelled. Restart clears the current flow, so its meaning must remain distinguishable from editing.
4. **Review separately — selection and confirmation repeat content.** The card-selection button opens a dialog, then explicit confirmation writes signed-in history. The duplication costs one action but currently protects the meaning of a confirmed selection. Removing it requires a separate decision about when history is written; it should not be removed merely to reduce a click count.

## Source action count

Assumptions: a fresh flow, no saved defaults, one choice per condition, no errors or rejections, reveal one card, then confirm it. Closing the success screen is excluded.

| Action                      | Current pointer presses |
| --------------------------- | ----------------------: |
| Start from Home             |                       1 |
| Choose four conditions      |                       4 |
| Next after each choice      |                       4 |
| Shuffle from summary        |                       1 |
| Reveal a card               |                       1 |
| Select the card and confirm |                       2 |
| Total to confirmed choice   |                      13 |

## Recommended first refinement

- Keep the existing question order and one-question-at-a-time presentation. Explicit pointer activation of a choice can select it and advance; explain this behavior before selection. Retain an explicit Next action for keyboard navigation and accepting a prefilled default. Arrow-key radio exploration must not automatically move focus to another question.
- When editing one answer from the summary, return directly to that summary after committing the edit. Preserve every other answer. Back navigation and initial data entry remain separate from this edit-return behavior.
- Keep the existing summary/shuffle action, card reveal, explicit confirmation, undo, and anonymous access. No new default, API call, provider call, history write, or persistence surface is needed.
- Make result selection the primary action and editing secondary; restyling secondary actions alone does not reduce the required action count.

Target for the fresh pointer path: 9 presses instead of 13, removing the four redundant Next presses. This is a proposed source-level reduction, not a usability-test result. Keyboard users retain deliberate progression controls.

## Proposed implementation boundary

```txt
Module: existing meal-condition presentation and summary edit navigation
Requirement/backlog ID: F1, F6, F7; B1, B6, B7; NFR2, NFR12
Legal requirement ID: LR2, LR3, LR7
Design artifact: existing journey step 2, choice-card interaction rules, summary edit pattern
API routes: unchanged
Web pages: /meal
Personal data: unchanged transient conditions and sessionStorage lifetime
Authorization: existing anonymous and signed-in behavior unchanged
Tests: pointer selection advances once; keyboard arrow selection stays on the current question; explicit Next accepts defaults; reselecting the current option works; summary edits return directly and preserve all other fields; Back, reload, missing master data, and empty results remain recoverable
```

Before implementation, record the accepted interaction in the active plan and design artifacts. Reuse `ChoiceStep`, its four existing wrappers, `MealPage`, and the current session hook; no replacement form framework or new state store is needed.

## Subsequent implementation instruction — 2026-10-26

The human then instructed implementation and added no-match recovery to this refinement. The accepted scope is recorded in `docs/plan.md`: pointer selection advances, committing a summary edit returns directly, and no-match guidance appears inside the summary beside its existing editable answer rows. The suggestion still requires an explicit primary action; no automatic filter relaxation is added. Verification is recorded separately in `docs/verification.md`.
