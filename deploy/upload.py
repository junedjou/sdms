"""
SDMS Upload ke VPS via SCP/SFTP
================================
Script Python untuk upload file SDMS ke VPS.

Install dependency:
  pip install paramiko

Cara pakai:
  python deploy/upload.py

Edit bagian KONFIGURASI VPS di bawah sesuai server Anda.
"""

import os, sys, subprocess, time

# ============================================================
# KONFIGURASI VPS — EDIT BAGIAN INI
# ============================================================
VPS_HOST = "123.456.789.0"      # IP atau domain VPS Anda
VPS_PORT = 22                    # Port SSH (biasanya 22)
VPS_USER = "root"                # Username SSH
VPS_PASS = ""                    # Password SSH (kosongkan jika pakai key)
SSH_KEY  = ""                    # Path ke file key, contoh: C:/Users/Admin/.ssh/id_rsa
APP_DIR  = "/var/www/sdms"       # Folder di VPS
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

R='\033[91m'; G='\033[92m'; Y='\033[93m'; C='\033[96m'; W='\033[0m'; BOLD='\033[1m'
def ok(m):   print(f"  {G}✓{W} {m}")
def err(m):  print(f"  {R}✗{W} {m}"); sys.exit(1)
def info(m): print(f"  {Y}→{W} {m}")
def head(m): print(f"\n{C}{BOLD}=== {m} ==={W}")

def check_deps():
    """Cek apakah paramiko terinstall"""
    try:
        import paramiko
        ok("paramiko tersedia")
        return paramiko
    except ImportError:
        info("Menginstall paramiko...")
        subprocess.run([sys.executable, "-m", "pip", "install", "paramiko"], check=True)
        import paramiko
        ok("paramiko berhasil diinstall")
        return paramiko

def connect(paramiko):
    """Buat koneksi SSH ke VPS"""
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    connect_kwargs = {
        "hostname": VPS_HOST,
        "port": VPS_PORT,
        "username": VPS_USER,
        "timeout": 10,
    }
    
    if SSH_KEY and os.path.exists(SSH_KEY):
        connect_kwargs["key_filename"] = SSH_KEY
        info(f"Menggunakan SSH key: {SSH_KEY}")
    elif VPS_PASS:
        connect_kwargs["password"] = VPS_PASS
    else:
        err("Isi VPS_PASS atau SSH_KEY di atas!")
    
    ssh.connect(**connect_kwargs)
    ok(f"Terhubung ke {VPS_USER}@{VPS_HOST}")
    return ssh

def run_cmd(ssh, cmd, show=True):
    """Jalankan perintah di VPS"""
    stdin, stdout, stderr = ssh.exec_command(cmd)
    out = stdout.read().decode().strip()
    err_out = stderr.read().decode().strip()
    if show and out:    print(f"    {out}")
    if show and err_out: print(f"    {Y}{err_out}{W}")
    return out, err_out

def upload_dir(sftp, local_path, remote_path, excludes=None):
    """Upload folder rekursif ke VPS"""
    if excludes is None:
        excludes = ['node_modules', '.git', 'dist', '__pycache__', '*.log', '.env']
    
    # Buat folder remote jika belum ada
    try: sftp.mkdir(remote_path)
    except: pass
    
    count = 0
    for item in os.listdir(local_path):
        # Skip excluded
        skip = False
        for exc in excludes:
            if exc.startswith('*'):
                if item.endswith(exc[1:]): skip = True; break
            elif item == exc:
                skip = True; break
        if skip: continue
        
        local_item  = os.path.join(local_path, item)
        remote_item = f"{remote_path}/{item}"
        
        if os.path.isdir(local_item):
            count += upload_dir(sftp, local_item, remote_item, excludes)
        else:
            sftp.put(local_item, remote_item)
            count += 1
    return count

