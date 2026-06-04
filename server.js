const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.static(__dirname));

// Endpoint to receive contact messages
app.post('/api/contact', (req, res) => {
  const { name, email, message } = req.body;
  
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newMessage = {
    id: Date.now(),
    name,
    email,
    message,
    timestamp: new Date().toISOString()
  };

  // Save to messages.json file
  const filePath = path.join(__dirname, 'messages.json');
  let messages = [];

  try {
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      messages = JSON.parse(fileData);
    }
  } catch (error) {
    console.error('Error reading messages file:', error);
  }

  messages.push(newMessage);

  try {
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
    console.log(`[Backend] New message received from ${name} (${email})`);
    return res.status(200).json({ success: true, message: 'Message saved successfully!' });
  } catch (error) {
    console.error('Error writing messages file:', error);
    return res.status(500).json({ error: 'Failed to save message on server.' });
  }
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Portfolio server running on http://localhost:${PORT}`);
});
