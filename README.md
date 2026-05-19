# Prowider Mini Lead Distribution System

A simplified lead distribution system for lead routing, mandatory assignment, fair provider allocation, real-time dashboard updates, and webhook idempotency.

## Features
- Public lead request form at `/request-service`
- Database-enforced duplicate lead rule: same phone cannot submit the same service twice
- Automatic provider assignments with mandatory providers and fair rotation
- Provider dashboard at `/dashboard` with polling-based live updates
- Test panel at `/test-tools` for webhook reset and concurrent lead generation
- PostgreSQL persistence through Prisma

## Database Design
- `Service`: service catalog
- `Provider`: provider metadata with `monthlyQuota` and `remainingQuota`
- `Lead`: customer enquiry with unique constraint on `(phone, serviceId)`
- `LeadAssignment`: provider assignments per lead
- `AllocationState`: persistent rotation state for each service pool
- `WebhookEvent`: idempotency guard for webhook resets

## Allocation Logic
- Mandatory assignments are always included if quota is available.
- Each lead gets exactly 3 providers.
- Remaining provider slots are selected from the service-specific pool using a round-robin pointer stored in `AllocationState`.
- Provider quotas decrement atomically during assignment.
- Fair state persists in the database so allocation survives restarts.

## Concurrency Handling
- Lead creation runs inside a Prisma transaction.
- `AllocationState` is locked during provider selection.
- Provider quota decrement uses conditional updates so providers cannot be assigned beyond quota even under concurrent lead creation.
- Duplicate leads are prevented by a database unique constraint.

## Webhook Idempotency
- `/api/test/webhook` accepts `eventId`.
- `WebhookEvent` stores each incoming event ID once.
- Repeated webhook calls with the same `eventId` are ignored.
- Reset logic updates provider quotas only once per unique event.

## Setup
1. Create a `.env` file from `.env.example`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your PostgreSQL connection in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/distribution"
   ```
4. Push the Prisma schema and seed data:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
5. Start the app:
   ```bash
   npm run dev
   ```

## Important Routes
- `/request-service` — submit leads
- `/dashboard` — provider dashboard with live updates
- `/test-tools` — webhook and concurrency test panel

## Notes
- The app uses database persistence only; no in-memory storage is used for lead or quota state.
- Quota reset is only available through the webhook endpoint, not through customer-facing UI.
