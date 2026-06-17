#!/bin/bash

# ============================================================
#  BABA FOOD Loyalty System — Avvio Server
# ============================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
RESET='\033[0m'

echo ""
echo -e "${RED}${BOLD}  ██████╗  █████╗ ██████╗  █████╗ ${RESET}"
echo -e "${RED}${BOLD}  ██╔══██╗██╔══██╗██╔══██╗██╔══██╗${RESET}"
echo -e "${RED}${BOLD}  ██████╔╝███████║██████╔╝███████║${RESET}"
echo -e "${RED}${BOLD}  ██╔══██╗██╔══██║██╔══██╗██╔══██║${RESET}"
echo -e "${RED}${BOLD}  ██████╔╝██║  ██║██████╔╝██║  ██║${RESET}"
echo -e "${RED}${BOLD}  ╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚═╝  ╚═╝${RESET}"
echo -e "         ${BOLD}FOOD — Loyalty System${RESET}"
echo ""

# --- Verifica Node.js ---
if ! command -v node &> /dev/null; then
  echo -e "${RED}[ERRORE]${RESET} Node.js non trovato."
  echo "  Scaricalo da: https://nodejs.org (versione 18 o superiore)"
  exit 1
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}[OK]${RESET} Node.js trovato: ${NODE_VERSION}"

# --- Entra nella directory backend ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend"

if [ ! -d "$BACKEND_DIR" ]; then
  echo -e "${RED}[ERRORE]${RESET} Directory 'backend/' non trovata in: ${SCRIPT_DIR}"
  exit 1
fi

cd "$BACKEND_DIR"

# --- Installa dipendenze se necessario ---
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}[SETUP]${RESET} Prima installazione — scarico le dipendenze..."
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${RED}[ERRORE]${RESET} npm install fallito. Controlla la connessione internet."
    exit 1
  fi
  echo -e "${GREEN}[OK]${RESET} Dipendenze installate."
else
  echo -e "${GREEN}[OK]${RESET} Dipendenze già presenti."
fi

# --- URL utili ---
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "${BOLD}  URL DISPONIBILI${RESET}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo -e "  ${GREEN}App clienti${RESET}          →  http://localhost:3000"
echo -e "  ${GREEN}Dashboard proprietario${RESET} →  http://localhost:3000/owner/"
echo -e "  ${GREEN}Registrazione (QR)${RESET}    →  http://localhost:3000/register.html"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
echo ""
echo -e "  Per generare il QR da stampare, apri nel browser:"
echo -e "  ${YELLOW}generate-restaurant-qr.html${RESET}"
echo ""
echo -e "  Premi ${RED}Ctrl+C${RESET} per fermare il server."
echo ""

# --- Avvia il server ---
node server.js
