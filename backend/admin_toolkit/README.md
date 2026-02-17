# Admin Toolkit

> [!CAUTION]
> **PRODUCTION-GRADE SAFETY WARNING**
> This toolkit contains scripts that can bypass application logic and modify data directly.
> These tools are for **SUPER ADMIN** use only. Improper use can lead to catastrophic data loss.

## Overview
The `admin_toolkit` is a hardened, isolated collection of utilities for system administration, auditing, and emergency repairs. It is designed for manual execution and includes safety guards to prevent accidental damage.

## Key Features
- **Safety Decorators**: Destructive scripts require explicit `CONFIRM` input.
- **Centralized Auditing**: All executions are logged to `backend/logs/admin_audit.log`.
- **Environment Isolation**: Lives outside the main Django apps to prevent accidental auto-discovery or auto-running.

## Directory Structure
```text
admin_toolkit/
├── core.py           # Core utilities: Django setup, @admin_tool decorator, logging.
├── inspectors/       # Read-only tools for auditing and health checks.
├── operations/       # Scripts for common admin tasks (e.g., user management).
└── emergency/        # Critical, irreversible repair tools (DANGER ZONE).
```

## Safety Guidelines
1.  **Always Backup**: Ensure a fresh database backup exists before running anything in `operations/` or `emergency/`.
2.  **Verify Context**: Confirm you are connected to the correct database (e.g., production vs staging) before executing.
3.  **Check Audit Logs**: Monitor `backend/logs/admin_audit.log` for execution history.

## Usage
Run scripts using the python interpreter from the **backend root**:

### Inspector (Safe)
```powershell
python -m admin_toolkit.inspectors.check_db_state
```

### Operation (Confirmation Required)
```powershell
python -m admin_toolkit.operations.user_management
```

### Emergency (High Risk)
```powershell
python -m admin_toolkit.emergency.fix_permissions
```

## Developing New Tools
Always use the `@admin_tool` decorator from `core.py` and import `logger`:

```python
from admin_toolkit.core import admin_tool, logger

@admin_tool(name="My New Tool", destructive=True)
def main():
    logger.info("Doing something important...")
    # Your logic here
```
