import React from "react";

const Faq = () => {
  return (
    <div className="bg-[#f8f4ed] min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Pertanyaan yang Sering Diajukan (FAQ)</h1>

        <div className="bg-white p-6 rounded-lg border border-[#e5cfa4] shadow-sm mb-8">
          <div className="space-y-6">

            <div className="border-b border-[#f0f0f0] pb-4">
              <h3 className="text-lg font-medium text-gray-700">Apakah aksesoris di toko ini terbuat dari bahan asli titanium?</h3>
              <p className="text-gray-600 mt-2">
                Ya, semua produk kami terbuat dari titanium berkualitas tinggi yang tahan lama dan tidak mudah berkarat.
              </p>
            </div>

            <div className="border-b border-[#f0f0f0] pb-4">
              <h3 className="text-lg font-medium text-gray-700">Apa keunggulan titanium dibanding bahan lain seperti stainless steel atau perak?</h3>
              <p className="text-gray-600 mt-2">
                Titanium memiliki beberapa keunggulan:<br />
                • Anti karat dan anti noda, bahkan saat terkena air atau keringat.<br />
                • Ringan tapi sangat kuat, nyaman dipakai sehari-hari.<br />
                • Hypoallergenic, aman untuk kulit sensitif.<br />
                • Tidak berubah warna atau kusam dalam jangka panjang.
              </p>
            </div>

            <div className="border-b border-[#f0f0f0] pb-4">
              <h3 className="text-lg font-medium text-gray-700">Apakah aksesoris ini bisa dipakai saat mandi atau berenang?</h3>
              <p className="text-gray-600 mt-2">
                Tentu bisa dong! Karena berbahan titanium anti karat, produk kami aman dipakai saat mandi, berenang, maupun terkena air laut.
              </p>
            </div>

            <div className="border-b border-[#f0f0f0] pb-4">
              <h3 className="text-lg font-medium text-gray-700">Apakah warna titanium bisa memudar?</h3>
              <p className="text-gray-600 mt-2">
                Warna alami titanium (Silver) tidak akan memudar. Namun untuk produk kami yang berwarna Gold (lapisan emas 18K), kami menyarankan untuk menghindari zat kimia keras agar warna tetap tahan lama.
              </p>
            </div>

            <div className="border-b border-[#f0f0f0] pb-4">
              <h3 className="text-lg font-medium text-gray-700">Bagaimana cara merawat aksesoris titanium?</h3>
              <p className="text-gray-600 mt-2">
                Cukup bersihkan dengan air hangat dan sabun ringan, lalu keringkan dengan kain lembut. Simpan di tempat kering untuk menjaga kilau dan kebersihannya.
              </p>
            </div>

            <div className="border-b border-[#f0f0f0] pb-4">
              <h3 className="text-lg font-medium text-gray-700">Apakah tersedia garansi produk?</h3>
              <p className="text-gray-600 mt-2">
                Ya, kami memberikan garansi 3 bulan untuk produk cacat produksi. Silakan hubungi kami melalui Instagram <strong>@sparklore.official</strong> segera jika ada masalah setelah penerimaan produk.
              </p>
            </div>

            <div className="border-b border-[#f0f0f0] pb-4">
              <h3 className="text-lg font-medium text-gray-700">Apakah bisa COD (Bayar di Tempat)?</h3>
              <p className="text-gray-600 mt-2">
                Tersedia! Kami mendukung pembayaran untuk pengiriman Cash on Delivery (COD) untuk area tertentu.
              </p>
            </div>

            <div className="border-b border-[#f0f0f0] pb-4">
              <h3 className="text-lg font-medium text-gray-700">Berapa lama pengiriman pesanan?</h3>
              <p className="text-gray-600 mt-2">
                Pengiriman dilakukan 1–2 hari kerja setelah pembayaran dikonfirmasi. Lama pengiriman tergantung lokasi, biasanya antara 2–5 hari kerja.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700">Berapa lama untuk proses claim garansi?</h3>
              <p className="text-gray-600 mt-2">
                Proses claim garansi akan dilakukan paling lama 7 hari kerja. Setelah proses selesai, pengiriman barang baru akan dilakukan dan membutuhkan tambahan waktu 2–5 hari kerja.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
