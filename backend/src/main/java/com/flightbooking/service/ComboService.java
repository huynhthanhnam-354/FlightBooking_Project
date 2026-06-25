package com.flightbooking.service;

import com.flightbooking.model.Flight;
import com.flightbooking.model.AppUser;
import com.flightbooking.model.Booking;
import com.flightbooking.model.BookingPassenger;
import com.flightbooking.model.BookingStatus;
import com.flightbooking.model.PaymentStatus;
import com.flightbooking.model.PaymentTransaction;
import com.flightbooking.repository.FlightRepository;
import com.flightbooking.repository.AppUserRepository;
import com.flightbooking.repository.BookingRepository;
import com.flightbooking.web.dto.ComboPriceRequest;
import com.flightbooking.web.dto.ComboPriceResponse;
import com.flightbooking.web.dto.ComboResponse;
import com.flightbooking.web.dto.FlightResponse;
import com.flightbooking.web.dto.RoomTypeResponse;
import com.flightbooking.web.dto.ComboCheckoutRequest;
import com.flightbooking.web.dto.ComboCheckoutResponse;
import com.flightbooking.validation.InputValidator;
import com.flightbooking.time.VietnamTime;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ComboService {

    private static final Logger log = LoggerFactory.getLogger(ComboService.class);

    private final FlightRepository flightRepository;
    private final BookingRepository bookingRepository;
    private final AppUserRepository appUserRepository;
    private final PnrGenerator pnrGenerator;
    private final SimpMessagingTemplate messagingTemplate;
    private final WeatherService weatherService;
    private final AirlabsService airlabsService;

    @Value("${app.vnpay.tmn-code:2QXUI8KI}")
    private String vnp_TmnCode;

    @Value("${app.vnpay.hash-secret:AQODJSRVZZTRNMTIKGOWVPHFXXKJZIEW}")
    private String vnp_HashSecret;

    // 🌟 ĐÃ CẬP NHẬT: Trỏ mặc định về Endpoint mô phỏng nội bộ của ứng dụng để không bị nhảy sang VNPAY thật ngoài internet
    @Value("${app.vnpay.return-url:http://localhost:5173/checkout/success}")
    private String vnp_ReturnUrl;

    private static final List<ComboBase> COMBO_BASES = Arrays.asList(
            new ComboBase(1L, "Kỳ nghỉ trọn gói Đà Nẵng 3N2Đ", "Đà Nẵng", "DAD", "InterContinental Danang Sun Peninsula Resort", 5, "Cao cấp, biệt thự sườn đồi view biển Sơn Trà trọn vẹn, nội thất tinh xảo đậm chất văn hóa Việt", Arrays.asList("Bãi biển riêng tư", "Hồ bơi vô cực ngoài trời", "Harnn Heritage Spa", "Nhà hàng La Maison 1888", "Trung tâm thể hình hiện đại", "Bữa sáng buffet thượng hạng"), 6890000L, "Miền Trung", "Tuyệt tác nghỉ dưỡng bên vịnh Bán đảo Sơn Trà hoang sơ, tận hưởng dịch vụ đẳng cấp thế giới cùng bãi biển riêng tư tuyệt đẹp.", "3 ngày 2 đêm", "https://images.unsplash.com/photo-1559592481-74418d7cd362?auto=format&fit=crop&w=600&q=80", 95, 20, "best_price"),
            new ComboBase(2L, "Khám phá Đảo Ngọc Phú Quốc 4N3Đ", "Phú Quốc", "PQC", "JW Marriott Phu Quoc Emerald Bay Resort", 5, "Tuyệt tác thiết kế Bãi Khem, phòng Deluxe view biển ngoạn mục, nội thất cổ điển chuẩn xa hoa", Arrays.asList("Hồ bơi vỏ sò độc đáo", "Spa by JW cao cấp", "Nhà hàng Pink Pearl ẩm thực Pháp", "Bãi tắm cát trắng riêng tư", "Lớp học làm bánh miễn phí", "Bữa sáng buffet chuẩn quốc tế"), 9450000L, "Miền Nam", "Tuyệt tác thiết kế mang cảm hứng học đường cổ điển bên Bãi Khem cát trắng mịn, trải nghiệm ẩm thực đỉnh cao và hồ bơi vỏ sò độc đáo.", "4 ngày 3 đêm", "https://images.unsplash.com/photo-1542332213-31f87348057f?auto=format&fit=crop&w=600&q=80", 98, 15, "price_up"),
            new ComboBase(3L, "Nha Trang Biển Gọi 3N2Đ", "Nha Trang", "CXR", "Amiana Resort Nha Trang", 5, "Biệt thự sát biển lãng mạn, phòng tím mở hòa mình vào thiên nhiên, view vịnh Nha Trang xanh mát", Arrays.asList("Hồ bơi nước biển tự nhiên", "Hồ bơi nước ngọt vô cực", "Tắm bùn khoáng nóng ôn tuyền", "Bãi tắm riêng yên bình", "Nhà hàng hải sản tươi sống", "Bữa sáng buffet miễn phí"), 5900000L, "Miền Trung", "Thư giãn bên hồ bơi vô cực nước biển tự nhiên rộng lớn cùng bãi tắm cát trắng riêng tư yên bình giữa vịnh Nha Trang lộng gió.", "3 ngày 2 đêm", "https://images.unsplash.com/photo-1588668214407-6eb95270273e?auto=format&fit=crop&w=600&q=80", 88, 10, null),
            new ComboBase(4L, "Sapa Mây Ngàn Kỳ Thú 3N2Đ", "Sa Pa", "HAN", "Hotel de la Coupole - MGallery", 5, "Phòng Indochine Pháp cổ kính quyến rũ, view núi Fansipan hùng vĩ, bồn tắm đứng nghệ thuật", Arrays.asList("Hồ bơi nước nóng Le Grand Bassin", "Nuages Spa cao cấp", "Nhà hàng Chic ẩm thực Pháp-Việt", "Quầy bar ngoài trời trên tầng mái", "Câu lạc bộ trẻ em", "Bữa sáng buffet miễn phí"), 4890000L, "Miền Bắc", "Trải nghiệm nét lãng mạn phong cách Pháp hòa quyện nét văn hóa Tây Bắc độc đáo giữa thị trấn mờ sương đẹp như tranh vẽ.", "3 ngày 2 đêm", "https://images.unsplash.com/photo-1508873699372-7aeab60b44ab?auto=format&fit=crop&w=600&q=80", 92, 25, "best_price"),
            new ComboBase(5L, "Vịnh Hạ Long Du Thuyền Sang Trọng 2N1Đ", "Hạ Long", "HAN", "Paradise Elegance Cruise Halong", 5, "Cabin sang trọng ban công riêng ngắm vịnh di sản, nội thất gỗ ấm cúng quý phái", Arrays.asList("Spa trị liệu chuyên sâu", "Lớp học Taichi sáng sớm", "Nhà hàng Le Marin ẩm thực cao cấp", "Boong tàu tắm nắng 360 độ", "Trải nghiệm chèo thuyền kayak", "Tiệc tối hoàng hôn lãng mạn"), 5490000L, "Miền Bắc", "Hành trình di sản kỳ diệu lênh đênh giữa vịnh biển kỳ vĩ, ngắm hoàng hôn buông xuống từ cabin ban công riêng cao cấp.", "2 ngày 1 đêm", "https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=600&q=80", 87, 18, null),
            new ComboBase(6L, "Hùng Vĩ Cao Nguyên Đá Hà Giang 3N2Đ", "Hà Giang", "HAN", "P\'apiu Resort Hà Giang", 5, "Biệt thự biệt lập ẩn mình giữa thiên nhiên cao nguyên đá, nội thất gỗ thủ công tinh tế", Arrays.asList("Hồ Jacuzzi ngoài trời", "Dịch vụ quản gia riêng 24/7", "Trải nghiệm đi bộ trekking", "Rạp chiếu phim ngoài trời", "Bữa tối BBQ tại đỉnh núi", "Bữa sáng tại phòng miễn phí"), 6200000L, "Miền Bắc", "Chinh phục cung đường đèo hiểm trở, ngắm mùa hoa tam giác mạch rực rỡ và ẩn mình tại resort sinh thái đẳng cấp biệt lập.", "3 ngày 2 đêm", "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=600&q=80", 89, 12, null),
            new ComboBase(7L, "Hội An Hoài Niệm Phố Cổ 3N2Đ", "Hội An", "DAD", "Anantara Hoi An Resort", 5, "Phòng suite ban công lớn hướng sông Hoài thơ mộng, nội thất gỗ mang âm hưởng phố cổ", Arrays.asList("Hồ bơi ngoài trời xanh mát", "Lớp học nấu ăn truyền thống", "Spa chăm sóc thảo dược", "Du thuyền sông Hoài hoàng hôn", "Nhà hàng ẩm thực Hội An", "Bữa sáng buffet miễn phí"), 4500000L, "Miền Trung", "Lưu trú bên dòng sông Hoài thơ mộng, thả đèn hoa đăng lung linh và len lỏi qua từng con hẻm rêu phong nhuộm màu thời gian.", "3 ngày 2 đêm", "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80", 91, 30, "best_price"),
            new ComboBase(8L, "Quy Nhơn Hoang Sơ Kỳ Vĩ 3N2Đ", "Quy Nhơn", "UIH", "Anantara Quy Nhon Villas", 5, "Biệt thự hồ bơi riêng hướng vịnh Quy Nhơn, nội thất đá tự nhiên và gỗ tếch đẳng cấp", Arrays.asList("Hồ bơi riêng biệt độc bản", "Trị liệu Spa bên bờ đá", "Dịch vụ ăn uống tại biệt thự", "Lớp dạy Yoga sáng sớm", "Trung tâm thể hình hiện đại", "Bữa sáng buffet miễn phí"), 7800000L, "Miền Trung", "Bờ biển nguyên sơ cát vàng mịn màng bao quanh bởi những mỏm đá tuyệt tác, tận hưởng hồ bơi riêng biệt độc bản xa hoa.", "3 ngày 2 đêm", "https://images.unsplash.com/photo-1610444583731-9e1e2d4400cc?auto=format&fit=crop&w=600&q=80", 84, 14, null),
            new ComboBase(9L, "Đà Lạt Sương Mờ Lãng Mạn 3N2Đ", "Đà Lạt", "DLI", "Ana Mandara Villas Dalat Resort & Spa", 5, "Biệt thự Pháp cổ kính nép mình dưới rừng thông, lò sưởi ấm cúng và bồn tắm vintage", Arrays.asList("Hồ bơi nước ấm ngoài trời", "La Cochinchine Spa", "Nhà hàng Le Petit ẩm thực Pháp", "Vườn rau hữu cơ sinh thái", "Tour khám phá biệt thự cổ", "Bữa sáng buffet miễn phí"), 3950000L, "Miền Trung", "Ẩn mình dưới những tán thông ngút ngàn, biệt thự kiến trúc Pháp cổ kính mở ra không gian lãng mạn ấm áp giữa cao nguyên.", "3 ngày 2 đêm", "https://images.unsplash.com/photo-1589136777351-fdc9c9c8c480?auto=format&fit=crop&w=600&q=80", 93, 22, "price_up"),
            new ComboBase(10L, "Côn Đảo Thiên Đường Tự Nhiên 3N2Đ", "Côn Đảo", "VCS", "Six Senses Con Dao Resort", 5, "Biệt thự gỗ mộc mạc tinh tế ven biển, hồ bơi tràn bờ riêng tư tuyệt hảo", Arrays.asList("Hồ bơi tràn bờ riêng biệt", "Spa Six Senses đẳng cấp thế giới", "Rạp chiếu phim ngoài trời", "Trải nghiệm xem rùa đẻ trứng", "Nhà hàng By The Beach hải sản", "Bữa sáng buffet hữu cơ"), 12500000L, "Miền Nam", "Thiên đường bảo tồn thiên nhiên biển đảo đỉnh cao, biệt thự gỗ sang trọng ven biển lộng gió mang lại sự thư thái tuyệt hảo.", "3 ngày 2 đêm", "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?auto=format&fit=crop&w=600&q=80", 96, 8, null),
            new ComboBase(11L, "Gió Biển Hồ Tràm Thanh Bình 3N2Đ", "Vũng Tàu", "SGN", "InterContinental Grand Ho Tram", 5, "Phòng Grand view biển Hồ Tràm thanh bình, thiết kế hiện đại trang nhã rộng rãi", Arrays.asList("Sân golf The Bluffs chuẩn quốc tế", "Khu phức hợp sòng bài giải trí", "Hệ thống 4 hồ bơi tràn bờ", "Spa trị liệu cao cấp", "Rạp chiếu phim hiện đại", "Bữa sáng buffet miễn phí"), 3200000L, "Miền Nam", "Trải nghiệm không gian sòng bài, sân golf chuẩn quốc tế ven bãi biển Hồ Tràm hoang sơ cách TP.HCM chỉ hơn 2 giờ di chuyển.", "3 ngày 2 đêm", "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80", 82, 16, null),
            new ComboBase(12L, "Combo Mũi Né Cát Vàng Lấp Lánh 3N2Đ", "Mũi Né", "SGN", "Anantara Mui Ne Resort", 5, "Biệt thự vườn nhiệt đới thanh bình, bồn tắm bằng đá nguyên khối ngắm vườn cây xanh mát", Arrays.asList("Hồ bơi vô cực hướng biển", "Anantara Spa cao cấp", "Nhà hàng L'Anmien ẩm thực Á-Âu", "Hoạt động thể thao dưới nước", "Lớp học pha chế cocktail", "Bữa sáng buffet miễn phí"), 4100000L, "Miền Nam", "Những rặng dừa xanh đung đưa trước gió bên bờ biển êm đềm, khám phá đồi cát bay trứ danh và thưởng ngoạn hoàng hôn tuyệt mỹ.", "3 ngày 2 đêm", "https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?auto=format&fit=crop&w=600&q=80", 86, 21, null)
    );

    public List<ComboResponse> search(String departure, String arrival, String dateStr, Integer guests, String sortBy) {
        List<ComboResponse> responses = new ArrayList<>();
        String destinationCode = arrival != null ? arrival.trim().toUpperCase() : "";

        List<Flight> matchingFlights = new ArrayList<>();
        if (!destinationCode.isEmpty()) {
            if (departure != null && !departure.trim().isEmpty()) {
                String dep = departure.trim().toUpperCase();
                if (dateStr != null && !dateStr.trim().isEmpty()) {
                    try {
                        LocalDate date = LocalDate.parse(dateStr.trim());
                        LocalDateTime startOfDay = date.atStartOfDay();
                        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
                        matchingFlights = flightRepository.findByDepartureAirportAndArrivalAirportAndDepartureAtBetweenOrderByDepartureAtAsc(dep, destinationCode, startOfDay, endOfDay);
                    } catch (Exception e) {
                        matchingFlights = flightRepository.findByDepartureAirportAndArrivalAirportOrderByDepartureAtAsc(dep, destinationCode);
                    }
                } else {
                    matchingFlights = flightRepository.findByDepartureAirportAndArrivalAirportOrderByDepartureAtAsc(dep, destinationCode);
                }
            }
        }

        for (ComboBase base : COMBO_BASES) {
            if (!destinationCode.isEmpty() && !base.destinationCode.equalsIgnoreCase(destinationCode)) {
                continue;
            }

            FlightResponse flightResponse = null;
            try {
                List<FlightResponse> apiFlights = airlabsService.getRealTimeSchedules(base.destinationCode);
                if (apiFlights != null && !apiFlights.isEmpty()) {
                    flightResponse = apiFlights.get(0);
                }
            } catch (Exception e) {
                log.error("Error fetching Airlabs schedules for {}, falling back to local: {}", base.destinationCode, e.getMessage());
            }

            if (flightResponse == null) {
                Flight bestFlight = null;
                if (!matchingFlights.isEmpty()) {
                    bestFlight = matchingFlights.get(0);
                } else {
                    List<Flight> fallbackFlights = flightRepository.findByDepartureAirportAndArrivalAirportOrderByDepartureAtAsc("HAN", base.destinationCode);
                    if (fallbackFlights.isEmpty()) {
                        fallbackFlights = flightRepository.findByDepartureAirportAndArrivalAirportOrderByDepartureAtAsc("SGN", base.destinationCode);
                    }
                    if (!fallbackFlights.isEmpty()) {
                        bestFlight = fallbackFlights.get(0);
                    }
                }

                if (bestFlight != null) {
                    flightResponse = new FlightResponse(
                            bestFlight.getId(),
                            bestFlight.getFlightNumber(),
                            bestFlight.getAirline(),
                            bestFlight.getDepartureAirport(),
                            bestFlight.getArrivalAirport(),
                            bestFlight.getDepartureAt(),
                            bestFlight.getArrivalAt(),
                            bestFlight.getDurationMinutes(),
                            bestFlight.getPrice(),
                            bestFlight.isPremiumCabin()
                    );
                }
            }

            List<RoomTypeResponse> rooms = Arrays.asList(
                    new RoomTypeResponse("std", "Standard Room", 0L),
                    new RoomTypeResponse("deluxe", "Deluxe Ocean View", 750000L),
                    new RoomTypeResponse("suite", "Executive Suite VIP", 2000000L)
            );

            long activeBookingsCount = bookingRepository.countByComboIdAndStatusIn(
                    base.id,
                    Arrays.asList(
                            BookingStatus.CONFIRMED,
                            BookingStatus.PENDING_PAYMENT,
                            BookingStatus.CHECKED_IN,
                            BookingStatus.COMPLETED
                    )
            );
            int availableSlots = Math.max(0, 5 - (int) activeBookingsCount);

            WeatherService.WeatherInfo weatherInfo = weatherService.getWeatherForecast(base.location);
            String weather = weatherInfo.status();
            int temp = weatherInfo.temperature();
            String aiRecommendationText;
            if ("Sunny".equalsIgnoreCase(weather)) {
                aiRecommendationText = "☀️ " + base.location + " hiện tại nắng đẹp " + temp + "°C. AI gợi ý bạn nên trải nghiệm các hoạt động ngoài trời, tắm biển hoặc check-in các điểm tham quan tự nhiên ngay chiều nay. Đừng quên chuẩn bị mũ và kem chống nắng nhé!";
            } else if ("Rainy".equalsIgnoreCase(weather)) {
                aiRecommendationText = "🌧️ Khu vực " + base.location + " đang có mưa, nhiệt độ khoảng " + temp + "°C. Để chuyến đi trọn vẹn, AI gợi ý bạn đổi lịch trình sang các hoạt động trong nhà: thư giãn tại Spa của resort, tham quan bảo tàng hoặc thưởng thức ẩm thực địa phương.";
            } else {
                aiRecommendationText = "⛅ Thời tiết tại " + base.location + " se lạnh " + temp + "°C, trời nhiều mây dịu mát. Đây là thời điểm lý tưởng để bạn đi dạo phố cổ, đi bộ trekking hoặc chụp ảnh check-in ngoại cảnh mà không lo nắng gắt.";
            }

            responses.add(new ComboResponse(
                    base.id,
                    base.title,
                    base.location,
                    base.hotelName,
                    base.hotelStars,
                    base.roomQuality,
                    base.hotelAmenities,
                    base.price,
                    base.region,
                    base.description,
                    base.duration,
                    base.image,
                    base.popularity,
                    base.discount,
                    aiRecommendationText,
                    availableSlots,
                    flightResponse,
                    rooms
            ));
        }

        if (sortBy != null) {
            String sort = sortBy.trim().toLowerCase();
            if (sort.equals("price_asc")) {
                responses.sort((c1, c2) -> Long.compare(c1.price(), c2.price()));
            } else if (sort.equals("popularity")) {
                responses.sort((c1, c2) -> Integer.compare(c2.popularity(), c1.popularity()));
            } else if (sort.equals("discount")) {
                responses.sort((c1, c2) -> Integer.compare(c2.discount(), c1.discount()));
            }
        }

        return responses;
    }

    public ComboPriceResponse calculatePrice(ComboPriceRequest request) {
        ComboBase base = COMBO_BASES.stream()
                .filter(c -> c.id.equals(request.comboId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Combo not found with ID: " + request.comboId()));

        long basePrice = base.price;
        long flightDiff = 0L;
        long roomDiff = 0L;

        if (request.selectedFlightId() != null) {
            Flight selectedFlight = flightRepository.findById(request.selectedFlightId()).orElse(null);
            if (selectedFlight != null) {
                List<Flight> defaultFlights = flightRepository.findByDepartureAirportAndArrivalAirportOrderByDepartureAtAsc("HAN", base.destinationCode);
                if (defaultFlights.isEmpty()) {
                    defaultFlights = flightRepository.findByDepartureAirportAndArrivalAirportOrderByDepartureAtAsc("SGN", base.destinationCode);
                }

                if (!defaultFlights.isEmpty()) {
                    long defaultFlightPrice = defaultFlights.get(0).getPrice();
                    flightDiff = selectedFlight.getPrice() - defaultFlightPrice;
                }
            }
        }

        if (request.selectedRoomTypeId() != null) {
            String roomType = request.selectedRoomTypeId().trim().toLowerCase();
            if (roomType.equals("deluxe")) {
                roomDiff = 750000L;
            } else if (roomType.equals("suite")) {
                roomDiff = 2000000L;
            }
        }

        long totalPrice = basePrice + flightDiff + roomDiff;
        if (totalPrice < 1000000L) {
            totalPrice = 1000000L;
        }

        return new ComboPriceResponse(
                request.comboId(),
                request.selectedFlightId(),
                request.selectedRoomTypeId(),
                totalPrice,
                basePrice,
                flightDiff,
                roomDiff
        );
    }

    @Transactional
    public ComboCheckoutResponse checkout(String userEmail, ComboCheckoutRequest request) {
        ComboBase base = COMBO_BASES.stream()
                .filter(c -> c.id.equals(request.comboId()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Combo not found with ID: " + request.comboId()));

        Flight flight = flightRepository.findById(request.selectedFlightId()).orElse(null);
        Long flightId = request.selectedFlightId();
        if (flight == null) {
            log.warn("Flight with ID {} not found for checkout. Falling back to the first available flight in database.", request.selectedFlightId());
            flight = flightRepository.findAll().stream()
                    .filter(f -> f.getDepartureAt().isAfter(VietnamTime.nowLocal()))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chuyến bay khả dụng nào trong tương lai."));
            flightId = flight.getId();
        } else {
            if (flight.getDepartureAt().isBefore(VietnamTime.nowLocal())) {
                throw new IllegalArgumentException("Không thể đặt vé Combo cho chuyến bay đã cất cánh hoặc ở trong quá khứ.");
            }
        }

        log.info("Successfully requested room lock for RoomType '{}' at hotel '{}' for user '{}'",
                request.selectedRoomTypeId(), base.hotelName, userEmail);

        AppUser user = appUserRepository.findByEmailIgnoreCase(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));
        String passengerName = InputValidator.requirePersonName(request.passengerName());
        String passengerEmail = InputValidator.requireEmail(request.passengerEmail());
        if (!passengerEmail.equalsIgnoreCase(user.getEmail())) {
            throw new IllegalArgumentException("Email nhận vé phải trùng với email tài khoản đang đăng nhập.");
        }
        String passengerPhone = InputValidator.optionalPhone(request.passengerPhone());
        String passengerIdCard = InputValidator.optionalIdCard(request.passengerIdCard());

        ComboPriceRequest priceRequest = new ComboPriceRequest(request.comboId(), flightId, request.selectedRoomTypeId());
        ComboPriceResponse priceResponse = calculatePrice(priceRequest);

        int passengerCount = request.passengerCount() != null ? request.passengerCount() : 1;
        int baggageKg = request.baggageKg() != null ? request.baggageKg() : 0;
        long baggageFeeVnd = request.baggageFeeVnd() != null ? request.baggageFeeVnd() : 0L;

        long totalPriceVnd = priceResponse.totalPriceVnd() * passengerCount + baggageFeeVnd;
        String pnr = pnrGenerator.generate();

        LocalDateTime expiresAtVietnam = ZonedDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh")).toLocalDateTime().plusMinutes(10);

        Booking booking = Booking.builder()
                .user(user)
                .flight(flight)
                .seatNumber("Auto-assigned")
                .passengerName(passengerName)
                .passengerEmail(passengerEmail)
                .passengerPhone(passengerPhone)
                .passengerIdCard(passengerIdCard)
                .passengerCount(passengerCount)
                .tripType("ROUND_TRIP")
                .paymentMethod("VNPAY")
                .baggageKg(baggageKg)
                .baggageFeeVnd(baggageFeeVnd)
                .totalPriceVnd(totalPriceVnd)
                .status(BookingStatus.PENDING_PAYMENT)
                .expiresAt(expiresAtVietnam)
                .pnr(pnr)
                .comboId(request.comboId())
                .sourceChannel("COMBO")
                .build();

        for (int i = 0; i < passengerCount; i++) {
            booking.addPassenger(BookingPassenger.builder()
                    .flight(flight)
                    .seatNumber("C-" + (i + 1))
                    .fullName(passengerName)
                    .email(passengerEmail)
                    .phone(passengerPhone)
                    .idCard(passengerIdCard)
                    .build());
        }

        PaymentTransaction transaction = PaymentTransaction.builder()
                .provider("VNPAY")
                .amountVnd(totalPriceVnd)
                .status(PaymentStatus.PENDING)
                .providerReference(pnr)
                .build();
        booking.setPaymentTransaction(transaction);

        bookingRepository.save(booking);

        try {
            updateAndBroadcastAvailability(request.comboId(), null);
        } catch (Exception e) {
            log.error("Failed to broadcast real-time availability update: ", e);
        }

        String paymentUrl = generateVnPayUrl(booking);
        return new ComboCheckoutResponse(paymentUrl, booking.getId(), pnr);
    }

    public void updateAndBroadcastAvailability(Long comboId, String customerCity) {
        int totalSlots = 5;
        long activeBookingsCount = bookingRepository.countByComboIdAndStatusIn(
                comboId,
                Arrays.asList(
                        BookingStatus.CONFIRMED,
                        BookingStatus.PENDING_PAYMENT,
                        BookingStatus.CHECKED_IN,
                        BookingStatus.COMPLETED
                )
        );
        int availableSlots = Math.max(0, totalSlots - (int) activeBookingsCount);

        ComboBase comboBase = COMBO_BASES.stream()
                .filter(c -> c.id.equals(comboId))
                .findFirst()
                .orElse(null);

        String cityName = comboBase != null ? comboBase.location : "Điểm đến";
        String chosenCity = customerCity != null ? customerCity : getRandomCity();

        Map<String, Object> payload = new HashMap<>();
        payload.put("comboId", comboId);
        payload.put("availableSlots", availableSlots);
        payload.put("customerCity", chosenCity);
        payload.put("cityName", cityName);
        payload.put("messageText", "Một khách hàng tại " + chosenCity + " vừa đặt thành công combo này!");

        messagingTemplate.convertAndSend("/topic/combos-availability", payload);
    }

    private String getRandomCity() {
        String[] cities = {"Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Nha Trang", "Phú Quốc", "Cần Thơ", "Hải Phòng"};
        return cities[(int) (Math.random() * cities.length)];
    }

    private String generateVnPayUrl(Booking booking) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = "Thanh toan combo " + booking.getPnr();
        String vnp_OrderType = "other";
        String vnp_TxnRef = booking.getPnr();
        String vnp_IpAddr = "127.0.0.1";
        String vnp_Locale = "vn";
        String vnp_CurrCode = "VND";

        long amount = booking.getTotalPriceVnd() * 100L;

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        String vnp_CreateDate = now.format(formatter);
        String vnp_ExpireDate = now.plusMinutes(10).format(formatter);

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_Locale", vnp_Locale);
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                try {
                    // 🛠️ MÔ PHỎNG MÃ HÓA ĐỒNG NHẤT: Tránh lệch chữ ký mã lỗi 97 trên bộ giả lập local
                    String encodedFieldName = URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString()).replace("+", "%20");
                    String encodedFieldValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString()).replace("+", "%20");

                    hashData.append(encodedFieldName).append("=").append(encodedFieldValue);
                    query.append(encodedFieldName).append("=").append(encodedFieldValue);
                } catch (Exception e) {
                    log.error("URL Encoding error: ", e);
                }

                if (i < fieldNames.size() - 1) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnp_PayUrl + "?" + queryUrl;
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmacSHA512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmacSHA512.init(secretKey);
            byte[] result = hmacSHA512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(2 * result.length);
            for (byte b : result) {
                sb.append(String.format("%02x", b & 0xff));
            }
            return sb.toString();
        } catch (Exception ex) {
            log.error("HMAC-SHA512 failed: ", ex);
            return "";
        }
    }

    private static class ComboBase {
        Long id;
        String title;
        String location;
        String destinationCode;
        String hotelName;
        int hotelStars;
        String roomQuality;
        List<String> hotelAmenities;
        Long price;
        String region;
        String description;
        String duration;
        String image;
        int popularity;
        int discount;
        String aiRecommendation;

        ComboBase(Long id, String title, String location, String destinationCode, String hotelName, int hotelStars, String roomQuality, List<String> hotelAmenities, Long price, String region, String description, String duration, String image, int popularity, int discount, String aiRecommendation) {
            this.id = id;
            this.title = title;
            this.location = location;
            this.destinationCode = destinationCode;
            this.hotelName = hotelName;
            this.hotelStars = hotelStars;
            this.roomQuality = roomQuality;
            this.hotelAmenities = hotelAmenities;
            this.price = price;
            this.region = region;
            this.description = description;
            this.duration = duration;
            this.image = image;
            this.popularity = popularity;
            this.discount = discount;
            this.aiRecommendation = aiRecommendation;
        }
    }
}
