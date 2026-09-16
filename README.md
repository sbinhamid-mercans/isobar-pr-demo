# isobar-pr-demo

Orders desk: a small Express + React + Postgres app (orders, customers, products, invoices, shipments) that exists to be reviewed by [isobar-pr](https://github.com/sbinhamid-mercans/isobar-pr). It is sized so isobar finds real conventions, a real hotspot and a real HTTP contract between `client/` and `server/`, and its pull requests show what isobar-pr reports when a change breaks them.

## Run

Node 20.19 or newer.

```sh
npm install
npm run typecheck
npm test
```

## Layout

```
shared/types.ts                 domain types shared by server and client
shared/lib/                     money, dates, pagination, validation, ids (+ tests)
server/index.ts, app.ts         Express app, five routers mounted under /api, pg pool in server/db/
server/services/                order, customer, product, invoice, shipment services (+ tests, none for invoices)
server/routes/                  one router per resource
client/services/                one fetch module per resource, plus reportsApi
client/hooks/                   use<Resource> data hooks over the client services
client/components/, pages/      React views
```

## History

`scripts/seed-history.sh` rebuilds the git history from the working tree: 34 backdated commits over about 300 days with uneven churn, so isobar ranks `server/services/invoiceService.ts` (8 commits, no test imports it) as the #1 hotspot. It wipes `.git` first, so it is safe to re-run; run it at the repository root.

## Check

`npm run check:graph [main|regression]` runs isobar 0.7.1 and asserts the fixture invariants: on `main` no security warnings, no cycles, 10 routes, invoiceService as hotspot #1 and the mined conventions as rules without exceptions; on `demo/regression` the six planted findings below.

## Pull requests

`demo/regression` plants six changes, one commit each:

1. `orders: enrich summaries with customer tier`: `summarizeOrders` crosses the cognitive limit and goes from O(n) to O(n·m) (a `find` inside the loop).
2. `reports: reuse the dashboard hook for prefetching`: a client service imports a hook, breaking the hooks → services layering.
3. `orders: search endpoint`: a new route builds its SQL by interpolating the query string (a serious security warning, so the check fails).
4. `reports: orders export`: the client calls `GET /api/orders/export`, which no route serves.
5. `invoices: round totals once`: a one-line change to the #1 hotspot, which no test imports.
6. `shipments: table-driven delivery estimates`: `estimateDelivery` drops back within every limit (the improvement).

`demo/clean` changes one label in `client/components/FilterBar.tsx`, and isobar-pr answers with a one-line comment.

The checks run through [`.github/workflows/isobar-pr.yml`](.github/workflows/isobar-pr.yml); the tool lives at https://github.com/sbinhamid-mercans/isobar-pr.
