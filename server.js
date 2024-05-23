// server.js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(bodyParser.json());

// Initialize Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

// API endpoint to collect contact form data
app.post('/api/contact', async (req, res) => {
    const { name, email, phone, eventDate, message } = req.body;
  
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert([{ 
          name, 
          email, 
          phone, 
          eventDate: new Date(eventDate), // Ensure the eventDate is a Date object
          message 
        }]);
  
      if (error) throw error;
  
      res.status(201).send('Contact information saved successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error saving contact information');
    }
});

// API endpoint to collect newsletter sign-up data
app.post('/api/contact', async (req, res) => {
    try {
      // Log the entire request for debugging
      console.log('Request headers:', req.headers);
      console.log('Request body:', req.body);
  
      const { name, email, phone, eventDate, message } = req.body;
  
      // Convert eventDate to a Date object
      const parsedEventDate = new Date(eventDate);
      console.log('Parsed eventDate:', parsedEventDate);
  
      const { data, error } = await supabase
        .from('contact_submissions')
        .insert([{ 
          name, 
          email, 
          phone, 
          eventDate: parsedEventDate, // Use the parsed Date object
          message 
        }]);
  
      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Supabase insert error', details: error });
      }
  
      res.status(201).send('Contact information saved successfully');
    } catch (error) {
      console.error('Error saving contact information:', error);
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
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