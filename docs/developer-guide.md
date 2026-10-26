---
title: Developer guide
description: CANOPY Developer guide
status: verified
evidence: []
---

# CANOPY Developer Guide

## A practical handbook for developers working across Mobile, Web, Backend, and AI

**Project:** CANOPY - Gorilla Health Intelligence Platform  
**Document type:** Shared developer workflow and integration handbook  
**Audience:** New developers, current contributors, reviewers, QA testers, and maintainers  
**Companion documents:** `Frontend Mobile` and `Frontend Web`

> **How to use this guide:** Read the relevant Mobile or Web document first for the application's technology, folder layout, installation, screens, security implementation, and deployment commands. This guide intentionally does **not** repeat those details. It explains how to work safely across the whole product, how to prove a feature works, and how to avoid integration problems.

> **Evidence note:** Statements about existing CANOPY behavior come from the two companion documents. Processes, examples, checklists, and suggested practices in this guide are **recommended workflows**, not claims that the team already uses them. Any example response or sample identifier is illustrative and must not be mistaken for real conservation data or a confirmed backend contract.

---

## 1. Start by understanding the whole user journey

A feature can work perfectly in one application and still fail for the person using CANOPY. For example, a tracker might successfully save an observation on the phone, but the veterinarian might never see it in the web portal. The mobile screen is not the only thing that matters: the information must travel correctly through the whole system.

The most important cross-application journey is:

1. A tracker records an observation in the mobile app.
2. The observation is stored safely on the phone.
3. The phone sends the observation when the backend is reachable.
4. The backend receives and processes the observation.
5. An authorized web user can review the related information.
6. A veterinarian can make a decision and assign follow-up work.
7. The tracker can see and act on assigned follow-ups.
8. Where available, environmental data and AI-assisted evidence can support review.

This is a **conceptual workflow**, not a promise that every step happens automatically or that every observation creates a case. The exact case-creation and follow-up rules must be confirmed against the backend.

### What this means for a developer

When you change a feature, ask four questions:

- **Where does the information begin?** On a phone, in a web form, or from a backend service?
- **Who uses it next?** A tracker, veterinarian, administrator, or another service?
- **What must remain true?** The right gorilla, time, observation, case, and permission must stay connected.
- **What could fail between steps?** A lost connection, expired session, invalid request, missing record, or slow AI service.

**Example:** If you add a new clinical sign to the mobile form, it is not enough to display the new choice. Confirm that the backend accepts it, stores it correctly, and that the web portal can display it without treating it as an unknown value.

---

## 2. Find the correct source of truth before writing code

Developers often lose time because they work from an old screenshot, a previous branch, or an example API response that no longer matches the backend.

Use this order when deciding what a feature should do:

1. **Approved product requirement or task:** Explains the intended user behavior.
2. **Current backend implementation and API contract:** Shows what the server really accepts and returns.
3. **Current application source code:** Shows how Mobile or Web currently uses that contract.
4. **Current automated tests:** Show behavior that has already been checked.
5. **Designs and documentation:** Help explain the intended interface, but may be older than the code.
6. **Team clarification:** Resolve any conflict that remains.

This is a recommended decision process, not an existing CANOPY policy.

### When two sources disagree

Do not silently choose the version you like best. Write down:

- The two conflicting statements.
- The files, routes, or screens involved.
- Which behavior is currently running.
- Which behavior the feature owner wants.
- What will be changed and tested.

**Example conflict:** A design shows four risk categories, but the API returns a numerical score and a different category set. Do not invent a conversion in the frontend. Ask the backend or AI feature owner for the official mapping.

### Keep a small integration note for each feature

A useful note contains:

```text
Feature:
Owner:
User role:
Entry screen:
Frontend file(s):
API route(s):
Request fields:
Response fields:
Authentication required:
Empty state:
Error state:
Related tests:
Open questions:
```

This note is especially useful when several developers work on the same feature.

