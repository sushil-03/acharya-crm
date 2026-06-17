# Email Campaigns — UI Integration Guide

**Date:** 2026-06-17  
**Auth:** All endpoints require `Authorization: Bearer <token>` except tracking pixels (public).

---

## Overview

Email campaigns let admissions/marketing staff send bulk emails to selected leads using existing email templates. The flow is:

```
Create Campaign (draft) → Preview Recipients → Schedule → Monitor → View Report
```

Status lifecycle:

```
draft → scheduled → running → complete
              ↘ cancelled
                          ↘ error (can be rescheduled)
```

---

## Screens to Build

1. **Campaign List** — table of all campaigns with status, stats, actions
2. **Create / Edit Campaign** — form to set name, template, recipient filter
3. **Campaign Detail / Report** — stats (sent, opened, clicked, failed) + recipient table
4. **Schedule Modal** — send now or pick a future date/time

---

## API Endpoints

### 1. List Campaigns

```
GET /api/v1/email-campaigns
```

**Query params (all optional):**

| Param      | Type   | Description                                                            |
| ---------- | ------ | ---------------------------------------------------------------------- |
| `status`   | string | `draft` / `scheduled` / `running` / `complete` / `error` / `cancelled` |
| `category` | string | Filter by category                                                     |
| `search`   | string | Search by name or category                                             |
| `page`     | number | Default: 1                                                             |
| `pageSize` | number | Default: 20                                                            |

**Response:**

```json
{
  "data": [
    {
      "id": "cmqh06x7m000110f8ie0pnjs5",
      "name": "June Admissions Campaign",
      "category": "Admissions",
      "status": "complete",
      "emailTemplateId": "uuid",
      "scheduledAt": "2026-06-17T10:00:00.000Z",
      "startedAt": "2026-06-17T10:00:01.000Z",
      "completedAt": "2026-06-17T10:02:15.000Z",
      "totalRecipients": 286,
      "sentCount": 283,
      "failedCount": 3,
      "openCount": 87,
      "clickCount": 21,
      "createdBy": "user-uuid",
      "createdAt": "2026-06-16T11:30:00.000Z",
      "updatedAt": "2026-06-17T10:02:15.000Z",
      "emailTemplate": {
        "id": "uuid",
        "name": "APT Pre-arrival Guide",
        "subject": "Welcome to Acharya, {{name}}!"
      },
      "_count": { "recipients": 286 }
    }
  ],
  "meta": { "total": 12, "page": 1, "pageSize": 20 }
}
```

**Calculated display values:**

- Delivery % = `sentCount / totalRecipients * 100`
- Open % = `openCount / sentCount * 100`
- Click % = `clickCount / sentCount * 100`

---

### 2. Create Campaign (draft)

```
POST /api/v1/email-campaigns
```

**Roles:** `super_admin`, `admissions_director`, `marketing`

**Body:**

```json
{
  "name": "June Admissions Outreach",
  "category": "Admissions",
  "emailTemplateId": "1daa338b-43fa-484a-b940-ba65410224b8",
  "recipientFilter": { "type": "all_leads" }
}
```

**`recipientFilter` options:**

| Type        | Description                           | Extra fields required              |
| ----------- | ------------------------------------- | ---------------------------------- |
| `all_leads` | All leads that have an email address  | none                               |
| `by_status` | Leads matching specific lead statuses | `"statuses": ["new", "qualified"]` |
| `by_campus` | Leads belonging to specific campuses  | `"campusIds": ["uuid1"]`           |
| `by_list`   | Leads in specific lead lists          | `"listIds": ["uuid1", "uuid2"]`    |

**Full examples:**

```json
{ "type": "all_leads" }
{ "type": "by_status", "statuses": ["new", "qualified", "nurturing"] }
{ "type": "by_campus", "campusIds": ["campus-uuid"] }
{ "type": "by_list", "listIds": ["list-uuid-1", "list-uuid-2"] }
```

**Response:** Full campaign object with `status: "draft"`

---

### 3. Get Campaign Detail

```
GET /api/v1/email-campaigns/:id
```

