// com.example.SoundWave.controller.TrackController
package com.example.SoundWave.controller;

import com.example.SoundWave.entity.Enum.TrackStatus;
import com.example.SoundWave.models.TrackModel;
import com.example.SoundWave.services.TrackService;
import com.example.SoundWave.entity.UserEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/tracks")
@CrossOrigin(origins = "http://localhost:3000")
public class TrackController {

    private final TrackService trackService;

    public TrackController(TrackService trackService) {
        this.trackService = trackService;
    }

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<?> uploadTrack(
            @RequestParam("title") String title,
            @RequestParam("artist") String artist,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            TrackModel track = trackService.uploadTrack(title, artist, file, userDetails.getUsername());
            return ResponseEntity.ok(track);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ошибка при загрузке трека: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<TrackModel>> getApprovedTracks() {
        List<TrackModel> tracks = trackService.getTracksByStatus(TrackStatus.APPROVED);
        return ResponseEntity.ok(tracks);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('ROLE_USER')")
    public ResponseEntity<List<TrackModel>> getUserTracks(@AuthenticationPrincipal UserDetails userDetails) {
        // Проверяем, является ли пользователь администратором
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

        // Если пользователь — администратор, передаем null (чтобы получить все треки)
        // Иначе передаем id текущего пользователя
        Long userId = isAdmin ? null : ((UserEntity) userDetails).getId();

        List<TrackModel> tracks = trackService.getTracksByUser(userId);
        return ResponseEntity.ok(tracks);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<TrackModel>> getPendingTracks() {
        List<TrackModel> tracks = trackService.getTracksByStatus(TrackStatus.PENDING);
        return ResponseEntity.ok(tracks);
    }

    @PutMapping("/{id}/moderate")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> moderateTrack(@PathVariable Long id, @RequestParam("status") String status) {
        try {
            TrackStatus trackStatus = TrackStatus.valueOf(status.toUpperCase());
            TrackModel track = trackService.moderateTrack(id, trackStatus);
            return ResponseEntity.ok(track);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Неверный статус: " + status);
        }
    }
}