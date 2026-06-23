import paramiko, time
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('ssh.alpha.openscaler.net', port=9041, username='root', password='amgedJISOO2004@', timeout=15)

def sh(cmd, timeout=30):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('latin-1', errors='replace'), stderr.read().decode('latin-1', errors='replace')

# Write PM2 output to temp files
sh('pm2 list > /tmp/p1.txt 2>&1; pm2 logs wannaout --lines 30 --nostream > /tmp/p2.txt 2>&1', timeout=10)
time.sleep(2)

print("=== PM2 STATUS ===")
out, _ = sh('cat /tmp/p1.txt')
print(out)

print("=== PM2 LOGS (last 30) ===")
out, _ = sh('cat /tmp/p2.txt')
print(out[-2000:])

print("=== TEST SERVER DIRECTLY ===")
# Kill existing pm2 first
sh('pm2 delete wannaout 2>/dev/null; true')
# Run server directly in background, capture output
sh('cd /app/WannaOut/server && NODE_ENV=production PORT=5000 node dist/index.js > /tmp/srv.txt 2>&1 &', timeout=5)
time.sleep(6)
out, _ = sh('cat /tmp/srv.txt')
print(out[-1000:])
# Test API
out, _ = sh('curl -s --max-time 5 http://localhost:5000/api/stats')
print(f"API Response: {out[:200]}")
# Test frontend
out, _ = sh('curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:5000/')
print(f"Frontend HTTP: {out}")

# Cleanup
sh('kill %1 2>/dev/null; true')

ssh.close()
