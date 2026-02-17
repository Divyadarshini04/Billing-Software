try:
    with open(r"c:\Users\divya\Downloads\Billing-Application-main-2\backend\logs\app.log", "r") as f:
        lines = f.readlines()
        print("".join(lines[-100:]))
except Exception as e:
    print(f"Error reading app.log: {e}")

print("-" * 20)

try:
    with open(r"c:\Users\divya\Downloads\Billing-Application-main-2\backend\debug_api.log", "r", encoding='utf-8') as f:
        lines = f.readlines()
        print("".join(lines[-50:]))
except Exception as e:
    print(f"Error reading debug_api.log: {e}")