---

## 3. How Mobile, Web, and Backend should coordinate

The companion documents describe the applications separately. The missing piece is how developers coordinate changes between them.

### 3.1 One change may affect several teams

| Example change                 | Mobile impact                                  | Web impact                                  | Backend impact                                 |
| ------------------------------ | ---------------------------------------------- | ------------------------------------------- | ---------------------------------------------- |
| Add a clinical sign            | Update form and local model                    | Update observation/evidence display if used | Accept, validate, and store the new value      |
| Change a gorilla identifier    | Update selection and sync mapping              | Update case and evidence lookups            | Preserve a stable identifier and relationships |
| Add a follow-up status         | Update task display and submission             | Update task creation or review display      | Define and validate allowed states             |
| Change observation time format | Preserve original observation time             | Display time consistently                   | Define timezone and serialization rules        |
| Change prediction response     | Usually no direct change unless used by Mobile | Update AI evidence display                  | Return documented, consistent fields           |

The table describes **possible dependencies**. Check the actual code before treating a column as affected.

### 3.2 Do not guess API fields

Before implementing an API call:

1. Open the relevant backend route and schema.
2. Record the exact method and URL.
3. Record required and optional fields.
4. Check whether the body is JSON or multipart form data.
5. Check successful response shape.
6. Check expected error status codes and messages.
7. Check which roles may use it.
8. Try the request in a controlled environment.
9. Add frontend types or models that match the response.

**Important:** A field name in a UI mockup is not proof that the backend returns that field.

### 3.3 Changes to an existing contract

If the backend changes a response:

- Prefer adding optional fields before removing old fields.
- Update consumers and tests before deleting fields that are still in use.
- Avoid changing a field's meaning without changing its documentation.
- Treat changes to IDs, enums, dates, and nested objects as potentially breaking.
- Tell both frontend owners when a shared endpoint changes.

These are recommended compatibility practices.

---

## 4. Follow one observation from beginning to end

This is a useful debugging exercise for any new CANOPY developer.

### Stage A — The tracker records the observation

Check that the mobile app has captured the intended gorilla or group, signs, severity, notes, observation time, and location information where required.

**Question:** Does the local record contain the same information the tracker reviewed before saving?

### Stage B — The observation waits to sync

Check whether the local record is pending, syncing, synced, or needs attention.

**Question:** Is the observation still safely stored when the connection fails?

### Stage C — The backend receives it

Inspect the actual request and server response in a development or test environment. Confirm the server ID and any error information.

**Question:** Did the backend acknowledge the observation, or did the phone only attempt to send it?

### Stage D — The information becomes available to web users

Use an authorized web session and inspect the relevant case, observation, or timeline view.

**Question:** Is the expected record present, with the correct gorilla and observation time?

### Stage E — The veterinarian acts

If the workflow involves a case review or follow-up, check the relevant backend record and its representation in the web and mobile applications.

**Question:** Does the action reach the intended tracker, and is its state understandable?

### A simple trace sheet

| Checkpoint      | What to record                            | Pass condition                        |
| --------------- | ----------------------------------------- | ------------------------------------- |
| Mobile save     | Local observation reference and state     | Record exists locally                 |
| Sync attempt    | Request time and result                   | Attempt is visible and understandable |
| Backend receipt | Server observation ID                     | Server confirms the record            |
| Web retrieval   | Relevant API result                       | Authorized user receives the record   |
| UI display      | Visible gorilla, signs, and time          | Information matches the stored record |
| Follow-up       | Task ID and intended owner, if applicable | Correct task is available             |

Do not put real passwords, access tokens, or sensitive location details into shared test notes.

---

## 5. Work with identifiers carefully

Several different records may appear in the same workflow: a gorilla, a group, an observation, a case, a grid, a prediction, and a follow-up task.

**Never assume these IDs are interchangeable.**

