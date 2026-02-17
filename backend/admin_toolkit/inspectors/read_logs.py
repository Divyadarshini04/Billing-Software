with open('logs/app.log', 'r') as f:
    lines = f.readlines()
    for i, line in enumerate(lines[-300:]):
        if 'JWTAuth' in line or 'PERMISSION DIAGNOSTIC' in line:
            # Print next 5 lines
            start = i + len(lines) - 300
            for j in range(start, min(start + 8, len(lines))):
                print(lines[j].strip())
