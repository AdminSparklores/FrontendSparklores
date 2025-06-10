import { ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const accordionData = [
  {
    title: "WATERPROOF | SWEATPROOF",
    content:
      "Aksesoris dari Sparklore Official 100% tahan air dan keringat. Kamu bisa memakainya saat mandi, berenang, bahkan saat olahraga intens tanpa khawatir berkarat atau berubah warna. Bahan titanium premium yang kami gunakan memastikan ketahanan dan kenyamanan maksimal untuk pemakaian harian.",
  },
  {
    title: "FREE DELIVERY",
    content:
      "Kami menawarkan gratis ongkir ke seluruh Indonesia tanpa minimum pembelian! Pesanan kamu akan diproses dalam 1–2 hari kerja dan dikirim menggunakan jasa pengiriman terpercaya.",
  },
  {
    title: "COLOR WARRANTY",
    content:
      "Setiap pembelian di Sparklore Official dilindungi oleh garansi warna selama 3 bulan. Jika warna titanium memudar secara tidak wajar atau ada cacat produksi, kamu bisa klaim garansi dengan mudah. Kami percaya pada kualitas, dan kami berani jamin itu.",
  },
  {
    title: "PRODUCT CARE",
    content:
      "Merawat aksesoris titanium sangat mudah:\n\n* Cuci dengan air hangat dan sabun cuci piring jika terlihat kotor\n* Keringkan dengan kain lembut\n* Simpan di tempat kering dan terpisah dari bahan kimia keras\n\nDengan perawatan sederhana ini, aksesorismu akan tetap awet dan berkilau.",
  },
  {
    title: "FREE REFUND & RETURN",
    content:
      "Belanja tanpa khawatir! Jika produk yang kamu terima rusak atau tidak sesuai, kami memberikan pengembalian dan penukaran GRATIS dalam 7 hari setelah barang diterima. Cukup hubungi tim kami, dan kami akan bantu prosesnya dengan cepat dan mudah.",
  },
  {
    title: "WHY SPARKLORE?",
    content:
      "Sparklore Official bukan sekadar toko aksesoris—kami hadir untuk memberikanmu kombinasi elegan, tahan lama, dan hypoallergenic lewat produk berbahan titanium berkualitas. Kami percaya bahwa keindahan tidak harus dikorbankan demi kualitas. Dengan desain timeless dan material anti karat, produk kami adalah teman setia untuk setiap momenmu.",
  },
];

const InfoAccordion = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className='bg-[#fdf9f0]'>
      <div className="max-w-6xl mx-auto font-serif w-full">
        {accordionData.map((item, index) => (
          <div key={index} className="border-b border-[#f1e2b6]">
            <button
              onClick={() => toggle(index)}
              className="w-full px-4 py-3 flex justify-between items-center text-left hover:bg-[#f7f3e8] transition-colors duration-200"
            >
              <span className="text-sm md:text-base font-semibold text-[#2d2a26]">
                {item.title}
              </span>
              {openIndex === index ? (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-600" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 whitespace-pre-line text-sm text-[#2d2a26]">
                {item.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoAccordion;
