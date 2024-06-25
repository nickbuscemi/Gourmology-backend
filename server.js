// server.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

// nodemailer config
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
      user: "nick.buscemi13@gmail.com", // Your email
      pass: "sglawjaksktpwwrg" // Your app password
  }
});

// read email html
const welcome3 = fs.readFileSync('./emails/welcome3.html', 'utf8');


// API endpoint to collect contact form data
app.post('/api/contact', async (req, res) => {
  console.log('Received request to /api/contact'); // Log when endpoint is hit

  const { name, email, phone, eventDate, message } = req.body;

  try {
    console.log('Inserting data into Supabase');

    const { data, error } = await supabase
      .from('contact_submissions')
      .insert([{ 
        name, 
        email, 
        phone, 
        eventDate: new Date(eventDate), // Ensure the eventDate is a Date object
        message 
      }]);

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    console.log('Supabase insert successful:', data);

    // Send email to yourself
    const mailOptionsToSelf = {
      from: process.env.GMAIL_USER, // Your email
      to: process.env.GMAIL_USER,
      subject: 'New Contact Form Submission',
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nEvent Date: ${eventDate}\nMessage: ${message}`
    };

    // Send confirmation email to user
    const mailOptionsToUser = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Thank you for your submission',
      html: welcome3.replace('{(name)}', name.split(' ')[0]),
      //text: `Dear ${name},\n\n.Thank you for reaching out to us. We have received your message and will get back to you shortly\n\nBest regards,\nThe Gourmology Team`
    };

    // Send emails and log results
    try {
      console.log('Sending email to self');
      await transporter.sendMail(mailOptionsToSelf);
      console.log('Email to self sent successfully');
    } catch (error) {
      console.error('Error sending email to self:', error);
    }

    try {
      console.log('Sending confirmation email to user');
      await transporter.sendMail(mailOptionsToUser);
      console.log('Confirmation email sent to user successfully');
    } catch (error) {
      console.error('Error sending confirmation email to user:', error);
    }

    res.status(201).send('Contact information saved successfully and emails sent');
  } catch (error) {
    console.error('Error saving contact information or sending emails:', error);
    res.status(500).send('Error saving contact information or sending emails');
  }
});
  

// API endpoint for newsletter sign-ups
app.post('/api/newsletter-signup', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  try {
    const { data, error } = await supabase
      .from('newsletter_signups')
      .insert([{ email }]);

    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }

    // Send welcome email to the new subscriber
    const mailOptionsToUser = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Welcome to Our Newsletter!',
      html: welcome3.replace('{(name)}', 'Subscriber'), // Adjust as needed if you want to personalize it
    };

    try {
      await transporter.sendMail(mailOptionsToUser);
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }

    res.status(201).send('Email saved successfully and welcome email sent');
  } catch (error) {
    console.error('Error saving email or sending welcome email:', error);
    res.status(500).send('Error saving email or sending welcome email');
  }
});




// New API endpoint to get Cloudflare image URL
app.get('/api/get-cloudflare-image', async (req, res) => {
    // const apiToken = process.env.CLOUDFLARE_API_TOKEN;
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID; // Use environment variable for account ID
    const imageId = req.query.imageId;
    const variant = req.query.variant || 'public'; // Default to 'public' variant if not provided
  
    if ( !accountId || !imageId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
  
    try {
      const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1/${imageId}`, {
        /*headers: {
          'Authorization': `Bearer ${apiToken}`
        }*/
      });
  
      const data = await response.json();
  
      if (data.success) {
        const imageUrl = data.result.variants.find(v => v.includes(variant)) || data.result.variants[0];
        res.json({ imageUrl });
      } else {
        res.status(500).json({ error: 'Failed to fetch Cloudflare image details', details: data.errors });
      }
    } catch (error) {
      console.error('Error fetching Cloudflare image details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

// PORT listen
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});