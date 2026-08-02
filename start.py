"""
SDMS Launcher v3 - School Data Management System
=================================================
Cara pakai:
  python start.py              # Jalankan backend + frontend
  python start.py --seed       # Jalankan + isi data awal (sekali saja)
  python start.py --sample     # Jalankan + isi data contoh
  python start.py --backend    # Hanya backend saja
  python start.py --frontend   # Hanya frontend saja
  python start.py --only-seed  # Hanya jalankan seed (tanpa server)
"""

import subprocess, sys, os, time, threading, signal, socket

BASE_DIR     = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR  = os.path.join(BASE_DIR, 'backend')
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')

# ── Auto-deteksi Node.js ──────────────────────────────────────
def find_node():
    candidates = [
        r'C:\laragon\bin\nodejs\node-v22',
        r'C:\laragon\bin\nodejs\node-v20',
        r'C:\laragon\bin\nodejs\node-v18',
        r'C:\Program Files\nodejs',
        r'C:\Program Files (x86)\nodejs',
    ]
    # Cek environment PATH dulu
    import shutil
    if shutil.which('node'):
        node_dir = os.path.dirname(shutil.which('node'))
        return node_dir, shutil.which('node'), shutil.which('npm') or os.path.join(node_dir, 'npm.cmd')

    for d in candidates:
        node_exe = os.path.join(d, 'node.exe')
        npm_cmd  = os.path.join(d, 'npm.cmd')
        if os.path.exists(node_exe):
            return d, node_exe, npm_cmd
    return None, None, None

NODE_DIR, NODE_EXE, NPM_CMD = find_node()

R='\033[91m'; G='\033[92m'; Y='\033[93m'; C='\033[96m'; W='\033[0m'; BOLD='\033[1m'

def ok(msg):   print(f"  {G}✓{W} {msg}")
def err(msg):  print(f"  {R}✗{W} {msg}")
def info(msg): print(f"  {Y}→{W} {msg}")
def head(msg): print(f"\n{C}{BOLD}{msg}{W}")

def banner():
    print(f"\n{C}{BOLD}╔═══════════════════════════════════════════════╗")
    print(f"║  SDMS — School Data Management System        ║")
    print(f"║  One Login · One Data · One Dashboard        ║")
    print(f"╚═══════════════════════════════════════════════╝{W}\n")

# ── Cek Node.js ──────────────────────────────────────────────
def check_node():
    if not NODE_EXE or not os.path.exists(NODE_EXE):
        err("Node.js tidak ditemukan!")
        err("Install Node.js dari https://nodejs.org atau via Laragon")
        sys.exit(1)
    r = subprocess.run([NODE_EXE,'--version'], capture_output=True, text=True)
    ok(f"Node.js {r.stdout.strip()} — {NODE_EXE}")

# ── Cek MySQL XAMPP ──────────────────────────────────────────
def check_mysql():
    try:
        s = socket.socket(); s.settimeout(2)
        result = s.connect_ex(('127.0.0.1', 3306)); s.close()
        if result == 0:
            ok("XAMPP MySQL aktif di port 3306")
            return True
    except: pass
    err("XAMPP MySQL tidak berjalan!")
    info("Buka XAMPP Control Panel → klik Start pada MySQL")
    return False

# ── Kill proses di port ──────────────────────────────────────
def kill_port(port):
    try:
        r = subprocess.run('netstat -ano', capture_output=True, text=True, shell=True)
        for line in r.stdout.splitlines():
            if f':{port} ' in line and 'LISTENING' in line:
                pid = line.split()[-1]
                if pid.isdigit() and pid != '0':
                    subprocess.run(f'taskkill /F /PID {pid}', shell=True,
                                   capture_output=True)
                    time.sleep(0.5)
    except: pass

# ── Build env dengan node di PATH ────────────────────────────
def make_env():
    env = os.environ.copy()
    if NODE_DIR:
        env['PATH'] = NODE_DIR + os.pathsep + env.get('PATH','')
    return env

procs = []

# ── Stream output ────────────────────────────────────────────
def pipe(proc, prefix, color):
    def _run():
        for line in iter(proc.stdout.readline, b''):
            text = line.decode('utf-8','replace').rstrip()
            if text: print(f"{color}[{prefix}]{W} {text}", flush=True)
    threading.Thread(target=_run, daemon=True).start()

# ── Tunggu URL ───────────────────────────────────────────────
def wait_url(url, name, timeout=45):
    import urllib.request
    print(f"  Menunggu {name}", end='', flush=True)
    for _ in range(timeout):
        try:
            urllib.request.urlopen(url, timeout=2)
            print(f" {G}OK{W}"); return True
        except: print('.', end='', flush=True); time.sleep(1)
    print(f" {R}TIMEOUT{W}"); return False

# ── Start proses ─────────────────────────────────────────────
def start_backend():
    info("Memulai Backend (port 3000)...")
    kill_port(3000)
    time.sleep(1)
    p = subprocess.Popen(
        [NODE_EXE, 'src/server.js'],
        cwd=BACKEND_DIR, env=make_env(),
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT
    )
    procs.append(('backend', p))
    pipe(p, 'BACKEND', C)
    return p

