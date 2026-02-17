import os
import sys
import logging
import functools
from datetime import datetime

# Centralized Logging Setup
LOG_DIR = os.path.join(os.getcwd(), 'logs')
if not os.path.exists(LOG_DIR):
    os.makedirs(LOG_DIR)

LOG_FILE = os.path.join(LOG_DIR, 'admin_audit.log')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger('admin_toolkit')

def setup_django():
    """Initializes Django environment."""
    if 'DJANGO_SETTINGS_MODULE' not in os.environ:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    
    import django
    django.setup()
    logger.info("Django environment initialized successfully.")

def admin_tool(name, destructive=False, requires_confirmation=None):
    """
    Decorator for admin toolkit scripts.
    - Logs execution.
    - Handles Django setup.
    - Enforces confirmation for destructive scripts.
    """
    if requires_confirmation is None:
        requires_confirmation = destructive

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            setup_django()
            
            logger.info(f"--- STARTING ADMIN TOOL: {name} ---")
            
            if requires_confirmation:
                print("\n" + "!"*60)
                print(f"⚠️  DANGER: YOU ARE RUNNING A DESTRUCTIVE OPERATION")
                print(f"   Tool: {name}")
                print("!"*60)
                print("This operation will modify or delete production data.")
                print("Ensure you have a recent backup and understand the impact.")
                print("-" * 60)
                
                confirm = input("Type 'CONFIRM' to proceed: ").strip()
                if confirm != 'CONFIRM':
                    logger.warning(f"Execution of {name} cancelled by user.")
                    print("\n❌ Execution Cancelled.")
                    sys.exit(1)
                
                logger.info(f"User confirmed execution of {name}.")
            
            try:
                result = func(*args, **kwargs)
                logger.info(f"--- COMPLETED ADMIN TOOL: {name} ---")
                return result
            except Exception as e:
                logger.error(f"Error executing {name}: {str(e)}", exc_info=True)
                print(f"\n❌ Error: {e}")
                sys.exit(1)
        
        return wrapper
    return decorator

class DryRunManager:
    """Context manager for handling dry-run logic."""
    def __init__(self, is_dry_run=True):
        self.is_dry_run = is_dry_run

    def log(self, action, target):
        prefix = "[DRY RUN]" if self.is_dry_run else "[LIVE]"
        logger.info(f"{prefix} {action}: {target}")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        pass
