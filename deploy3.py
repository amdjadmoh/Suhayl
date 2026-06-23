import paramiko, time
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('ssh.alpha.openscaler.net', port=9041, username='root', password='amgedJISOO2004@', timeout=15)

def run(cmd, timeout=120):
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out: print(out.strip()[:1000])
    if err.strip(): print(f'E: {err.strip()[:500]}')

run('pm2 list')
print('---LOGS---')
run('pm2 logs wannaout --lines 30 --nostream 2>&1', timeout=10)
print('---TEST DIRECT---')
run('cd /app/WannaOut/server && node dist/index.js 2>&1 &  sleep 5 && curl -s http://localhost:5000/api/stats; kill %1 2>/dev/null', timeout=20)

ssh.close()
