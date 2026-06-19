# Frontend Integration Guide — Dynamic Roles & Navigation Menus

**Backend branch:** `feat/bug-fixes`  
**Date:** 2026-06-19

---

## What changed and why

Previously, CRM roles were a fixed TypeScript enum — the list was hardcoded and could never change without a code deploy. The system has been upgraded so that:

- The 12 existing roles (`super_admin`, `counsellor`, etc.) still exist and work **exactly the same** — no changes to how JWT auth or
  role guards work
- Roles now live in a **database table** (`crm_roles`), so admins can create custom roles
- A 3-level **navigation menu tree** (Module → Menu → Sub-menu) controls which sidebar items each role can see
- One new API call — `GET /auth/me/submenus` — gives the frontend the full nav tree for the logged-in user

---

## Changes to existing behaviour

### 1. User object — new field `crmRoleId`

The user object now has an optional `crmRoleId` field. This is the integer ID of the role in the `crm_roles` table.

**Before (unchanged):**

```json
{
  "id": "...",
  "email": "staff@example.com",
  "role": "counsellor",
  "campusId": "..."
}
```

**After (new field added):**

```json
{
  "id": "...",
  "email": "staff@example.com",
  "role": "counsellor",
  "campusId": "...",
  "crmRoleId": 5
}
```

`crmRoleId` will be `null` for users that haven't been linked to a CRM role row yet (most existing users until an admin links them). The `role` string is still the source of truth for access control — `crmRoleId` is used for the navigation tree lookup.

**Action required:** No breaking change. The JWT payload and `GET /auth/me` response still return `role` as a string. Just start reading `crmRoleId` when you need it for nav tree lookups.

---

## New feature: Dynamic navigation tree

The sidebar/navigation is now configurable by the admin. An admin can create modules, menus, and sub-menus and assign which roles can see each sub-menu.

### Structure

```
Module (e.g. "Admissions")
  └── Menu (e.g. "Applications")
        └── Sub-menu (e.g. "All Applications" → path: /applications)
        └── Sub-menu (e.g. "Pending Review"   → path: /applications?status=under_review)
  └── Menu (e.g. "Offers")
        └── Sub-menu (e.g. "All Offers"       → path: /offers)
Module (e.g. "Reports")
  └── Menu (e.g. "Analytics")
        └── Sub-menu (e.g. "Dashboard"        → path: /analytics)
```

Each sub-menu has a `path` — this is the frontend route to navigate to.

---

## API: Fetching the nav tree for the logged-in user

### `GET /api/v1/auth/me/submenus`

Requires: Bearer token (any authenticated user)

Returns the full nav tree filtered to only the sub-menus the current user's role can access.

**Response example:**

```json
[
  {
    "id": 1,
    "name": "Admissions",
    "shortName": "ADM",
    "icon": "school",
    "position": 1,
    "menus": [
      {
        "id": 1,
        "name": "Applications",
        "icon": "folder",
        "position": 1,
        "subMenus": [
          {
            "id": 1,
            "name": "All Applications",
            "path": "/applications",
            "icon": "list",
            "position": 1
          }
        ]
      }
    ]
  }
]
```

Returns `[]` if the role has no sub-menu assignments yet.

**When to call:** On login (alongside `GET /auth/me`). Store it in your app state. Do not re-fetch on every page load — it changes only when an admin updates the nav config.

---

## How to build the sidebar

```typescript
// Call once after login
const navTree = await api.get("/auth/me/submenus");

// Render:
// navTree.map(module => (
//   <ModuleSection key={module.id} icon={module.icon} title={module.name}>
//     {module.menus.map(menu => (
//       <MenuGroup key={menu.id} icon={menu.icon} title={menu.name}>
//         {menu.subMenus.map(sub => (
//           <NavLink key={sub.id} href={sub.path} icon={sub.icon}>
//             {sub.name}
//           </NavLink>
//         ))}
//       </MenuGroup>
//     ))}
//   </ModuleSection>
// ))
```

All items are sorted by `position` (ascending) — no need to sort client-side.

---

## Admin UI: Managing roles and navigation

These endpoints are for the admin settings screen. All require `super_admin` role except the read-only list endpoints which allow `admissions_director` and `campus_director` as well.

### CRM Roles

| Method   | Endpoint                | Who                                               | Description                                   |
| -------- | ----------------------- | ------------------------------------------------- | --------------------------------------------- |
| `GET`    | `/api/v1/roles`         | super_admin, admissions_director, campus_director | List all roles (12 system + any custom)       |
| `GET`    | `/api/v1/roles/:roleId` | super_admin, admissions_director, campus_director | Single role detail with sub-menu assignments  |
| `POST`   | `/api/v1/roles`         | super_admin                                       | Create a new custom role                      |
| `PATCH`  | `/api/v1/roles/:roleId` | super_admin                                       | Update description or active status           |
| `DELETE` | `/api/v1/roles/:roleId` | super_admin                                       | Delete (system roles cannot be deleted — 422) |

**Create role body:**

```json
{
  "roleName": "admission_officer",
  "description": "Handles application reviews"
}
```

**Update role body:**

```json
{
  "description": "Updated description",
  "isActive": false
}
```

**Role object:**

```json
{
  "roleId": 13,
  "roleName": "admission_officer",
  "description": "Handles application reviews",
  "isSystem": false,
  "isActive": true,
  "createdAt": "2026-06-19T..."
}
```

The 12 system roles (`isSystem: true`) cannot be deleted but their description and active status can be updated.

---

