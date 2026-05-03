import { useEffect, useState } from "react";
import { Check, TriangleAlert, X, Loader } from "lucide-react";
function PaymentResult() {
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Đang xử lý thanh toán...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const statusParam = params.get("status");
    const bookingId = params.get("bookingId");

    if (statusParam === "success") {
      setStatus("success");
      setMessage(`Thanh toán thành công cho booking #${bookingId}`);
    } else if (statusParam === "cancel") {
      setStatus("cancel");
      setMessage("Bạn đã hủy thanh toán");
    } else {
      setStatus("fail");
      setMessage("Thanh toán thất bại");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F4E1] to-white px-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl text-center border border-[#842A3B]/10 max-w-md w-full">

        {/* Icon trạng thái */}
        <div className="mb-5 flex justify-center">
          {status === "success" && (
            <Check size={70} className="text-green-500" />
          )}

          {status === "cancel" && (
            <TriangleAlert size={70} className="text-orange-500" />
          )}

          {status === "fail" && (
            <X size={70} className="text-red-500" />
          )}

          {status === "loading" && (
            <Loader size={50} className="animate-spin text-[#842A3B]" />
          )}
        </div>

        {/* Message */}
        <h2 className="text-xl font-bold text-[#842A3B] mb-2">
          {message}
        </h2>

        {/* Sub text */}
        {status === "success" && (
          <p className="text-green-600 font-medium mb-6">
            Thanh toán thành công Cảm ơn bạn đã đặt phòng
          </p>
        )}

        {status === "cancel" && (
          <p className="text-orange-500 mb-6">
            Bạn đã hủy thanh toán. Bạn có thể đặt lại bất kỳ lúc nào.
          </p>
        )}

        {status === "fail" && (
          <p className="text-red-500 mb-6">
            Giao dịch thất bại, vui lòng thử lại.
          </p>
        )}

        {/* Button về home */}
        <button
          onClick={() => window.location.assign("/dashboard")}
          className="mt-4 px-6 py-3 rounded-xl bg-[#842A3B] text-white font-semibold hover:bg-[#6e2230] transition-all shadow-md"
        >
          Về trang chủ
        </button>

      </div>
    </div>
  );
}

export default PaymentResult;