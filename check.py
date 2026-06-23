import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('ssh.alpha.openscaler.net', port=9041, username='root', password='amgedJISOO2004@', timeout=15)

def sh(cmd, timeout=60):
    _, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    return stdout.read().decode('latin-1', errors='replace')

# Check what's on port 9005 vs 5000
out = sh('ss -tlnp | grep -E "5000|9005"')
print(f"Ports: {out}")

# Check nginx
out = sh('which nginx && nginx -v 2>&1 || echo "no nginx"')
print(f"Nginx: {out.strip()}")

# Check if there's a proxy config
out = sh('cat /etc/nginx/sites-enabled/* 2>/dev/null || cat /etc/nginx/conf.d/* 2>/dev/null || echo "no nginx config"')
print(f"Nginx config: {out[:500]}")

# Check PM2 status
out = sh('pm2 jlist 2>/dev/null | python3 -c "import sys,json; [print(f\'{p[\"name\"]}: {p[\"pm2_env\"][\"status\"]}\') for p in json.load(sys.stdin)]" 2>/dev/null || echo "no pm2"')
print(f"PM2: {out}")

# Check the API directly
out = sh('curl -s http://localhost:5000/api/countries | head -c 100')
print(f"Direct API: {out}")

# Check if port 9005 reaches anything
out = sh('curl -s -o /dev/null -w "%{http_code}" http://localhost:9005/ 2>/dev/null || echo "no 9005"')
print(f"Port 9005: {out.strip()}")

ssh.close()
