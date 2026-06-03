import { EmailTemplate } from "../types/email-templates-types";

const SEED_TEMPLATES: EmailTemplate[] = [
  {
    id: "temp-001",
    name: "FEE_pending2627_AIT",
    subject: "Urgent: Fee Payment Pending for Academic Year 2026-27",
    type: "visual",
    content: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <img src="/brand/logo.png" alt="Acharya University" style="height: 50px;" />
        </div>
        <h2 style="color: #800000; font-size: 22px; font-weight: 700; margin-bottom: 16px;">Fee Payment Pending</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 12px;">Dear {{First Name}},</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 12px;">We hope this email finds you well. Our records indicate that your tuition/admissions fee for the academic year 2026-27 is currently pending.</p>
        <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 4px;">
          <strong style="color: #b45309; font-size: 14px;">Please Note:</strong>
          <p style="color: #d97706; font-size: 13px; margin: 4px 0 0 0;">The deadline to secure your seat by clearing the outstanding balance is approaching quickly.</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="#" style="background-color: #800000; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Pay Pending Fee Now</a>
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">If you have already made the payment, please ignore this email and send your transaction receipt to admissions@acharya.ac.in.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 30px 0 20px 0;" />
        <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">Acharya University CRM · Admissions Intelligence OS</p>
      </div>
    `,
    tags: ["AIT", "Fee", "Pending"],
    createdBy: "Admin",
    modifiedBy: "Admin",
    accessibleTo: "Everyone",
    createdOn: "2026-06-01T10:30:00.000Z",
    modifiedOn: "2026-06-01T11:45:00.000Z",
    status: "Published"
  },
  {
    id: "temp-002",
    name: "waiting list_FEE_pending2627",
    subject: "Important Notice: Waiting List Status and Fee Requirement",
    type: "visual",
    content: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; background-color: #ffffff;">
        <h2 style="color: #800000; font-size: 20px; font-weight: bold;">Waiting List Status Notice</h2>
        <p>Dear {{First Name}},</p>
        <p>Your application is currently on the waiting list for your selected program. To ensure you remain in contention should a seat open up, please pay the partial processing fee.</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="#" style="background-color: #0284c7; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; font-weight: bold; display: inline-block;">Complete Verification Deposit</a>
        </div>
        <p>Thank you for your interest in Acharya University.</p>
      </div>
    `,
    tags: ["Waiting List", "Fee"],
    createdBy: "Admin",
    modifiedBy: "Admin",
    accessibleTo: "Everyone",
    createdOn: "2026-05-30T09:15:00.000Z",
    modifiedOn: "2026-05-30T09:15:00.000Z",
    status: "Published"
  },
  {
    id: "temp-003",
    name: "PUC Pre arrival Guide 2627_Kolar",
    subject: "Welcome to Kolar Campus: Your Pre-Arrival Guide",
    type: "visual",
    content: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <h2 style="color: #0f172a; font-size: 22px;">PUC Pre-Arrival Guide - Kolar Campus</h2>
        <p>Dear {{First Name}} {{Last Name}},</p>
        <p>Welcome to Acharya! Ahead of your start, we have compiled an essential guide to help you transition smoothly to campus life.</p>
        <ul>
          <li>Hostel check-in guidelines</li>
          <li>Document verification schedule</li>
          <li>Orientation timetable</li>
        </ul>
        <p>See you on campus!</p>
      </div>
    `,
    tags: ["PUC", "Pre-Arrival", "Kolar"],
    createdBy: "Admin",
    modifiedBy: "Admin",
    accessibleTo: "Everyone",
    createdOn: "2026-05-30T14:22:00.000Z",
    modifiedOn: "2026-05-30T14:22:00.000Z",
    status: "Published"
  },
  {
    id: "temp-004",
    name: "PUC Pre arrival Guide 2627",
    subject: "Welcome to Acharya: Your Pre-Arrival Guide",
    type: "visual",
    content: `
      <div style="font-family: 'Plus Jakarta Sans', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <h2 style="color: #0f172a; font-size: 22px;">PUC Pre-Arrival Guide</h2>
        <p>Dear {{First Name}},</p>
        <p>Here is your general pre-arrival checklist for Acharya University main campus admissions.</p>
        <p>Keep your original documents ready for physical verification next week.</p>
      </div>
    `,
    tags: ["PUC", "Pre-Arrival"],
    createdBy: "Admin",
    modifiedBy: "Admin",
    accessibleTo: "Everyone",
    createdOn: "2026-05-29T11:00:00.000Z",
    modifiedOn: "2026-05-29T11:00:00.000Z",
    status: "Published"
  },
  {
    id: "temp-005",
    name: "Nepal 1st Emailers",
    subject: "Opportunities for Nepalese Students at Acharya University",
    type: "html",
    content: `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; }
            .header { background: #800000; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .cta { display: block; width: 200px; margin: 20px auto; background: #f59e0b; color: black; padding: 12px; text-align: center; text-decoration: none; font-weight: bold; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Acharya University Admission</h1>
          </div>
          <div class="content">
            <p>Namaste {{First Name}},</p>
            <p>Explore specialized engineering and business programs with exclusive SAARC scholarships designed specifically for Nepal applicants.</p>
            <a href="https://acharya.ac.in" class="cta">Register Interest</a>
          </div>
        </body>
      </html>
    `,
    tags: ["Nepal", "International", "Scholarship"],
    createdBy: "Ganesh G",
    modifiedBy: "Ganesh G",
    accessibleTo: "Everyone",
    createdOn: "2026-05-07T08:45:00.000Z",
    modifiedOn: "2026-05-07T08:45:00.000Z",
    status: "Published"
  }
];

const STORAGE_KEY = "acharya_email_templates";

function load(): EmailTemplate[] {
  if (typeof window === "undefined") return SEED_TEMPLATES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as EmailTemplate[];
  } catch {}
  // Seed first
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_TEMPLATES));
  } catch {}
  return SEED_TEMPLATES;
}

function save(templates: EmailTemplate[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {}
}

export function getEmailTemplates(): EmailTemplate[] {
  return load();
}

export function getEmailTemplate(id: string): EmailTemplate | undefined {
  return getEmailTemplates().find((t) => t.id === id);
}

export function saveEmailTemplate(template: EmailTemplate) {
  const templates = getEmailTemplates();
  const idx = templates.findIndex((t) => t.id === template.id);
  
  const updated = {
    ...template,
    modifiedOn: new Date().toISOString()
  };

  if (idx >= 0) {
    templates[idx] = updated;
  } else {
    templates.unshift(updated);
  }
  save(templates);
}

export function deleteEmailTemplate(id: string) {
  const templates = getEmailTemplates().filter((t) => t.id !== id);
  save(templates);
}

export function createBlankEmailTemplate(
  type: "visual" | "rich-text" | "html" | "plain-text"
): EmailTemplate {
  return {
    id: `temp-${Math.random().toString(36).slice(2, 10)}`,
    name: "Untitled Template",
    subject: "Subject goes here",
    type,
    content: "",
    tags: [],
    createdBy: "Admin",
    modifiedBy: "Admin",
    accessibleTo: "Everyone",
    createdOn: new Date().toISOString(),
    modifiedOn: new Date().toISOString(),
    status: "Draft"
  };
}
