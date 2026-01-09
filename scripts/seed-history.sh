#!/usr/bin/env bash
# Rebuilds this repository's git history from the working tree: 34 backdated commits with uneven churn,
# so isobar ranks server/services/invoiceService.ts as the #1 hotspot. Re-runnable: it wipes .git first.
# Usage: scripts/seed-history.sh        (at the repository root; the working tree is the final main content)
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f package.json ] && [ -d server ] && [ -d client ] || { echo "run at the repository root" >&2; exit 2; }

SRC="$(mktemp -d)"
trap 'rm -rf "$SRC"' EXIT
rsync -a --exclude .git --exclude node_modules --exclude .codegraph ./ "$SRC"/
rm -rf .git
git init -q -b main

stamp() {  # stamp <days-ago> → ISO date at noon UTC
  date -u -v-"$1"d +%Y-%m-%dT12:00:00Z 2>/dev/null || date -u -d "$1 days ago" +%Y-%m-%dT12:00:00Z
}
commit() {  # commit <days-ago> <message…>
  local when; when="$(stamp "$1")"; shift
  git add -A
  GIT_AUTHOR_DATE="$when" GIT_COMMITTER_DATE="$when" git commit -q -m "$*"
}
full() {  # full <file>…  copy final content
  for f in "$@"; do mkdir -p "$(dirname "$f")"; cp "$SRC/$f" "$f"; done
}
version() {  # version <file> <k>  header + first k top-level `export` blocks
  mkdir -p "$(dirname "$1")"
  awk -v k="$2" '/^export / { n++ } n <= k { print }' "$SRC/$1" > "$1"
}
rm -rf server client shared .github README.md package.json package-lock.json tsconfig.json .gitignore   # scripts/ stays: it is final and this script is running from it

full package-lock.json tsconfig.json .gitignore .github/workflows/isobar-pr.yml
grep -v '"engines"' "$SRC/package.json" > package.json
mkdir -p .github/workflows
sed 's/node-version: 22/node-version: 20/' "$SRC/.github/workflows/ci.yml" > .github/workflows/ci.yml
printf '# isobar-pr-demo\n\nFixture app for isobar-pr.\n' > README.md
commit 300 "chore: scaffold orders desk"
full shared/types.ts server/index.ts server/app.ts server/db/pool.ts
commit 295 "server: bootstrap express app and pool"
version shared/lib/money.ts 1; full shared/lib/dates.ts shared/lib/pagination.ts shared/lib/validation.ts shared/lib/ids.ts
commit 290 "lib: money, dates, pagination, validation, ids"
version server/services/invoiceService.ts 1;  commit 285 "invoices: line totals"
version server/services/customerService.ts 1; commit 280 "customers: tiers"
version server/services/invoiceService.ts 2;  commit 275 "invoices: discounts"
version server/services/orderService.ts 1;    commit 270 "orders: totals"
version server/services/invoiceService.ts 3;  commit 260 "invoices: regional tax rules"
full server/services/productService.ts server/services/shipmentService.ts; commit 255 "products and shipments services"
version shared/lib/money.ts 2;                commit 250 "lib: parse money input"
version server/services/orderService.ts 2;    commit 245 "orders: summaries"
version server/services/invoiceService.ts 4;  commit 240 "invoices: cent rounding"
full server/routes/orders.ts server/routes/customers.ts; commit 235 "routes: orders and customers"
full server/services/customerService.ts;      commit 230 "customers: churn risk flag"
version server/services/invoiceService.ts 5;  commit 220 "invoices: build invoice from order"
full server/routes/products.ts server/routes/invoices.ts server/routes/shipments.ts; commit 215 "routes: products, invoices, shipments"
version client/services/ordersApi.ts 1; version client/services/productsApi.ts 1
full client/services/customersApi.ts client/services/invoicesApi.ts client/services/shipmentsApi.ts client/services/reportsApi.ts
commit 205 "client: api services"
version server/services/invoiceService.ts 6;  commit 200 "invoices: overdue status"
version server/services/orderService.ts 3;    commit 190 "orders: status transitions"
full client/hooks/useOrders.ts client/hooks/useCustomers.ts client/hooks/useProducts.ts client/hooks/useInvoices.ts client/hooks/useShipments.ts client/hooks/useDashboard.ts
commit 180 "client: data hooks"
version client/services/ordersApi.ts 2;       commit 170 "client: fetch order items"
version server/services/invoiceService.ts 7;  commit 160 "invoices: formatting"
full client/components/OrderTable.tsx client/components/CustomerCard.tsx client/components/ProductList.tsx client/components/InvoiceSummary.tsx client/components/ShipmentStatus.tsx client/components/FilterBar.tsx
commit 150 "client: components"
full client/services/productsApi.ts;          commit 140 "client: product search"
full client/pages/OrdersPage.tsx client/pages/DashboardPage.tsx; commit 130 "client: pages"
full shared/lib/money.ts;                     commit 120 "lib: sum cents"
full server/services/invoiceService.ts;       commit 110 "invoices: period summaries"
full server/services/orderService.ts;         commit 100 "orders: refunds"
full client/services/ordersApi.ts;            commit 90 "client: create orders"
full server/services/orderService.test.ts server/services/customerService.test.ts server/services/productService.test.ts server/services/shipmentService.test.ts
commit 80 "test: services"
full shared/lib/money.test.ts shared/lib/pagination.test.ts; commit 70 "test: money and pagination"
full README.md;                               commit 50 "docs: how to run and re-seed"
full .github/workflows/ci.yml;                commit 10 "ci: node 22"
full package.json;                            commit 0 "chore: pin engines"
git status --short | grep -q . && { echo "working tree differs from the seeded tree" >&2; exit 1; }
echo "seeded $(git rev-list --count HEAD) commits on main"
