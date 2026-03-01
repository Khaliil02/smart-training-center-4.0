package com.goodgovit.stc.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RfidScanPayload {
    private String badgeCode;
    private String readerId;
    private String timestamp;
}
