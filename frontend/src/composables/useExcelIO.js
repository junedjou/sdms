import { ref } from 'vue';
import { saveAs } from 'file-saver';
import { notify } from '@/utils/toast';

/**
 * Composable reusable untuk Export + Template + Import Excel.
 *
 * Usage:
 *   const { exporting, showImport, doExport, doTemplate } =
 *     useExcelIO({ exportFn, templateFn, importFn, label, onImported })
 */
export function useExcelIO({ exportFn, templateFn, importFn, label, onImported }) {
  const exporting   = ref(false);
  const showImport  = ref(false);

  const doExport = async () => {
    exporting.value = true;
    try {
      const res = await exportFn();
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `data_${label}_${new Date().toISOString().slice(0,10)}.xlsx`);
      notify.success(`Data ${label} berhasil diexport`);
    } catch {
      notify.error(`Gagal export data ${label}`);
    } finally {
      exporting.value = false;
    }
  };

  const doTemplate = async () => {
    try {
      const res = await templateFn();
      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      saveAs(blob, `template_import_${label}.xlsx`);
      notify.success('Template berhasil didownload');
    } catch {
      notify.error('Gagal download template');
    }
  };

  const handleImported = (count) => {
    notify.success(`${count} data ${label} berhasil diimport`);
    onImported?.();
  };

  return {
    exporting,
    showImport,
    doExport,
    doTemplate,
    importFn,
    handleImported,
  };
}
