const express = require('express');
const https = require('https');
const querystring = require('querystring');
const db = require('../db');

const router = express.Router();

function sendTwilioSms(to, body, accountSid, authToken, fromNumber) {
  return new Promise((resolve, reject) => {
    const data = querystring.stringify({ To: to, From: fromNumber, Body: body });
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const options = {
      hostname: 'api.twilio.com',
      path: `/2010-04-01/Accounts/${accountSid}/Messages.json`,
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data),
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(json);
          else reject(new Error(json.message || `HTTP ${res.statusCode}`));
        } catch { reject(new Error('Risposta non valida da Twilio')); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// POST /api/sms/broadcast
router.post('/broadcast', async (req, res) => {
  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Il messaggio non può essere vuoto.' });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return res.status(503).json({
      success: false,
      error: 'SMS non configurato. Imposta TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN e TWILIO_FROM_NUMBER nelle variabili d\'ambiente.',
    });
  }

  const customers = db.prepare(`SELECT * FROM customers WHERE telefono IS NOT NULL AND telefono != ''`).all();

  if (customers.length === 0) {
    return res.json({ success: true, sent: 0, failed: 0, total: 0, results: [] });
  }

  const results = await Promise.allSettled(
    customers.map(c => sendTwilioSms(c.telefono, message.trim(), accountSid, authToken, fromNumber))
  );

  const sent   = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  const details = customers.map((c, i) => ({
    nome: `${c.nome || ''} ${c.cognome || ''}`.trim(),
    telefono: c.telefono,
    ok: results[i].status === 'fulfilled',
    errore: results[i].status === 'rejected' ? results[i].reason?.message : null,
  }));

  res.json({ success: true, sent, failed, total: customers.length, results: details });
});

// GET /api/sms/recipients-count — quanti clienti hanno il telefono
router.get('/recipients-count', (req, res) => {
  const row = db.prepare(`SELECT COUNT(*) as count FROM customers WHERE telefono IS NOT NULL AND telefono != ''`).get();
  res.json({ count: row.count });
});

module.exports = router;
