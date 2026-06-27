import { useState } from 'react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="d-flex justify-content-center gap-2 mt-4">
      <button
        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &laquo;
      </button>
      {start > 1 && (
        <>
          <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => onPageChange(1)}>1</button>
          {start > 2 && <span className="align-self-center">...</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          className={`btn btn-sm rounded-pill px-3 ${p === currentPage ? 'btn-lensique text-white' : 'btn-outline-secondary'}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="align-self-center">...</span>}
          <button className="btn btn-sm btn-outline-secondary rounded-pill px-3" onClick={() => onPageChange(totalPages)}>{totalPages}</button>
        </>
      )}
      <button
        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        &raquo;
      </button>
    </div>
  );
}
