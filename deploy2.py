import paramiko, time, sys
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('ssh.alpha.openscaler.net', port=9041, username='root', password='amgedJISOO2004@', timeout=15)

def run(cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read()
    err = stderr.read()
    if out:
        try:
            print(out.decode('utf-8').strip()[:500])
        except:
            print(out.decode('latin-1', errors='replace').strip()[:500])
    if err:
        e = err.decode('utf-8', errors='replace').strip()
        if e and 'WARN' not in e and 'deprecated' not in e.lower():
            print(f'E: {e[:200]}')

# Start/restart PM2 (capture stderr to avoid ASCII art on stdout)
run('pm2 delete wannaout 2>/dev/null; echo "cleaned"')
run('cd /app/WannaOut/server && NODE_ENV=production PORT=5000 pm2 start dist/index.js --name wannaout > /dev/null 2>&1; echo "started"', timeout=30)

time.sleep(5)

# Test API
run('curl -s http://localhost:5000/api/stats')
print('---')
# Test frontend
run('curl -s -o /dev/null -w "Frontend HTTP: %{http_code}\n" http://localhost:5000/')
# PM2 status
run('pm2 jlist 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\'PM2: {d[0][\"name\"]} status={d[0][\"pm2_env\"][\"status\"]}\')" 2>/dev/null || echo "pm2 status unknown"')

ssh.close()
print('DONE')
