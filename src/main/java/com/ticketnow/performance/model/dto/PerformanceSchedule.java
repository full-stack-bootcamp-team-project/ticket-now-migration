package com.ticketnow.performance.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PerformanceSchedule {
    private String performanceScheduleId;
    private String performanceId;
    private String performanceScheduleStartDate;
    private String performanceScheduleStartTime;
}
