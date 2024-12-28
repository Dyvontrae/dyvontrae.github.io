// @ts-ignore
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
// @ts-ignore
import { Resend } from 'https://esm.sh/resend@1.0.0'

serve(async (req: Request) => {
  console.log('=== START OF REQUEST ===')
  console.log('Timestamp:', new Date().toISOString())
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request')
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // Log full request details
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers))
    
    const payload = await req.json()
    console.log('Parsed payload:', JSON.stringify(payload, null, 2))

    const apiKey = Deno.env.get('RESEND_API_KEY')
    console.log('API Key length:', apiKey?.length || 0)
    
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is missing')
    }

    console.log('Initializing Resend client...')
    const resend = new Resend(apiKey)
    
    console.log('Preparing email data...')
    const emailData = {
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: 'dyvontrae@gmail.com',
      subject: `Portfolio Contact: ${payload.subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${payload.name}</p>
        <p><strong>Email:</strong> ${payload.email}</p>
        <p><strong>Subject:</strong> ${payload.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${payload.message}</p>
      `
    }
    console.log('Email data prepared:', JSON.stringify(emailData, null, 2))

    console.log('Attempting to send email...')
    const { data, error: resendError } = await resend.emails.send(emailData)

    if (resendError) {
      console.error('Resend error occurred:', resendError)
      throw resendError
    }

    console.log('Email sent successfully. Response data:', data)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        data,
        debug: {
          timestamp: new Date().toISOString(),
          apiKeyPresent: !!apiKey,
          emailData: {
            to: emailData.to,
            subject: emailData.subject
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      }
    )
  } catch (error) {
    console.error('=== ERROR DETAILS ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Error full details:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      }
    )
  } finally {
    console.log('=== END OF REQUEST ===')
  }
})