// lib/templates/payment-confirmed-email.ts

interface PaymentConfirmedEmailInput {
  companyName: string;
  proposalTitle: string;
  amount: string;
  quoteNumber: string;
  paidDate: string;
  paymentMethod: string;
  hasBillingInfo: boolean;
  paymentLabel?: string;

  // Pricing breakdown
  originalTotal: number;
  serviceDiscountTotal: number;
  packageDiscountTotal: number;
  finalAmount: number;
  currencySymbol: string;
}

export function paymentConfirmedEmailTemplate({
  companyName,
  proposalTitle,
  amount,
  quoteNumber,
  paidDate,
  paymentMethod,
  hasBillingInfo,
  paymentLabel,

  originalTotal,
  serviceDiscountTotal,
  packageDiscountTotal,
  finalAmount,
  currencySymbol,
}: PaymentConfirmedEmailInput) {
  const heading = paymentLabel || "Payment Received";

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://platform.staffunitedgroup.com";

  const logoUrl = `${baseUrl}/logo.png`;

  const formatMoney = (value: number) =>
    `${currencySymbol}${Math.round(value).toLocaleString()}`;

  /*
   * Pricing rows
   *
   * We only show discount rows when there is actually
   * a discount.
   */

  const serviceDiscountRow =
    serviceDiscountTotal > 0
      ? `
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: #64748b;">
            Service Discount
          </td>
          <td style="padding: 10px 0; font-size: 13px; color: #dc2626; font-weight: 600; text-align: right;">
            -${formatMoney(serviceDiscountTotal)}
          </td>
        </tr>
      `
      : "";

  const packageDiscountRow =
    packageDiscountTotal > 0
      ? `
        <tr>
          <td style="padding: 10px 0; font-size: 13px; color: #64748b; border-top: 1px solid #f1f5f9;">
            Package Discount
          </td>
          <td style="padding: 10px 0; font-size: 13px; color: #dc2626; font-weight: 600; text-align: right; border-top: 1px solid #f1f5f9;">
            -${formatMoney(packageDiscountTotal)}
          </td>
        </tr>
      `
      : "";

  return `
  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    style="
      background-color: #f8fafc;
      padding: 32px 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    "
  >
    <tr>
      <td align="center">

        <table
          role="presentation"
          width="480"
          cellpadding="0"
          cellspacing="0"
        >

          <!-- ================================================= -->
          <!-- LOGO -->
          <!-- ================================================= -->

          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <img
                src="${logoUrl}"
                alt="STAFF United"
                width="140"
                style="display: block; height: auto;"
              />
            </td>
          </tr>

          <!-- ================================================= -->
          <!-- CARD -->
          <!-- ================================================= -->

          <tr>
            <td
              style="
                background-color: #ffffff;
                border-radius: 16px;
                padding: 36px 32px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.06);
              "
            >

              <!-- Checkmark -->

              <table
                role="presentation"
                cellpadding="0"
                cellspacing="0"
                style="margin: 0 auto 20px auto;"
              >
                <tr>
                  <td
                    width="56"
                    height="56"
                    align="center"
                    valign="middle"
                    style="
                      background-color: #d1fae5;
                      border-radius: 28px;
                      font-size: 26px;
                      color: #059669;
                      font-weight: bold;
                      line-height: 56px;
                    "
                  >
                    &#10003;
                  </td>
                </tr>
              </table>

              <!-- Heading -->

              <h1
                style="
                  color: #0f172a;
                  font-size: 20px;
                  font-weight: 700;
                  margin: 0 0 4px 0;
                  text-align: center;
                "
              >
                Payment Received
              </h1>

              <p
                style="
                  color: #94a3b8;
                  font-size: 12px;
                  margin: 0 0 28px 0;
                  text-align: center;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                "
              >
                Receipt confirmation
              </p>

              <!-- ================================================= -->
              <!-- RECEIPT INFORMATION -->
              <!-- ================================================= -->

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  border-top: 1px solid #e2e8f0;
                  border-bottom: 1px solid #e2e8f0;
                "
              >

                <tr>
                  <td
                    style="
                      padding: 12px 0;
                      font-size: 13px;
                      color: #64748b;
                    "
                  >
                    Receipt No.
                  </td>

                  <td
                    style="
                      padding: 12px 0;
                      font-size: 13px;
                      color: #0f172a;
                      font-weight: 600;
                      text-align: right;
                    "
                  >
                    ${quoteNumber}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 12px 0;
                      font-size: 13px;
                      color: #64748b;
                      border-top: 1px solid #f1f5f9;
                    "
                  >
                    Bill To
                  </td>

                  <td
                    style="
                      padding: 12px 0;
                      font-size: 13px;
                      color: #0f172a;
                      font-weight: 600;
                      text-align: right;
                      border-top: 1px solid #f1f5f9;
                    "
                  >
                    ${companyName}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 12px 0;
                      font-size: 13px;
                      color: #64748b;
                      border-top: 1px solid #f1f5f9;
                    "
                  >
                    Description
                  </td>

                  <td
                    style="
                      padding: 12px 0;
                      font-size: 13px;
                      color: #0f172a;
                      font-weight: 600;
                      text-align: right;
                      border-top: 1px solid #f1f5f9;
                    "
                  >
                    ${proposalTitle}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 12px 0;
                      font-size: 13px;
                      color: #64748b;
                      border-top: 1px solid #f1f5f9;
                    "
                  >
                    Payment Method
                  </td>

                  <td
                    style="
                      padding: 12px 0;
                      font-size: 13px;
                      color: #0f172a;
                      font-weight: 600;
                      text-align: right;
                      border-top: 1px solid #f1f5f9;
                    "
                  >
                    ${paymentMethod}
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding: 12px 0;
                      font-size: 13px;
                      color: #64748b;
                      border-top: 1px solid #f1f5f9;
                    "
                  >
                    Date Paid
                  </td>

                  <td
                    style="
                      padding: 12px 0;
                      font-size: 13px;
                      color: #0f172a;
                      font-weight: 600;
                      text-align: right;
                      border-top: 1px solid #f1f5f9;
                    "
                  >
                    ${paidDate}
                  </td>
                </tr>

              </table>

              <!-- ================================================= -->
              <!-- PRICING BREAKDOWN -->
              <!-- ================================================= -->

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="
                  margin-top: 22px;
                  border-top: 1px solid #e2e8f0;
                  border-bottom: 1px solid #e2e8f0;
                "
              >

                <!-- Original Total -->

                <tr>
                  <td
                    style="
                      padding: 12px 0;
                      font-size: 13px;
                      color: #64748b;
                    "
                  >
                    Original Total
                  </td>

                  <td
                    style="
                      padding: 12px 0;
                      font-size: 13px;
                      color: #64748b;
                      font-weight: 600;
                      text-align: right;
                      text-decoration: line-through;
                    "
                  >
                    ${formatMoney(originalTotal)}
                  </td>
                </tr>

                ${serviceDiscountRow}

                ${packageDiscountRow}

                <!-- Final Amount -->

                <tr>
                  <td
                    style="
                      padding: 14px 0;
                      font-size: 14px;
                      color: #0f172a;
                      font-weight: 700;
                      border-top: 1px solid #e2e8f0;
                    "
                  >
                    Total Amount
                  </td>

                  <td
                    style="
                      padding: 14px 0;
                      font-size: 16px;
                      color: #0f172a;
                      font-weight: 700;
                      text-align: right;
                      border-top: 1px solid #e2e8f0;
                    "
                  >
                    ${formatMoney(finalAmount)}
                  </td>
                </tr>

              </table>

              <!-- ================================================= -->
              <!-- PAYMENT RECEIVED -->
              <!-- ================================================= -->

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="margin-top: 18px;"
              >
                <tr>

                  <td
                    style="
                      font-size: 14px;
                      color: #0f172a;
                      font-weight: 700;
                    "
                  >
                    Total Paid
                  </td>

                  <td
                    style="
                      font-size: 22px;
                      color: #059669;
                      font-weight: 700;
                      text-align: right;
                    "
                  >
                    ${amount}
                  </td>

                </tr>
              </table>

              <!-- ================================================= -->
              <!-- INVOICE NOTE -->
              <!-- ================================================= -->

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                style="margin-top: 24px;"
              >
                <tr>
                  <td
                    style="
                      background-color: #f8fafc;
                      border-radius: 10px;
                      padding: 14px;
                      font-size: 12px;
                      color: #64748b;
                      line-height: 1.6;
                    "
                  >
                    ${
                      hasBillingInfo
                        ? "Your official VAT invoice will be issued and sent to you separately based on the billing details you provided."
                        : "If you need an official VAT invoice for this payment, please reply to this email with your billing details."
                    }
                  </td>
                </tr>
              </table>

              <!-- PDF note -->

              <p
                style="
                  color: #94a3b8;
                  font-size: 11px;
                  margin: 20px 0 0 0;
                  text-align: center;
                "
              >
                A PDF copy of this receipt is attached to this email.
              </p>

            </td>
          </tr>

          <!-- ================================================= -->
          <!-- FOOTER -->
          <!-- ================================================= -->

          <tr>
            <td
              align="center"
              style="padding-top: 20px;"
            >
              <p
                style="
                  color: #94a3b8;
                  font-size: 11px;
                  margin: 0;
                "
              >
                © ${new Date().getFullYear()}
                STAFF United. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
  `;
}
