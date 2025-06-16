import AdminSidebar from "./AdminSidebar";
import logo from "../../assets/logo/sparklore_logo.png";

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen font-sans bg-[#f8f4ed]">
      <AdminSidebar />
      <div className="flex-1 min-h-screen flex flex-col">
        <header className="bg-white shadow-md py-4 px-8 flex items-center justify-between">
          <div className="text-lg font-bold text-[#bfa170] tracking-tight">Sparklore Admin Panel</div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-gray-500 font-medium">Welcome, Admin</div>
            {/* <img
              src={logo}
              alt="Sparklore"
              className="rounded-full border-2 border-[#e5cfa4] w-10 h-10 object-cover"
            /> */}
          </div>
        </header>
        <main className="flex-1 px-6 py-8 bg-[#f8f4ed]">{children}</main>
      </div>
    </div>
  );
}