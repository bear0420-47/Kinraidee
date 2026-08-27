# บุศรวยไม่ จำกัด — Legal & Compliance Rules

This file is the single source of truth for legal, privacy, retention, and security rules in the Kinraidee food-menu recommendation project. Every Agent must read it before producing requirements, plans, code, tests, or reviews.

**Written by: Butsarin Chomchat 6631503111,Natthanan Kaewsaengin 6631503017 ,
Andrew Dicesare	6631503050**

Read this before writing any code that touches user data or user actions in **Kinraidee**.

## PDPA (Personal Data Protection Act)

**What it is:** The PDPA is Thailand's law for protecting personal data. It regulates how personal data is collected, used, disclosed, stored, and deleted, and gives data subjects rights over their personal data.

**What it requires:** consent · purpose limit · minimise · access/correct/delete · sensitive data

### Rules for the agent

- If the system collects personal data, it must have a lawful basis for collecting and processing that data.
- If the system collects personal data, it must tell the user the purpose of collection and other information required by the applicable privacy notice.
- If the system collects a student's email for account registration, it must use the email for the stated account-related purpose and must not silently reuse it for an unrelated purpose.
- If the system stores food preferences, it must use them only for purposes that have been disclosed to the user and have an appropriate lawful basis.
- If the system uses food preferences to provide personalized restaurant recommendations, it must not use those preferences for an unrelated purpose unless a lawful basis and required notice are provided.
- If the system processes sensitive personal data, it must satisfy the additional requirements under the PDPA, including obtaining explicit consent when explicit consent is the applicable legal basis and no applicable exception applies.
- If the system processes information that may reveal health information, religion, or another sensitive characteristic, it must determine whether the information constitutes sensitive personal data before processing it.
- If the system asks for consent, it must make the consent request clear and distinguish it from unrelated terms or conditions.
- If the user refuses consent for personalized recommendations, the system must not use the refused data for that personalized recommendation purpose.
- If the system can provide a general restaurant selection without personalized data, it should allow the user to use that functionality without requiring unnecessary consent for personalization.
- If the system stores restaurant information that is personal data, it must collect only information necessary for the stated restaurant-listing purpose.
- If a restaurant photo contains an identifiable person, the system must determine whether the image contains personal data and ensure that an appropriate lawful basis exists before using or publishing it.
- If the user exercises a data subject right, the system must provide an appropriate mechanism for handling the request, subject to the conditions and exceptions provided by law.
- If the user requests access to or correction of their personal data, the system must provide a way to submit and process the request where the applicable legal requirements are satisfied.
- If the user requests deletion of their personal data, the system must process the request according to the PDPA and must retain the data only where there is a lawful reason or legal requirement to do so.
- If the system stores personal data, it must implement appropriate security measures to prevent unauthorized access, use, alteration, disclosure, loss, or destruction.
- If personal data is no longer necessary for the stated purpose and there is no legal requirement or other lawful reason to retain it, the system must delete, destroy, or anonymize it as appropriate.
- If the system writes personal data to application logs, it must minimize the data recorded and must not log passwords, authentication secrets, or unnecessary sensitive personal data.
- If the system exposes personal data through a public page or API, it must ensure that the disclosure has an appropriate lawful basis and authorization.
- If the system requests the user's real-time GPS location to recommend nearby restaurants, it must clearly inform the user of the purpose before collecting the location and must use the location only for that recommendation session unless the user is separately informed of and agrees to another purpose.

## Computer Crime Act §26

**What it is:** Section 26 requires covered service providers to retain computer traffic data for the period prescribed by law. The minimum retention period is 90 days, and the data must be maintained so that it can support identification and investigation as required by law.

**What it requires:** keep an access/traffic log ≥90 days, tied to a real user

### Rules for the agent

- If the system is a service provider subject to the Computer Crime Act's traffic-data retention requirements, it must collect the computer traffic data required by the applicable law and regulations.
- If the system is subject to Section 26, it must retain the required traffic data for at least 90 days.
- If a longer retention period is required by another applicable law or a valid legal order, the system must retain the required data for that longer period.
- If the system stores traffic data required by Section 26, it must protect the data against unauthorized access, alteration, destruction, or loss.
- If the system stores traffic data required by Section 26, it must maintain the integrity of the records so that the stored information cannot be silently altered.
- If a competent authority lawfully requests retained traffic data, the system must handle the request according to the applicable legal procedure.
- If the statutory retention period has expired and there is no other lawful reason or legal requirement to retain the traffic data, the system should securely dispose of the data according to the system's retention policy.
- If the application records login, logout, registration, restaurant changes, or administrative actions for security auditing, it must treat those records as application audit logs and must not claim that every such record is independently required by Section 26.
- If application audit logs contain personal data, the system must protect and retain them according to applicable privacy and security requirements.
- If the system creates traffic logs, it must not include passwords, authentication secrets, or unnecessary sensitive personal data in those logs.

## Electronic Transactions Act §9 / 26 / 28

**What it is:** Section 9 recognizes an electronic signature when the method can identify the signatory, show the signatory's intention to associate with the electronic data, and is sufficiently reliable for the transaction. Section 26 defines characteristics of a reliable electronic signature, while Section 28 sets requirements for certification service providers that issue certificates supporting electronic signatures.

**What it requires:** valid e-signature test (§9) · presumed-reliable signature (§26) · CA duties (§28)

### Rules for the agent

- If the system allows a user to electronically sign a document, it must use a method that can identify the signatory.
- If the system allows a user to electronically sign a document, it must provide evidence that the signatory intended to associate the signature with the electronic data.
- If the system claims that an electronic signature satisfies the reliable electronic signature requirements of §26, the signature creation data must be linked to the signatory and not another person in the context in which it is used.
- If the system claims that an electronic signature satisfies §26, the signature creation data must be under the control of the signatory at the time the signature is created.
- If the system claims that an electronic signature satisfies §26, the system must make alterations to the electronic signature detectable after signing.
- If the purpose of the signature is to provide assurance of the integrity of information, the system must make alterations to the signed information detectable after signing.
- If the system stores an electronically signed document, it must preserve the signed data and the information necessary to verify the signature.
- If the system records an electronic agreement, it should preserve sufficient evidence of who agreed, what was agreed, and when the agreement occurred so that the transaction can be verified later.
- If the system records acceptance of Terms of Service, it should store the accepted terms version and timestamp so that the accepted version can be identified later.
- If the system records PDPA consent, it must keep consent records separately identifiable from general acceptance of Terms of Service.
- If the system changes the Terms of Service, it must preserve previous versions that are needed to establish which version a user accepted.
- If the system uses a digital certificate to support an electronic signature, it must take the reasonable steps required by applicable law to verify the reliability and validity of the signature and certificate.
- If the system relies on a certificate and the applicable certificate information indicates that it is suspended or revoked, the system must not rely on that certificate as valid without an applicable legal or technical basis.
- If the system operates as a certification service provider issuing certificates for electronic signatures, it must comply with the duties imposed on certification service providers under §28.
- If the system does not operate a certification service, it must not implement or describe itself as a certification service provider merely because it uses certificates issued by another provider.
