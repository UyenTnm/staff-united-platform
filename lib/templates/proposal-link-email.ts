// lib/templates/proposal-link-email.ts

interface ProposalLinkEmailInput {
  companyName: string;
  proposalTitle: string;
  proposalUrl: string;
}

export function proposalLinkEmailTemplate({
  companyName,
  proposalTitle,
  proposalUrl,
}: ProposalLinkEmailInput) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://platform.staffunitedgroup.com";
  const logoUrl = `${baseUrl}/logo.png`;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background-color: #f8fafc; padding: 32px 24px;">

      <!-- Logo header -->
      <div style="text-align: center; margin-bottom: 24px;">
        <img
          src="${logoUrl}"
          alt="STAFF United"
          style="height: 40px; width: auto;"
        />
      </div>

      <!-- Card -->
      <div style="background-color: #ffffff; border-radius: 16px; padding: 32px 28px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">

        <p style="color: #059669; font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin: 0 0 12px 0;">
          Your Proposal
        </p>

        <h1 style="color: #0f172a; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.3;">
          ${proposalTitle}
        </h1>

        <p style="color: #475569; font-size: 14px; line-height: 1.7; margin: 0 0 24px 0;">
          Hi ${companyName},<br /><br />
          Here is the link to your proposal. You can view the details,
          select the services you'd like, and complete payment directly
          from the page — no account or login required.
        </p>

        <div style="text-align: center;">
          <a
            href="${proposalUrl}"
            style="display: inline-block; padding: 14px 32px; background: linear-gradient(90deg, #059669, #10b981); color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px;"
          >
            View Proposal →
          </a>
        </div>

        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #94a3b8; font-size: 12px; line-height: 1.6; margin: 0;">
            If the button above doesn't work, copy and paste this link
            into your browser:
          </p>
          <p style="color: #059669; font-size: 12px; word-break: break-all; margin: 6px 0 0 0;">
            ${proposalUrl}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <p style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 20px;">
        © ${new Date().getFullYear()} STAFF United. All rights reserved.
      </p>
    </div>
  `;
}
