import AdminLayout from "../../components/Admin/AdminLayout";
import { useEffect, useState } from "react";
import {BASE_URL} from "../../utils/api"

export default function AdminProducts() {
  const [iframeKey, setIframeKey] = useState(0);

  // Force iframe reload when URL changes
  const refreshIframe = () => setIframeKey(prev => prev + 1);
  const link = `${BASE_URL}/admin/api/product/`
  return (
    <AdminLayout>
      <div style={{ width: '100%', height: '100vh' }} className="p-[1rem]">
        <iframe
          key={iframeKey}
          src={link}
          title="Admin Panel"
          style={{ width: '100%', height: '100%', border: 'none' }}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
          // Add these attributes
          allow="fullscreen *"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <button 
          onClick={refreshIframe}
          style={{ position: 'absolute', top: 70, right: 10, zIndex: 1000 }}
        >
          Refresh Iframe
        </button>
      </div>
    </AdminLayout>
  );
}

// import AdminLayout from "../../components/Admin/AdminLayout";
// import { useEffect, useState, useRef } from "react";
// import {
//   getProducts,
//   addProduct,
//   updateProduct,
//   deleteProduct,
//   addProductImage,
//   deleteProductImage,
// } from "../../utils/admin_api";

// // These should match your backend choices
// const CATEGORY_OPTIONS = [
//   { value: "necklace", label: "Necklace" },
//   { value: "bracelet", label: "Bracelet" },
//   { value: "earring", label: "Earring" },
//   { value: "ring", label: "Ring" },
//   { value: "anklet", label: "Anklet" },
//   { value: "jewel_set", label: "Jewel Set" },
//   { value: "charm", label: "Charm" },
// ];
// const LABEL_OPTIONS = [
//   { value: "gold", label: "Gold" },
//   { value: "silver", label: "Silver" },
//   { value: "rose_gold", label: "Rose Gold" },
//   { value: "null", label: "No Label" },
// ];

// export default function AdminProducts() {
//   const [products, setProducts] = useState([]);
//   const [editing, setEditing] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     getProducts().then((data) => {
//       setProducts(data);
//       setLoading(false);
//     });
//   }, []);

//   const handleSave = async (data) => {
//     setLoading(true);
//     // Save all product fields except images
//     const formData = new FormData();
//     Object.entries(data).forEach(([k, v]) => {
//       if (k === "jewel_set_products" && Array.isArray(v)) {
//         v.forEach(val => formData.append("jewel_set_products", val));
//       } else if (k !== "images" && k !== "id" && v !== undefined && v !== null) {
//         formData.append(k, v);
//       }
//     });
//     if (data.id) {
//       await updateProduct(data.id, formData, true);
//     } else {
//       await addProduct(formData, true);
//     }
//     setEditing(null);
//     getProducts().then((data) => {
//       setProducts(data);
//       setLoading(false);
//     });
//   };

//   const handleDelete = async (id) => {
//     if (window.confirm("Are you sure you want to delete this product?")) {
//       setLoading(true);
//       await deleteProduct(id);
//       getProducts().then((data) => {
//         setProducts(data);
//         setLoading(false);
//       });
//     }
//   };

