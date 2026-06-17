const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/by-email', (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, error: 'Email obbligatoria' });

  const customer = db.prepare('SELECT * FROM customers WHERE email = ?').get(email.toLowerCase().trim());
  if (!customer) return res.status(404).json({ success: false, error: 'Cliente non trovato' });

  return res.json({ qr_token: customer.qr_token, nome: customer.nome, cognome: customer.cognome });
});

router.get('/:qr_token', (req, res) => {
  const { qr_token } = req.params;

  const customer = db.prepare('SELECT * FROM customers WHERE qr_token = ?').get(qr_token);
  if (!customer) {
    return res.status(404).json({ success: false, error: 'Cliente non trovato' });
  }

  const visitRow = db.prepare('SELECT COUNT(*) as count FROM visits WHERE customer_id = ?').get(customer.id);
  const visit_count = visitRow.count;

  const promotion_active = visit_count > 0 && visit_count % 10 === 0;
  const visits_to_reward = promotion_active ? 10 : 10 - (visit_count % 10);

  return res.json({
    customer: {
      id: customer.id,
      qr_token: customer.qr_token,
      nome: customer.nome,
      cognome: customer.cognome,
      email: customer.email,
      telefono: customer.telefono,
      data_nascita: customer.data_nascita,
      created_at: customer.created_at,
    },
    visit_count,
    next_reward_at: 10,
    promotion_active,
    visits_to_reward,
  });
});

router.get('/', (req, res) => {
  const customers = db.prepare(`
    SELECT c.*, COUNT(v.id) as visit_count
    FROM customers c
    LEFT JOIN visits v ON v.customer_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `).all();

  return res.json({ customers });
});

module.exports = router;
