# CRM Tables

## clients

Purpose

Store company information.

Relationships

- One Client -> Many Projects
- One Client -> Many Contacts

---

## client_contacts

Purpose

Store contact persons of a client.

Relationships

- Belongs to one Client

---

## quote_intakes

Purpose

Store all requests submitted from the website.

Relationships

- Can create one Client
- Can create one Project

---

## projects

Purpose

Store each business engagement.

Relationships

- Belongs to one Client
- Belongs to one Quote Intake
- Has many Quotes
- Has one Active Contract
- Has many Invoices
- Has many Activities

Status

- Draft
- Quoting
- Contract Pending
- Awaiting Deposit
- In Progress
- Completed
- Archived

---

## quotes

Purpose

Store quotation versions.

Relationships

- Belongs to one Project
- Has many Quote Items

Status

- Draft
- Sent
- Viewed
- Accepted
- Rejected
- Expired

Supports Version History.

### Fields

| Field        | Type      | Required | Notes                        |
| ------------ | --------- | -------- | ---------------------------- |
| id           | UUID      | ✅       | Primary Key                  |
| project_code | String    | ✅       | PRJ-2026-00001               |
| intake_id    | UUID      | ❌       | Original Quote Intake        |
| client_id    | UUID      | ✅       | Client                       |
| name         | String    | ✅       | Project Name                 |
| description  | Text      | ❌       | Internal description         |
| status       | Enum      | ✅       | Project Status               |
| priority     | Enum      | ✅       | Low / Medium / High / Urgent |
| owner_id     | UUID      | ❌       | Internal Project Owner       |
| start_date   | Date      | ❌       | Planned Start                |
| due_date     | Date      | ❌       | Planned Finish               |
| completed_at | Date      | ❌       | Completion Date              |
| created_at   | Timestamp | ✅       |                              |
| updated_at   | Timestamp | ✅       |                              |
