# STAFF United Platform V2

# Entity Relationship Diagram (ERD) V1

**Status:** Draft
**Version:** 1.0
**Last Updated:** 2026-07-21

---

# Overview

The CRM system is designed around the Project.

Business Flow:

Lead
→ Quote Intake
→ Client
→ Project
→ Quote
→ Contract
→ Invoice
→ Payment
→ Project Completion

---

# Core Entities

| Entity          | Description                                            |
| --------------- | ------------------------------------------------------ |
| Lead            | A potential customer before becoming a client.         |
| Client          | A company that works with STAFF United.                |
| Project         | One business engagement created from one Quote Intake. |
| Project Service | A service included within a project.                   |
| Quote           | Commercial quotation sent to the client.               |
| Quote Item      | Individual pricing item within a quote.                |
| Deliverable     | Scope of work for each service.                        |
| Contract        | Signed agreement between STAFF United and the client.  |
| Invoice         | Billing document issued after contract approval.       |
| Payment         | Deposit or final payment for an invoice.               |
| Project File    | Files related to the project.                          |
| Activity        | Timeline and audit history.                            |

---

# Business Relationships

Lead

1 Lead
→ 0 or 1 Client

Client

1 Client
→ Many Projects

Project

1 Project
→ Many Services

1 Project
→ Many Quotes

1 Project
→ One Active Contract

1 Project
→ Many Files

1 Project
→ Many Activities

Quote

1 Quote
→ Many Quote Items

Quote Item

1 Quote Item
→ Many Deliverables

Invoice

1 Invoice
→ Many Payments

---

# Business Rules

- One Quote Intake creates one Project.
- One Project can contain multiple services.
- A Client can have multiple Projects.
- Every Quote belongs to one Project.
- Every Contract belongs to one Project.
- Every Invoice belongs to one Project.
- Every Payment belongs to one Invoice.
- Project starts only after Deposit Payment is verified.
- Every document belongs to a Project.

---

# Current Status

Phase

✅ Business Analysis Completed

✅ Solution Design Completed

🔄 Database Design In Progress

⬜ SQL Migration

⬜ Repository Layer

⬜ API Layer

⬜ UI Development

⬜ Automation

---

# Entity Design

## Clients

Purpose

Store company information.

Primary Key

id (UUID)

Business Code

client_code

Relationships

One Client

↓

Many Projects

Fields

- id
- client_code
- company_name
- industry
- company_size
- website
- country
- timezone
- status
- notes
- created_at
- updated_at

Notes

Client stores company information only.

Contact persons will be stored in a separate table.

## Quote Intake

Purpose

Store every request submitted from the website before it becomes a Client or Project.

Relationships

One Quote Intake

↓

Zero or One Client

↓

Zero or One Project

Fields

- id
- intake_code
- source
- company_name
- contact_name
- email
- phone
- website
- requested_services
- answers_json
- status
- assigned_to
- converted_at
- created_at
- updated_at

Business Rules

- Every website submission creates one Quote Intake.
- Quote Intake is never deleted.
- Original answers are preserved.
- One Quote Intake can only be converted once.
