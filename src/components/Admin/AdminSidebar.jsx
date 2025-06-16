import { NavLink } from "react-router-dom";
import logo from "../../assets/logo/sparklore_logo.png";

const links = [
  { name: "Orders", to: "/admin/dashboard", icon: "📋" },
//   { name: "Dashboard", to: "/admin/dashboard", icon: "🏠" },
  { name: "Products", to: "/admin/products", icon: "📦" },
  { name: "Charms", to: "/admin/charms", icon: "💎" },
  { name: "Gift Sets", to: "/admin/giftsets", icon: "🎁" },
  { name: "Discount Campaign", to: "/admin/discount", icon: "📢" },
  { name: "Footer Gallery", to: "/admin/photoGallery", icon: "📸" },
  { name: "Page Banners", to: "/admin/pageBanner", icon: "📷" },


];

export default function AdminSidebar() {
  return (
    <aside className="h-screen bg-white border-r border-[#e5cfa4] min-w-[220px] px-6 py-8 flex flex-col items-center shadow-lg">
      <div className="mb-10 flex flex-col items-center gap-2">
        <img
          src={logo}
          alt="Admin"
          className="w-[10rem]"
        />
        <div className="font-semibold text-lg text-[#bfa170]">Admin</div>
        <span className="text-xs text-gray-400">Sparklore Dashboard</span>
      </div>
      <nav className="flex-1 w-full">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium mb-2 transition
              ${isActive ? "bg-[#e5cfa4] text-white shadow" : "text-gray-700 hover:bg-[#f8f4ed]"}`
            }
          >
            <span className="text-xl">{link.icon}</span>
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}