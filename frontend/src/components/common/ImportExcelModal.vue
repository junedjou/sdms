<template>
  <BaseModal :modelValue="modelValue" :title="`Import Excel — ${title}`" size="lg" @update:modelValue="$emit('update:modelValue', $event)">

    <!-- ── Step 1: Upload ──────────────────────────────────── -->
    <div v-if="step === 'upload'" class="space-y-5">

      <!-- Download template -->
      <div class="flex items-center justify-between p-4 rounded-xl bg-primary-50 border border-primary-100">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center">
            <DocumentArrowDownIcon class="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p class="text-sm font-semibold text-primary-800">Download Template</p>
            <p class="text-xs text-primary-600 mt-0.5">Gunakan template agar format kolom sesuai</p>
          </div>
        </div>
        <button @click="$emit('download-template')" class="btn-secondary btn-sm gap-1.5">
          <ArrowDownTrayIcon class="w-3.5 h-3.5" />
          Template .xlsx
        </button>
      </div>

      <!-- Panduan singkat -->
      <div class="p-4 rounded-xl bg-amber-50 border border-amber-100">
        <p class="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1.5">
          <InformationCircleIcon class="w-3.5 h-3.5" />
          Panduan Import
        </p>
        <ul class="text-xs text-amber-700 space-y-1 list-disc list-inside">
          <li>Baris pertama adalah header — <strong>jangan diubah</strong></li>
          <li>Kolom bertanda <strong>*</strong> wajib diisi</li>
          <li>Format tanggal: <strong>YYYY-MM-DD</strong> (contoh: 2024-08-01)</li>
          <li>Jenis kelamin: <strong>L</strong> atau <strong>P</strong></li>
          <li>Gunakan kode jurusan sesuai data master (contoh: TKJ, RPL)</li>
        </ul>
      </div>

      <!-- Drop zone -->
      <div
        class="relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer"
        :class="isDragging
          ? 'border-primary-400 bg-primary-50'
          : file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop"
        @click="triggerFile"
      >
        <input ref="fileInput" type="file" accept=".xlsx,.xls" class="hidden" @change="onFileChange" />

        <div class="flex flex-col items-center justify-center py-10 gap-3">
          <template v-if="file">
            <div class="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
              <DocumentCheckIcon class="w-7 h-7 text-emerald-600" />
            </div>
            <div class="text-center">
              <p class="text-sm font-semibold text-emerald-700">{{ file.name }}</p>
              <p class="text-xs text-emerald-500 mt-0.5">{{ (file.size / 1024).toFixed(1) }} KB — klik untuk ganti</p>
            </div>
          </template>
          <template v-else>
            <div class="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
              <CloudArrowUpIcon class="w-7 h-7 text-slate-400" />
            </div>
            <div class="text-center">
              <p class="text-sm font-semibold text-slate-600">Drag & drop file Excel di sini</p>
              <p class="text-xs text-slate-400 mt-0.5">atau klik untuk pilih file (.xlsx / .xls, maks 5 MB)</p>
            </div>
          </template>
        </div>
      </div>

      <!-- Error file -->
      <p v-if="fileError" class="text-sm text-red-600 flex items-center gap-1.5">
        <ExclamationCircleIcon class="w-4 h-4" />{{ fileError }}
      </p>
    </div>

    <!-- ── Step 2: Result ──────────────────────────────────── -->
    <div v-else-if="step === 'result'" class="space-y-4">
      <!-- Summary -->
      <div class="grid grid-cols-2 gap-3">
        <div class="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
          <CheckCircleIcon class="w-8 h-8 text-emerald-500 flex-shrink-0" />
          <div>
            <p class="text-2xl font-bold text-emerald-700">{{ result.imported }}</p>
            <p class="text-xs text-emerald-600 font-medium">Berhasil diimport</p>
          </div>
        </div>
        <div class="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100">
          <XCircleIcon class="w-8 h-8 text-red-400 flex-shrink-0" />
          <div>
            <p class="text-2xl font-bold text-red-600">{{ result.errors.length }}</p>
            <p class="text-xs text-red-500 font-medium">Baris gagal</p>
          </div>
        </div>
      </div>

      <!-- Tabel error jika ada -->
      <div v-if="result.errors.length" class="space-y-2">
        <p class="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
          <ExclamationTriangleIcon class="w-4 h-4 text-amber-500" />
          Detail Baris Gagal
        </p>
        <div class="max-h-56 overflow-y-auto rounded-xl border border-slate-100">
          <table class="table text-xs">
            <thead>
              <tr>
                <th class="w-16">Baris</th>
                <th class="w-28">Kolom</th>
                <th>Keterangan Error</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(err, i) in result.errors" :key="i">
                <td class="font-mono text-slate-500">{{ err.row }}</td>
                <td class="font-mono text-amber-600">{{ err.field }}</td>
                <td class="text-red-600">{{ err.message }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <button @click="downloadErrorReport" class="btn-secondary btn-sm gap-1.5 text-xs">
          <ArrowDownTrayIcon class="w-3.5 h-3.5" />
          Download laporan error (.xlsx)
        </button>
      </div>

      <!-- Sukses semua -->
      <div v-else class="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
        <CheckCircleIcon class="w-6 h-6 text-emerald-500 flex-shrink-0" />
        <p class="text-sm text-emerald-700 font-medium">Semua baris berhasil diimport tanpa error!</p>
      </div>
    </div>

    <!-- ── Step 3: Loading ─────────────────────────────────── -->
    <div v-else-if="step === 'loading'" class="flex flex-col items-center justify-center py-14 gap-4">
      <svg class="w-10 h-10 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <div class="text-center">
        <p class="text-sm font-semibold text-slate-700">Mengimport data...</p>
        <p class="text-xs text-slate-400 mt-1">Mohon tunggu, jangan tutup halaman ini</p>
      </div>
    </div>

    <!-- ── Footer ─────────────────────────────────────────── -->
    <template #footer>
      <template v-if="step === 'upload'">
        <button class="btn-secondary" @click="close">Batal</button>
        <button class="btn-primary" :disabled="!file" @click="doImport">
          <CloudArrowUpIcon class="w-4 h-4" />
          Import Sekarang
        </button>
      </template>
      <template v-else-if="step === 'result'">
        <button class="btn-secondary" @click="reset">Import Lagi</button>
        <button class="btn-primary" @click="close">
          <CheckCircleIcon class="w-4 h-4" />
          Selesai
        </button>
      </template>
      <template v-else>
        <span />
      </template>
    </template>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import BaseModal from './BaseModal.vue';
import {
  DocumentArrowDownIcon, ArrowDownTrayIcon, CloudArrowUpIcon,
  DocumentCheckIcon, CheckCircleIcon, XCircleIcon,
  ExclamationCircleIcon, ExclamationTriangleIcon, InformationCircleIcon,
} from '@heroicons/vue/24/outline';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title:      { type: String, default: 'Data' },
  importFn:   { type: Function, required: true },
});
const emit = defineEmits(['update:modelValue', 'download-template', 'imported']);

