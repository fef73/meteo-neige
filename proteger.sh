#!/bin/sh
# Rechiffre les pages après modification des originaux dans _source/
# Usage : ./proteger.sh MOTDEPASSE   (nécessite : npm i -g staticrypt)
[ -z "$1" ] && { echo "Usage : ./proteger.sh MOTDEPASSE"; exit 1; }
staticrypt _source/*.html -p "$1" --short --remember 0 -d . \
  --template-title "Accès réservé" \
  --template-instructions "Ce site météo est réservé. Saisissez le mot de passe." \
  --template-placeholder "Mot de passe" --template-button "Entrer" \
  --template-remember "Se souvenir de moi" --template-error "Mot de passe incorrect" \
  --template-color-primary "#2b6cb0" --template-color-secondary "#0f172a"
for f in *.html; do grep -q 'name="robots"' "$f" || sed -i '0,/<head>/s//<head>\n<meta name="robots" content="noindex, nofollow">/' "$f"; done
