import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOTP, requestOTP } from '../../utils/api';

const CodeVerificationPage = () => {
  const [code, setCode] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(5 * 60);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleChange = (e, index) => {
    const newCode = [...code];
    newCode[index] = e.target.value.slice(0, 1);
    setCode(newCode);
    if (e.target.value && index < 3) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length === 4) {
      try {
        const result = await verifyOTP(email, fullCode);
        // Store in location state to trigger snackbar in NavBar
        navigate("/", { state: { showLoginSuccess: true } });
        if (location.state?.showLoginSuccess) {
          setSnackbarMessage('You are logged in');
          setSnackbarType('success');
          setShowSnackbar(true);
          // Clear the state so it doesn't show again on refresh
          navigate(location.pathname, { replace: true, state: {} });
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError('');
    try {
      await requestOTP(email);
      setTimer(5 * 60);
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  const formatTime = () => {
    const minutes = String(Math.floor(timer / 60)).padStart(2, "0");
    const seconds = String(timer % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf9f2]">
      <div className="bg-[#fdf9f2] border border-[#f3e6c7] rounded-md px-10 py-8 text-center shadow-sm w-full max-w-md">
        <h2 className="text-lg md:text-xl font-medium text-[#2d2d2d] tracking-wide mb-2">
          We’ve sent you a code!
        </h2>
        <p className="text-sm text-gray-500 mb-6">Please check your email!</p>

        <div className="flex justify-center gap-4 mb-4">
          {code.map((digit, i) => (
            <input
              key={i}
              id={`code-${i}`}
              type="text"
              inputMode="numeric"
              className="w-12 h-12 border border-gray-400 rounded-md text-center text-lg outline-none"
              value={digit}
              onChange={(e) => handleChange(e, i)}
            />
          ))}
        </div>

        {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

        <p className="text-sm text-[#2d2d2d] mb-6">
          Code expires in <span className="font-medium">{formatTime()}</span>
        </p>

        <button
          onClick={handleVerify}
          className="w-full py-3 bg-[#e8d49c] text-[#2d2d2d] font-medium rounded hover:opacity-90 transition mb-3"
        >
          Verify
        </button>
        <button
          onClick={handleResend}
          className="w-full py-2 bg-transparent border border-[#e8d49c] text-[#e8d49c] font-medium rounded hover:bg-[#e8d49c] hover:text-[#2d2d2d] transition flex justify-center items-center"
          disabled={resending}
        >
          {resending ? (
            <span>
              <svg className="animate-spin h-5 w-5 inline-block mr-2 text-gray-700" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Sending...
            </span>
          ) : 'Send Again'}
        </button>
      </div>
    </div>
  );
};

export default CodeVerificationPage;