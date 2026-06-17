const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/apple/:qr_token', (req, res) => {
  const { qr_token } = req.params;

  const customer = db.prepare('SELECT * FROM customers WHERE qr_token = ?').get(qr_token);
  if (!customer) {
    return res.status(404).json({ success: false, error: 'Cliente non trovato' });
  }

  const visitRow = db.prepare('SELECT COUNT(*) as count FROM visits WHERE customer_id = ?').get(customer.id);
  const visit_count = visitRow.count;

  const passData = {
    formatVersion: 1,
    passTypeIdentifier: 'pass.com.babafood.loyalty',
    serialNumber: qr_token,
    teamIdentifier: 'YOUR_TEAM_ID',
    organizationName: 'BABA FOOD',
    description: 'BABA FOOD Loyalty Card',
    foregroundColor: 'rgb(255, 255, 255)',
    backgroundColor: 'rgb(194, 82, 4)',
    labelColor: 'rgb(255, 220, 180)',
    storeCard: {
      primaryFields: [
        {
          key: 'balance',
          label: 'VISITE',
          value: `${visit_count}/10`,
        },
      ],
      secondaryFields: [
        {
          key: 'name',
          label: 'CLIENTE',
          value: `${customer.nome} ${customer.cognome}`,
        },
      ],
      auxiliaryFields: [
        {
          key: 'reward',
          label: 'PREMIO',
          value: 'Panino GRATIS ogni 10 visite',
        },
      ],
    },
    barcode: {
      message: qr_token,
      format: 'PKBarcodeFormatQR',
      messageEncoding: 'iso-8859-1',
    },
  };

  return res.json({
    type: 'apple_wallet',
    message: 'Configura certificati Apple Developer per PKPass reali',
    pass_data: passData,
  });
});

router.get('/google/:qr_token', (req, res) => {
  const { qr_token } = req.params;

  const customer = db.prepare('SELECT * FROM customers WHERE qr_token = ?').get(qr_token);
  if (!customer) {
    return res.status(404).json({ success: false, error: 'Cliente non trovato' });
  }

  const visitRow = db.prepare('SELECT COUNT(*) as count FROM visits WHERE customer_id = ?').get(customer.id);
  const visit_count = visitRow.count;

  const passData = {
    iss: 'your-service-account@project.iam.gserviceaccount.com',
    aud: 'google',
    typ: 'savetowallet',
    payload: {
      loyaltyObjects: [
        {
          id: `YOUR_ISSUER_ID.${qr_token}`,
          classId: 'YOUR_ISSUER_ID.babafood_loyalty',
          state: 'ACTIVE',
          accountId: qr_token,
          accountName: `${customer.nome} ${customer.cognome}`,
          loyaltyPoints: {
            balance: {
              int: visit_count,
            },
            label: 'Visite',
          },
          barcode: {
            type: 'QR_CODE',
            value: qr_token,
            alternateText: qr_token.slice(0, 8).toUpperCase(),
          },
          textModulesData: [
            {
              header: 'PREMIO',
              body: 'Panino GRATIS ogni 10 visite',
            },
          ],
        },
      ],
    },
  };

  return res.json({
    type: 'google_wallet',
    message: 'Configura Google Cloud per pass reali',
    pass_data: passData,
  });
});

module.exports = router;
