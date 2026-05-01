import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function PaymentResult() {
  const [status, setStatus] = useState("loading"); 
  const [message, setMessage] = useState("Đang xử lý thanh toán...");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

  if (!code) {
    setStatus("error");
    setMessage("Không tìm thấy kết quả thanh toán ❌");
    return;
  }

  if (code === "00") {
    setStatus("success");
    setMessage("Thanh toán thành công ✅");
  } 
  else if (code === "24") {
    setStatus("cancel");
    setMessage("Bạn đã hủy thanh toán ⚠️");

  } 
  else {
    setStatus("fail");
    setMessage("Thanh toán thất bại ❌");

  }

  // 🔥 redirect after 3 seconds
  setTimeout(() => {
    if (code === "00") {
      navigate("/dashboard");
    } else {
      navigate("/dashboard/hotels");
    }
  }, 3000);

}, []);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      
      <h2>{message}</h2>

      {status === "success" && (
        <p style={{ color: "green" }}>Cảm ơn bạn đã đặt phòng 🎉</p>
      )}

      {status === "cancel" && (
        <p style={{ color: "orange" }}>Bạn có thể đặt lại phòng bất kỳ lúc nào.</p>
      )}

      {status === "fail" && (
        <p style={{ color: "red" }}>Vui lòng thử lại hoặc chọn phương thức khác.</p>
      )}

    </div>
  );
}

export default PaymentResult;