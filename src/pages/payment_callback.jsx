import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    const transactionStatus = params.get('transaction_status');

    // console.log('Midtrans callback received:', { orderId, transactionStatus });

    if (orderId) {
      // Only redirect if it's success (or maybe pending, depending on your flow)
      // Optionally: if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      navigate(`/track-order/${orderId}`, { replace: true });
      // }
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ display: 'none' }}>
      Processing payment callback...
    </div>
  );
};

export default PaymentCallback;