import AdminLayout from "../../components/Admin/AdminLayout";
import { useState } from "react";
import { BASE_URL } from "../../utils/api";
import AdminRouteGuard from "../../components/Admin/adminRouteGuard";

export default function AdminProducts() {
  const [iframeKey, setIframeKey] = useState(0);
  const refreshIframe = () => setIframeKey(prev => prev + 1);
  const link = `${BASE_URL}/admin/api/product/`;

  return (
    <AdminRouteGuard>
      <AdminLayout>
        <div style={{ width: '100%', height: '100vh' }} className="p-[1rem]">
          <iframe
            key={iframeKey}
            src={link}
            title="Admin Panel"
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="fullscreen *"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <button 
            onClick={refreshIframe}
            style={{ 
              position: 'absolute', 
              top: 63, 
              right: 10, 
              zIndex: 1000,
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Refresh Iframe
          </button>
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}