//   return (
//     <AdminLayout>
//       <div className="mx-auto max-w-full">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-xl font-bold text-[#bfa170]">Products</h1>
//           <button
//             onClick={() => setEditing({})}
//             className="bg-[#e5cfa4] hover:bg-[#d1b98a] text-white px-4 py-2 rounded-lg font-semibold shadow transition"
//           >
//             + Add Product
//           </button>
//         </div>
//         <div className="bg-white rounded-xl border border-[#e5cfa4] shadow overflow-x-auto">
//           <table className="w-full text-left text-sm">
//             <thead>
//               <tr className="text-[#bfa170] border-b">
//                 <th className="p-4">Name</th>
//                 <th>Category</th>
//                 <th>Label</th>
//                 <th>Price</th>
//                 <th>Stock</th>
//                 <th>Rating</th>
//                 <th>Discount</th>
//                 <th>Charms</th>
//                 <th>Images</th>
//                 <th></th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading && (
//                 <tr>
//                   <td colSpan={10} className="text-center py-4">Loading...</td>
//                 </tr>
//               )}
//               {!loading &&
//                 products.map((prod) => (
//                   <tr key={prod.id} className="border-b hover:bg-[#f8f4ed] transition">
//                     <td className="p-4 font-medium w-[30%]">{prod.name}</td>
//                     <td>{prod.category}</td>
//                     <td>{prod.label}</td>
//                     <td>{prod.price}</td>
//                     <td>{prod.stock}</td>
//                     <td>{prod.rating}</td>
//                     <td>{prod.discount}</td>
//                     <td>{prod.charms ? "Yes" : "No"}</td>
//                     <td>
//                       {(prod.images || []).slice(0, 2).map((img) => (
//                         <img key={img.id || img.image_url} src={img.image_url || img.image} alt={img.alt_text} className="h-8 w-8 inline object-cover rounded mr-1" />
//                       ))}
//                       {prod.images && prod.images.length > 2 && <span className="text-xs text-gray-400 ml-1">+{prod.images.length - 2}</span>}
//                     </td>
//                     <td>
//                       <div className="flex gap-2">
//                         <button
//                           onClick={() => setEditing(prod)}
//                           className="bg-[#e5cfa4] hover:bg-[#d1b98a] text-white px-3 py-1 rounded font-semibold shadow transition"
//                         >Edit</button>
//                         <button
//                           onClick={() => handleDelete(prod.id)}
//                           className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded font-semibold shadow transition"
//                         >Delete</button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//             </tbody>
//           </table>
//         </div>
//         {editing && (
//           <ProductModal
//             product={editing}
//             allProducts={products}
//             onClose={() => setEditing(null)}
//             onSave={handleSave}
//           />
//         )}
//       </div>
//     </AdminLayout>
//   );
// }

// function ProductModal({ product, allProducts, onClose, onSave }) {
//   const [form, setForm] = useState({
//     ...product,
//     label: product.label ?? "null",
//     charms: Boolean(product.charms),
//     jewel_set_products: (product.jewel_set_products || []).map(p => typeof p === "object" ? p.id : p),
//   });
//   const [images, setImages] = useState([...((product.images || []))]);
//   const [imageLoading, setImageLoading] = useState(false);
//   const fileRef = useRef();

//   function handleChange(e) {
//     const { name, value, type, checked } = e.target;
//     setForm(f => ({
//       ...f,
//       [name]: type === "checkbox" ? checked : value,
//     }));
//   }

//   function handleMultiSelect(e) {
//     const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
//     setForm(f => ({ ...f, jewel_set_products: options }));
//   }

//   async function handleFile(e) {
//     const files = e.target.files;
//     if (!files.length || !form.id) return;
//     setImageLoading(true);
//     for (let file of files) {
//       const img = await addProductImage(form.id, file);
//       setImages(prev => [...prev, img]);
//     }
//     setImageLoading(false);
//   }

//   async function handleDeleteImage(imageId) {
//     if (!window.confirm("Delete this image?")) return;
//     setImageLoading(true);
//     await deleteProductImage(imageId);
//     setImages(prev => prev.filter(img => img.id !== imageId));
//     setImageLoading(false);
//   }

//   function handleSubmit(e) {
//     e.preventDefault();
//     // Attach images to form for display only, not for saving
//     onSave({ ...form, images });
//   }