Returns the same fields as the list item. Use `sentCount`, `openCount`, `clickCount`, `failedCount` for the report page.

---

### 4. Update Campaign

```
PATCH /api/v1/email-campaigns/:id
```

**Only works when `status === "draft"`**. Send only fields you want to change.

```json
{
  "name": "Updated Campaign Name",
  "category": "Scholarships",
  "emailTemplateId": "new-template-uuid",
  "recipientFilter": { "type": "by_status", "statuses": ["nurturing"] }
}
```

---

### 5. Delete Campaign

```
DELETE /api/v1/email-campaigns/:id
```

Only works for `draft`, `error`, or `cancelled` campaigns.

**Response:** `{ "deleted": true }`

---

### 6. Preview Recipient Count

Call this **before scheduling** to show the user how many leads will receive the email.

```
GET /api/v1/email-campaigns/:id/preview-recipients
```

**Response:**

```json
{
  "estimatedRecipients": 142,
  "filter": { "type": "by_status", "statuses": ["new", "qualified"] }
}
```

Show this in the schedule confirmation: _"This campaign will be sent to 142 leads."_

---

### 7. Schedule Campaign

```
POST /api/v1/email-campaigns/:id/schedule
```

**To send immediately** — empty body:

```json
{}
```

**To schedule for a future time:**

```json
{
  "scheduledAt": "2026-06-18T09:00:00Z"
}
```

> **Important:** Always send dates in UTC ISO format (with `Z`). If the user picks a time using a local date picker (IST), convert to UTC before sending. Use `date.toISOString()` in JavaScript.

**Response:**

```json
{
  "scheduled": true,
  "scheduledAt": "2026-06-18T09:00:00.000Z",
  "willSendIn": "82800s"
}
```

Status changes to `"scheduled"`. At the scheduled time it automatically moves to `"running"` then `"complete"`.

---

### 8. Cancel Campaign

```
POST /api/v1/email-campaigns/:id/cancel
```

Works for `scheduled` or `draft` campaigns. Cannot cancel once `running`.

**Response:** `{ "cancelled": true }`

---

### 9. View Recipients

```
GET /api/v1/email-campaigns/:id/recipients?page=1&pageSize=50
```

**Response:**

```json
{
  "data": [
    {
      "id": "recipient-uuid",
      "campaignId": "campaign-uuid",
      "leadId": "lead-uuid",
      "email": "rahul@gmail.com",
      "status": "opened",
      "sentAt": "2026-06-17T10:00:05.000Z",
      "openedAt": "2026-06-17T10:15:22.000Z",
      "clickedAt": null,
      "failReason": null,
      "lead": {
        "id": "lead-uuid",
        "name": "Rahul Sharma",
        "mobile": "9876543210",
        "status": "qualified"
      }
    }
  ],
  "meta": { "total": 286, "page": 1, "pageSize": 50 }
}
```

**Recipient status values:**

| Status    | Meaning                               |
| --------- | ------------------------------------- |
| `pending` | Not yet sent (campaign still running) |
| `sent`    | Email delivered                       |
| `failed`  | Send failed — see `failReason` field  |
| `opened`  | Lead opened the email                 |
| `clicked` | Lead clicked a link in the email      |

---

### 10. Get Email Templates (for template picker)

```
GET /api/v1/email-templates?status=published&isActive=true
```

