export const EDITOR_ID = "rich-text-editor";

export const MERGE_FIELDS = [
  { label: "First Name", key: "FirstName" },
  { label: "Last Name", key: "LastName" },
  { label: "Course Name", key: "CourseName" },
  { label: "Application ID", key: "ApplicationID" },
  { label: "Parent Name", key: "ParentName" },
  { label: "Parent Number", key: "ParentNumber" },
  { label: "Campus Name", key: "CampusName" },
  { label: "Counsellor Name", key: "CounsellorName" },
  { label: "Fee Amount", key: "FeeAmount" },
  { label: "Scholarship Percentage", key: "ScholarshipPercentage" },
];

export const DEFAULT_VISIBLE_FIELDS = 2;

export const DEFAULT_SUBJECT =
  "Congratulations! Scholarship Offered for your B.Tech CSE Admission";

export const DEFAULT_CONTENT = `<h2>Dear {{FirstName}} {{LastName}},</h2>
<p>Congratulations! We are pleased to inform you that you have been approved for a merit-based scholarship for the upcoming session.</p>
<p>Here are the details of your award:</p>
<table style="border-collapse: collapse; width: 100%; border: 1px solid #ccc;" border="1">
<tbody>
<tr>
<td style="width: 50%; padding: 8px;"><strong>Scholarship Bracket</strong></td>
<td style="width: 50%; padding: 8px;">Merit Excellence Category A</td>
</tr>
<tr>
<td style="width: 50%; padding: 8px;"><strong>Tuition Fee Waiver</strong></td>
<td style="width: 50%; padding: 8px;">25% per semester</td>
</tr>
<tr>
<td style="width: 50%; padding: 8px;"><strong>Assigned Counsellor</strong></td>
<td style="width: 50%; padding: 8px;">Priya (9876543210)</td>
</tr>
</tbody>
</table>
<p>&nbsp;</p>
<p>To accept this scholarship offer, submit your registration fee on our portal. Your application ID is <strong>{{ApplicationID}}</strong>.</p>
<p>If you have any questions, reply to this email or contact us.</p>
<p>Best Regards,<br /><strong>Acharya Admissions Board</strong></p>`;