A gorilla ID identifies an individual. A case ID identifies a case. A prediction ID identifies a prediction. A grid ID identifies a location cell. The exact relationships and field names must come from the backend schemas.

### Rules to follow

- Keep identifiers as strings unless the contract says otherwise.
- Never create a fake ID for a real API request.
- Do not derive an ID from a display name.
- Do not use array position as a permanent identifier.
- Check that the same identifier is used across the request, response, and screen.
- If a record is missing, show the correct empty or error state rather than silently using another record.

### Offline IDs need special care

The mobile app can create a local reference before the server returns a permanent ID. Treat these as different concepts. When sync succeeds, preserve the relationship between the local record and the server record. This helps prevent accidental duplicates and makes failures easier to investigate.

---

## 6. Handle dates, times, and location consistently

An observation may be made in the forest while offline and sent later. That creates at least two meaningful times:

- **Observed time:** When the tracker actually saw the condition.
- **Sync or receipt time:** When the backend received the record.

Do not replace the observed time with the upload time. The Mobile document explicitly describes preserving the original observation time.

### Recommended checks

- Confirm the timestamp format in the backend schema.
- Confirm whether timestamps include a timezone or UTC offset.
- Convert times for display without changing the underlying event.
- Keep sorting rules consistent between the timeline and observation history.
- Test observations created before midnight and synced the following day.
- Test records that arrive out of order.

### Location handling

The mobile document describes resolving exact GPS coordinates to a park grid and removing exact coordinates from the phone after grid resolution.

When working with location information:

- Prefer the documented grid identifier where the workflow expects one.
- Do not display exact GPS coordinates simply because a value is available.
- Do not log raw location details for debugging.
- Check behavior when location permission is denied or grid lookup is unavailable.

---

## 7. AI-assisted predictions: what developers must verify

AI results need more careful handling than ordinary text. A successful HTTP response does not mean the prediction is correct or useful.

The Web document identifies AI-assisted content as part of the portal. The existing web routes and UI work discussed in this project include prediction generation, prediction retrieval, and evidence display. However, **the supplied Mobile and Web documents do not establish a validated AI accuracy score, clinical performance target, or complete model-evaluation protocol**.

### 7.1 Separate three kinds of checks

**A. Frontend behavior**

Does the user see the correct loading state, result, error, empty state, and evidence sections? Does the button send the expected request?

**B. Backend integration**

Does the real API accept a valid request, enforce authorization, return the documented shape, and link the result to the intended record?

**C. AI quality and safety**

Are predictions supported by appropriate evidence? Are recommendations consistent with reviewed reference material? Are outputs evaluated by qualified reviewers against an agreed test set?

Passing A or B does **not** prove C.

### 7.2 Test the evidence relationship

For a prediction associated with a case, confirm:

1. The result belongs to the intended gorilla or group.
2. The result has a stable prediction identifier.
3. The interface displays the risk information returned by the API.
4. Observation evidence, if returned, refers to the intended records.
5. Environmental evidence, if returned, refers to the intended period or location.
6. Citations or reference sources are displayed when available.
7. Missing evidence is not presented as if it exists.
8. Errors do not leave an old result looking like a new one.

### 7.3 Do not invent clinical facts in test fixtures

Synthetic fixtures are useful for checking whether a screen renders. Label them clearly as test data. They must never be passed off as real gorilla health records or evidence that an AI model is clinically correct.

### 7.4 Protect the user from confusing results

Recommended UI rules:

- Explain that a prediction is AI-assisted, not a confirmed diagnosis.
- Show when an assessment is loading or unavailable.
- Keep risk score, supporting evidence, and recommendations visually distinct.
- Do not hide uncertainty or missing evidence.
- Make it possible to identify which assessment is being viewed.

The exact wording and review responsibilities should be agreed with the product and veterinary team.

---

## 8. Environmental data: practical integration checks

Environmental readings can be missing, delayed, incomplete, or associated with a different grid or date range.

