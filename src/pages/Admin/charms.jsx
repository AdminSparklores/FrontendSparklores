import AdminLayout from "../../components/Admin/AdminLayout";
import { useEffect, useState, useRef } from "react";
import { getCharms, addCharm, updateCharm, deleteCharm } from "../../utils/admin_api";

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

export default function AdminCharms() {
  const [charms, setCharms] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCharms().then((data) => {
      setCharms(data);
      setLoading(false);
    });
  }, []);

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
      setCharms(updatedCharms);
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
      setCharms(updatedCharms);
      setLoading(false);
    }
  };

  return (
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
              {!loading &&
                charms.map((charm) => (
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
        {editing && (
          <CharmModal
            charm={editing}
            onClose={() => setEditing(null)}
            onSave={handleSave}
          />
        )}
      </div>
    </AdminLayout>
  );
}

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
          {form.image && <img src={form.image} alt="Current" className="h-16 mt-2 rounded shadow" />}
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
