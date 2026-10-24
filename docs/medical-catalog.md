# Medical catalog

Route: `/apps/medical-catalog`. Navigation: Danh mục > Bệnh & thuốc.

Uses the existing Next.js/MUI interface and SQL Server connection. Each condition
has its own medication names and descriptions. The same medication name can be
entered under multiple conditions. Editing a description affects only that condition.

## Database

Run `node scripts/deploy-medical-catalog.js` from the project root. It loads the
same development environment files as Next.js (or production with
`NODE_ENV=production`), requires DB_SERVER/DB_DATABASE/DB_USER/DB_PASSWORD,
and applies `src/lib/migrations/003_add_medical_catalog.sql`.

The migration is transactional and rerunnable. It creates only:
- `dbo.MedicalConditions`: Id, Name, CreatedAt, UpdatedAt.
- `dbo.ConditionMedications`: Id, ConditionId, Name, Description, CreatedAt, UpdatedAt.

Condition names are unique; medication names are unique within a condition.
Deleting a condition cascades to its medications after UI confirmation.
No example medical content is seeded.

## API

All endpoints use the application's existing `auth_token` session format.
The catalog inherits its trust model; it does not introduce a new auth system.
Mutating requests reject a mismatched Origin header. SQL uses bound parameters.
Responses follow `{ success: true, data }` or `{ success: false, error }`.

| Method | Endpoint | Body |
| --- | --- | --- |
| GET | /api/medical-conditions | Returns conditions with nested medications |
| POST | /api/medical-conditions | name |
| PUT | /api/medical-conditions/:id | name |
| DELETE | /api/medical-conditions/:id | None |
| POST | /api/medical-conditions/:id/medications | name, description |
| PUT | /api/medical-conditions/:id/medications/:medicationId | name, description |
| DELETE | /api/medical-conditions/:id/medications/:medicationId | None |

Names are trimmed, required, maximum 200 characters. Descriptions are trimmed,
required, maximum 2000 characters. Invalid input returns 400, missing session 401,
wrong origin 403, missing record 404, duplicate or removed parent 409.
Successful creation returns 201. GET disables caching.
Search runs in the browser across the loaded catalog, ignoring case and Vietnamese
accents; searching a drug shows every matching medication grouped by condition,
regardless of the previously selected condition. The default view is all conditions.
Selecting a condition opens its details and clears the search. Clearing search alone
returns to the previous condition selection; choosing "Tat ca benh" resets it.

## Verification

`node scripts/test-medical-catalog-search.cjs` checks global search and condition
selection with browser-only fixtures, without writing database records. It uses
the same Playwright and local URL environment variables as the smoke test below.

`node node_modules/typescript/bin/tsc --noEmit --incremental false`

`node scripts/smoke-medical-catalog.cjs` requires Playwright, a running local dev
server, and the migrated database. Set `CATALOG_PLAYWRIGHT_MODULE` to an existing
Playwright installation when it is not installed in this repo, and
`CATALOG_TEST_URL` if using a port other than 3000.

The smoke test uses a local session fixture matching the current auth implementation.
It creates uniquely named QA records, checks API validation, duplicates,
parent scoping, UI CRUD, search, persistence and responsive widths, then removes
only its own records. Desktop/mobile screenshots are written to the OS temp folder.
