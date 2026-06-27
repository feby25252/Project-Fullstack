/**
 * Format number as Indonesian Rupiah currency
 */
export function formatRupiah(num) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num || 0);
}

/**
 * Format date string to Indonesian locale
 */
export function formatDate(dateString) {
  if (!dateString) return '-';
  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

/**
 * Format date short (no time)
 */
export function formatDateShort(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get status badge class and label
 */
export function getStatusInfo(status) {
  const map = {
    pending: { cls: 'badge-pending', label: 'Menunggu' },
    processing: { cls: 'badge-processing', label: 'Diproses' },
    shipped: { cls: 'badge-shipped', label: 'Dikirim' },
    delivered: { cls: 'badge-delivered', label: 'Diterima' },
    cancelled: { cls: 'badge-cancelled', label: 'Dibatalkan' },
    in_transit: { cls: 'badge-shipped', label: 'Dalam Perjalanan' },
  };
  return map[status] || { cls: 'badge-pending', label: status || 'Unknown' };
}

/**
 * Get payment status info
 */
export function getPaymentInfo(status) {
  const map = {
    pending: { cls: 'badge-pending', label: 'Belum Dibayar' },
    paid: { cls: 'badge-delivered', label: 'Lunas' },
    failed: { cls: 'badge-cancelled', label: 'Gagal' },
    refunded: { cls: 'badge-processing', label: 'Refund' },
  };
  return map[status] || { cls: 'badge-pending', label: status || 'Unknown' };
}
