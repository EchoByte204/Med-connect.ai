# MedConnect AI Backend

Production-ready REST API for MedConnect AI medical dashboard.

## Quick Start

```bash
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

## Documentation

See [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md) for complete setup instructions.

## Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL (Supabase)
- **Auth:** Supabase Auth + JWT
- **Payments:** Stripe
- **Hosting:** Railway

## API Endpoints

- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- More endpoints in [PRODUCTION_SETUP_GUIDE.md](./PRODUCTION_SETUP_GUIDE.md)

## License

MIT
