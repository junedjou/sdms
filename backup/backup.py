"""
SDMS Database Backup Manager
==============================
Backup otomatis database sdms_master dari XAMPP/MariaDB lokal.

Cara pakai:
  python backup/backup.py              # Backup sekarang
  python backup/backup.py --restore    # Restore dari file backup
  python backup/backup.py --list       # Lihat daftar backup
  python backup/backup.py --auto       # Jalankan backup otomatis (tiap hari)
  python backup/backup.py --clean      # Hapus backup lama (>30 hari)
"""

import os, sys, subprocess, time, glob, shutil, json
from datetime import datetime, timedelta
from pathlib import Path

# ============================================================
# KONFIGURASI — Sesuaikan jika berbeda
# ============================================================
XAMPP_DIR    = r"C:\xampp"                  # Lokasi XAMPP
MYSQL_HOST   = "127.0.0.1"
MYSQL_PORT   = "3306"
MYSQL_USER   = "root"
MYSQL_PASS   = ""                           # Kosong = XAMPP default
DB_NAME      = "sdms_master"
BACKUP_DIR   = os.path.join(os.path.dirname(os.path.abspath(__file__)), "files")
KEEP_DAYS    = 30                           # Simpan backup selama 30 hari
MAX_BACKUPS  = 50                           # Maksimal file backup disimpan
# ============================================================

# Path mysqldump di XAMPP
MYSQLDUMP = os.path.join(XAMPP_DIR, "mysql", "bin", "mysqldump.exe")
MYSQL_BIN = os.path.join(XAMPP_DIR, "mysql", "bin", "mysql.exe")R='\033[91m'; G='\033[92m'; Y='\033[93m'; C='\033[96m'; W='\033[0m'; BOLD='\033[1m'
def ok(m):    print(f"  {G}✓{W} {m}")
def err(m):   print(f"  {R}✗{W} {m}")
def info(m):  print(f"  {Y}→{W} {m}")
def head(m):  print(f"\n{C}{BOLD}{'='*50}\n  {m}\n{'='*50}{W}")

def get_timestamp():
    return datetime.now().strftime("%Y%m%d_%H%M%S")

def get_backup_path(label=""):
    ts = get_timestamp()
    name = f"sdms_{ts}{'_'+label if label else ''}.sql"
    return os.path.join(BACKUP_DIR, name)

def get_mysql_args(extra=[]):
    """Build argumen MySQL/mysqldump"""
    args = [
        f"--host={MYSQL_HOST}",
        f"--port={MYSQL_PORT}",
        f"--user={MYSQL_USER}",
    ]
    if MYSQL_PASS:
        args.append(f"--password={MYSQL_PASS}")
    return args + extra

def check_mysqldump():
    """Cek apakah mysqldump tersedia — auto-deteksi semua lokasi umum"""
    # Cek konfigurasi dulu
    if os.path.exists(MYSQLDUMP):
        return MYSQLDUMP

    # Auto-deteksi
    candidates = [
        r"C:\xampp\mysql\bin\mysqldump.exe",
        r"D:\xampp\mysql\bin\mysqldump.exe",
        r"C:\laragon\bin\mysql\mysql-8.0\bin\mysqldump.exe",
        r"C:\laragon\bin\mariadb\mariadb-10.6\bin\mysqldump.exe",
        r"C:\laragon\bin\mariadb\mariadb-10.11\bin\mysqldump.exe",
        r"C:\wamp64\bin\mysql\mysql8.0.31\bin\mysqldump.exe",
        "/usr/bin/mysqldump",
        "/usr/local/bin/mysqldump",
    ]
    for p in candidates:
        if os.path.exists(p):
            return p

    # Coba via PATH
    result = shutil.which("mysqldump")
    if result:
        return result

    return None

def do_backup(label="manual"):
    """Jalankan backup database"""
    mysqldump = check_mysqldump()
    if not mysqldump:
        err("mysqldump tidak ditemukan!")
        err(f"Pastikan XAMPP sudah terinstall di: {XAMPP_DIR}")
        return None

    # Buat folder backup
    os.makedirs(BACKUP_DIR, exist_ok=True)

    backup_file = get_backup_path(label)

    info(f"Backup database '{DB_NAME}'...")
    info(f"File: {os.path.basename(backup_file)}")

    cmd = [mysqldump] + get_mysql_args([
        "--single-transaction",
        "--routines",
        "--triggers",
        "--events",
        "--add-drop-table",
        "--complete-insert",
        f"--result-file={backup_file}",
        DB_NAME,
    ])

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        if result.returncode != 0:
            err(f"Backup gagal: {result.stderr[:200]}")
            return None

        # Cek ukuran file
        size = os.path.getsize(backup_file)
        if size < 100:
            err("File backup terlalu kecil — mungkin database kosong atau error")
            return None

        size_kb = size / 1024
        ok(f"Backup berhasil! Ukuran: {size_kb:.1f} KB")
        ok(f"Disimpan: {backup_file}")

        # Simpan metadata
        save_metadata(backup_file, label, size)
        return backup_file

    except subprocess.TimeoutExpired:
        err("Backup timeout (>120 detik)")
        return None
    except Exception as e:
        err(f"Error: {str(e)}")
        return None

def save_metadata(filepath, label, size):
    """Simpan info backup ke JSON"""
    meta_file = os.path.join(BACKUP_DIR, "backup_history.json")
    history = []
    if os.path.exists(meta_file):
        try:
            with open(meta_file, 'r') as f:
                history = json.load(f)
        except: pass

    history.append({
        "file": os.path.basename(filepath),
        "path": filepath,
        "label": label,
        "size_bytes": size,
        "size_kb": round(size / 1024, 1),
        "created_at": datetime.now().isoformat(),
        "database": DB_NAME,
    })

    # Batasi history
    history = history[-MAX_BACKUPS:]

    with open(meta_file, 'w') as f:
        json.dump(history, f, indent=2)

