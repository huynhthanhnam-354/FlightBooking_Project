package com.flightbooking.service;

import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AiComboService {

    public Map<String, Object> suggestCombo(String prompt) {
        Map<String, Object> result = new HashMap<>();

        if (prompt == null || prompt.isBlank()) {
            result.put("origin", "");
            result.put("destination", "");
            result.put("maxBudget", 0L);
            result.put("budget", 0L);
            return result;
        }

        String lowerPrompt = prompt.toLowerCase();

        // 1. Extract Destination
        String destination = extractAirportCode(lowerPrompt, true);

        // 2. Extract Origin
        String origin = extractAirportCode(lowerPrompt, false);

        // If origin and destination are the same (e.g. prompt is "đi phú quốc từ phú quốc"), resolve it
        if (origin != null && origin.equals(destination)) {
            // Check if there are patterns specifying origin vs destination
            // e.g. "từ Hà Nội đi Đà Nẵng" -> origin=HAN, destination=DAD
            if (lowerPrompt.indexOf("từ") < lowerPrompt.indexOf("đi")) {
                // Keep them resolved if order matches
            } else {
                origin = "";
            }
        }

        // 3. Extract Budget
        Long budget = extractBudget(lowerPrompt);

        result.put("origin", origin != null ? origin : "");
        result.put("destination", destination != null ? destination : "");
        result.put("maxBudget", budget);
        result.put("budget", budget); // Support both budget and maxBudget for frontend flexibility

        return result;
    }

    private String extractAirportCode(String prompt, boolean isDestination) {
        // Specific checks for origin patterns like "từ hà nội", "từ sài gòn"
        if (!isDestination) {
            if (prompt.contains("từ hà nội") || prompt.contains("từ han") || prompt.contains("khởi hành từ hà nội") || prompt.contains("ở hà nội")) {
                return "HAN";
            }
            if (prompt.contains("từ hồ chí minh") || prompt.contains("từ sài gòn") || prompt.contains("từ sgn") || prompt.contains("khởi hành từ sài gòn") || prompt.contains("ở sài gòn") || prompt.contains("từ tphcm")) {
                return "SGN";
            }
            if (prompt.contains("từ đà nẵng") || prompt.contains("từ dad") || prompt.contains("khởi hành từ đà nẵng") || prompt.contains("ở đà nẵng")) {
                return "DAD";
            }
            if (prompt.contains("từ nha trang") || prompt.contains("từ cxr") || prompt.contains("khởi hành từ nha trang")) {
                return "CXR";
            }
        }

        // Checks for destination patterns like "đi phú quốc", "tới phú quốc", "du lịch đà nẵng"
        if (isDestination) {
            if (prompt.contains("phú quốc") || prompt.contains("phu quoc") || prompt.contains("pqc") || prompt.contains("đảo ngọc")) {
                return "PQC";
            }
            if (prompt.contains("đà nẵng") || prompt.contains("da nang") || prompt.contains("dad")) {
                return "DAD";
            }
            if (prompt.contains("nha trang") || prompt.contains("cxr")) {
                return "CXR";
            }
            if (prompt.contains("đà lạt") || prompt.contains("da lat") || prompt.contains("dli") || prompt.contains("hoa anh đào")) {
                return "DLI";
            }
            if (prompt.contains("quy nhơn") || prompt.contains("quy nhon") || prompt.contains("uih")) {
                return "UIH";
            }
            if (prompt.contains("hà nội") || prompt.contains("ha noi") || prompt.contains("han")) {
                return "HAN";
            }
            if (prompt.contains("hồ chí minh") || prompt.contains("ho chi minh") || prompt.contains("sài gòn") || prompt.contains("sai gon") || prompt.contains("sgn")) {
                return "SGN";
            }
            if (prompt.contains("sa pa") || prompt.contains("sapa")) {
                return "SAPA";
            }
            if (prompt.contains("hạ long") || prompt.contains("ha long")) {
                return "HALONG";
            }
        } else {
            // General origin extraction if specific "từ" keyword is not present but location exists in second place
            // Try to find the non-destination location
            boolean hasHaNoi = prompt.contains("hà nội") || prompt.contains("ha noi") || prompt.contains("han");
            boolean hasSaiGon = prompt.contains("hồ chí minh") || prompt.contains("ho chi minh") || prompt.contains("sài gòn") || prompt.contains("sai gon") || prompt.contains("sgn");
            boolean hasDaNang = prompt.contains("đà nẵng") || prompt.contains("da nang") || prompt.contains("dad");

            if (isDestination) {
                // Destination check
                if (hasDaNang) return "DAD";
                if (hasHaNoi) return "HAN";
                if (hasSaiGon) return "SGN";
            } else {
                // Origin check (if we already know destination, origin is the other one)
                if (hasHaNoi && !prompt.contains("đi hà nội") && !prompt.contains("đến hà nội")) return "HAN";
                if (hasSaiGon && !prompt.contains("đi sài gòn") && !prompt.contains("đến sài gòn") && !prompt.contains("đi hồ chí minh")) return "SGN";
                if (hasDaNang && !prompt.contains("đi đà nẵng") && !prompt.contains("đến đà nẵng")) return "DAD";
            }
        }

        return "";
    }

    private Long extractBudget(String prompt) {
        // Match numbers followed by "triệu", "tr", "m", "million" (e.g. 5 triệu, 5tr, 5.5tr, 5,5tr)
        Pattern millionPattern = Pattern.compile("([\\d\\.,]+)\\s*(triệu|tr|m|million)");
        Matcher millionMatcher = millionPattern.matcher(prompt);
        if (millionMatcher.find()) {
            try {
                String cleanNum = millionMatcher.group(1).replace(',', '.');
                double val = Double.parseDouble(cleanNum);
                return (long) (val * 1_000_000);
            } catch (Exception e) {
                // Ignore
            }
        }

        // Match plain numbers representing large amounts (e.g. 5000000, 5.000.000)
        Pattern numberPattern = Pattern.compile("(\\d+[\\d\\.,]*)");
        Matcher numberMatcher = numberPattern.matcher(prompt);
        while (numberMatcher.find()) {
            String cleanNum = numberMatcher.group(1).replaceAll("[\\.,]", "");
            try {
                long val = Long.parseLong(cleanNum);
                if (val >= 100_000 && val <= 100_000_000) {
                    return val;
                }
            } catch (Exception e) {
                // Ignore
            }
        }

        return 0L;
    }
}
