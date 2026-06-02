package com.flightbooking.service;

import com.flightbooking.repository.BookingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PnrGeneratorTest {

    @Mock
    private BookingRepository bookingRepository;

    private PnrGenerator pnrGenerator;

    @BeforeEach
    void setUp() {
        pnrGenerator = new PnrGenerator(bookingRepository);
    }

    @Test
    void shouldGenerateValidPnr() {
        // Given: No PNR exists in DB
        when(bookingRepository.existsByPnr(anyString())).thenReturn(false);

        // When
        String pnr = pnrGenerator.generate();

        // Then
        assertThat(pnr).startsWith("SB");
        assertThat(pnr.length()).isEqualTo(10); // "SB" + 8 chars
        verify(bookingRepository, times(1)).existsByPnr(anyString());
    }

    @Test
    void shouldRetryIfPnrExists() {
        // Given: First PNR exists, second does not
        when(bookingRepository.existsByPnr(anyString()))
                .thenReturn(true)
                .thenReturn(false);

        // When
        String pnr = pnrGenerator.generate();

        // Then
        assertThat(pnr).startsWith("SB");
        verify(bookingRepository, times(2)).existsByPnr(anyString());
    }
}
