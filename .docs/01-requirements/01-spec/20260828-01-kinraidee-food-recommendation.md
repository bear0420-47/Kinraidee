# Specification: Kinraidee Food Decision Assistant

## Status

Draft — pending human approval.

## Traceability

- Intent: `.docs/01-requirements/intent.md`
- Research evidence: `evidence/survey-summary.md`
- Legal source of truth: `doc/rule.md`
- Product backlog: `.docs/01-requirements/backlog.md`

## Functional requirements

| ID | User story / requirement | Acceptance criteria | Priority | Traces to |
|---|---|---|---|---|
| F1 | As an undecided meal seeker, I want to enter short conditions such as budget, food type, desired taste, and area, so that the system understands this meal's constraints. | User can submit a valid condition set; invalid values receive field-level errors; account creation is not required. | Must | P1, P2, P5, P6, P7 |
| F2 | As a meal seeker, I want about three matching choices, so that I do not need to browse a large catalog. | A round returns at most three choices; every result satisfies all mandatory filters; fewer results are allowed when fewer records match. | Must | P1, P3, P8 |
| F3 | As a meal seeker, I want to see estimated price, food type, area/distance, and recommendation rationale, so that I can compare choices. | Every displayed choice contains the available required decision fields and identifies unavailable information rather than inventing it. | Must | P4, P5, P6, P7 |
| F4 | As a meal seeker, I want to reject a choice and receive a replacement, so that the system can help even when I cannot describe what I want. | Rejecting a result excludes it for the current session and returns another matching result when available. | Must | P4 |
| F5 | As a meal seeker, I want choices rejected in this session not to appear again, so that I do not loop through the same options. | A rejected record is not repeated in the same session while another matching record exists. | Must | P3, P4 |
| F6 | As a meal seeker, I want to use general recommendations without registering or consenting to personalization, so that I can use the core service privately. | Core workflow is available without login; declining optional consent does not block general recommendations. | Must | P1, LR2 |
| F7 | As a meal seeker, I want to edit conditions or start a new recommendation session, so that I can use the service for a new meal or context. | User can revise conditions and reset session exclusions without creating an account. | Must | P1, P2 |
| F8 | As an authorized data administrator, I want to create, update, and retire restaurant/menu records, so that recommendation data remains usable. | All mutations require authentication and the correct role; invalid inputs are rejected; changes generate a minimized audit event. | Must | OA1, LR8 |
| F9 | As a meal seeker, I want to use my current location after receiving a purpose notice, so that I can restrict choices to nearby places. | Location is requested only after notice and affirmative action; declining location leaves manual-area/general discovery available. | Should | P7, LR5 |
| F10 | As a meal seeker, I want to set temporary food exclusions, so that unsuitable food is not recommended in this session. | Exclusions affect the current session; the system does not create a permanent profile by default. | Should | P6, LR3, LR4 |
| F11 | As a meal seeker, I want the system to surface alternatives rather than only familiar items, so that I can escape repetitive choices. | When qualifying data exists, at least one shortlist position may contain a non-repeated alternative without violating mandatory filters. | Should | P3 |
| F12 | As a meal seeker, I want one random choice from already-filtered results, so that the system can make the final decision for me. | Randomization operates only on records satisfying the current mandatory filters. | Should | P8 |
| F13 | As a group, we want a shared voting room, so that we can choose a restaurant together. | Participants can vote on the same candidate set and see the resulting tally. | Could | P9 |
| F14 | As an opted-in account holder, I want to save favorites, so that I can find them later. | Saving requires an account, notice, access controls, and deletion behavior. | Could | P6, LR1, LR6 |
| F15 | As an opted-in account holder, I want recommendation history to influence later results, so that recommendations improve over time. | No history is retained or reused without documented purpose, lawful basis, notice, retention, and user controls. | Could | P3, LR1, LR3, LR6 |
| F16 | As a meal seeker, I want promotions, delivery costs, ratings, and wait times when reliable data exists, so that I can compare total value. | Each field identifies its source and freshness; missing or stale values are not presented as current facts. | Could | P5, P7 |

`OA1` is an operational assumption that an authorized actor must maintain the recommendation dataset; it requires human confirmation because it was not established by the user survey.

## Legal requirements incorporated from `doc/rule.md`

