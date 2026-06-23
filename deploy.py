import paramiko, sys
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('ssh.alpha.openscaler.net', port=9041, username='root', password='amgedJISOO2004@', timeout=15)

def run(cmd, timeout=120):
    print(f'>>> {cmd}')
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out: print(out.strip()[:800])
    if err and 'debconf' not in err and 'npm warn' not in err.lower():
        e = err.strip()
        if e: print(f'E: {e[:300]}')

# Check build outputs first
run('ls /app/WannaOut/client/dist/index.html 2>/dev/null && echo CLIENT_BUILT || echo CLIENT_NOT_BUILT')
run('ls /app/WannaOut/server/dist/index.js 2>/dev/null && echo SERVER_BUILT || echo SERVER_NOT_BUILT')

# Build client if needed (handle unicode)
run('cd /app/WannaOut/client && npx vite build 2>&1 | tail -3', timeout=180)

# Build server
run('cd /app/WannaOut/server && npx tsc 2>&1 | tail -3', timeout=60)

# Verify both built
run('[ -f /app/WannaOut/client/dist/index.html ] && echo CLIENT_OK || echo CLIENT_FAIL')
run('[ -f /app/WannaOut/server/dist/index.js ] && echo SERVER_OK || echo SERVER_FAIL')

# Restart PM2
run('pm2 delete wannaout 2>/dev/null; echo done')
run('cd /app/WannaOut/server && NODE_ENV=production PORT=5000 pm2 start dist/index.js --name wannaout', timeout=30)

# Wait and test
import time
time.sleep(5)

run('curl -s http://localhost:5000/api/stats | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\'Universities: {d.get(\"totalUniversities\",0)}, Countries: {d.get(\"countriesCount\",0)}\')" 2>/dev/null || echo API_FAIL')

run('curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:5000/')

ssh.close()
print('DONE')