When developing or testing the environmental view, check:

- Is the selected case linked to a grid?
- Does the request use the correct grid ID?
- Does the selected period change the request as expected?
- Are units shown clearly for temperature, rainfall, and humidity?
- Are empty readings displayed as empty, not as zero?
- Are errors distinguishable from “no data”?
- Does changing the period update both chart and summary?
- Does the interface remain usable if one metric is missing?

**Example:** “No rainfall readings” is not the same as “0 mm rainfall.” The first means the system lacks measurements; the second means measurements indicate no rain. Do not turn missing values into zero unless the backend contract explicitly requires it.

### Checking AI–environment relationships

If an AI prediction includes environmental evidence, verify the returned grid and time period against the prediction context. A frontend test can verify rendering; an integration test must verify that the backend returned the correct records.

---

## 9. A testing strategy that proves the right things

Do not measure quality only by counting passed tests.

A suite of 50 tests that all check unauthorized requests may be useful, but it does not prove that a veterinarian can view a case or that an AI assessment appears correctly.

### 9.1 Test levels

| Level                    | Main question                                                   | Typical tool                                        |
| ------------------------ | --------------------------------------------------------------- | --------------------------------------------------- |
| Unit                     | Does one function or class behave correctly?                    | Flutter test framework or project unit-test tooling |
| Component                | Does the screen or UI component react correctly to data?        | Flutter widget tests or frontend component tooling  |
| API                      | Does the endpoint validate and respond correctly?               | Postman or automated request tests                  |
| Browser E2E              | Can a user complete the web workflow?                           | Playwright                                          |
| Mobile device workflow   | Can a tracker complete the workflow on a device?                | Device testing                                      |
| Cross-system integration | Does data travel correctly between applications and backend?    | Coordinated test environment                        |
| AI evaluation            | Are outputs accurate and appropriate against reviewed evidence? | Separate domain evaluation                          |

### 9.2 What mocks can prove

With mocked API responses, you can test:

- Button clicks and navigation.
- Loading indicators.
- Form validation.
- Data rendering.
- Empty states.
- Error messages.
- Request payload construction.

Mocks **cannot** prove that the real backend works, that authorization is configured correctly, or that the AI model makes accurate predictions.

### 9.3 What real integration tests must prove

Using a controlled test environment:

- A real authenticated request reaches the backend.
- The backend validates the request.
- The expected record is created or returned.
- The frontend reads the result correctly.
- The system handles permission failures and unavailable services.
- A related record can be found again using its real ID.

### 9.4 Suggested CANOPY acceptance scenarios

| Scenario                         | Expected evidence                                       |
| -------------------------------- | ------------------------------------------------------- |
| Tracker saves offline            | Local record remains available without signal           |
| Tracker reconnects               | Pending record is sent without accidental duplication   |
| Wrong mobile role                | Access is refused                                       |
| Authorized web user opens a case | Correct case information appears                        |
| Case has no grid                 | Environmental section explains the limitation           |
| Environmental request fails      | Useful error state appears                              |
| User changes weather period      | Request and displayed period agree                      |
| AI assessment is requested       | Correct request is sent                                 |
| AI request fails                 | User sees failure; no false success                     |
| AI result has no evidence        | UI does not fabricate evidence                          |
| Prediction includes evidence     | Correct observation and environmental sections appear   |
| User loses session               | Protected action cannot continue without authentication |

This is a **proposed acceptance matrix**, not a claim that all scenarios have already passed.

---

## 10. How to write a useful bug report

A good bug report lets another developer reproduce the problem without guessing.

Use this template:

```text
Title:
Application: Mobile / Web / Backend / AI
Environment: Local / Test / Production
Role used:
Feature:
Expected result:
Actual result:
Steps to reproduce:
Relevant request and status code:
Screenshot or test report:
First seen:
Severity:
Possible cause (if known):
```

### Example: Environmental tab does not update

