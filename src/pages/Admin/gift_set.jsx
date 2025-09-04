import AdminLayout from "../../components/Admin/AdminLayout";
import { useEffect, useState, useRef } from "react";
import AdminRouteGuard from "../../components/Admin/adminRouteGuard";
import {
  getGiftSets,
  addGiftSet,
  updateGiftSet,
  deleteGiftSet,
  getProducts,
} from "../../utils/admin_api";
import ImageWithFallback from "../../components/ImageWithFallback";

const LABEL_OPTIONS = [
  { value: "forUs", label: "For Us" },
  { value: "forHer", label: "For Her" },
  { value: "forHim", label: "For Him" },
  { value: "monthlySpecial", label: "Monthly Special" },
  { value: "null", label: "No Label" },
];

// Items per page configuration
const ITEMS_PER_PAGE = 10;

export default function AdminGiftSets() {
  const [giftSets, setGiftSets] = useState([]);
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    Promise.all([getGiftSets(), getProducts()]).then(([sets, prods]) => {
      // Sort gift sets from latest to oldest
      const sortedGiftSets = sets.sort((a, b) => {
        // If you have a createdAt field, use it for sorting
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        // Fallback: sort by ID in descending order (assuming newer items have higher IDs)
        return b.id - a.id;
      });
      
      setGiftSets(sortedGiftSets);
      setProducts(prods);
      setTotalPages(Math.ceil(sortedGiftSets.length / ITEMS_PER_PAGE));
      setLoading(false);
    });
  }, []);

  // Calculate the current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return giftSets.slice(startIndex, endIndex);
  };

  const handleSave = async (data, imageFile) => {
    setLoading(true);
    const formData = new FormData();

    Object.entries(data).forEach(([k, v]) => {
      if (k === "label" && v === "null") {
        formData.append(k, "");
      } else if (k !== "products" && k !== "image" && v !== undefined && v !== null) {
        formData.append(k, v);
      }
    });

    if (data.products && Array.isArray(data.products)) {
      data.products.forEach((id) => {
        formData.append("products", id);
      });
    }

    if (imageFile instanceof File) {
      formData.append("image", imageFile);
    } else if (data.image === null) {
      formData.append("image", "");
    }

    try {
      if (data.id) {
        await updateGiftSet(data.id, formData, true);
      } else {
        await addGiftSet(formData, true);
      }
      setEditing(null);
      const updatedGiftSets = await getGiftSets();
      
      // Sort gift sets from latest to oldest
      const sortedGiftSets = updatedGiftSets.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return b.id - a.id;
      });
      
      setGiftSets(sortedGiftSets);
      setTotalPages(Math.ceil(sortedGiftSets.length / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error saving gift set:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this gift set?")) {
      setLoading(true);
      await deleteGiftSet(id);
      const updatedGiftSets = await getGiftSets();
      
      // Sort gift sets from latest to oldest
      const sortedGiftSets = updatedGiftSets.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return b.id - a.id;
      });
      
      setGiftSets(sortedGiftSets);
      setTotalPages(Math.ceil(sortedGiftSets.length / ITEMS_PER_PAGE));
      
      // If the current page becomes empty after deletion, go to the previous page
      if (getCurrentPageItems().length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
      
      setLoading(false);
    }
  };

  // Pagination controls component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;
    
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return (
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          «
        </button>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ‹
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1 rounded border"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        
        {pageNumbers.map(page => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded border ${
              currentPage === page ? "bg-[#e5cfa4] text-white" : ""
            }`}
          >
            {page}
          </button>
        ))}
        
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1 rounded border"
            >
              {totalPages}
            </button>
          </>
        )}
        
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ›
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          »
        </button>
      </div>
    );
  };

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div className="mx-auto max-w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-[#bfa170]">Gift Sets</h1>
            <button
              onClick={() => setEditing({})}
              className="bg-[#e5cfa4] hover:bg-[#d1b98a] text-white px-4 py-2 rounded-lg font-semibold shadow transition"
            >
              + Add Gift Set
            </button>
          </div>
          <div className="bg-white rounded-xl border border-[#e5cfa4] shadow overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[#bfa170] border-b">
                  <th className="p-4 w-[30%]">Name</th>
                  <th>Label</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Discount</th>
                  <th>Monthly Special?</th>
                  <th>Image</th>
                  <th>Products</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="text-center py-4">Loading...</td>
                  </tr>
                )}
                {!loading && getCurrentPageItems().map((set) => (
                  <tr key={set.id} className="border-b hover:bg-[#f8f4ed] transition">
                    <td className="p-4 font-medium">{set.name}</td>
                    <td>{set.label}</td>
                    <td>{set.price}</td>
                    <td>{set.stock}</td>
                    <td>{set.discount}</td>
                    <td>{set.is_monthly_special ? "Yes" : "No"}</td>
                    <td>
                      {set.image_url && (
                        <img src={set.image_url || set.image} alt={set.name} className="h-10 w-10 object-contain rounded shadow" />
                      )}
                    </td>
                    <td className="max-w-[180px] truncate">
                      {(set.products || []).map((p) => p.name).join(", ")}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing(set)}
                          className="bg-[#e5cfa4] hover:bg-[#d1b98a] text-white px-3 py-1 rounded font-semibold shadow transition"
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(set.id)}
                          className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded font-semibold shadow transition"
                        >Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <PaginationControls />
          
          {/* Page Info */}
          {!loading && giftSets.length > 0 && (
            <div className="text-center mt-2 text-sm text-gray-600">
              Showing {getCurrentPageItems().length} of {giftSets.length} gift sets
            </div>
          )}
          
          {editing && (
            <GiftSetModal
              giftSet={editing}
              allProducts={products}
              onClose={() => setEditing(null)}
              onSave={handleSave}
            />
          )}
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}

// GiftSetModal component remains the same
function GiftSetModal({ giftSet, allProducts, onClose, onSave }) {
  const [form, setForm] = useState({
    ...giftSet,
    label: giftSet.label === null ? "null" : giftSet.label,
    is_monthly_special: Boolean(giftSet.is_monthly_special),
    products: (giftSet.products || []).map(p => typeof p === "object" ? p.id : p),
  });
  const [file, setFile] = useState(null);
  const fileRef = useRef();

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleMultiSelect(e) {
    const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setForm(f => ({ ...f, products: options }));
  }

  function handleFile(e) {
    const selected = e.target.files[0];
    if (selected instanceof File) setFile(selected);
  }

  function handleRemoveImage() {
    setForm(f => ({ ...f, image: null, image_url: null }));
    setFile(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave(form, file);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-[#e5cfa4] w-full max-w-2xl overflow-y-auto max-h-[95vh]">
        <h2 className="text-xl font-bold mb-4 text-[#bfa170]">
          {form.id ? "Edit" : "Add"} Gift Set
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input name="name" value={form.name || ""} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-sm font-medium">Label</label>
            <select name="label" value={form.label || ""} onChange={handleChange} required className="w-full border px-3 py-2 rounded">
              <option value="">-- Select --</option>
              {LABEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Price</label>
            <input name="price" type="number" step="0.01" value={form.price || ""} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-sm font-medium">Stock</label>
            <input name="stock" type="number" value={form.stock || ""} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-sm font-medium">Discount</label>
            <input name="discount" type="number" step="0.01" value={form.discount || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-sm font-medium">Sold Stock</label>
            <input name="sold_stok" type="number" value={form.sold_stok || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div className="flex gap-2 items-center mt-2">
            <label className="text-sm font-medium">Monthly Special?</label>
            <input type="checkbox" name="is_monthly_special" checked={form.is_monthly_special} onChange={handleChange} />
          </div>
          <div>
            <label className="text-sm font-medium">Products in set</label>
            <select
              multiple
              name="products"
              value={form.products || []}
              onChange={handleMultiSelect}
              className="w-full border px-3 py-2 rounded"
            >
              {allProducts.map(p =>
                <option key={p.id} value={p.id}>{p.name}</option>
              )}
            </select>
            <div className="text-xs text-gray-500">Hold Ctrl (Cmd on Mac) to select multiple</div>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" value={form.description || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mt-4 flex flex-col">
          <label className="text-sm font-medium mb-1">Image</label>
          <div className="flex gap-2 items-center">
            {(form.image_url || form.image) && (
              <div className="relative group">
                <ImageWithFallback src={form.image_url || form.image} alt="Current" className="h-16 rounded shadow" />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 rounded-full bg-red-500 text-white text-xs px-2 py-1 opacity-80 hover:opacity-100"
                  title="Delete"
                >✕</button>
              </div>
            )}
            <label htmlFor="giftset-image-upload" className="bg-[#f8f4ed] border border-[#e5cfa4] px-4 py-2 rounded-lg cursor-pointer hover:bg-[#f3ecd0] w-fit font-semibold text-[#bfa170] shadow transition">
              Choose Photo
              <input type="file" id="giftset-image-upload" accept="image/*" ref={fileRef} onChange={handleFile} className="hidden" />
            </label>
          </div>
          {file && <div className="mt-1 text-xs text-green-600">{file.name}</div>}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" className="px-4 py-2 rounded bg-gray-100 font-semibold" onClick={onClose}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-[#e5cfa4] hover:bg-[#d1b98a] text-white font-semibold shadow transition">Save</button>
        </div>
      </form>
    </div>
  );
}