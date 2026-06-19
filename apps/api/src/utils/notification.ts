export async function sendEmail(to: string, subject: string, html: string) {
  console.log(`\n======================================================`);
  console.log(`[EMAIL SEND SIMULATOR]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body Snippet: ${html.substring(0, 300)}...`);
  console.log(`======================================================\n`);
  return { success: true, id: 'simulated_email_id_' + Math.random().toString(36).substr(2, 9) };
}

export async function sendSMS(to: string, message: string) {
  console.log(`\n======================================================`);
  console.log(`[SMS SEND SIMULATOR]`);
  console.log(`To: ${to}`);
  console.log(`Message: ${message}`);
  console.log(`======================================================\n`);
  return { success: true, id: 'simulated_sms_id_' + Math.random().toString(36).substr(2, 9) };
}
