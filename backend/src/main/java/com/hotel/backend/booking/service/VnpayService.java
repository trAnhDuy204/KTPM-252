package com.hotel.backend.booking.service;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Service;

@Service
public class VnpayService {
    private final String vnp_TmnCode = "M51QNFEJ";
    private final String vnp_HashSecret = "399XZ6P6QCIFLQWK5QS8PRRRLZF71LEG";
    private final String vnp_Url = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    private final String returnUrl = "http://localhost:8080/api/public/payment/vnpay-return";
    //dữ liệu test:
    // 9704198526191432198
    // NGUYEN VAN A
    // 07/15
    // OTP: 123456
    public String createPaymentUrl(Integer bookingId, long amount) throws Exception {

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnp_TmnCode);
        params.put("vnp_Amount", String.valueOf(amount * 100));
        params.put("vnp_CurrCode", "VND");

        params.put("vnp_TxnRef", bookingId.toString());
        params.put("vnp_OrderInfo", "Pay booking " + bookingId);
        params.put("vnp_OrderType", "other");
        params.put("vnp_ReturnUrl", returnUrl);
        params.put("vnp_Locale", "vn");
        params.put("vnp_IpAddr", "127.0.0.1");

        String createDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        params.put("vnp_CreateDate", createDate);

        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String key : keys) {
            String value = params.get(key);

            if (value != null && value.length() > 0) {

                hashData.append(key)
                        .append("=")
                        .append(URLEncoder.encode(value, StandardCharsets.US_ASCII))
                        .append("&");

                query.append(key)
                    .append("=")
                    .append(URLEncoder.encode(value, StandardCharsets.US_ASCII))
                    .append("&");
            }
        }

        hashData.deleteCharAt(hashData.length() - 1);
        query.deleteCharAt(query.length() - 1);

        String secureHash = hmacSHA512(vnp_HashSecret, hashData.toString());

        return vnp_Url + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    private String hmacSHA512(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512");
        mac.init(new SecretKeySpec(key.getBytes(), "HmacSHA512"));
        return HexFormat.of().formatHex(mac.doFinal(data.getBytes()));
    }
}
