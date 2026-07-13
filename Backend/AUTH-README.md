# RetailMind AI — Auth Module

## EF Core Migrations

Run these commands from inside `src/RetailMind.API/`:

```bash
# Install EF Core tools (once, globally)
dotnet tool install --global dotnet-ef

# Create initial migration
dotnet ef migrations add InitialCreate --output-dir Data/Migrations

# Apply to database
dotnet ef database update
```

> The API also auto-migrates on startup in Development mode.

## API Quick Reference

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | POST | `/api/v1/auth/register` | Public | Create account |
| 2 | POST | `/api/v1/auth/login` | Public | Login → JWT |
| 3 | POST | `/api/v1/auth/refresh-token` | Public | Rotate tokens |
| 4 | POST | `/api/v1/auth/revoke-token` | Public | Logout |
| 5 | POST | `/api/v1/auth/forgot-password` | Public | Request reset link |
| 6 | POST | `/api/v1/auth/reset-password` | Public | Complete reset |
| 7 | GET  | `/api/v1/auth/me` | Bearer | My profile |
| 8 | POST | `/api/v1/auth/change-password` | Bearer | Change password |
| 9 | GET  | `/api/v1/auth/users` | Admin | All users |
| 10 | POST | `/api/v1/auth/users/assign-role` | Admin | Assign role |
| 11 | POST | `/api/v1/auth/users/remove-role` | Admin | Remove role |
| 12 | PATCH | `/api/v1/auth/users/toggle-active` | Admin | Activate/deactivate |

## Default Admin

Seeded on first startup from `appsettings.json > DefaultAdmin`:
- Email: `admin@retailmind.ai`
- Password: `Admin@123456!`

> **Change this before deploying to production!**
> Override `DefaultAdmin:Password` via environment variable or Azure Key Vault.
