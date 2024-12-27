import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'dyvontrae@gmail.com', 
      subject: 'API Key Test',
      html: '<p>This is a test email to verify API key.</p>'
    });
    res.status(200).json(data);
  } catch (error) {
    console.error('Resend test error:', error);
    res.status(400).json({ error: 'Failed to send test email' });
  }
}