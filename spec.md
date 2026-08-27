# Specification

## Status

Draft. Requires human approval after review against `intent.md` and `rule.md`.

## Functional requirements

- FR-01: Users can browse restaurant information needed for the listing purpose.
- FR-02: Users can request general restaurant selection without providing personalization consent.
- FR-03: Users can opt in to personalized recommendations after receiving a clear purpose notice.
- FR-04: The system uses preferences only for disclosed recommendation purposes.
- FR-05: Location is collected only after notice and only for the approved recommendation session unless separately authorized.
- FR-06: Account registration validates the email and uses it only for the stated account purpose.
- FR-07: Users can submit access, correction, and deletion requests through a defined mechanism.
- FR-08: Protected APIs verify authentication and authorization before changing or exposing protected data.
- FR-09: The system records consent separately from Terms of Service acceptance, including version and timestamp.
- FR-10: Required traffic and audit records are protected, integrity-preserving, and retained according to applicable rules.

## Non-functional requirements

- NFR-01: API inputs are validated at the boundary.
- NFR-02: Logs do not contain passwords, authentication secrets, or unnecessary sensitive personal data.
- NFR-03: Personal data is minimized, access-controlled, and deleted or anonymized when no longer lawfully needed.
- NFR-04: Electronic agreements preserve who agreed, what was agreed, and when.
- NFR-05: The system must be testable through automated build, test, and lint checks.

## Core use cases

1. Browse general restaurants.
2. Consent to and receive personalized recommendations.
3. Decline personalization and continue with general discovery.
4. Request access, correction, or deletion of personal data.
5. Administrator manages restaurant information with authorization.
6. Authorized operator handles lawful data or traffic-log requests.

## Data design boundary

The implementation plan must identify fields, purpose, lawful basis, retention, access roles, and deletion behavior for each personal-data field before storage is implemented.