**Expected:** Selecting “7 days” changes the displayed period and corresponding data.

**Actual:** The button changes state, but the chart still shows the previous period.

**How to investigate:**

1. Check whether the click handler ran.
2. Check whether the browser sent a new request.
3. Check the request query parameters.
4. Check the API response.
5. Check whether the component replaced its previous state.
6. Add a regression test once the cause is fixed.

Avoid reports like “AI is broken” or “the API is not working.” They do not explain what failed.

---

## 11. Debug problems from the outside inward

Use a consistent sequence instead of changing several files at once.

### If a web screen is blank

1. Check the browser console.
2. Check whether the page is redirecting.
3. Check the browser Network tab.
4. Find the first failing request.
5. Inspect the corresponding Next.js route handler.
6. Check backend status and response shape.
7. Check whether the UI expects a field the API does not return.

### If an observation does not sync

1. Confirm it exists in the local database.
2. Check its sync status.
3. Check whether the server is reachable.
4. Check whether the session is valid.
5. Check the last error or server rejection.
6. Confirm whether the backend received the record.
7. Do not delete the local record just to make the error disappear.

### If an AI result does not appear

1. Check whether the UI sent the generation request.
2. Check the response status.
3. Check whether the backend returned a prediction identifier.
4. Check the subsequent retrieval request.
5. Check the response fields used by the UI.
6. Confirm whether the result is empty, delayed, rejected, or genuinely missing.

### If Mobile and Web show different information

Compare the **same real record ID** and the same backend environment. Check timestamps, filtering, role permissions, caching, and whether one application is showing an unsynced local record.

---

## 12. A safe Git and pull-request workflow

The companion documents describe build and testing commands. This section describes how to organize the work around those commands.

### Before starting

1. Pull the latest approved branch.
2. Check for uncommitted changes.
3. Read the issue and relevant API contract.
4. Create a focused feature branch.
5. Identify affected screens, routes, and tests.

Illustrative branch names:

```text
feature/environment-empty-state
fix/observation-sync-retry
test/ai-evidence-browser-flow
```

### During implementation

- Keep changes limited to the task.
- Avoid unrelated formatting or refactoring.
- Do not hard-code production credentials.
- Do not add fake conservation records to production.
- Add or update tests for behavior you change.
- Explain any backend dependency that is not yet available.

### Before opening a PR

Check the relevant Mobile or Web guide for project-specific commands. Then:

- Review your own diff.
- Run the relevant checks.
- Confirm new and changed behavior manually.
- Record what was tested and what was not.
- Attach screenshots only when they help explain the UI.
- Make sure no secret or authenticated browser state is included.

### Suggested PR template

```markdown
## What changed

Describe the feature or fix in simple words.

## Why

Explain the user problem.

## Areas affected

Mobile / Web / API / AI / Database

## API contract

List endpoints or schema changes, if any.

## How it was tested

List commands, scenarios, and results.

## Screenshots

Attach if relevant.

## Risks and limitations

State missing dependencies or untested paths.

## Reviewer notes

Explain what needs special attention.
```

A PR should not claim complete E2E coverage if it only ran mocked UI tests or authorization checks.

---

## 13. How to review another developer's code

Reviewers should check more than whether the code compiles.

### Correctness

- Does the implementation match the requirement?
- Are identifiers, dates, and statuses handled correctly?
- Are missing and invalid values handled?
- Does the feature preserve existing workflows?

### Integration

- Does the request match the backend contract?
- Are response types accurate?
- Does the change affect Mobile, Web, or both?
- Is a backend change required before merging?

### Security and privacy

- Are permissions enforced at the right boundary?
- Are tokens and secrets kept out of logs?
- Are sensitive location and health-related records handled carefully?
- Is the new feature using the existing secure paths?

### Testing

- Are the tests meaningful?
- Are both success and failure cases covered?
- Does a mocked test make a claim it cannot support?
- Is there a way to verify the feature manually?

