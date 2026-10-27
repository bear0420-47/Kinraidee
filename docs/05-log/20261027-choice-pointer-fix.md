# Choice pointer progression correction — 2026-10-27

The human approved fixing taps/clicks that select an answer but still require Next. This restores the approved F1/F6/F7, B1/B6/B7 pointer progression contract. Reuse ChoiceStep and its onChange advance flag; capture pointer activation on the existing label rather than relying solely on click detail. Consume activation on radio click; cancel it on pointercancel or keyboard input. Keep native radio keyboard selection and explicit Next, saved-default activation and summary edit return.

No API, schema, provider, data retention, permission or design-token changes. Scope checklist and approval are recorded in docs/plan.md; exact validation and remaining device-verification limitations are in docs/verification.md.
