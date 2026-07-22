interface ProposalEmailTemplateProps {
  contactName: string;
  companyName: string;
  proposalUrl: string;
}

export function proposalEmailTemplate({
  contactName,
  companyName,
  proposalUrl,
}: ProposalEmailTemplateProps) {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
</head>

<body
  style="
    margin:0;
    padding:0;
    background:#F4F7FB;
    font-family:Arial,sans-serif;
  "
>

<table
  width="100%"
  cellpadding="0"
  cellspacing="0"
  style="padding:40px 0;"
>

<tr>

<td align="center">

<table
width="620"
cellpadding="0"
cellspacing="0"
style="
background:#fff;
border-radius:18px;
overflow:hidden;
">

<tr>

<td
style="
background:#0A1B33;
padding:35px;
color:white;
text-align:center;
">

<h1 style="margin:0;">
STAFF United
</h1>

<p style="margin-top:10px;color:#D8E8FF;">
Your Proposal is Ready
</p>

</td>

</tr>

<tr>

<td style="padding:40px;">

<p>

Hi <strong>${contactName}</strong>,

</p>

<p>

Thank you for taking the time to speak with our team.

</p>

<p>

Your proposal for
<strong>${companyName}</strong>
is now ready for review.

</p>

<p>

Please click the button below to securely access your proposal.

</p>

<p style="text-align:center;margin:40px 0;">

<a
href="${proposalUrl}"
style="
background:#2563EB;
padding:16px 34px;
border-radius:999px;
color:white;
text-decoration:none;
font-weight:bold;
display:inline-block;
">

View Proposal

</a>

</p>

<p>

Inside your proposal you can:

</p>

<ul>

<li>Review your services</li>

<li>See pricing</li>

<li>Request changes</li>

<li>Accept your proposal</li>

</ul>

<p>

If you have any questions, simply reply to this email.

</p>

<p>

Thank you,

<br />

<strong>STAFF United</strong>

</p>

</td>

</tr>

</table>

</td>

</tr>

</table>

</body>

</html>
`;
}
