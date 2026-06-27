export default function Loading({ text = 'Memuat...' }) {
  return (
    <div className="text-center py-5">
      <div className="spinner-lensique mx-auto"></div>
      <p className="mt-3 text-muted">{text}</p>
    </div>
  );
}