def main():
    print(f"\n{C}{BOLD}{'='*50}")
    print(f"  SDMS Upload ke VPS")
    print(f"  Target: {VPS_USER}@{VPS_HOST}:{APP_DIR}")
    print(f"{'='*50}{W}\n")
    
    if VPS_HOST == "123.456.789.0":
        err("Edit dulu VPS_HOST di file upload.py dengan IP VPS Anda!")
    
    # Konfirmasi
    print(f"  Akan mengupload ke: {VPS_HOST}:{APP_DIR}")
    confirm = input("  Lanjutkan? (y/n): ").strip().lower()
    if confirm != 'y': print("Dibatalkan."); return
    
    paramiko = check_deps()
    
    head("Menghubungkan ke VPS")
    ssh = connect(paramiko)
    sftp = ssh.open_sftp()
    
    head("Membuat Struktur Folder di VPS")
    run_cmd(ssh, f"mkdir -p {APP_DIR}/backend {APP_DIR}/frontend {APP_DIR}/deploy")
    ok("Folder dibuat")
    
    head("Upload Backend")
    info("Mengupload folder backend... (node_modules tidak diupload)")
    n = upload_dir(sftp, 
                   os.path.join(BASE_DIR, 'backend'),
                   f"{APP_DIR}/backend",
                   excludes=['node_modules', '.git', 'dist', '__pycache__', 'logs'])
    ok(f"{n} file backend diupload")
    
    head("Upload Frontend Source")
    info("Mengupload folder frontend... (node_modules tidak diupload)")
    n = upload_dir(sftp,
                   os.path.join(BASE_DIR, 'frontend'),
                   f"{APP_DIR}/frontend",
                   excludes=['node_modules', '.git', 'dist', '__pycache__'])
    ok(f"{n} file frontend diupload")
    
    head("Upload Script Deploy")
    for fname in ['deploy.sh', 'setup-after-upload.sh']:
        local = os.path.join(BASE_DIR, 'deploy', fname)
        if os.path.exists(local):
            sftp.put(local, f"{APP_DIR}/deploy/{fname}")
            run_cmd(ssh, f"chmod +x {APP_DIR}/deploy/{fname}", show=False)
    ok("Script deploy diupload")
    
    head("Install Dependencies di VPS")
    info("npm install backend...")
    out, _ = run_cmd(ssh, f"cd {APP_DIR}/backend && npm install --omit=dev 2>&1 | tail -3")
    ok("Dependencies backend terinstall")
    
    info("npm install frontend...")
    run_cmd(ssh, f"cd {APP_DIR}/frontend && npm install 2>&1 | tail -3")
    ok("Dependencies frontend terinstall")
    
    head("Build Frontend")
    info("npm run build... (mungkin butuh 1-2 menit)")
    run_cmd(ssh, f"cd {APP_DIR}/frontend && npm run build 2>&1 | tail -5")
    ok("Frontend berhasil di-build ke dist/")
    
    head("Seed Data Awal")
    confirm2 = input("  Isi data awal (roles, permissions, superadmin)? (y/n): ").strip().lower()
    if confirm2 == 'y':
        run_cmd(ssh, f"cd {APP_DIR}/backend && node seeds/run.js 2>&1 | grep -E 'INFO|WARN|ERROR'")
        ok("Seed selesai")
    
    head("Start Backend dengan PM2")
    run_cmd(ssh, f"pm2 start {APP_DIR}/ecosystem.config.js --env production")
    run_cmd(ssh, "pm2 save")
    ok("Backend berjalan dengan PM2")
    
    # Cek status
    out, _ = run_cmd(ssh, "pm2 list | grep sdms")
    print(f"    {out}")
    
    sftp.close()
    ssh.close()
    
    print(f"""
{G}{BOLD}{'='*50}
  UPLOAD SELESAI!
{'='*50}{W}
  Website : http://{VPS_HOST}
  Login   : superadmin / Admin@SDMS2024!
  
  PM2 commands di VPS:
    pm2 list          - lihat status
    pm2 logs sdms-backend  - lihat log
    pm2 restart sdms-backend  - restart
    pm2 stop sdms-backend     - stop
""")

if __name__ == "__main__":
    main()
