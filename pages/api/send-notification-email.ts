import { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get API key from Supabase
    const { data: config } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'RESEND_API_KEY')
      .single();

    if (!config?.value) {
      throw new Error('API key not found');
    }

    const resend = new Resend(config.value);
    const { name, email, subject, message } = req.body;

    const { data, error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: 'dyvontrae@gmail.com',
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(400).json({ error });
    }

    return res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}