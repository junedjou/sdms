"""
SDMS Sample Data Generator
Mengisi data contoh via API agar dashboard langsung terlihat.
Jalankan: python sample_data.py
Prasyarat: backend sudah berjalan di http://localhost:3000
"""

import urllib.request, urllib.error, json, sys, time

BASE = "http://localhost:3000/api/v1"
R='\033[91m'; G='\033[92m'; Y='\033[93m'; C='\033[96m'; W='\033[0m'; B='\033[1m'

def ok(msg):   print(f"  {G}✓{W} {msg}")
def err(msg):  print(f"  {R}✗{W} {msg}")
def info(msg): print(f"  {Y}→{W} {msg}")
def head(msg): print(f"\n{C}{B}{'='*50}{W}\n  {msg}\n{C}{'='*50}{W}")

def api(method, path, data=None, token=None):
    url = BASE + path
    body = json.dumps(data).encode() if data else None
    headers = {"Content-Type": "application/json"}
    if token: headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            return json.loads(res.read()), res.status
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        return json.loads(body) if body else {}, e.code
    except Exception as ex:
        return {"error": str(ex)}, 0

# ── Login ─────────────────────────────────────────────────────
def login():
    head("LOGIN")
    res, status = api("POST", "/auth/login", {"username":"superadmin","password":"Admin@SDMS2024!"})
    if status == 200:
        token = res["data"]["access_token"]
        ok(f"Login berhasil — {res['data']['user']['full_name']}")
        return token
    else:
        err(f"Login gagal ({status}): {res.get('message','?')}")
        err("Pastikan backend berjalan: python start.py --backend")
        sys.exit(1)

# ── Tahun Pelajaran ───────────────────────────────────────────
def create_tahun_pelajaran(token):
    head("TAHUN PELAJARAN & SEMESTER")
    res, s = api("POST", "/master/tahun-pelajaran", {
        "nama": "2025/2026",
        "tanggal_mulai": "2025-07-14",
        "tanggal_selesai": "2026-06-30",
        "is_aktif": True
    }, token)
    if s in (200,201):
        tp_id = res["data"]["id"]
        ok(f"Tahun Pelajaran 2025/2026 dibuat (id: {tp_id[:8]}...)")
    elif s == 409:
        res2, _ = api("GET", "/master/tahun-pelajaran", token=token)
        aktif = next((x for x in res2.get("data",[]) if x.get("is_aktif")), None)
        tp_id = (aktif or res2["data"][0])["id"]
        info(f"Tahun pelajaran sudah ada, gunakan: {tp_id[:8]}...")
    else:
        err(f"Gagal buat tahun pelajaran: {res.get('message')}")
        return None

    # Semester Ganjil
    res, s = api("POST", "/master/semester", {
        "tahun_pelajaran_id": tp_id,
        "nama": "Ganjil",
        "tanggal_mulai": "2024-07-15",
        "tanggal_selesai": "2024-12-31",
        "is_aktif": True
    }, token)
    if s in (200,201): ok("Semester Ganjil dibuat")

    # Semester Genap
    res, s = api("POST", "/master/semester", {
        "tahun_pelajaran_id": tp_id,
        "nama": "Genap",
        "tanggal_mulai": "2025-01-06",
        "tanggal_selesai": "2025-06-20",
        "is_aktif": False
    }, token)
    if s in (200,201): ok("Semester Genap dibuat")

    return tp_id

# ── Jurusan ───────────────────────────────────────────────────
def create_jurusan(token):
    head("JURUSAN")
    jurusan_list = [
        {"kode":"TKJ",  "nama":"Teknik Komputer dan Jaringan",      "deskripsi":"Jurusan jaringan komputer"},
        {"kode":"RPL",  "nama":"Rekayasa Perangkat Lunak",          "deskripsi":"Jurusan pemrograman"},
        {"kode":"AKL",  "nama":"Akuntansi dan Keuangan Lembaga",    "deskripsi":"Jurusan akuntansi"},
        {"kode":"OTKP", "nama":"Otomatisasi Tata Kelola Perkantoran","deskripsi":"Jurusan administrasi"},
        {"kode":"BDP",  "nama":"Bisnis Daring dan Pemasaran",       "deskripsi":"Jurusan pemasaran"},
    ]
    ids = {}
    for j in jurusan_list:
        res, s = api("POST", "/master/jurusan", j, token)
        if s in (200,201):
            ids[j["kode"]] = res["data"]["id"]
            ok(f"Jurusan {j['kode']} — {j['nama']}")
        elif s == 409:
            res2, _ = api("GET", "/master/jurusan", token=token)
            for item in res2.get("data", []):
                ids[item["kode"]] = item["id"]
            info(f"Jurusan {j['kode']} sudah ada")
        else:
            err(f"Gagal: {j['kode']} — {res.get('message')}")
    return ids