def start_frontend():
    info("Memulai Frontend (port 5173)...")
    kill_port(5173)
    time.sleep(1)
    p = subprocess.Popen(
        [NPM_CMD, 'run', 'dev'],
        cwd=FRONTEND_DIR, env=make_env(),
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT
    )
    procs.append(('frontend', p))
    pipe(p, 'FRONTEND', G)
    return p

def run_seed():
    head("Mengisi data awal (roles, permissions, superadmin)...")
    r = subprocess.run(
        [NODE_EXE, 'seeds/run.js'],
        cwd=BACKEND_DIR, env=make_env(),
        capture_output=True, text=True
    )
    for line in r.stdout.splitlines():
        tag = line.split('] ')[-1] if '] ' in line else line
        if 'INFO' in line:    ok(tag)
        elif 'WARN' in line:  info(tag)
        elif 'ERROR' in line: err(tag)
    if r.returncode == 0: ok("Seed selesai!")
    else: err(f"Seed error: {r.stderr[:300]}")

def run_sample():
    head("Mengisi data contoh...")
    sample_script = os.path.join(BASE_DIR, 'sample_data.py')
    if not os.path.exists(sample_script):
        err("sample_data.py tidak ditemukan")
        return
    r = subprocess.run([sys.executable, sample_script], capture_output=True, text=True)
    # Tampilkan output bersih
    for line in r.stdout.splitlines():
        if '✓' in line or 'OK' in line:      print(f"  {G}{line.strip()}{W}")
        elif '✗' in line or 'Gagal' in line: print(f"  {R}{line.strip()}{W}")
        elif '→' in line or 'sudah' in line: print(f"  {Y}{line.strip()}{W}")
        elif '===' in line or '---' in line: print(f"  {C}{line.strip()}{W}")
        elif line.strip():                   print(f"  {line.strip()}")

# ── Cleanup ──────────────────────────────────────────────────
def cleanup(*_):
    print(f"\n{Y}Menghentikan semua proses...{W}")
    for _, p in procs:
        try: p.terminate()
        except: pass
    time.sleep(1)
    for _, p in procs:
        try: p.kill()
        except: pass
    print(f"{G}Semua proses dihentikan.{W}")
    sys.exit(0)

# ── MAIN ─────────────────────────────────────────────────────
def main():
    banner()
    args       = sys.argv[1:]
    do_seed    = '--seed'      in args or '-s' in args
    do_sample  = '--sample'    in args
    only_seed  = '--only-seed' in args
    only_back  = '--backend'   in args or '-b' in args
    only_front = '--frontend'  in args or '-f' in args

    signal.signal(signal.SIGINT, cleanup)

    head("Memeriksa prasyarat...")
    check_node()

    # ── Mode: hanya seed ─────────────────────────────────────
    if only_seed:
        check_mysql() or sys.exit(1)
        run_seed()
        return

    # ── Mode: hanya frontend ─────────────────────────────────
    if only_front:
        start_frontend()
        wait_url('http://localhost:5173', 'Frontend')
        _print_ready(False)
        _keep_alive()
        return

    # ── Perlu MySQL ──────────────────────────────────────────
    check_mysql() or sys.exit(1)

    # ── Jalankan backend ─────────────────────────────────────
    start_backend()
    if not wait_url('http://localhost:3000/health', 'Backend'):
        err("Backend gagal start! Cek log di atas.")
        cleanup()

    # ── Seed jika diminta ─────────────────────────────────────
    if do_seed:
        run_seed()

    # ── Sample data jika diminta ──────────────────────────────
    if do_sample:
        run_sample()

    # ── Jalankan frontend ─────────────────────────────────────
    if not only_back:
        start_frontend()
        wait_url('http://localhost:5173', 'Frontend')

    _print_ready(True)
    _keep_alive()


def _print_ready(with_frontend=True):
    print(f"""
{G}{BOLD}╔═══════════════════════════════════════════════╗
║  ✓  SDMS BERHASIL DIJALANKAN!                 ║
╠═══════════════════════════════════════════════╣
║  Backend  : http://localhost:3000/api/v1      ║
║  Frontend : http://localhost:5173             ║
╠═══════════════════════════════════════════════╣
║  Username : superadmin                        ║
║  Password : Admin@SDMS2024!                   ║
╚═══════════════════════════════════════════════╝{W}
{Y}  Buka browser: http://localhost:5173{W}
{Y}  Tekan Ctrl+C untuk menghentikan{W}
""")


def _keep_alive():
    """Jaga proses tetap hidup, restart backend jika crash."""
    while True:
        for name, p in procs:
            if name == 'backend' and p.poll() is not None:
                err("Backend berhenti! Cek log di atas.")
                print(f"{Y}Restart backend dalam 3 detik...{W}")
                time.sleep(3)
                procs.clear()
                start_backend()
                wait_url('http://localhost:3000/health', 'Backend')
        time.sleep(3)


if __name__ == '__main__':
    main()
