const express = require('express');
const db = require('../db');

const router = express.Router();

router.post('/:qr_token', (req, res) => {
  const { qr_token } = req.params;
  const { note } = req.body || {};

  const customer = db.prepare('SELECT * FROM customers WHERE qr_token = ?').get(qr_token);
  if (!customer) {
    return res.status(404).json({ success: false, error: 'Cliente non trovato' });
  }

  db.prepare('INSERT INTO visits (customer_id, note) VALUES (?, ?)').run(customer.id, note || null);

  const visitRow = db.prepare('SELECT COUNT(*) as count FROM visits WHERE customer_id = ?').get(customer.id);
  const visit_count = visitRow.count;

  const promotion_triggered = visit_count > 0 && visit_count % 10 === 0;
  const message = promotion_triggered
    ? `🎉 ${visit_count}a visita! Panino GRATIS!`
    : `Visita registrata! (${visit_count}/10 per il premio)`;

  return res.json({
    success: true,
    customer: {
      id: customer.id,
      qr_token: customer.qr_token,
      nome: customer.nome,
      cognome: customer.cognome,
      email: customer.email,
    },
    visit_count,
    promotion_triggered,
    message,
  });
});

module.exports = router;
