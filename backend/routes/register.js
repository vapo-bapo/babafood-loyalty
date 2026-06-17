const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

router.post('/', (req, res) => {
  const { nome, cognome, data_nascita, email, telefono } = req.body;

  if (!nome || !cognome || !email) {
    return res.status(400).json({ success: false, error: 'nome, cognome ed email sono obbligatori' });
  }

  const existing = db.prepare('SELECT * FROM customers WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({
      success: false,
      error: 'Email già esistente',
      customer: {
        id: existing.id,
        qr_token: existing.qr_token,
        nome: existing.nome,
        cognome: existing.cognome,
        email: existing.email,
      },
      card_url: `/card.html?token=${existing.qr_token}`,
    });
  }

  const qr_token = uuidv4();

  const stmt = db.prepare(
    'INSERT INTO customers (qr_token, nome, cognome, data_nascita, email, telefono) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(qr_token, nome.trim(), cognome.trim(), data_nascita || null, email.trim().toLowerCase(), telefono || null);

  const customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(result.lastInsertRowid);

  return res.status(201).json({
    success: true,
    customer: {
      id: customer.id,
      qr_token: customer.qr_token,
      nome: customer.nome,
      cognome: customer.cognome,
      email: customer.email,
    },
    card_url: `/card.html?token=${customer.qr_token}`,
  });
});

module.exports = router;
