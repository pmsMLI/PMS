import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Plus,
  Image as ImageIcon,
  X,
  Search,
  Package,
  UploadCloud,
  Loader2,
  Trash2,
  Pencil,
  ShoppingBag,
  Save,
  ArrowLeft,
  LayoutGrid,
  TrendingUp,
  Filter,
  Layers,
  CheckCircle2
} from "lucide-react";

/* ---------- TYPES ---------- */
interface Product {
  id: string;
  product_code: string;
  name: string; // Category
  size: string;
  quantity: number;
  cost: number;
  image_url?: string;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ---------- FILTERS ---------- */
  const [category, setCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false); // New Filter State

  /* ---------- MODALS & EDIT STATE ---------- */
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(true); 
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ---------- FORM STATE ---------- */
  const [form, setForm] = useState({
    product_code: "",
    name: "",
    size: "",
    quantity: "",
    cost: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  /* ---------- SELL INPUT STATE ---------- */
  const [sellQty, setSellQty] = useState<Record<string, number>>({});

  /* ---------- FETCH ---------- */
  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("inventory")
      .select("*")
      .order("created_at", { ascending: false });

    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* ---------- CALCULATE STATS ---------- */
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const totalStock = products.reduce((acc, curr) => acc + curr.quantity, 0);
    const lowStock = products.filter((p) => p.quantity < 10).length;
    const totalValue = products.reduce((acc, curr) => acc + (curr.cost * curr.quantity), 0);

    return { totalProducts, totalStock, lowStock, totalValue };
  }, [products]);