Use this to populate the template picker in the campaign creation form.

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "APT Pre-arrival Guide 2627",
      "subject": "Welcome to Acharya, {{name}}!",
      "category": "Admissions",
      "status": "published",
      "isActive": true
    }
  ]
}
```

---

## Screens Detail

### Screen 1 — Campaign List

Table with:

| Column         | Source field                                                                                             |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Name           | `name`                                                                                                   |
| Status         | `status` — badges: draft=gray, scheduled=blue, running=orange, complete=green, error=red, cancelled=gray |
| Scheduled Date | `scheduledAt`                                                                                            |
| Template       | `emailTemplate.name`                                                                                     |
| Recipients     | `totalRecipients`                                                                                        |
| Delivered      | `sentCount / totalRecipients * 100`%                                                                     |
| Open %         | `openCount / sentCount * 100`%                                                                           |
| Click %        | `clickCount / sentCount * 100`%                                                                          |

**Actions per row:**

| Status      | Actions                                    |
| ----------- | ------------------------------------------ |
| `draft`     | Edit, Preview recipients, Schedule, Delete |
| `scheduled` | View, Cancel                               |
| `running`   | View (read-only, auto-refresh)             |
| `complete`  | View report                                |
| `error`     | View, Reschedule, Delete                   |
| `cancelled` | View, Delete                               |

---

### Screen 2 — Create / Edit Campaign (multi-step form)

**Step 1 — Details:**

- Campaign name (required)
- Category (free text or dropdown from existing categories)
- Email template picker — call `GET /api/v1/email-templates?status=published&isActive=true`, show template name + subject preview

**Step 2 — Select recipients:**

- Radio buttons: All Leads / By Status / By Campus / By Lead List
- By Status → multi-select checkboxes: `new`, `qualified`, `assigned`, `contacted`, `nurturing`
- By Campus → campus picker (call `GET /api/v1/campuses`)
- By Lead List → list picker (call `GET /api/v1/lead-lists`)
- "Preview count" button → call `GET /api/v1/email-campaigns/:id/preview-recipients` and show _"~142 leads will receive this email"_

**Step 3 — Schedule:**

- Option A: Send immediately
- Option B: Pick date and time (show in IST, convert to UTC on submit)
- Confirmation message: _"This will be sent to X leads. This action cannot be undone."_
- On confirm → call `POST /api/v1/email-campaigns/:id/schedule`

---

### Screen 3 — Campaign Report

**Top stat cards:**

| Card        | Formula                             |
| ----------- | ----------------------------------- |
| Emails Sent | `sentCount`                         |
| Delivered % | `sentCount / totalRecipients * 100` |
| Open Rate   | `openCount / sentCount * 100`       |
| Click Rate  | `clickCount / sentCount * 100`      |
| Failed      | `failedCount`                       |

**Recipient table** (`GET /api/v1/email-campaigns/:id/recipients`):

- Allow filtering by status (sent / opened / clicked / failed)
- Columns: Lead Name, Email, Status badge, Sent At, Opened At, Clicked At, Fail Reason (if failed)

---

## Access Control

| Role                  | Create | List/View | Schedule | Cancel | View Recipients |
| --------------------- | ------ | --------- | -------- | ------ | --------------- |
| `super_admin`         | ✅     | ✅        | ✅       | ✅     | ✅              |
| `admissions_director` | ✅     | ✅        | ✅       | ✅     | ✅              |
| `marketing`           | ✅     | ✅        | ✅       | ✅     | ✅              |
| `campus_director`     | ❌     | ✅        | ❌       | ❌     | ✅              |
| `chairman`            | ❌     | ✅        | ❌       | ❌     | ❌              |
| others                | ❌     | ❌        | ❌       | ❌     | ❌              |

---

## Important Notes

1. **Dates must be UTC** — convert IST to UTC before sending to the API. Use `new Date(localDate).toISOString()` in JavaScript.

2. **Edit only when draft** — disable the edit button for any status other than `draft`.

3. **Open/click tracking is automatic** — the backend injects a tracking pixel and wraps all links in every campaign email. `openCount` and `clickCount` update automatically when recipients interact. No extra work needed from the UI side.

4. **Template picker** — only show templates with `status = "published"` and `isActive = true`. Draft templates are not ready for campaigns.

5. **Always show preview count** — call `GET /:id/preview-recipients` whenever the user changes the recipient filter, before they can proceed to scheduling.

6. **Poll during running state** — when `status === "running"`, poll `GET /api/v1/email-campaigns/:id` every 5 seconds to refresh counts. Stop polling when status changes to `complete` or `error`.

7. **Recipient filter is saved on create** — the filter set during campaign creation is stored. Changing it via PATCH updates the filter, but only affects future scheduling (not past sends).