def list_backups():
    """Tampilkan daftar backup"""
    head("Daftar Backup SDMS")

    files = sorted(glob.glob(os.path.join(BACKUP_DIR, "sdms_*.sql")), reverse=True)
    if not files:
        print(f"  {Y}Belum ada file backup di: {BACKUP_DIR}{W}")
        return []

    print(f"  {'No':<4} {'File':<40} {'Ukuran':>10} {'Tanggal'}")
    print(f"  {'-'*4} {'-'*40} {'-'*10} {'-'*20}")
    for i, f in enumerate(files, 1):
        size  = os.path.getsize(f) / 1024
        mtime = datetime.fromtimestamp(os.path.getmtime(f)).strftime("%d/%m/%Y %H:%M")
        name  = os.path.basename(f)
        print(f"  {i:<4} {name:<40} {size:>8.1f} KB  {mtime}")

    print(f"\n  Total: {len(files)} file backup")
    print(f"  Lokasi: {BACKUP_DIR}")
    return files

def do_restore():
    """Restore database dari file backup"""
    mysql_bin_path = os.path.join(os.path.dirname(check_mysqldump() or ""), "mysql.exe")
    if not os.path.exists(mysql_bin_path):
        mysql_bin_path = shutil.which("mysql") or "mysql"

    files = list_backups()
    if not files:
        return

    print()
    choice = input(f"  Pilih nomor backup untuk restore (1-{len(files)}), atau 'q' untuk batal: ").strip()
    if choice.lower() == 'q':
        print("  Dibatalkan.")
        return

    try:
        idx = int(choice) - 1
        if idx < 0 or idx >= len(files):
            err("Nomor tidak valid")
            return
    except ValueError:
        err("Input tidak valid")
        return

    backup_file = files[idx]
    print(f"\n  {R}PERHATIAN: Restore akan menimpa data database '{DB_NAME}' saat ini!{W}")
    confirm = input(f"  Yakin restore dari '{os.path.basename(backup_file)}'? (ketik 'YA' untuk lanjut): ").strip()
    if confirm != 'YA':
        print("  Dibatalkan.")
        return

    info(f"Restore dari: {os.path.basename(backup_file)}")

    # Backup dulu sebelum restore
    info("Membuat backup current sebelum restore...")
    do_backup("before_restore")

    # Jalankan restore
    with open(backup_file, 'r', encoding='utf-8', errors='replace') as f:
        sql_content = f.read()

    cmd = [mysql_bin_path] + get_mysql_args([DB_NAME])

    try:
        result = subprocess.run(
            cmd, input=sql_content,
            capture_output=True, text=True, timeout=300
        )
        if result.returncode == 0:
            ok(f"Restore berhasil dari: {os.path.basename(backup_file)}")
        else:
            err(f"Restore gagal: {result.stderr[:200]}")
    except Exception as e:
        err(f"Error: {str(e)}")

def clean_old_backups():
    """Hapus backup yang lebih lama dari KEEP_DAYS"""
    head(f"Bersihkan Backup Lama (>{KEEP_DAYS} hari)")

    cutoff = datetime.now() - timedelta(days=KEEP_DAYS)
    files  = glob.glob(os.path.join(BACKUP_DIR, "sdms_*.sql"))
    deleted = 0

    for f in files:
        mtime = datetime.fromtimestamp(os.path.getmtime(f))
        if mtime < cutoff:
            os.remove(f)
            info(f"Dihapus: {os.path.basename(f)}")
            deleted += 1

    if deleted:
        ok(f"{deleted} file backup lama dihapus")
    else:
        ok("Tidak ada backup yang perlu dihapus")

def auto_backup_loop():
    """Jalankan backup otomatis setiap 24 jam"""
    head("Auto Backup — Setiap 24 Jam")
    info("Tekan Ctrl+C untuk berhenti")
    info(f"Backup disimpan di: {BACKUP_DIR}")

    while True:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"\n[{now}] Menjalankan backup...")
        result = do_backup("auto")
        if result:
            clean_old_backups()
        next_run = datetime.now() + timedelta(hours=24)
        info(f"Backup berikutnya: {next_run.strftime('%Y-%m-%d %H:%M:%S')}")
        time.sleep(24 * 3600)

def main():
    print(f"\n{C}{BOLD}SDMS Backup Manager{W}")
    print(f"Database: {DB_NAME} @ {MYSQL_HOST}:{MYSQL_PORT}")
    print(f"Backup dir: {BACKUP_DIR}")

    args = sys.argv[1:]

    if '--restore' in args or '-r' in args:
        do_restore()
    elif '--list' in args or '-l' in args:
        list_backups()
    elif '--clean' in args or '-c' in args:
        clean_old_backups()
    elif '--auto' in args or '-a' in args:
        auto_backup_loop()
    else:
        # Default: backup sekarang
        head("Backup Database SDMS")
        result = do_backup("manual")
        if result:
            print(f"\n  {G}Backup selesai!{W}")
            print(f"  File: {result}")
            print(f"\n  Perintah lain:")
            print(f"    python backup/backup.py --list      # Lihat semua backup")
            print(f"    python backup/backup.py --restore   # Restore dari backup")
            print(f"    python backup/backup.py --clean     # Hapus backup lama")
            print(f"    python backup/backup.py --auto      # Auto backup tiap 24 jam")

if __name__ == "__main__":
    main()