### Maintainability

- Can another developer understand the names and control flow?
- Is the logic in the appropriate layer?
- Are errors easy to investigate?
- Does the change duplicate code unnecessarily?

---

## 14. Test environments and test data

Use separate concepts for **production data**, **test environment data**, and **mock fixtures**.

### Production data

Real information used by the deployed platform. Do not change or delete it just to make a test pass.

### Test environment data

Records created in an approved non-production environment for integration testing. They should have known owners, clear cleanup rules, and no misleading claim that they are real wildlife observations.

### Mock fixtures

Small synthetic responses returned by a test runner. They help check the UI without contacting the real service.

### Recommended fixture rules

- Use obvious names such as `TEST_CASE` or `SYNTHETIC_OBSERVATION`.
- Keep fixtures deterministic so the same test behaves consistently.
- Use only fields supported by the actual API contract.
- Include empty, error, and boundary examples.
- Avoid real credentials and precise sensitive locations.
- Never use a fixture to claim the AI model has been validated.

---

## 15. Managing dependencies between teams

A feature may be blocked even when its frontend code is ready.

Use a small dependency register:

| Item                        | Owner            | Dependency                 | State                 | Next action                      |
| --------------------------- | ---------------- | -------------------------- | --------------------- | -------------------------------- |
| Example: AI evidence screen | Web developer    | Stable prediction response | Awaiting confirmation | Review response schema           |
| Example: Observation upload | Mobile developer | Upload validation behavior | Needs testing         | Run controlled multipart request |
| Example: Follow-up display  | Mobile developer | Task state contract        | Awaiting confirmation | Agree on status values           |

These are **examples**, not actual project statuses.

### When blocked

Do not invent endpoints or response fields to keep moving. You can still work on isolated UI behavior with a clearly labeled fixture, but record the integration as unfinished until the real contract is confirmed.

---

## 16. Handover checklist for another developer

When you finish a feature, leave enough information for someone else to continue.

A useful handover answers:

1. What user problem was solved?
2. Which files were changed?
3. Which API routes are involved?
4. Which user roles are affected?
5. What is working?
6. What is not yet working?
7. Which tests were run?
8. Which tests were skipped, and why?
9. What environment or configuration is required?
10. What should the next developer do first?

### Suggested handover format

```text
Feature:
Branch / PR:
Current status:
Implemented:
API dependencies:
Tests passed:
Tests not run:
Known limitations:
Manual verification steps:
Next action:
```

This is particularly important for features that depend on work being merged by another team member.

---

## 17. Release readiness: a shared checklist

Before releasing a change that affects more than one part of CANOPY, confirm the following.

### User experience

- The intended role can complete the task.
- Empty and error states make sense.
- The workflow does not lose user-entered information.
- A failure does not appear to be a success.

### Integration

- Mobile and Web use compatible backend contracts.
- Backend permissions match the expected roles.
- Real records remain linked to the correct IDs.
- Any AI or environmental dependencies are understood.

### Data integrity

- Observation times are preserved.
- Retries do not create unwanted duplicates.
- Missing values are not silently changed into meaningful values.
- Sensitive information is not leaked through logs or test reports.

### Verification

- Relevant unit tests pass.
- Relevant UI or browser tests pass.
- API integration has been checked where required.
- Device-specific behavior has been checked where required.
- Known limitations are documented.

### Operations

- Required configuration is available in the target environment.
- The team knows how to recognize and investigate a failure.
- The release has an owner.
- A rollback or corrective plan exists for important changes.

This is a recommended release checklist, not evidence that every item is currently automated.

---

## 18. Common misunderstandings to avoid

**“The page loads, so the feature works.”**  
A page can load while its API requests fail. Test the action and its result.

**“All API tests passed, so E2E is complete.”**  
API tests do not automatically prove the full browser or mobile journey.

**“The AI request returned 200, so the prediction is accurate.”**  
A successful request proves transport and response behavior, not clinical validity.

