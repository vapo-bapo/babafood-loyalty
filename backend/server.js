const express = require('express');
const cors = require('cors');
const path = require('path');
const QRCode = require('qrcode');

const db = require('./db');
const registerRouter = require('./routes/register');
const customerRouter = require('./routes/customer');
const scanRouter = require('./routes/scan');
const passesRouter = require('./routes/passes');

const smsRouter = require('./routes/sms');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/media', express.static(path.join(__dirname, '..', 'media')));

app.use('/api/register', registerRouter);
app.use('/api/sms', smsRouter);
app.use('/api/customer', customerRouter);
app.use('/api/customers', (req, res) => {
  const customers = db.prepare(`
    SELECT c.*, COUNT(v.id) as visit_count
    FROM customers c
    LEFT JOIN visits v ON v.customer_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all();
  return res.json({ customers });
});
app.use('/api/scan', scanRouter);
app.use('/api/passes', passesRouter);

app.get('/api/restaurant-qr', async (req, res) => {
  const baseUrl = req.query.base_url || `http://localhost:${PORT}`;
  const targetUrl = `${baseUrl}/register.html`;
  try {
    const qrPng = await QRCode.toBuffer(targetUrl, {
      type: 'png',
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
    res.setHeader('Content-Type', 'image/png');
    res.send(qrPng);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Errore generazione QR' });
  }
});

app.get('/owner', (req, res) => res.redirect('/owner/login.html'));
app.get('/owner/', (req, res) => res.redirect('/owner/login.html'));
app.use('/owner', express.static(path.join(__dirname, '..', 'owner-app')));
app.use('/', express.static(path.join(__dirname, '..', 'customer-app')));

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint non trovato' });
});

app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ success: false, error: 'Errore interno del server' });
});

app.listen(PORT, () => {
  console.log(`BABA FOOD Backend avviato su http://localhost:${PORT}`);
  console.log(`API disponibili su http://localhost:${PORT}/api/`);
  console.log(`Owner dashboard su http://localhost:${PORT}/owner`);
  console.log(`Customer app su http://localhost:${PORT}/`);
});
