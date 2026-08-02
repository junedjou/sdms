import dayjs from 'dayjs';
import 'dayjs/locale/id';

dayjs.locale('id');

/**
 * Format tanggal ke format Indonesia
 */
export const formatDate = (date, format = 'DD MMMM YYYY') => {
  if (!date) return '-';
  return dayjs(date).format(format);
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD MMM YYYY, HH:mm');
};

export const formatDateShort = (date) => {
  if (!date) return '-';
  return dayjs(date).format('DD/MM/YYYY');
};

/**
 * Format angka sebagai ribuan
 */
export const formatNumber = (n) => {
  if (n === null || n === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(n);
};

/**
 * Truncate teks
 */
export const truncate = (str, length = 50) => {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '...' : str;
};

/**
 * Inisial dari nama lengkap
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
};

/**
 * Warna avatar berdasarkan nama (konsisten)
 */
export const getAvatarColor = (name) => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500',
    'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500',
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Debounce function
 */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Ambil pesan error dari response axios
 */
export const getErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Terjadi kesalahan yang tidak diketahui'
  );
};

/**
 * Download file dari blob response
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Gender label
 */
export const genderLabel = (jk) => ({ L: 'Laki-laki', P: 'Perempuan' }[jk] || jk || '-');

/**
 * Status siswa badge class
 */
export const statusBadgeClass = (status) => {
  const map = {
    Aktif: 'badge-green',
    Lulus: 'badge-blue',
    Pindah: 'badge-yellow',
    Keluar: 'badge-red',
    Meninggal: 'badge-gray',
  };
  return map[status] || 'badge-gray';
};
