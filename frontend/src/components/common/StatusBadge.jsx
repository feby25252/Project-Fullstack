import { getStatusInfo } from '../../utils/format';

export default function StatusBadge({ status }) {
  const info = getStatusInfo(status);
  return <span className={`badge-status ${info.cls}`}>{info.label}</span>;
}
