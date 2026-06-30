interface WelcomeEmailProps {
  fullName: string;
  email: string;
  temporaryPassword: string;
}

export function welcomeEmailTemplate({
  fullName,
  email,
  temporaryPassword,
}: WelcomeEmailProps) {
  return `
    <div style="font-family:Arial,sans-serif;padding:30px;max-width:700px;margin:auto">

      <h2 style="color:#10b981">
        Welcome to STAFF United 🎉
      </h2>

      <p>Hello <strong>${fullName}</strong>,</p>

      <p>
        Your STAFF United account has been created successfully.
      </p>

      <table cellpadding="8" cellspacing="0">
        <tr>
          <td><strong>Login URL</strong></td>
          <td>http://localhost:3000/login</td>
        </tr>

        <tr>
          <td><strong>Email</strong></td>
          <td>${email}</td>
        </tr>

        <tr>
          <td><strong>Temporary Password</strong></td>
          <td>${temporaryPassword}</td>
        </tr>
      </table>

      <br/>

      <p>
        For security reasons, please log in and change your password immediately.
      </p>

      <hr/>

      <p style="color:#888;font-size:13px">
        STAFF United Platform
      </p>

    </div>
  `;
}
