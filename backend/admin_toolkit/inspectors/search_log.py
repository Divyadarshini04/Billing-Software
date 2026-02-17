try:
    with open(r"c:\Users\divya\Downloads\Billing-Application-main-2\backend\debug_api.log", "r", encoding='utf-8') as f:
        content = f.read()
        if "POST /api/billing/invoices/" in content:
            print("FOUND POST REQUEST")
            # Print context around it
            index = content.find("POST /api/billing/invoices/")
            print(content[index:index+500])
        else:
            print("POST REQUEST NOT FOUND")
except Exception as e:
    print(e)
