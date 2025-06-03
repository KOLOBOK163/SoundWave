// com.example.SoundWave.models.TrackModel
package com.example.SoundWave.models;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class TrackModel {
    private Long id;
    private String title;
    private String artist;
    private String fileUrl;
    private String coverUrl;
    private String status;
    private String genre;
    private Long userId;
    private String username;
    private LocalDateTime releaseDate;
    private LocalDateTime approvalDate;
    private long playCount;
    private String rejectionReason;

}