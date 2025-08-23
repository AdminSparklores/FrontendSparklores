import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Read query params
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    const transactionStatus = params.get('transaction_status');

    console.log('Midtrans callback received:', { orderId, transactionStatus });

    // Close the popup or silently handle
    // You can postMessage to parent if needed

    // Immediately redirect back to track-order or stay silent
    if (orderId) {
      // Navigate to track-order without triggering Midtrans again
      navigate(`/track-order/${orderId}`, { replace: true });
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