  /* ---------- DERIVED STATE ---------- */
  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.name))).sort(),
    [products]
  );

  const sizes = useMemo(
    () => Array.from(new Set(products.map((p) => p.size))).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let res = products;

    // 1. Filter by Low Stock Toggle
    if (showLowStockOnly) {
        res = res.filter(p => p.quantity < 10);
    }

    // 2. Filter by Category
    if (category !== "All") res = res.filter((p) => p.name === category);

    // 3. Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter(
        (p) =>
          p.product_code.toLowerCase().includes(q) ||
          p.name.toLowerCase().includes(q) ||
          p.size.toLowerCase().includes(q)
      );
    }
    return res;
  }, [products, category, searchQuery, showLowStockOnly]);

  /* ---------- HANDLERS ---------- */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setForm({ product_code: "", name: "", size: "", quantity: "", cost: "" });
    setImageFile(null);
    setImagePreviewUrl(null);
    setEditingId(null);
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      product_code: p.product_code,
      name: p.name,
      size: p.size,
      quantity: String(p.quantity),
      cost: String(p.cost),
    });
    setImagePreviewUrl(p.image_url || null);
    setIsFormOpen(true);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    await supabase.from("inventory").delete().eq("id", id);
    fetchProducts();
  };

  const handleSubmit = async () => {
    if (!form.product_code || !form.name) return;
    setIsSubmitting(true);

    let imageUrl: string | null = imagePreviewUrl;

    if (imageFile) {
      const ext = imageFile.name.split(".").pop();
      const path = `public/${form.product_code}-${Date.now()}.${ext}`;

      await supabase.storage
        .from("inventory-images")
        .upload(path, imageFile, { upsert: true });

      const { data } = supabase.storage
        .from("inventory-images")
        .getPublicUrl(path);

      imageUrl = data.publicUrl;
    }

    const payload = {
      product_code: form.product_code,
      name: form.name,
      size: form.size,
      quantity: Number(form.quantity),
      cost: Number(form.cost),
      image_url: imageUrl,
    };

    if (editingId) {
      await supabase.from("inventory").update(payload).eq("id", editingId);
    } else {
      await supabase.from("inventory").insert(payload);
    }

    resetForm();
    setIsSubmitting(false);
    fetchProducts();
  };

  const sellItems = async (p: Product) => {
    const qty = sellQty[p.id] || 0;
    if (qty <= 0 || qty > p.quantity) return;

    await supabase
      .from("inventory")
      .update({ quantity: p.quantity - qty })
      .eq("id", p.id);

    setSellQty({ ...sellQty, [p.id]: 0 });
    fetchProducts();
  };

  /* ---------- UI ---------- */
  return (
    <div className="min-h-screen bg-[#F3F4F6] font-sans text-slate-900 pb-20">
      
      {/* --- TOP HEADER BAR --- */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
         <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200">
                <img src="/llogo.jpg" alt="Logo" className="w-full h-full object-cover" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-slate-800 leading-tight">Inventory</h1>
                <p className="text-xs text-slate-500">Manage your products and stock levels</p>
             </div>
         </div>

         <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600" size={16} />
                <input 
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
                <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="appearance-none bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 pl-4 pr-10 rounded-xl text-sm cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 transition-colors"
                >
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
            </div>

             <a href="/" className="p-2.5 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                <ArrowLeft size={20} />
             </a>
         </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 space-y-8">
        
        {/* --- STATS ROW --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-sm font-medium">Total Products</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalProducts}</h3>
                    <p className="text-xs text-slate-400 mt-1">Unique items</p>
                </div>
                <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Package size={24} />
                </div>
            </div>

             <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-sm font-medium">Total Stock</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalStock.toLocaleString()}</h3>
                    <p className="text-xs text-slate-400 mt-1">Units available</p>
                </div>
                <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Layers size={24} />
                </div>
            </div>

            {/* CLICKABLE LOW STOCK CARD */}
             <div 
                onClick={() => setShowLowStockOnly(!showLowStockOnly)}
                className={`p-5 rounded-2xl border shadow-sm flex items-center justify-between cursor-pointer transition-all active:scale-95 ${
                    showLowStockOnly 
                    ? "bg-red-50 border-red-200 ring-2 ring-red-200" 
                    : "bg-white border-slate-100 hover:border-red-200"
                }`}
             >
                <div>
                    <p className={`${showLowStockOnly ? "text-red-700" : "text-slate-500"} text-sm font-medium`}>
                        {showLowStockOnly ? "Filtering Low Stock" : "Low Stock"}
                    </p>
                    <h3 className={`text-2xl font-bold mt-1 ${showLowStockOnly ? "text-red-800" : "text-slate-800"}`}>
                        {stats.lowStock}
                    </h3>
                    <p className={`${showLowStockOnly ? "text-red-600" : "text-slate-400"} text-xs mt-1`}>
                        {showLowStockOnly ? "Tap to show all" : "Items need attention"}
                    </p>
                </div>
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${showLowStockOnly ? "bg-white text-red-600" : "bg-red-50 text-red-500"}`}>
                    <AlertTriangle size={24} />
                </div>
            </div>

             <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-slate-500 text-sm font-medium">Inventory Value</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{stats.totalValue.toLocaleString()}</h3>
                    <p className="text-xs text-slate-400 mt-1">Total worth</p>
                </div>
                <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={24} />
                </div>
            </div>
        </div>

        {/* --- ADD PRODUCT SECTION (BLUE THEME) --- */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header Bar */}
            <div 
                className="bg-blue-600 px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-blue-700 transition-colors"
                onClick={() => {
                   if(editingId) resetForm();
                   setIsFormOpen(!isFormOpen);
                }}
            >
                <div className="flex items-center gap-3 text-white">
                    <div className="bg-white/20 p-1.5 rounded-lg">
                        {editingId ? <Pencil size={18} /> : <Plus size={18} />}
                    </div>
                    <div>
                        <h2 className="font-semibold text-base">{editingId ? "Edit Product" : "Add New Product"}</h2>
                        <p className="text-xs text-blue-100 font-light">Fill in the details below</p>
                    </div>
                </div>
                <div className="text-white/80 hover:text-white transition-colors">
                     {isFormOpen ? <X size={20}/> : <Plus size={20}/>}
                </div>
            </div>

            {/* Form Body */}
            <AnimatePresence>
            {isFormOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                >
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                        
                        {/* Image Upload - Left Side */}
                        <div className="lg:col-span-3">
                            <label className={`
                                flex flex-col items-center justify-center w-full h-40 rounded-xl border-2 border-dashed 
                                transition-all cursor-pointer overflow-hidden bg-slate-50 hover:bg-slate-100 hover:border-blue-400
                                ${imagePreviewUrl ? "border-blue-600" : "border-slate-300"}
                            `}>
                                {imagePreviewUrl ? (
                                    <div className="relative w-full h-full group">
                                         <img src={imagePreviewUrl} className="w-full h-full object-cover" alt="Preview" />
                                         <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                             <p className="text-white text-xs font-medium">Change</p>
                                         </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-slate-400">
                                        <UploadCloud size={24} className="mb-2" />
                                        <p className="text-xs font-medium">Upload Image</p>
                                    </div>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>

                        {/* Inputs - Right Side */}
                        <div className="lg:col-span-9 flex flex-col justify-between">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500">Product Code *</label>
                                    <input
                                        value={form.product_code}
                                        onChange={(e) => setForm({ ...form, product_code: e.target.value })}
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                        placeholder="Code"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500">Category *</label>
                                    <input
                                        list="cat-list"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                        placeholder="Category"
                                    />
                                    <datalist id="cat-list">
                                        {categories.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500">Size (opt)</label>
                                    <input
                                        list="size-list"
                                        value={form.size}
                                        onChange={(e) => setForm({ ...form, size: e.target.value })}
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                        placeholder="Size"
                                    />
                                    <datalist id="size-list">
                                        {sizes.map(s => <option key={s} value={s} />)}
                                    </datalist>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500">Quantity</label>
                                    <input
                                        type="number"
                                        value={form.quantity}
                                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                        placeholder="0"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500">Cost (₹)</label>
                                    <input
                                        type="number"
                                        value={form.cost}
                                        onChange={(e) => setForm({ ...form, cost: e.target.value })}
                                        className="w-full bg-slate-50 text-slate-900 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-600 outline-none transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                {editingId && (
                                    <button 
                                        onClick={resetForm}
                                        className="px-5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-sm shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-70"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : editingId ? <Save size={16} /> : <Plus size={16} />}
                                    {editingId ? "Update Product" : "Add Product"}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>

        {/* --- PRODUCTS TITLE --- */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
             <div className="flex items-center gap-2 text-slate-500">
                <LayoutGrid size={18} />
                <h3 className="font-semibold text-lg text-slate-700">Products ({filteredProducts.length})</h3>
             </div>
             {showLowStockOnly && (
                 <button onClick={() => setShowLowStockOnly(false)} className="text-xs text-red-500 flex items-center gap-1 hover:underline">
                    <X size={12}/> Clear Low Stock Filter
                 </button>
             )}
        </div>

        {/* --- GRID --- */}
        {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
                <Loader2 className="animate-spin mr-2" /> Loading inventory...
            </div>
        ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-slate-400" size={32}/>
                </div>
                <h3 className="text-slate-900 font-medium text-lg">No products found</h3>
                {showLowStockOnly && <p className="text-slate-500 text-sm mt-1">Great job! No items are low in stock.</p>}
            </div>
        ) : (
          <motion.div 
            layout 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence>
            {filteredProducts.map((p) => {
              const isLowStock = p.quantity < 10;
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={p.id}
                  className={`bg-white rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col ${isLowStock ? "border-red-200 shadow-red-50" : "border-slate-200"}`}
                >
                  {/* IMAGE AREA */}
                  <div className="relative h-48 overflow-hidden bg-slate-100 shrink-0">
                     {/* Floating Action Buttons (Hover) */}
                     <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(p)} className="bg-white/90 p-2 rounded-full text-slate-600 hover:text-blue-600 shadow-sm"><Pencil size={14}/></button>
                        <button onClick={() => handleDelete(p.id)} className="bg-white/90 p-2 rounded-full text-slate-600 hover:text-red-600 shadow-sm"><Trash2 size={14}/></button>
                     </div>

                     <div onClick={() => setPreviewImage(p.image_url || null)} className="w-full h-full cursor-pointer">
                        {p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={40} /></div>
                        )}
                     </div>

                     {/* Badges */}
                     <div className="absolute bottom-2 left-2 flex gap-2">
                         {isLowStock && (
                            <span className="bg-red-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                                <AlertTriangle size={10} /> Low Stock
                            </span>
                         )}
                         <span className="bg-white/90 backdrop-blur text-slate-700 text-[10px] font-bold px-2 py-1 rounded-md">
                            {p.quantity} in stock
                         </span>
                     </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-800 line-clamp-1">{p.name}</h3>
                          <span className="text-xs font-medium bg-slate-100 px-2 py-1 rounded text-slate-600">{p.size}</span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium mb-3">{p.product_code}</p>
                      
                      <div className="mt-auto pt-3 border-t border-slate-100">
                          <div className="flex justify-between items-center mb-3">
                             <span className="text-sm font-semibold text-slate-900">₹{p.cost}</span>
                          </div>

                          {/* BIGGER SELL BUTTONS & INPUT */}
                          <div className="flex gap-2">
                             <input 
                                type="number" 
                                min={1} max={p.quantity} 
                                placeholder="Qty"
                                value={sellQty[p.id] || ""}
                                onChange={(e) => setSellQty({ ...sellQty, [p.id]: Number(e.target.value) })}
                                className="w-20 text-center text-sm font-medium text-slate-900 bg-slate-50 border border-slate-200 rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder:text-slate-400"
                             />
                             <button 
                                onClick={() => sellItems(p)}
                                disabled={!sellQty[p.id]}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium text-sm rounded-lg py-2 transition-colors flex items-center justify-center gap-2"
                             >
                                <ShoppingBag size={16} /> Sell
                             </button>
                          </div>
                      </div>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* --- PREVIEW MODAL --- */}
      <AnimatePresence>
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl w-full">
            <img src={previewImage} className="max-h-[85vh] w-auto mx-auto object-contain rounded-lg shadow-2xl" />
            <button className="absolute -top-10 right-0 text-white" onClick={() => setPreviewImage(null)}><X size={32}/></button>
          </div>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}