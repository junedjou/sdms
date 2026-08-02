import { defineStore } from 'pinia';
import { ref } from 'vue';
import { masterService } from '@/services/api';

export const useMasterStore = defineStore('master', () => {
  // Lookup data yang sering dipakai di form (jurusan, kelas, dll)
  const jurusan        = ref([]);
  const kelas          = ref([]);
  const tahunPelajaran = ref([]);
  const semester       = ref([]);
  const tahunAktif     = ref(null);
  const semesterAktif  = ref(null);

  const fetchJurusan = async () => {
    const res = await masterService.jurusanList();
    jurusan.value = res.data.data || [];
  };

  const fetchKelas = async (tahunPelajaranId = null) => {
    const params = tahunPelajaranId ? { tahun_pelajaran_id: tahunPelajaranId } : {};
    const res = await masterService.kelasList(params);
    kelas.value = res.data.data || [];
  };

  const fetchTahunPelajaran = async () => {
    const res = await masterService.tahunPelajaranList();
    tahunPelajaran.value = res.data.data || [];
    tahunAktif.value = tahunPelajaran.value.find((tp) => tp.is_aktif) || null;
  };

  const fetchSemester = async (tahunPelajaranId = null) => {
    const params = tahunPelajaranId ? { tahun_pelajaran_id: tahunPelajaranId } : {};
    const res = await masterService.semesterList(params);
    semester.value = res.data.data || [];
    semesterAktif.value = semester.value.find((s) => s.is_aktif) || null;
  };

  const initLookups = async () => {
    await Promise.all([fetchJurusan(), fetchTahunPelajaran()]);
    if (tahunAktif.value) {
      await Promise.all([
        fetchKelas(tahunAktif.value.id),
        fetchSemester(tahunAktif.value.id),
      ]);
    }
  };

  return {
    jurusan, kelas, tahunPelajaran, semester, tahunAktif, semesterAktif,
    fetchJurusan, fetchKelas, fetchTahunPelajaran, fetchSemester, initLookups,
  };
});
