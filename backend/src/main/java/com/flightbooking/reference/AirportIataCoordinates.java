package com.flightbooking.reference;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Tọa độ sân bay (IATA) — dùng vẽ tuyến trên bản đồ khi API chỉ trả dep_iata / arr_iata.
 */
public final class AirportIataCoordinates {

    private static final Map<String, double[]> COORDS = new HashMap<>();

    static {
        COORDS.put("HAN", new double[] { 21.2211, 105.8072 });
        COORDS.put("SGN", new double[] { 10.8188, 106.6519 });
        COORDS.put("DAD", new double[] { 16.0439, 108.1990 });
        COORDS.put("HPH", new double[] { 20.8190, 106.7250 });
        COORDS.put("CXR", new double[] { 11.9982, 109.2193 });
        COORDS.put("PQC", new double[] { 10.2270, 103.9670 });
        COORDS.put("VCA", new double[] { 10.0851, 105.7120 });
        COORDS.put("VII", new double[] { 18.7376, 105.6708 });
        COORDS.put("THD", new double[] { 19.9017, 105.4674 });
        COORDS.put("DIN", new double[] { 21.3975, 103.0078 });
        COORDS.put("VCL", new double[] { 15.4030, 108.7060 });
        COORDS.put("UIH", new double[] { 13.9549, 109.0420 });
        COORDS.put("BMV", new double[] { 12.6683, 108.1203 });
        COORDS.put("PXU", new double[] { 14.0035, 108.0214 });
        COORDS.put("TBB", new double[] { 13.0496, 109.3367 });
        COORDS.put("VDH", new double[] { 17.5150, 106.5906 });
        COORDS.put("VDO", new double[] { 21.1177, 107.4144 });
        COORDS.put("SQH", new double[] { 21.3217, 103.9083 });
        COORDS.put("CAH", new double[] { 9.1777, 105.1778 });
        COORDS.put("VCS", new double[] { 8.6938, 106.6320 });
        COORDS.put("DLI", new double[] { 11.7500, 108.3667 });
        COORDS.put("VKG", new double[] { 9.9580, 105.1324 });
    }

    private AirportIataCoordinates() {}

    public static Optional<double[]> forIata(String iata) {
        if (iata == null || iata.isBlank()) {
            return Optional.empty();
        }
        double[] c = COORDS.get(iata.trim().toUpperCase());
        return c == null ? Optional.empty() : Optional.of(c);
    }
}