**“The phone has internet, so synchronization must work.”**  
The backend may still be unreachable, or the session may be expired.

**“No weather readings means there was no rain.”**  
Missing data and a measured value of zero are different.

**“A mocked prediction is real AI integration.”**  
A mock tests frontend handling. Real integration requires the actual service.

**“A local observation ID is the server ID.”**  
The two can represent different stages of the same record.

**“The feature is done because the code was merged.”**  
A feature is only ready when its intended workflow and dependencies have been verified.

---

## 19. A practical first-week plan for a new developer

### Day 1 — Understand the product

Read the Mobile or Web companion document for the application you will work on. Identify the user role, main workflow, and where the backend fits.

### Day 2 — Trace one existing feature

Choose a simple feature, such as retrieving a case or saving an observation. Find its UI, state logic, request code, and backend contract. Write down the request and response.

### Day 3 — Run the existing tests

Run the documented checks for your application. Learn which tests use mocks and which require a real environment. Do not assume a passing suite proves every feature.

### Day 4 — Make a small safe change

Choose a small bug or usability improvement. Add a relevant test, confirm the change locally, and review the diff.

### Day 5 — Prepare a complete handover

Open a focused PR. Explain the change, the API impact, tests run, known limitations, and any remaining dependency.

This is a suggested onboarding plan and can be adapted to the team's schedule.

---

## 20. Quick reference: where to look next

| Need                                            | Read or inspect                                          |
| ----------------------------------------------- | -------------------------------------------------------- |
| Flutter installation and device configuration   | **Frontend Mobile**, installation section                |
| Mobile offline database and sync implementation | **Frontend Mobile**, offline capability section          |
| Mobile security implementation                  | **Frontend Mobile**, security section                    |
| Mobile screens and navigation                   | **Frontend Mobile**, UI section                          |
| Next.js installation and environment variables  | **Frontend Web**, local setup section                    |
| Web server-side proxy and route structure       | **Frontend Web**, architecture and request-flow sections |
| Web validation and coding standards             | **Frontend Web**, coding standards section               |
| Web Playwright commands                         | **Frontend Web**, testing section                        |
| Web deployment                                  | **Frontend Web**, deployment section                     |
| How Mobile, Web, and Backend coordinate         | **This guide**, sections 1–6                             |
| How to evaluate AI-related behavior             | **This guide**, section 7                                |
| How to distinguish UI, API, and E2E testing     | **This guide**, section 9                                |
| How to debug and report defects                 | **This guide**, sections 10–11                           |
| PR reviews, handover, and release readiness     | **This guide**, sections 12–17                           |

---

## 21. Information still needed for a fully verified system-wide guide

The two supplied frontend documents do **not** provide enough evidence to confirm every detail of the backend, database, AI model, or deployment infrastructure.

A future version of this guide should incorporate, from their actual owners:

1. **Backend API specification:** Exact schemas, roles, response shapes, and error codes.
2. **Database specification:** Tables, relationships, migrations, and retention rules.
3. **AI implementation documentation:** Model/service flow, source retrieval, output schemas, and evaluation approach.
4. **Environment inventory:** Approved development, staging, and production URLs and access policies.
5. **Release and incident procedures:** Who deploys, who monitors, and how rollbacks are performed.
6. **End-to-end test evidence:** Which scenarios have been executed against real integrated services and their outcomes.

Until those documents are reviewed, do not treat inferred workflows or examples as confirmed backend behavior.

---

## Final note

The Mobile and Web guides explain **how each application is built**.

This shared Developer Guide explains **how developers work across them**: following information from one system to another, checking contracts, handling failures, writing meaningful tests, reviewing changes, and handing work over safely.

The central rule is simple:

**Do not call a feature complete just because one screen or endpoint works. Confirm that the right user can complete the intended workflow, that the information remains correct, and that failures are handled safely.**