//   return (
//     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//       <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-[#e5cfa4] w-full max-w-2xl overflow-y-auto max-h-[95vh]">
//         <h2 className="text-xl font-bold mb-4 text-[#bfa170]">
//           {form.id ? "Edit" : "Add"} Product
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           <div>
//             <label className="text-sm font-medium">Name</label>
//             <input name="name" value={form.name || ""} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
//           </div>
//           <div>
//             <label className="text-sm font-medium">Category</label>
//             <select name="category" value={form.category || ""} onChange={handleChange} required className="w-full border px-3 py-2 rounded">
//               <option value="">-- Select --</option>
//               {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//             </select>
//           </div>
//           <div>
//             <label className="text-sm font-medium">Label</label>
//             <select name="label" value={form.label || ""} onChange={handleChange} required className="w-full border px-3 py-2 rounded">
//               <option value="">-- Select --</option>
//               {LABEL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
//             </select>
//           </div>
//           <div>
//             <label className="text-sm font-medium">Price</label>
//             <input name="price" type="number" step="0.01" value={form.price || ""} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
//           </div>
//           <div>
//             <label className="text-sm font-medium">Stock</label>
//             <input name="stock" type="number" value={form.stock || ""} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
//           </div>
//           <div>
//             <label className="text-sm font-medium">Rating</label>
//             <input name="rating" type="number" step="0.01" value={form.rating || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
//           </div>
//           <div>
//             <label className="text-sm font-medium">Discount</label>
//             <input name="discount" type="number" step="0.01" value={form.discount || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
//           </div>
//           <div>
//             <label className="text-sm font-medium">Sold Stock</label>
//             <input name="sold_stok" type="number" value={form.sold_stok || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
//           </div>
//           <div className="flex gap-2 items-center mt-2">
//             <label className="text-sm font-medium">Has Charms?</label>
//             <input type="checkbox" name="charms" checked={form.charms} onChange={handleChange} />
//           </div>
//           <div>
//             <label className="text-sm font-medium">Jewel Set Products (if any)</label>
//             <select
//               multiple
//               name="jewel_set_products"
//               value={form.jewel_set_products || []}
//               onChange={handleMultiSelect}
//               className="w-full border px-3 py-2 rounded"
//             >
//               {allProducts.filter(p => !form.id || p.id !== form.id).map(p =>
//                 <option key={p.id} value={p.id}>{p.name}</option>
//               )}
//             </select>
//             <div className="text-xs text-gray-500">Hold Ctrl (Cmd on Mac) to select multiple</div>
//           </div>
//         </div>
//         <div className="mt-4">
//           <label className="text-sm font-medium">Description</label>
//           <textarea name="description" value={form.description || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
//         </div>
//         <div className="mt-4">
//           <label className="text-sm font-medium">Details</label>
//           <textarea name="details" value={form.details || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
//         </div>
//         <div className="mt-4 flex flex-col">
//           <label className="text-sm font-medium mb-1">Images</label>
//           <div className="flex flex-wrap gap-2 mb-2">
//             {images.map(img => (
//               <div key={img.id} className="relative group">
//                 <img src={img.image_url || img.image} alt={img.alt_text} className="h-12 w-12 object-cover rounded" />
//                 <button
//                   type="button"
//                   onClick={() => handleDeleteImage(img.id)}
//                   className="absolute top-0 right-0 rounded-full bg-red-500 text-white text-xs px-2 py-1 opacity-80 hover:opacity-100"
//                   title="Delete"
//                   disabled={imageLoading}
//                 >✕</button>
//               </div>
//             ))}
//           </div>
//           {form.id && (
//             <>
//               <label htmlFor="product-image-upload" className="bg-[#f8f4ed] border border-[#e5cfa4] px-4 py-2 rounded-lg cursor-pointer hover:bg-[#f3ecd0] w-fit font-semibold text-[#bfa170] shadow transition mb-1">
//                 Add Photo(s)
//                 <input type="file" id="product-image-upload" accept="image/*" ref={fileRef} onChange={handleFile} className="hidden" multiple />
//               </label>
//               {imageLoading && <div className="text-sm text-[#bfa170]">Uploading...</div>}
//             </>
//           )}
//         </div>
//         <div className="flex justify-end gap-3 mt-6">
//           <button type="button" className="px-4 py-2 rounded bg-gray-100 font-semibold" onClick={onClose}>Cancel</button>
//           <button type="submit" className="px-4 py-2 rounded bg-[#e5cfa4] hover:bg-[#d1b98a] text-white font-semibold shadow transition">Save</button>
//         </div>
//       </form>
//     </div>
//   );
// }