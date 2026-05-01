package com.hotel.backend.booking.service;

import org.junit.jupiter.api.Test;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

class VnpayServiceTest {

    private final VnpayService vnpayService = new VnpayService();

    @Test
    void createPaymentUrl_shouldReturnVnpaySandboxUrl() throws Exception {
        String result = vnpayService.createPaymentUrl(123, 250000L);

        assertThat(result)
                .startsWith("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?");
    }

    @Test
    void createPaymentUrl_shouldContainRequiredPaymentParams() throws Exception {
        String result = vnpayService.createPaymentUrl(123, 250000L);

        Map<String, String> params = extractParams(result);

        assertThat(params.get("vnp_Version")).isEqualTo("2.1.0");
        assertThat(params.get("vnp_Command")).isEqualTo("pay");
        assertThat(params.get("vnp_TmnCode")).isEqualTo("M51QNFEJ");
        assertThat(params.get("vnp_Amount")).isEqualTo("25000000");
        assertThat(params.get("vnp_CurrCode")).isEqualTo("VND");
        assertThat(params.get("vnp_TxnRef")).isEqualTo("123");
        assertThat(params.get("vnp_OrderInfo")).isEqualTo("Pay booking 123");
        assertThat(params.get("vnp_OrderType")).isEqualTo("other");
        assertThat(params.get("vnp_ReturnUrl"))
                .isEqualTo("http://localhost:8080/api/public/payment/vnpay-return");
        assertThat(params.get("vnp_Locale")).isEqualTo("vn");
        assertThat(params.get("vnp_IpAddr")).isEqualTo("127.0.0.1");
    }

    @Test
    void createPaymentUrl_shouldContainCreateDateWithExpectedFormat() throws Exception {
        String result = vnpayService.createPaymentUrl(123, 250000L);

        Map<String, String> params = extractParams(result);

        assertThat(params.get("vnp_CreateDate"))
                .isNotBlank()
                .hasSize(14)
                .matches("\\d{14}");
    }

    @Test
    void createPaymentUrl_shouldContainSecureHash() throws Exception {
        String result = vnpayService.createPaymentUrl(123, 250000L);

        Map<String, String> params = extractParams(result);

        assertThat(params.get("vnp_SecureHash"))
                .isNotBlank()
                .hasSize(128)
                .matches("[0-9a-f]+");
    }

    @Test
    void createPaymentUrl_shouldSortQueryParamsBeforeSecureHash() throws Exception {
        String result = vnpayService.createPaymentUrl(123, 250000L);

        String query = result.substring(result.indexOf("?") + 1);
        String queryWithoutHash = query.substring(0, query.indexOf("&vnp_SecureHash="));

        String[] keys = Arrays.stream(queryWithoutHash.split("&"))
                .map(pair -> pair.substring(0, pair.indexOf("=")))
                .toArray(String[]::new);

        String[] sortedKeys = keys.clone();
        Arrays.sort(sortedKeys);

        assertThat(keys).containsExactly(sortedKeys);
    }

    private Map<String, String> extractParams(String url) {
        String query = url.substring(url.indexOf("?") + 1);

        return Arrays.stream(query.split("&"))
                .map(pair -> pair.split("=", 2))
                .collect(Collectors.toMap(
                        pair -> pair[0],
                        pair -> URLDecoder.decode(pair[1], StandardCharsets.UTF_8)
                ));
    }
}
