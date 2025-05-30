// com.example.SoundWave.models.TrackModel
package com.example.SoundWave.models;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TrackModel {
    private Long id;
    private String title;
    private String artist;
    private String fileUrl;
    private String status;
    private Long userId;

    // Явно добавляем геттер и сеттер для status
    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}