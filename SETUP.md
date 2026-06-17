# BABA FOOD — Loyalty System: Guida al Setup

Questa guida spiega come installare, avviare e configurare il sistema di loyalty card per il ristorante BABA FOOD.

---

## 1. Requisiti

Prima di iniziare, assicurati di avere installato:

- **Node.js 18 o superiore** — scaricabile da [https://nodejs.org](https://nodejs.org)
- **Un browser moderno** (Chrome, Firefox, Safari, Edge)

Non è necessario installare database o altri software: tutto è incluso nel progetto.

---

## 2. Installazione

Apri il terminale, entra nella cartella del progetto ed esegui:

```bash
cd backend
npm install
```

Questo scarica tutte le dipendenze necessarie (operazione necessaria solo la prima volta).

---

## 3. Avvio del server

### Metodo rapido (consigliato)

Dalla cartella principale del progetto:

```bash
./start.sh
```

Lo script controlla automaticamente che Node.js sia installato, installa le dipendenze se mancano e avvia il server.

### Metodo manuale

```bash
cd backend
node server.js
```

---

## 4. URL principali

Una volta avviato il server, questi indirizzi sono disponibili nel browser:

| URL | Descrizione |
|-----|-------------|
| `http://localhost:3000` | **App clienti** — i clienti scansionano il QR e vedono la propria carta fedeltà |
| `http://localhost:3000/register.html` | **Registrazione** — pagina di iscrizione al programma fedeltà (questo è l'URL del QR da appendere al ristorante) |
| `http://localhost:3000/owner/` | **Dashboard proprietario** — gestione clienti, validazione visite, statistiche |

---

## 5. Come generare il QR da stampare

Il QR code da appendere al ristorante si genera con il file `generate-restaurant-qr.html`.

**Passi:**

1. Apri il file `generate-restaurant-qr.html` direttamente nel browser (doppio clic, nessun server necessario)
2. Nel campo URL inserisci l'indirizzo pubblico del sito una volta in produzione (es. `https://loyalty.babafood.it/register.html`)
3. Clicca **Genera QR Code**
4. Usa **Scarica PNG** per salvare l'immagine, oppure **Stampa** per stampare direttamente

Il QR generato porta i clienti alla pagina di registrazione dove possono iscriversi al programma fedeltà.

---

## 6. Sistema premi

Il programma fedeltà funziona così:

- Ogni cliente si registra la prima volta scansionando il QR
- Ad ogni visita al ristorante, il proprietario convalida la visita dalla dashboard (`/owner/`)
- **Alla 10a visita** il cliente riceve un **panino gratis**
- Il contatore riparte da zero dopo il premio

La carta fedeltà può essere aggiunta al portafoglio digitale (Apple Wallet o Google Wallet) direttamente dall'app cliente.

---

## 7. Apple Wallet (produzione)

Per abilitare l'aggiunta della carta ad Apple Wallet è necessario un **Apple Developer Account** ($99/anno).

**Passi:**

1. Accedi al portale Apple Developer: [https://developer.apple.com](https://developer.apple.com)
2. Vai in **Certificates, Identifiers & Profiles**
3. Crea un nuovo **Pass Type ID** (es. `pass.com.babafood.loyalty`)
4. Genera il certificato per il Pass Type ID e scaricalo
5. Esporta il certificato come `.pem` insieme alla chiave privata
6. Scarica il certificato **WWDR** di Apple
7. Copia i tre file `.pem` nella cartella `backend/certs/`
8. Copia il file `.env.example` in `backend/.env` e compila le variabili `APPLE_*`
9. Modifica il template `passes/apple/pass-template.json` con il tuo `teamIdentifier` e `passTypeIdentifier`

---

## 8. Google Wallet (produzione)

Per abilitare Google Wallet è necessario un **Google Cloud Project** (gratuito con limiti generosi).

**Passi:**

1. Vai su [https://pay.google.com/business/console](https://pay.google.com/business/console) e crea un account Google Pay & Wallet
2. Crea un nuovo **Issuer Account** e annota l'**Issuer ID**
3. Dal Google Cloud Console, crea un **Service Account** con il ruolo necessario
4. Scarica il file JSON delle credenziali del service account
5. Copialo in `backend/certs/google-service-account.json`
6. Copia il file `.env.example` in `backend/.env` e compila le variabili `GOOGLE_*`

---

## Note per la messa in produzione

- Sostituisci `http://localhost:3000` con il dominio pubblico reale in tutte le configurazioni
- Assicurati che il server sia sempre attivo (considera un servizio di hosting come Railway, Render o un VPS)
- Fai backup periodici del database SQLite (`backend/data/loyalty.db`)