| ID | Requirement | Activation / acceptance criteria | Priority |
|---|---|---|---|
| LR1 | Personal-data processing must have a documented lawful basis and the required purpose notice. | Before storing a personal field, the data inventory records purpose, lawful basis, access role, retention, and deletion behavior. | Must when personal data is processed |
| LR2 | General recommendation must remain available without unnecessary personalization consent. | Declining optional personalization does not block F1–F7. | Must |
| LR3 | Food preferences and exclusions may be used only for disclosed recommendation purposes. | Tests verify that preference fields are not sent to unrelated processing or logs. | Must when preferences are processed |
| LR4 | Information that may reveal health, religion, or another sensitive characteristic must be assessed before processing. | Sensitive-data assessment is approved before persistent storage; explicit consent is recorded when it is the applicable basis and no exception applies. | Must when such data is processed |
| LR5 | Real-time GPS may be collected only after purpose notice and used only for the approved session unless separately authorized. | Decline path works; raw coordinates are not persisted by default; session data expires as defined by NFR7. | Must when GPS is used |
| LR6 | The system must provide an appropriate access, correction, and deletion request mechanism when it stores personal data. | Requests can be submitted, authenticated as appropriate, tracked, and resolved according to the approved procedure and exceptions. | Must when personal data is stored |
| LR7 | Logs must not contain passwords, authentication secrets, or unnecessary sensitive personal data. | Automated scan and review defined by NFR6 pass. | Must |
| LR8 | Personal and protected data may be disclosed or changed only with appropriate authorization. | All protected API authorization tests pass. | Must |
| LR9 | Personal data no longer necessary and without another lawful retention reason must be deleted, destroyed, or anonymized. | Each personal field has an approved retention/deletion rule and an executable deletion path. | Must when personal data is stored |
| LR10 | If the deployed system is subject to Computer Crime Act Section 26, it must retain required traffic data for at least 90 days. | Applicability and required fields are approved by an accountable human; retention configuration is tested. | Conditional Must |
| LR11 | Required traffic records must be protected against unauthorized access, alteration, destruction, and loss, with integrity maintained. | Access-control, integrity, backup/recovery, and tamper-evidence checks pass. | Conditional Must with LR10 |
| LR12 | Traffic data past its required retention period must be securely disposed of when no other lawful reason remains. | Retention job and legal-hold exception are tested. | Conditional Must with LR10 |
| LR13 | Required traffic logs must be distinguished from application audit logs. | Data model and documentation label each event class and do not claim every audit event is legally required. | Must when either log type exists |
| LR14 | PDPA consent records must be separately identifiable from Terms acceptance. | Separate record types/purposes and separate user actions are verifiable. | Must when consent or Terms are used |
| LR15 | Electronic agreement evidence must preserve who agreed, what was agreed, the version, and when. | Required evidence fields are present in 100% of agreement records. | Must when electronic agreement is used |
| LR16 | Previous Terms/notice versions needed to prove an agreement must be preserved. | Agreement records resolve to immutable/versioned content used at acceptance time. | Must when electronic agreement is used |
| LR17 | Kinraidee must not claim to be a certification service provider merely because it relies on third-party certificates. | Product and technical documentation contain no such claim; the MVP issues no certificates. | Must |

## Non-functional requirements

| ID | Measurable requirement | Verification |
|---|---|---|
| NFR1 | Recommendation response time is at most 2 seconds at p95 against a test dataset of up to 500 active restaurant records in the defined test environment. | Automated performance test records environment, dataset size, sample count, and p95. |
| NFR2 | At least 80% of at least five target-user testers complete F1–F4 within 60 seconds without facilitator help. | Timed usability-test record with anonymized outcome counts. |
| NFR3 | A recommendation round displays at most three choices unless fewer records match. | Unit/integration tests for 0, 1, 2, 3, and more than 3 matches. |
| NFR4 | Every API input boundary has automated valid, invalid, and boundary-value tests. | Endpoint-to-test inventory has no missing endpoint; suite passes. |
| NFR5 | 100% of protected API tests reject unauthenticated and unauthorized requests. | Authentication/authorization suite passes with expected 401/403 behavior. |
| NFR6 | Application and test logs contain zero passwords, authentication tokens, email addresses, raw GPS coordinates, or unnecessary food-restriction details. | Automated secret/PII pattern scan plus manual log review records zero findings. |
| NFR7 | Raw GPS coordinates are not stored in the database by default and expire from session processing at session end or within 30 minutes, whichever occurs first. | Storage inspection and expiry integration test. |
| NFR8 | 100% of returned results satisfy every mandatory budget, food-type, exclusion, and area constraint supplied for the session. | Property/table-driven recommendation tests across the approved dataset. |
| NFR9 | A rejected choice is not repeated in the same session while another qualifying choice exists. | State-transition integration tests. |
| NFR10 | Build, test, and lint commands all exit with code 0 before implementation is reported complete. | Exact commands and results recorded in `doc/verification.md`. |
| NFR11 | 100% of consent/agreement records contain subject identifier, purpose/type, content version, decision, and timestamp. | Schema constraints and integration tests. |
| NFR12 | The complete F1–F7 workflow is operable using a keyboard without a blocking step. | Manual keyboard-only acceptance test recorded in verification evidence. |

## Primary use case

### UC1: Receive a constrained meal shortlist

- Actor: meal seeker.
- Preconditions: active restaurant/menu data exists; no account is required.
- Main flow: enter conditions → validate → find matches → rank/select up to three → display decision details → select a result.
- Alternate flows: no matches suggests relaxing a named constraint; reject returns a non-duplicate replacement; invalid input identifies the affected field; location denial falls back to manual area/general discovery.
- Data involved: session identifier, budget range, food type/taste, manual area or optional transient location, excluded record IDs.

## Data-design boundary

| Entity/field | Purpose | Lawful basis decision | Access role | Retention/deletion |
|---|---|---|---|---|
| Session ID | Maintain one recommendation flow and rejected choices | Confirm before implementation; avoid direct identity | System only | End of session or short technical expiry |
| Budget/type/taste | Filter this session's choices | Confirm based on transient processing design | User/session service | Session only by default |
| Food exclusion | Exclude unsuitable food | Sensitive-data assessment required | User/session service | Session only by default |
| Raw GPS | Calculate nearby choices | Notice and lawful basis required | Location/recommendation service only | No database storage; max 30-minute session expiry |
| Account email | Account identity if accounts are added | Must be approved before F14/F15 | User and authorized account support | Approved account retention plus deletion process |
| Consent/agreement evidence | Demonstrate choice and accepted version | Legal/compliance approval required | User and authorized compliance role | Approved evidence-retention schedule |
| Restaurant/menu record | Supply recommendations | Assess identifiable-person fields/photos separately | Public read; authorized admin write | Until retired; personal fields follow approved schedule |
| Traffic/audit record | Legal traffic obligations or security accountability | Separate applicability/purpose decisions | Restricted operator/compliance role | Traffic ≥90 days only if LR10 applies; audit schedule separately approved |

No persistent personal-data field may be implemented until its row has a final lawful basis, retention period, access role, and deletion behavior approved by an accountable human.

## Approval

- Decision: Pending
- Approved by:
- Date:

