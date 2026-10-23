# System Architecture
## Purpose of the Architecture 

Canopy is designed to support mountain gorilla health monitoring by connecting field observations, veterinary assessment, environmental information, and follow-up activities within one health management workflow. The architecture defines how the different parts of the platform work together. It explains where data enters the system, how it is processed and stored, how intelligence services use that data, and how the results reach the people responsible for making decisions.

The central architectural principle is continuity of a health case. A field observation should remain connected to the veterinary review it triggers, the decision made, the follow-up assigned, and the eventual outcome. Information should not become disconnected across separate records or communication channels. The platform is intended to complement existing conservation and veterinary systems rather than replace them.

## System Architecture Diagram

Is a high-level visual blueprint that maps out the structural design of a software application or infrastructure. It serves as the foundational roadmap for developers, stakeholders, and engineers to understand how the system functions as a whole.

* **Primary Goal**: To illustrate exactly how data moves through the ecosystem and how components interact to satisfy business logic.

<a href="public/solène SAD.png" target="_blank">
  <img src="public/solène SAD.png" alt="Click to expand" width="1000" />
</a>

## Secure SAD

Takes the standard SAD template and overlays a comprehensive layer of cybersecurity controls, threat boundaries, and defensive mechanisms. It is used to prove that a system complies with strict security policies.

* **Core Focus**: Data protection, access control, vulnerability mitigation, and perimeter defense.

**Key Components Added**
* Encryption Standards
* Identity & Access Management (IAM): Where Multi-Factor Authentication (MFA), OAuth2 tokens, and API gateways live.
* Perimeter Defense: Firewalls, Web Application Firewalls (WAF), and Virtual Private Clouds (VPC).
* Monitoring & Compliance: Intrusion Detection Systems (IDS), audit logs, and security information event management (SIEM).

* **Primary Goal**: To illustrate how data is protected and where the absolute security boundaries exist within the network architecture.


<a href="public/CANOPY platform security architecture.png" target="_blank">
  <img src="public/CANOPY platform security architecture.png" alt="Click to expand" width="1000" />
</a>



## Components & Responsibilities


| Component | Primary Responsibility |
| :--- | :--- |
| Tracker mobile app | Capture health observations and locations, view case status, and complete assigned tasks. |
| Veterinarian dashboard | Review cases, inspect health history and risk signals, make clinical decisions, and assign follow-up. |
| Admin interface | Register and manage users and gorilla records. |
| User onboarding | Manage tracker, veterinarian, and administrator registration and access. |
| Gorilla management | Maintain individual gorilla information and related records. |
| Health case management | Connect observations, assessments, decisions and follow-up into a traceable case. |
| Health surveillance and prediction | Combine relevant health and environmental information to surface potential risks. |
| Preventive recommendation service | Produce or manage preventive guidance for veterinary review. |
| Canopy API | Receive requests, validate input, apply application rules, coordinate services, and return responses. |
| Location service | Resolve and manage geographic information relevant to observations and risk analysis. |
| Database | Persist application records and relationships. |
| External integrations | Provide environmental data, geocoding, or AI file-read capabilities as required. |



## Data Flow
The steps below document the complete health case lifecycle:

* **Observation**: A tracker records an individual gorilla's condition, signs, severity, and relevant contextual information.
* **Submission and synchronization**: The application submits the observation to the backend when connectivity is available. Offline capture and automatic synchronization are enabled once online.
* **Record creation**: The backend validates the information and associates it with the relevant gorilla and health case.
* **Context enrichment**: Relevant history, group information, location, and environmental information are retrieved or added where available.
* **Risk analysis**: The surveillance and intelligence functions identify potential disease risk signals or patterns for further assessment.
* **Veterinary review**: A veterinarian reviews the available evidence, uncertainty, and case history before deciding on the appropriate response.
* **Action and follow-up**: Recommendations or decisions can result in assigned tasks, deadlines, and subsequent observations.
* **Outcome and closure**: The case record is updated with decisions and outcomes, maintaining continuity for future reviews.

## Architecture Layers

The system is organised into layers, each with a distinct responsibility. This  layered design makes the platform easier to maintain because changes to one part do not automatically require changes throughout the entire system.

### 1. Presentation layers
The interfaces used by trackers, veterinarians, and administrators to record, review, and manage information.

#### 1.1 Gorilla Tracker

Trackers are responsible for observing gorillas in the field. Using a mobile application, their logged in observations provide the information that starts the health monitoring process.
The tracker interface is designed to let users:

* Record a health observation.
* Submit relevant gorilla and location details.
* View case status.
* Receive and review assigned follow-up tasks.
* Submit new observations after completing a follow-up task.

**Example**: A tracker notices that a gorilla is coughing and records the observation. That record becomes available to the backend for processing and veterinary review.

The architecture connects the tracker interface to the Canopy API rather than allowing the mobile interface to write directly to the database. This centralises validation and access control.

#### 1. 2 Gorilla Doctor/Veterinarian

The veterinarian is the clinical decision maker. The veterinarian dashboard provides access to information needed to review a case.

Its documented responsibilities include:

* Reviewing reported health cases
* Accessing gorilla details and relevant health history
* Viewing predicted health risks
* Reviewing preventive measures
* Assigning follow-up tasks to trackers

**Example:** After receiving the tracker’s report, a veterinarian reviews the observation alongside previous health information, determines whether additional monitoring is necessary, and assigns a follow-up task.

The system supports this process; the veterinarian remains responsible for the clinical decision.

#### 1.3 Administrator

The administrator manages the users and gorilla records required by the platform.

* Registering tracker and veterinarian accounts.
* Viewing registered users.
* Registering gorilla details.
* Viewing registered gorilla records.

This separates platform administration from clinical decision making. A user responsible for account management should not automatically receive unrestricted access to sensitive clinical information. The precise permissions assigned to each role are enforced by the application and backend, not just by hiding buttons in the interface.

### 2. Application layer

This is the central coordinator of Canopy. It receives requests from the interfaces, invokes the appropriate business logic, communicates with the database and external services, and returns results.

#### 2.1 User onboarding Module

Manages the registration and onboarding of users.
Its documented flow is:

* An administrator registers a tracker or veterinarian.
* The relevant user details are sent to the backend.
* The backend processes and stores the registration information.
* A registration confirmation is returned.
* The registered user becomes available for the appropriate platform workflows.

Onboarding establishes the user's role and account status. Authentication and authorisation determines whether that user is allowed to perform a particular action.

#### 2.2  Gorilla Management Module

Maintains the gorilla records used throughout the platform. It supports registration, retrieval and association of records with other parts of the system. A gorilla record provides the reference needed to connect different observations to the same animal. Without consistent identifiers, the system could mistakenly treat observations about the same gorilla as unrelated records.

**Example**: If several observations are submitted about the same gorilla over several days, the platform needs a consistent gorilla identifier to associate them with the correct health history.

#### 2.3  Health case Management Module

The module manages the operational lifecycle of a health concern. This part connects an observation to the response that follows. 
It’s documented flow is:

* Receiving and checking reported cases.
* Retrieving observations and relevant health data.
* Making case information available for review.
* Associating follow-up tasks with the relevant case.
* Retrieving and displaying case details and status.

A Health Case is not simply a single observation. It is a record that brings together related information about a health concern over time. Depending on what is available and implemented, that information may include the original observation, earlier observations, assessments, diagnostic information, veterinary decisions, follow-up tasks, and the final outcome.

Without case management, a tracker’s observation might exist in one record, the veterinarian’s decision in another, and the follow-up in a separate conversation. Connecting them makes it easier to understand what happened and whether the required action was completed.

#### 2.4 Health surveillance and  prediction Module

This module provides a broader view of potential health risks using health and environmental information.
It’s documented flow include:

* Retrieves environmental data.
* Receives health and environmental information.
* Produces or retrieves a health-risk prediction.
* Makes prediction results available to the application.
* Allows users to view predicted risks.

The architecture therefore distinguishes individual health-case management from broader health surveillance.
- Case management focuses on a particular health concern and its response.
- Health surveillance looks for potential patterns across observations and monitored areas.

#### 2.5 Preventive measure recommendation Module

This module connects health risk information to potential preventive actions. The veterinarian requests for preventive measures, the system retrieves preventive recommendations, and recommendations can either be rejected or approved. The final decision solemnly lies on the veterinarian.

The intended flow is:

* Health risk information is made available.
* A request for preventive guidance is submitted.
* The relevant AI and reference-retrieval components are used.
* A recommendation is returned.
* The veterinarian reviews the recommendation before deciding whether to accept or reject it.

This module supports decision making, it does not automatically convert an AI-generated suggestion into a clinical instruction. The existing interface also includes a review queue for proposed recommendations. 

#### 2.6  Canopy AI

The Canopy API is the communication boundary between the user interfaces and the backend functionality. A veterinarian can ask a question concerning mountain gorillas and the assistant will generate answers within the context.

**Example**: when a tracker submits an observation, the application sends a request to the Canopy API. The backend then processes the request and returns a success response or an error.

The API is responsible for coordinating operations such as:
* Receiving a request.
* Identifying and authorising the user.
* Validating the submitted information.
* Invoking the relevant application module
* Saving or retrieving information.
* Returning a structured response.

This central coordination reduces duplication of business rules across the mobile app, PWA, and administrative interface.

### 3. Data Layer

The data layer provides persistent storage for the information used by the application modules. The database that stores gorilla records, observations, locations, environmental measurements, predictions, and preventive recommendations. The database is important because the system must preserve information across sessions and connect records that belong to the same health concern.

#### 3.1 How data entities relate


| Data Entity | Purpose | Example |
| :--- | :--- | :--- |
| User | Identifies a platform user and their relationship to the system | A registered tracker |
| Gorilla | Identifies an individual gorilla | A gorilla with a canonical identifier |
| Observation | Records what was observed and when | A report of coughing or limping |
| Location | Associates information with a geographic area | A monitored location |
| Health case | Connects a health concern to its management history | A case opened after a concerning observation |
| Environmental data | Stores weather or environmental measurements over time | Rainfall recorded for a monitored area |
| Disease Prediction | Stores a model-generated risk estimate | A prediction for a monitored region |
| Preventive recommendation | Stores a suggested action and its review status | A proposed preventive measure to reduce spread |
| Follow-up task | Tracks an assigned action and its completion | A request to observe the gorilla again to monitor their health status |


#### 3.2 Why relationships matter

Consider a health case opened after an observation. The case needs to reference the gorilla involved and the observation that triggered the review. Additional observations may then be linked to the same case. A veterinarian may record an assessment and assign a follow-up task. When the tracker completes the task, the resulting observation can be associated with the same case.

This creates a connected history instead of a collection of unrelated records. The database preserves the relationships between these records so that users can understand not only the current state of a case but also the sequence of events that led to it.


### 4. Integration layers

#### 4.1 Open-Meteo API

Provides weather and environmental data used by the health surveillance and prediction workflow. The application requests relevant environmental data and uses the returned measurements as inputs or context for health risk analysis.

[Open Meteo](https://open-meteo.com/)


#### 4.2  Gemini Files Search API

Gemini File Search is the knowledge-retrieval and generation service for Canopy AI. Provides retrieval augmented generation over cleaned gorilla health reference documents. Cleaned gorilla health documents are uploaded into a configured File Search Store. The backend sends a question and the store reference to Gemini, receives a grounded answer and citation metadata, and converts that result into CANOPY’s response schema.

The Gemini API key, model name, and File Search Store identifier must remain backend environment variables. They must not be sent to or embedded in the frontend.

[Gemini File search](https://ai.google.dev/gemini-api/docs/file-search)

#### 4.3  Email provider(SMTP)

Email is used for login OTP and account-related communication. SMTP configuration is backend-only and should never be exposed to the frontend.

[Simple Mail Transfer Protocol](https://www.smtp.com/email-api/?afid=partnerstack&utm_source=partner&gclid=CjwKCAjwi-zWBhAdEiwAqlRf-G3SBMqMIwsmRCCcsMYF0VMREavKwGN2WvKO57kvyjg2bt1aKFNNrxoCxLIQAvD_BwE&gbraid=0AAAAAphr3jv3qfiLUtvGqkLBzM8ccM70f&gad_campaignid=20083745898&gad_source=1&ps_partner_key=c2VtYW50aWNsYWJz&pscd=pstk.smtp.com&sid=1-g-CjwKCAjwi-zWBhAdEiwAqlRf-G3SBMqMIwsmRCCcsMYF0VMREavKwGN2WvKO57kvyjg2bt1aKFNNrxoCxLIQAvD_BwE&utm_medium=semanticlabs&utm_campaign=partnerstack&source=partner&gspk=c2VtYW50aWNsYWJz)

#### 4.4  Redis

Redis stores short-lived authentication states such as OTP information and rate-limiting or login-flow data. Redis is not the authoritative store for health records.

[ Redis](https://redis.io/)

#### 4.5  Mapping service

The map component visualizes location grids, gorilla-related observations, and risk distributions. Because location data can be sensitive, the API must apply role-based restrictions before returning it.

[Maptiler ](https://www.maptiler.com/)

## Authentication Flow

User submits credentials
        ↓
Backend validates email and password hash
        ↓
Backend creates OTP and stores temporary state in Redis
        ↓
OTP is sent by email
        ↓
User submits OTP
        ↓
Backend validates and consumes OTP
        ↓
Backend creates access token
        ↓
Next.js stores token in HTTP-only canopy_session cookie
        ↓
Proxy forwards bearer token to FastAPI
        ↓
FastAPI loads user and applies role permissions

A request fails with `401 Unauthorized` when the token is missing, invalid, expired, malformed, or associated with a user that cannot be loaded. A valid token with an insufficient role produces `403 Forbidden`.

**For example**, the Canopy AI chat and recommendation-review operations require a gorilla-doctor role. A tracker may submit observations and complete assigned tasks but must not approve or reject a preventive recommendation.

Logout clears the HTTP-only session cookie and redirects the user to the sign-in page. Protected requests after logout must no longer carry a valid session.

## Request and Response Flow
A normal API request follows these steps:

1. The user performs an action in the frontend.
2. The frontend validates obvious input constraints such as required fields and text length.
3. The browser sends a same-origin request to the Next.js API proxy.
4. The proxy reads the HTTP-only session cookie.
5. The proxy forwards the request to FastAPI with Authorization: Bearer <token>.
6. FastAPI extracts and validates the token.
7. The router validates the request body, path variables, and query parameters using Pydantic schemas.
8. A role dependency checks whether the current user may perform the operation.
9. The router calls the domain service.
10. The service loads or writes records through repositories and calls external integrations where necessary.
11. The service returns a domain result.
12. FastAPI serializes the result using the response schema.
13. The proxy returns the backend response to the browser.
14. The frontend updates its local page state


### Request

<details>
<summary><b>Click to expand request payload</b></summary>

```json
{
  "question": "What preventive measures can reduce respiratory disease transmission?"
}
```

</details>

### Response

<details>
<summary><b>Click to expand response data</b></summary>

```json
{
  "response_id": "uuid",
  "answer": "Generated answer grounded in the configured reference store.",
  "recommendation": null,
  "sources": [
    {
      "file_id": "uuid",
      "title": "Mountain Gorilla Health Reference",
      "file_url": "provider-reference-or-url",
      "status": "active"
    }
  ]
}
```

</details>


## AI Flow
CANOPY contains multiple AI-assisted flows that must be kept conceptually separate.

### Canopy AI question-answering flow

Doctor enters question
        ↓
Frontend POSTs question through same-origin proxy
        ↓
FastAPI validates doctor role and question schema
        ↓
Preventive/Canopy AI service calls Gemini adapter
        ↓
Gemini retrieves relevant passages from File Search Store
        ↓
Gemini generates grounded answer and source metadata
        ↓
Backend validates and stores AI response
        ↓
Frontend displays answer and sources

### Prediction Flow

The prediction flow combines health observations, environmental records, geographic context, and configured reference knowledge. It stores the prediction and links the input records so that a veterinarian can understand what informed the result.

#### Preventive recommendation flow

When the AI or prediction process produces a preventive measure, the backend creates a preventive recommendation with status proposed. A doctor must review it. The doctor can add veterinary notes and choose approved or rejected.

The AI cannot:

* Approve a recommendation;
* Reject a recommendation;
* Record a veterinary diagnosis;
* Prescribe treatment; or
* Bypass role-based authorization.

#### AI feedback flow

After an answer is displayed, the doctor may submit positive or negative feedback with an optional comment. Feedback is linked to the stored response_id, not to an arbitrary frontend message identifier.

👉 [Read the full documentation here](docs/ai.md)



