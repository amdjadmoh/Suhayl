import paramiko, time
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('ssh.alpha.openscaler.net', port=9041, username='root', password='amgedJISOO2004@', timeout=15)

def run_raw(cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    return stdout.read(), stderr.read()

def run_safe(cmd, timeout=120):
    out, err = run_raw(cmd, timeout)
    # Write to temp file on server to avoid encoding issues
    ssh.exec_command(f"echo '{out.decode('latin-1',errors='replace').replace(chr(39),chr(39)+chr(34)+chr(39)+chr(34)+chr(39))}' > /tmp/out.txt 2>/dev/null; true", timeout=5)
    print(out.decode('latin-1', errors='replace').strip()[:1000])
    if err:
        e = err.decode('utf-8', errors='replace').strip()
        if e: print(f'E: {e[:300]}')

# Write PM2 status to a file on server to avoid unicode
ssh.exec_command('pm2 list > /tmp/pm2_status.txt 2>&1; pm2 logs wannaout --lines 30 --nostream > /tmp/pm2_logs.txt 2>&1', timeout=10)
time.sleep(3)

# Read the files
stdout, _ = ssh.exec_command('cat /tmp/pm2_status.txt')
print("=== PM2 STATUS ===")
print(stdout.read().decode('latin-1', errors='replace'))

stdout, _ = ssh.exec_command('cat /tmp/pm2_logs.txt')
print("=== PM2 LOGS ===")
print(stdout.read().decode('latin-1', errors='replace')[-2000:])

# Test running directly
stdout, _ = ssh.exec_command('cd /app/WannaOut/server && timeout 10 node dist/index.js > /tmp/server_out.txt 2>&1 & sleep 6; curl -s http://localhost:5000/api/stats 2>/dev/null; kill %1 2>/dev/null', timeout=15)
print("=== DIRECT RUN ===")
print(stdout.read().decode('utf-8', errors='replace'))

# Also check if port 5000 is being used
stdout, _ = ssh.exec_command('ss -tlnp | grep 5000')
print("=== PORT 5000 ===")
print(stdout.read().decode())

ssh.close()