### Navigation Modules

| Method   | Endpoint                  | Who                                               | Description                                             |
| -------- | ------------------------- | ------------------------------------------------- | ------------------------------------------------------- |
| `GET`    | `/api/v1/nav/modules`     | super_admin, admissions_director, campus_director | Full tree (all modules + menus + submenus)              |
| `POST`   | `/api/v1/nav/modules`     | super_admin                                       | Create module                                           |
| `PATCH`  | `/api/v1/nav/modules/:id` | super_admin                                       | Update module                                           |
| `DELETE` | `/api/v1/nav/modules/:id` | super_admin                                       | Delete module (cascades to all its menus and sub-menus) |

**Create/update module body:**

```json
{
  "name": "Admissions",
  "shortName": "ADM",
  "icon": "school",
  "position": 1
}
```

---

### Navigation Menus

| Method   | Endpoint                              | Who         | Description                         |
| -------- | ------------------------------------- | ----------- | ----------------------------------- |
| `POST`   | `/api/v1/nav/modules/:moduleId/menus` | super_admin | Create menu inside a module         |
| `PATCH`  | `/api/v1/nav/menus/:id`               | super_admin | Update menu                         |
| `DELETE` | `/api/v1/nav/menus/:id`               | super_admin | Delete menu (cascades to sub-menus) |

**Create/update menu body:**

```json
{
  "name": "Applications",
  "icon": "folder",
  "position": 1
}
```

---

### Navigation Sub-menus

| Method   | Endpoint                             | Who         | Description                   |
| -------- | ------------------------------------ | ----------- | ----------------------------- |
| `POST`   | `/api/v1/nav/menus/:menuId/submenus` | super_admin | Create sub-menu inside a menu |
| `PATCH`  | `/api/v1/nav/submenus/:id`           | super_admin | Update sub-menu               |
| `DELETE` | `/api/v1/nav/submenus/:id`           | super_admin | Delete sub-menu               |

**Create/update sub-menu body:**

```json
{
  "name": "All Applications",
  "path": "/applications",
  "icon": "list",
  "position": 1
}
```

---

### Assigning Roles to a Sub-menu

| Method | Endpoint                         | Who         | Description                           |
| ------ | -------------------------------- | ----------- | ------------------------------------- |
| `PUT`  | `/api/v1/nav/submenus/:id/roles` | super_admin | Set which roles can see this sub-menu |

**Body — pass an array of `roleId` values:**

```json
{
  "roleIds": [1, 3, 5, 9]
}
```

This **replaces** the full set of roles for the sub-menu. To clear all access, pass `{ "roleIds": [] }`.

**Response:** The updated sub-menu with role names:

```json
{
  "id": 1,
  "name": "All Applications",
  "path": "/applications",
  "roleAssignments": [
    { "role": { "roleId": 1, "roleName": "super_admin" } },
    { "role": { "roleId": 3, "roleName": "admissions_director" } },
    { "role": { "roleId": 5, "roleName": "counsellor" } }
  ]
}
```

---

### Get nav tree for any role (admin preview)

| Method | Endpoint                   | Who                                               | Description                                    |
| ------ | -------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| `GET`  | `/api/v1/nav/tree/:roleId` | super_admin, admissions_director, campus_director | Preview the nav tree as seen by a given roleId |

Useful when building the admin "Role Permissions" screen — lets the admin preview what a role's sidebar looks like.

---

## The 12 system roles and their roleIds

These are seeded and fixed. Use these IDs when assigning roles to sub-menus.

| roleId | roleName             |
| ------ | -------------------- |
| 1      | super_admin          |
| 2      | chairman             |
| 3      | admissions_director  |
| 4      | marketing            |
| 5      | counsellor           |
| 6      | telecaller           |
| 7      | verification_team    |
| 8      | finance              |
| 9      | campus_director      |
| 10     | international_office |
| 11     | student              |
| 12     | channel_partner      |

---

## Recommended admin UI flow

The admin settings area should have two sections:

### Section 1: Roles

- List all roles with name, isSystem badge, isActive toggle
- Button: "Create role" → name + description
- For each role: click to see which sub-menus it has access to

### Section 2: Navigation Builder

- Show the full module → menu → sub-menu tree
- Per module: edit name/icon/position, delete
- Per menu: edit, delete, add sub-menus
- Per sub-menu: edit name/path/icon/position, **assign roles** (multi-select checklist of all roles)

**Suggested flow for setting up nav for a new role:**

1. `POST /roles` → create the new role, note the `roleId`
2. Admin builds the module/menu/submenu structure via the nav builder (if not already created)
3. For each sub-menu they want the role to access: `PUT /nav/submenus/:id/roles` → add the new roleId to the existing list
4. Use `GET /nav/tree/:roleId` to preview the result
5. Done — any user with that `role` string will see it immediately in `GET /auth/me/submenus`

---

## What does NOT change

- JWT structure is unchanged — `role` is still a plain string in the token
- All existing `@Roles()` guards on every API endpoint still work exactly the same
- All existing login flows (`POST /auth/login`, `POST /auth/erp-login`, `POST /auth/otp/verify`) unchanged
- `GET /auth/me` response unchanged except the new optional `crmRoleId` field
- The 12 role strings (`super_admin`, `counsellor`, etc.) are unchanged — do not rename them

---

## Swagger docs

All new endpoints are visible in Swagger under the **`roles`** tag:  
`http://localhost:3000/api/docs` → look for the `roles` section

The `GET /auth/me/submenus` endpoint is under the `auth` tag.
