import { ref, computed } from 'vue';

/**
 * Composable reusable untuk fitur hapus massal (bulk delete).
 *
 * Usage:
 *   const { selected, isAllSelected, toggleAll, toggleOne, clearSelected, confirmBulkDelete, bulkDeleting, showBulkConfirm } =
 *     useBulkDelete({ items, deleteFn, onDeleted })
 *
 * @param {Ref<Array>} items   - array data yang ditampilkan di tabel (ref)
 * @param {Function}  deleteFn - fungsi API yang menerima { ids: string[] }
 * @param {Function}  onDeleted - callback setelah delete berhasil
 */
export function useBulkDelete({ items, deleteFn, onDeleted }) {
  const selected        = ref([]);   // array id yang dicentang
  const bulkDeleting    = ref(false);
  const showBulkConfirm = ref(false);

  /** Apakah semua item di halaman ini tercentang */
  const isAllSelected = computed(() =>
    items.value.length > 0 && items.value.every(i => selected.value.includes(i.id))
  );

  /** Apakah sebagian (indeterminate) */
  const isPartialSelected = computed(() =>
    selected.value.length > 0 && !isAllSelected.value
  );

  /** Toggle semua item di halaman ini */
  const toggleAll = () => {
    if (isAllSelected.value) {
      // Uncheck semua item di halaman ini
      const pageIds = items.value.map(i => i.id);
      selected.value = selected.value.filter(id => !pageIds.includes(id));
    } else {
      // Centang semua item di halaman ini (gabung dengan yang sudah ada)
      const pageIds = items.value.map(i => i.id);
      const merged  = new Set([...selected.value, ...pageIds]);
      selected.value = Array.from(merged);
    }
  };

  /** Toggle satu item */
  const toggleOne = (id) => {
    const idx = selected.value.indexOf(id);
    if (idx > -1) selected.value.splice(idx, 1);
    else selected.value.push(id);
  };

  /** Cek apakah satu item tercentang */
  const isSelected = (id) => selected.value.includes(id);

  /** Bersihkan semua seleksi */
  const clearSelected = () => { selected.value = []; };

  /** Buka dialog konfirmasi */
  const openBulkConfirm = () => { showBulkConfirm.value = true; };

  /** Eksekusi bulk delete */
  const executeBulkDelete = async () => {
    bulkDeleting.value = true;
    try {
      await deleteFn({ ids: selected.value });
      const count = selected.value.length;
      clearSelected();
      showBulkConfirm.value = false;
      onDeleted?.(count);
    } finally {
      bulkDeleting.value = false;
    }
  };

  return {
    selected,
    bulkDeleting,
    showBulkConfirm,
    isAllSelected,
    isPartialSelected,
    isSelected,
    toggleAll,
    toggleOne,
    clearSelected,
    openBulkConfirm,
    executeBulkDelete,
  };
}
