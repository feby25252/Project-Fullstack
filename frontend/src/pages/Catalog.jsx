import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/product/ProductCard';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    api.get('/katalog/kategori').then(r => setCategories(r.data?.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12, sort });
    if (search) params.set('search', search);
    if (category) params.set('category', category);

    api.get(`/katalog/produk?${params}`).then(res => {
      const data = res.data;
      if (data?.success) {
        setProducts(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, search, category, sort]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="container py-4">
      <div className="section-heading">
        <h2>Katalog Produk</h2>
        <p>Temukan kacamata yang cocok untukmu</p>
        <div className="heading-line"></div>
      </div>

      {/* Filters */}
      <div className="card-container mb-4">
        <form onSubmit={handleSearch} className="row g-3 align-items-end">
          <div className="col-md-4">
            <input type="text" className="form-control" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
              <option value="">Semua Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
              <option value="newest">Terbaru</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
              <option value="name_asc">Nama A-Z</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-lensique w-100"><i className="bi bi-search"></i> Filter</button>
          </div>
        </form>
      </div>

      {/* Products Grid */}
      {loading ? <Loading /> : (
        <>
          <div className="row g-4">
            {products.length > 0 ? products.map(p => (
              <div key={p.id} className="col-6 col-md-4 col-lg-3">
                <ProductCard product={p} />
              </div>
            )) : (
              <div className="empty-state w-100">
                <i className="bi bi-search"></i>
                <h4>Produk Tidak Ditemukan</h4>
                <p>Coba ubah kata kunci atau filter pencarian</p>
              </div>
            )}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