const step      = ref('upload');
const file      = ref(null);
const fileError = ref('');
const isDragging = ref(false);
const fileInput  = ref(null);
const result     = ref({ imported: 0, errors: [] });

watch(() => props.modelValue, (v) => { if (v) reset(); });

const triggerFile = () => fileInput.value?.click();

const validateFile = (f) => {
  if (!f) return 'Pilih file terlebih dahulu';
  if (!/\.(xlsx|xls)$/i.test(f.name)) return 'Hanya file .xlsx atau .xls yang diizinkan';
  if (f.size > 5 * 1024 * 1024) return 'Ukuran file maks 5 MB';
  return '';
};

const onFileChange = (e) => {
  const f = e.target.files[0];
  fileError.value = validateFile(f);
  file.value = fileError.value ? null : f;
};

const onDrop = (e) => {
  isDragging.value = false;
  const f = e.dataTransfer.files[0];
  fileError.value = validateFile(f);
  file.value = fileError.value ? null : f;
};

const doImport = async () => {
  if (!file.value) return;
  step.value = 'loading';
  try {
    const fd = new FormData();
    fd.append('file', file.value);
    const res = await props.importFn(fd);
    result.value = res.data.data;
    step.value = 'result';
    emit('imported', result.value.imported);
  } catch (e) {
    result.value = {
      imported: 0,
      errors: [{ row: '-', field: '-', message: e.response?.data?.message || e.message || 'Terjadi kesalahan' }],
    };
    step.value = 'result';
  }
};

const reset = () => {
  step.value = 'upload';
  file.value = null;
  fileError.value = '';
  if (fileInput.value) fileInput.value.value = '';
};

const close = () => {
  emit('update:modelValue', false);
};

const downloadErrorReport = () => {
  const headers = ['Baris', 'Kolom', 'Keterangan Error'];
  const rows = result.value.errors.map(e => [e.row, e.field, e.message]);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Error Report');
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `error_import_${Date.now()}.xlsx`);
};
</script>
