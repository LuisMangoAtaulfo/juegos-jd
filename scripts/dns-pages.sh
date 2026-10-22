#!/usr/bin/env bash
# Crea los 4 registros CNAME que apuntan los subdominios de mango-ataulfo.com
# a sus proyectos de Cloudflare Pages y deja los dominios en "pending" hasta
# que la validación de Pages los verifique (~1 minuto).
#
# Requiere un token de API de Cloudflare con permiso Zone.DNS:Edit sobre la
# zona mango-ataulfo.com (el token OAuth de wrangler solo tiene zone:read):
#
#   export CF_API_TOKEN=xxxx    # Cloudflare → My Profile → API Tokens → Create
#   ./scripts/dns-pages.sh
#
set -euo pipefail

: "${CF_API_TOKEN:?Define CF_API_TOKEN con permiso Zone.DNS:Edit sobre mango-ataulfo.com}"

API="https://api.cloudflare.com/client/v4"

ZONE_ID="$(
	curl -s -H "Authorization: Bearer $CF_API_TOKEN" "$API/zones?name=mango-ataulfo.com" |
		python3 -c 'import sys, json; print(json.load(sys.stdin)["result"][0]["id"])'
)"

cname() { # $1 subdominio  $2 proyecto de Pages
	local resp
	resp="$(curl -s -X POST \
		-H "Authorization: Bearer $CF_API_TOKEN" \
		-H "Content-Type: application/json" \
		-d "{\"type\":\"CNAME\",\"name\":\"$1\",\"content\":\"$2.pages.dev\",\"ttl\":1,\"proxied\":true}" \
		"$API/zones/$ZONE_ID/dns_records")"
	python3 -c '
import sys, json
d = json.loads(sys.argv[1])
name, ok = sys.argv[2], d.get("success")
print(("  OK   " if ok else "  FALLO ") + name + ("" if ok else " " + str(d.get("errors"))))
' "$resp" "$1.mango-ataulfo.com"
}

echo "Zona: mango-ataulfo.com ($ZONE_ID)"
cname pastel jd-pastel-3d
cname tres jd-experimento-3
cname tablero jd-dashboard-z
cname casual jd-casual-intencional

echo
echo "Listo. Verifica con: wrangler pages deployment list --project-name=jd-pastel-3d"
echo "o esperando: curl -I https://pastel.mango-ataulfo.com"
