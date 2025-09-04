import AdminLayout from "../../components/Admin/AdminLayout";
import { useEffect, useState, useRef } from "react";
import { getCharms, addCharm, updateCharm, deleteCharm } from "../../utils/admin_api";
import AdminRouteGuard from "../../components/Admin/adminRouteGuard";

const CATEGORY_OPTIONS = [
  { value: "alphabet", label: "Alphabet" },
  { value: "birthstone", label: "Birthstone" },
  { value: "birthstone_mini", label: "Birthstone Mini" },
  { value: "birth_flower", label: "Birth Flower" },
  { value: "number", label: "Number" },
  { value: "special", label: "Sparklore's Special" },
  { value: "zodiac", label: "Zodiac" },
];

const LABEL_OPTIONS = [
  { value: "gold", label: "Gold" },
  { value: "silver", label: "Silver" },
  { value: "rose_gold", label: "Rose Gold" },
  { value: "null", label: "No Label" },
];

// Items per page configuration
const ITEMS_PER_PAGE = 10;

export default function AdminCharms() {
  const [charms, setCharms] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    getCharms().then((data) => {
      // Sort charms from latest to oldest (assuming there's a createdAt field)
      const sortedCharms = data.sort((a, b) => {
        // If you have a createdAt field, use it for sorting
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        // Fallback: sort by ID in descending order (assuming newer items have higher IDs)
        return b.id - a.id;
      });
      
      setCharms(sortedCharms);
      setTotalPages(Math.ceil(sortedCharms.length / ITEMS_PER_PAGE));
      setLoading(false);
    });
  }, []);

  // Calculate the current page items
  const getCurrentPageItems = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return charms.slice(startIndex, endIndex);
  };

  const handleSave = async (data, imageFile) => {
    setLoading(true);
    const formData = new FormData();

    // Only include fields with values
    Object.entries(data).forEach(([k, v]) => {
      if (k === "label" && v === "null") {
        formData.append(k, "");
      } else if (k !== "image" && v !== undefined && v !== null) {
        formData.append(k, v);
      }
    });

    // Only include image if a new one is selected
    if (imageFile instanceof File) {
      formData.append("image", imageFile);
    }

    try {
      if (data.id) {
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }
        await updateCharm(data.id, formData, true); // PATCH
      } else {
        await addCharm(formData, true); // POST
      }
      setEditing(null);
      const updatedCharms = await getCharms();
      
      // Sort charms from latest to oldest
      const sortedCharms = updatedCharms.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return b.id - a.id;
      });
      
      setCharms(sortedCharms);
      setTotalPages(Math.ceil(sortedCharms.length / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error saving charm:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this charm?")) {
      setLoading(true);
      await deleteCharm(id);
      const updatedCharms = await getCharms();
      
      // Sort charms from latest to oldest
      const sortedCharms = updatedCharms.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        return b.id - a.id;
      });
      
      setCharms(sortedCharms);
      setTotalPages(Math.ceil(sortedCharms.length / ITEMS_PER_PAGE));
      
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
            <h1 className="text-xl font-bold text-[#bfa170]">Charms</h1>
            <button
              onClick={() => setEditing({})}
              className="bg-[#e5cfa4] hover:bg-[#d1b98a] text-white px-4 py-2 rounded-lg font-semibold shadow transition"
            >
              + Add Charm
            </button>
          </div>
          <div className="bg-white rounded-xl border border-[#e5cfa4] shadow overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[#bfa170] border-b">
                  <th className="p-4 w-[20%]">Name</th>
                  <th>Category</th>
                  <th>Label</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Rating</th>
                  <th>Discount</th>
                  <th>Image</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={9} className="text-center py-4">Loading...</td>
                  </tr>
                )}
                {!loading && getCurrentPageItems().map((charm) => (
                  <tr key={charm.id} className="border-b hover:bg-[#f8f4ed] transition">
                    <td className="p-4 font-medium">{charm.name}</td>
                    <td>{charm.category}</td>
                    <td>{charm.label}</td>
                    <td>{charm.price}</td>
                    <td>{charm.stock}</td>
                    <td>{charm.rating}</td>
                    <td>{charm.discount}</td>
                    <td>
                      {charm.image && (
                        <img src={charm.image} alt={charm.name} className="h-10 w-10 object-contain rounded shadow" />
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditing(charm)}
                          className="bg-[#e5cfa4] hover:bg-[#d1b98a] text-white px-3 py-1 rounded font-semibold shadow transition"
                        >Edit</button>
                        <button
                          onClick={() => handleDelete(charm.id)}
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
          {!loading && charms.length > 0 && (
            <div className="text-center mt-2 text-sm text-gray-600">
              Showing {getCurrentPageItems().length} of {charms.length} charms
            </div>
          )}
          
          {editing && (
            <CharmModal
              charm={editing}
              onClose={() => setEditing(null)}
              onSave={handleSave}
            />
          )}
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}

// CharmModal component remains the same
function CharmModal({ charm, onClose, onSave }) {
  const [form, setForm] = useState({
    ...charm,
    label: charm.label === null ? "null" : charm.label,
  });
  const [file, setFile] = useState(null);
  const fileRef = useRef();
  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }
  function handleFile(e) {
    const selected = e.target.files[0];
    if (selected instanceof File) {
      setFile(selected);
    }
  }
  function handleSubmit(e) {
    e.preventDefault();
    onSave(form, file);
  }
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-[#e5cfa4] w-full max-w-xl">
        <h2 className="text-xl font-bold mb-4 text-[#bfa170]">
          {form.id ? "Edit" : "Add"} Charm
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input name="name" value={form.name || ""} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-sm font-medium">Category</label>
            <select name="category" value={form.category || ""} onChange={handleChange} required className="w-full border px-3 py-2 rounded">
              <option value="">-- Select --</option>
              {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
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
            <label className="text-sm font-medium">Rating</label>
            <input name="rating" type="number" step="0.01" value={form.rating || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-sm font-medium">Discount</label>
            <input name="discount" type="number" step="0.01" value={form.discount || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
          <div>
            <label className="text-sm font-medium">Sold Stock</label>
            <input name="sold_stok" type="number" value={form.sold_stok || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
          </div>
        </div>
        <div className="mt-4">
          <label className="text-sm font-medium">Description</label>
          <textarea name="description" value={form.description || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>
        <div className="mt-4 flex flex-col">
          <label className="text-sm font-medium mb-1">Image</label>
          <label htmlFor="charm-image-upload" className="bg-[#f8f4ed] border border-[#e5cfa4] px-4 py-2 rounded-lg cursor-pointer hover:bg-[#f3ecd0] w-fit font-semibold text-[#bfa170] shadow transition">
            Choose Photo
            <input type="file" id="charm-image-upload" accept="image/*" ref={fileRef} onChange={handleFile} className="hidden" />
          </label>

          {/* Show New Image Preview if file selected, otherwise show existing image */}
          {(file || form.image) && (
            <div className="mt-3 rounded shadow w-48 h-48 overflow-hidden border border-gray-200 relative">
              <img
                src={file ? URL.createObjectURL(file) : form.image}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            </div>
          )}

          {/* Show filename if new file selected */}
          {file && (
            <div className="mt-1 text-xs text-green-600 flex items-center gap-1">
              📎 {file.name}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" className="px-4 py-2 rounded bg-gray-100 font-semibold" onClick={onClose}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-[#e5cfa4] hover:bg-[#d1b98a] text-white font-semibold shadow transition">Save</button>
        </div>
      </form>
    </div>
  );
}