# ── Guru ──────────────────────────────────────────────────────
def create_guru(token, jurusan_ids):
    head("GURU")
    guru_list = [
        {"nama":"Ahmad Fauzi, S.Pd",      "nip":"198501012010011001","jenis_kelamin":"L","status_kepegawaian":"PNS",  "jabatan":"Kepala Sekolah",       "jurusan_id":None,              "no_hp":"081234567001","agama":"Islam"},
        {"nama":"Siti Rahayu, S.Kom",     "nip":"199002032015012002","jenis_kelamin":"P","status_kepegawaian":"PNS",  "jabatan":"Wakasek Kurikulum",    "jurusan_id":"TKJ",             "no_hp":"081234567002","agama":"Islam"},
        {"nama":"Budi Santoso, S.T",      "nip":"198803152012011003","jenis_kelamin":"L","status_kepegawaian":"GTY",  "jabatan":"Wali Kelas X TKJ 1",   "jurusan_id":"TKJ",             "no_hp":"081234567003","agama":"Islam"},
        {"nama":"Dewi Lestari, S.Pd",     "niy":"20150001",         "jenis_kelamin":"P","status_kepegawaian":"GTT",  "jabatan":"Guru Matematika",      "jurusan_id":None,              "no_hp":"081234567004","agama":"Islam"},
        {"nama":"Rudi Hartono, S.Kom",    "niy":"20160002",         "jenis_kelamin":"L","status_kepegawaian":"GTY",  "jabatan":"Wali Kelas XI RPL 1",  "jurusan_id":"RPL",             "no_hp":"081234567005","agama":"Islam"},
        {"nama":"Maya Sari, S.E",         "niy":"20170003",         "jenis_kelamin":"P","status_kepegawaian":"Honor","jabatan":"Guru Akuntansi",        "jurusan_id":"AKL",             "no_hp":"081234567006","agama":"Islam"},
        {"nama":"Hendra Wijaya, S.Pd",    "nip":"199105202018011004","jenis_kelamin":"L","status_kepegawaian":"PPPK", "jabatan":"Guru Bahasa Indonesia", "jurusan_id":None,              "no_hp":"081234567007","agama":"Islam"},
        {"nama":"Fitri Handayani, S.Pd",  "niy":"20180004",         "jenis_kelamin":"P","status_kepegawaian":"GTT",  "jabatan":"Wali Kelas XII AKL 1", "jurusan_id":"AKL",             "no_hp":"081234567008","agama":"Islam"},
    ]
    guru_ids = []
    for g in guru_list:
        payload = {k:v for k,v in g.items() if v is not None and k != "jurusan_id"}
        if g["jurusan_id"] and g["jurusan_id"] in jurusan_ids:
            payload["jurusan_id"] = jurusan_ids[g["jurusan_id"]]
        res, s = api("POST", "/master/guru", payload, token)
        if s in (200,201):
            guru_ids.append(res["data"]["id"])
            ok(f"Guru: {g['nama']}")
        elif s == 409:
            info(f"Guru {g['nama']} sudah ada")
        else:
            err(f"Gagal: {g['nama']} — {res.get('message','?')}")
    return guru_ids

