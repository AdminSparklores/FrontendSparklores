import AdminLayout from "../../components/Admin/AdminLayout";
import { useEffect, useState } from "react";
import {BASE_URL} from "../../utils/api"

export default function AdminBanner() {
  const [iframeKey, setIframeKey] = useState(0);

  // Force iframe reload when URL changes
  const refreshIframe = () => setIframeKey(prev => prev + 1);
  const link = `${BASE_URL}/admin/api/pagebanner/`
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