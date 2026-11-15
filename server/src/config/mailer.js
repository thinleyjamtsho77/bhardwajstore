import nodemailer from "nodemailer";

let configPromise;

async function createConfig() {
  if (process.env.SMTP_HOST) {
    const user = process.env.SMTP_USER;
    return {
      transport: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: user ? { user, pass: process.env.SMTP_PASS } : undefined,
      }),
      from: process.env.MAIL_FROM || `Bhardwaj Grocery Store <${user}>`,
      isTestInbox: false,
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("SMTP_HOST is not set");
  }
  
  // Nothing is delivered to real addresses.
  const account = await nodemailer.createTestAccount();
  console.log("Email: no SMTP_HOST set, using an Ethereal test inbox (emails are not really delivered).");
  return {
    transport: nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: { user: account.user, pass: account.pass },
    }),
    from: `Bhardwaj Grocery Store <${account.user}>`,
    isTestInbox: true,
  };
}

export async function sendMail({ to, subject, text, html }) {
  configPromise ??= createConfig();

  let config;
  try {
    config = await configPromise;
  } catch (error) {
    configPromise = undefined; // try again next time
    throw error;
  }

  const info = await config.transport.sendMail({ from: config.from, to, subject, text, html });
  return { previewUrl: config.isTestInbox ? nodemailer.getTestMessageUrl(info) || null : null };
}