# ── Siswa ─────────────────────────────────────────────────────
def create_siswa(token, jurusan_ids):
    head("SISWA")
    siswa_list = [
        # TKJ
        {"nama":"Andi Prasetyo",      "nisn":"0001234567","nis":"2024001","jenis_kelamin":"L","jurusan_id":"TKJ","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
        {"nama":"Rini Oktaviani",     "nisn":"0001234568","nis":"2024002","jenis_kelamin":"P","jurusan_id":"TKJ","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
        {"nama":"Dika Firmansyah",    "nisn":"0001234569","nis":"2024003","jenis_kelamin":"L","jurusan_id":"TKJ","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
        {"nama":"Sari Wahyuningsih",  "nisn":"0001234570","nis":"2024004","jenis_kelamin":"P","jurusan_id":"TKJ","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
        {"nama":"Bagas Nugroho",      "nisn":"0001234571","nis":"2024005","jenis_kelamin":"L","jurusan_id":"TKJ","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
        # RPL
        {"nama":"Citra Dewi",         "nisn":"0001234572","nis":"2024006","jenis_kelamin":"P","jurusan_id":"RPL","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
        {"nama":"Rizal Maulana",      "nisn":"0001234573","nis":"2024007","jenis_kelamin":"L","jurusan_id":"RPL","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
        {"nama":"Indah Permatasari",  "nisn":"0001234574","nis":"2024008","jenis_kelamin":"P","jurusan_id":"RPL","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
        # AKL
        {"nama":"Yoga Pratama",       "nisn":"0001234575","nis":"2024009","jenis_kelamin":"L","jurusan_id":"AKL","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
        {"nama":"Putri Ayu",          "nisn":"0001234576","nis":"2024010","jenis_kelamin":"P","jurusan_id":"AKL","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
        {"nama":"Fajar Setiawan",     "nisn":"0001234577","nis":"2024011","jenis_kelamin":"L","jurusan_id":"AKL","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
        # OTKP
        {"nama":"Nisa Ramadhani",     "nisn":"0001234578","nis":"2024012","jenis_kelamin":"P","jurusan_id":"OTKP","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
        {"nama":"Arif Budiman",       "nisn":"0001234579","nis":"2024013","jenis_kelamin":"L","jurusan_id":"OTKP","tahun_masuk":2024,"agama":"Islam","status":"Aktif"},
    ]
    count = 0
    for s in siswa_list:
        payload = {k:v for k,v in s.items() if k != "jurusan_id"}
        if s["jurusan_id"] in jurusan_ids:
            payload["jurusan_id"] = jurusan_ids[s["jurusan_id"]]
        res, status = api("POST", "/master/siswa", payload, token)
        if status in (200,201):
            count += 1
            ok(f"Siswa: {s['nama']} ({s['jurusan_id']})")
        elif status == 409:
            info(f"Siswa {s['nama']} sudah ada")
        else:
            err(f"Gagal: {s['nama']} — {res.get('message','?')}")
    return count

# ── Kelas ─────────────────────────────────────────────────────
def create_kelas(token, jurusan_ids, tp_id):
    head("KELAS")
    kelas_list = [
        {"nama":"X TKJ 1",  "tingkat":"X",   "jurusan_id":"TKJ",  "kapasitas":36},
        {"nama":"X TKJ 2",  "tingkat":"X",   "jurusan_id":"TKJ",  "kapasitas":36},
        {"nama":"X RPL 1",  "tingkat":"X",   "jurusan_id":"RPL",  "kapasitas":36},
        {"nama":"XI TKJ 1", "tingkat":"XI",  "jurusan_id":"TKJ",  "kapasitas":36},
        {"nama":"XI RPL 1", "tingkat":"XI",  "jurusan_id":"RPL",  "kapasitas":36},
        {"nama":"XI AKL 1", "tingkat":"XI",  "jurusan_id":"AKL",  "kapasitas":36},
        {"nama":"XII TKJ 1","tingkat":"XII", "jurusan_id":"TKJ",  "kapasitas":36},
        {"nama":"XII AKL 1","tingkat":"XII", "jurusan_id":"AKL",  "kapasitas":36},
    ]
    count = 0
    for k in kelas_list:
        payload = {"nama":k["nama"],"tingkat":k["tingkat"],"kapasitas":k["kapasitas"],"tahun_pelajaran_id":tp_id}
        if k["jurusan_id"] in jurusan_ids:
            payload["jurusan_id"] = jurusan_ids[k["jurusan_id"]]
        res, s = api("POST", "/master/kelas", payload, token)
        if s in (200,201):
            count += 1
            ok(f"Kelas: {k['nama']}")
        elif s == 409:
            info(f"Kelas {k['nama']} sudah ada")
        else:
            err(f"Gagal: {k['nama']} — {res.get('message','?')}")
    return count

# ── Mata Pelajaran ────────────────────────────────────────────
def create_mapel(token, jurusan_ids):
    head("MATA PELAJARAN")
    mapel_list = [
        {"kode":"MAT",    "nama":"Matematika",              "kelompok":"A","jurusan_id":None, "jam_per_minggu":4},
        {"kode":"IND",    "nama":"Bahasa Indonesia",        "kelompok":"A","jurusan_id":None, "jam_per_minggu":4},
        {"kode":"ING",    "nama":"Bahasa Inggris",          "kelompok":"A","jurusan_id":None, "jam_per_minggu":3},
        {"kode":"PKN",    "nama":"Pendidikan Pancasila",    "kelompok":"A","jurusan_id":None, "jam_per_minggu":2},
        {"kode":"PAI",    "nama":"Pendidikan Agama Islam",  "kelompok":"A","jurusan_id":None, "jam_per_minggu":3},
        {"kode":"PKK-TKJ","nama":"Prod. Kreatif TKJ",       "kelompok":"C","jurusan_id":"TKJ","jam_per_minggu":7},
        {"kode":"PKK-RPL","nama":"Prod. Kreatif RPL",       "kelompok":"C","jurusan_id":"RPL","jam_per_minggu":7},
        {"kode":"PKK-AKL","nama":"Prod. Kreatif AKL",       "kelompok":"C","jurusan_id":"AKL","jam_per_minggu":7},
        {"kode":"PJOK",   "nama":"Penjasorkes",             "kelompok":"B","jurusan_id":None, "jam_per_minggu":2},
        {"kode":"SENBUD", "nama":"Seni Budaya",             "kelompok":"B","jurusan_id":None, "jam_per_minggu":2},
    ]
    count = 0
    for m in mapel_list:
        payload = {k:v for k,v in m.items() if v is not None and k != "jurusan_id"}
        if m["jurusan_id"] and m["jurusan_id"] in jurusan_ids:
            payload["jurusan_id"] = jurusan_ids[m["jurusan_id"]]
        res, s = api("POST", "/master/mapel", payload, token)
        if s in (200,201):
            count += 1
            ok(f"Mapel: {m['kode']} — {m['nama']}")
        elif s == 409:
            info(f"Mapel {m['kode']} sudah ada")
        else:
            err(f"Gagal: {m['kode']} — {res.get('message','?')}")
    return count

# ── Kalender Akademik ─────────────────────────────────────────
def create_kalender(token, tp_id):
    head("KALENDER AKADEMIK")
    events = [
        {"judul":"Hari Pertama Masuk Sekolah",     "tanggal_mulai":"2025-07-14","tanggal_selesai":"2025-07-14","jenis":"kegiatan","warna":"#10b981"},
        {"judul":"Masa Pengenalan Lingkungan Sekolah","tanggal_mulai":"2025-07-14","tanggal_selesai":"2025-07-16","jenis":"kegiatan","warna":"#3b82f6"},
        {"judul":"Ulangan Harian 1",                "tanggal_mulai":"2025-09-01","tanggal_selesai":"2025-09-05","jenis":"ujian",   "warna":"#f59e0b"},
        {"judul":"Penilaian Tengah Semester Ganjil", "tanggal_mulai":"2025-10-06","tanggal_selesai":"2025-10-11","jenis":"ujian",   "warna":"#ef4444"},
        {"judul":"Penilaian Akhir Semester Ganjil",  "tanggal_mulai":"2025-11-24","tanggal_selesai":"2025-11-29","jenis":"ujian",   "warna":"#ef4444"},
        {"judul":"Libur Semester Ganjil",            "tanggal_mulai":"2025-12-22","tanggal_selesai":"2026-01-04","jenis":"libur",   "warna":"#8b5cf6"},
        {"judul":"Hari Pertama Semester Genap",      "tanggal_mulai":"2026-01-05","tanggal_selesai":"2026-01-05","jenis":"kegiatan","warna":"#10b981"},
        {"judul":"Penilaian Tengah Semester Genap",  "tanggal_mulai":"2026-03-09","tanggal_selesai":"2026-03-14","jenis":"ujian",   "warna":"#ef4444"},
        {"judul":"Ujian Sekolah",                    "tanggal_mulai":"2026-04-06","tanggal_selesai":"2026-04-17","jenis":"ujian",   "warna":"#dc2626"},
        {"judul":"Penerimaan Peserta Didik Baru",    "tanggal_mulai":"2026-06-01","tanggal_selesai":"2026-06-13","jenis":"penerimaan","warna":"#06b6d4"},
        {"judul":"Libur Akhir Tahun Pelajaran",      "tanggal_mulai":"2026-06-22","tanggal_selesai":"2026-07-12","jenis":"libur",   "warna":"#8b5cf6"},
    ]
    count = 0
    for e in events:
        e["tahun_pelajaran_id"] = tp_id
        res, s = api("POST", "/master/kalender", e, token)
        if s in (200,201):
            count += 1
            ok(f"Kalender: {e['judul']}")
        else:
            err(f"Gagal: {e['judul']} — {res.get('message','?')}")
    return count

# ── Pegawai ───────────────────────────────────────────────────
def create_pegawai(token):
    head("PEGAWAI")
    pegawai_list = [
        {"nama":"Eko Susanto",       "jenis_kelamin":"L","jabatan":"Kepala TU",       "unit_kerja":"Tata Usaha",  "status_kepegawaian":"PNS",  "no_hp":"081234568001"},
        {"nama":"Yanti Kurniawati",  "jenis_kelamin":"P","jabatan":"Staf Administrasi","unit_kerja":"Tata Usaha",  "status_kepegawaian":"PPPK", "no_hp":"081234568002"},
        {"nama":"Joko Widodo",       "nip":None,               "jenis_kelamin":"L","jabatan":"Penjaga Sekolah", "unit_kerja":"Keamanan",    "status_kepegawaian":"Honor","no_hp":"081234568003"},
        {"nama":"Sri Mulyani",       "nip":None,               "jenis_kelamin":"P","jabatan":"Bendahara",       "unit_kerja":"Keuangan",    "status_kepegawaian":"PTY",  "no_hp":"081234568004"},
        {"nama":"Agus Salim",        "nip":None,               "jenis_kelamin":"L","jabatan":"Staf Perpustakaan","unit_kerja":"Perpustakaan","status_kepegawaian":"Honor","no_hp":"081234568005"},
    ]
    count = 0
    for p in pegawai_list:
        payload = {k:v for k,v in p.items() if v is not None}
        res, s = api("POST", "/master/pegawai", payload, token)
        if s in (200,201):
            count += 1
            ok(f"Pegawai: {p['nama']}")
        elif s == 409:
            info(f"Pegawai {p['nama']} sudah ada")
        elif s == 429:
            time.sleep(2); res, s = api("POST", "/master/pegawai", payload, token)
            if s in (200,201): count += 1; ok(f"Pegawai: {p['nama']}")
        else:
            err(f"Gagal: {p['nama']} — {res.get('message','?')}")
    return count

# ── MAIN ──────────────────────────────────────────────────────
def main():
    print(f"\n{C}{B}{'='*52}")
    print(f"  SDMS Sample Data Generator")
    print(f"  Mengisi data contoh untuk tampilan dashboard")
    print(f"{'='*52}{W}\n")

    token = login()
    tp_id = create_tahun_pelajaran(token)
    if not tp_id:
        err("Gagal buat tahun pelajaran, berhenti.")
        sys.exit(1)

    jurusan_ids = create_jurusan(token)
    g_count     = len(create_guru(token, jurusan_ids))
    s_count     = create_siswa(token, jurusan_ids)
    k_count     = create_kelas(token, jurusan_ids, tp_id)
    m_count     = create_mapel(token, jurusan_ids)
    p_count     = create_pegawai(token)
    ev_count    = create_kalender(token, tp_id)

    print(f"\n{G}{B}{'='*52}")
    print(f"  SELESAI! Data sample berhasil diisi:")
    print(f"{'='*52}{W}")
    print(f"  {G}✓{W} Tahun Pelajaran : 2024/2025 (aktif)")
    print(f"  {G}✓{W} Jurusan        : {len(jurusan_ids)}")
    print(f"  {G}✓{W} Guru           : {g_count}")
    print(f"  {G}✓{W} Siswa          : {s_count}")
    print(f"  {G}✓{W} Kelas          : {k_count}")
    print(f"  {G}✓{W} Mata Pelajaran : {m_count}")
    print(f"  {G}✓{W} Pegawai        : {p_count}")
    print(f"  {G}✓{W} Kalender       : {ev_count} agenda")
    print(f"\n{Y}  Buka http://localhost:5173 dan login!{W}")
    print(f"  Username: superadmin  |  Password: Admin@SDMS2024!\n")

if __name__ == "__main__":
    main()
