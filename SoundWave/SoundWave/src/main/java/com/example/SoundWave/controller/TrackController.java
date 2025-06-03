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
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> uploadTrack(
            @RequestParam("title") String title,
            @RequestParam("artist") String artist,
            @RequestParam("genre") String genre,
            @RequestParam("trackFile") MultipartFile trackFile,
            @RequestParam("coverFile") MultipartFile coverFile,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            TrackModel track = trackService.uploadTrack(title, artist, genre,trackFile, coverFile, userDetails.getUsername());
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

    @GetMapping("/search")
    public ResponseEntity<List<TrackModel>> searchTracks(@RequestParam("query") String query){
            List<TrackModel> tracks = trackService.searchTracks(query);
            return ResponseEntity.ok(tracks);
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<List<TrackModel>> getUserTracks(@AuthenticationPrincipal UserDetails userDetails) {
        boolean isAdmin = userDetails.getAuthorities().stream()
                .anyMatch(authority -> {
                    String auth = authority.getAuthority();
                    return auth.equals("ADMIN");
                });

        UserEntity user = (UserEntity) userDetails;
        List<TrackModel> tracks = trackService.getTracksByUser(user.getId());
        return ResponseEntity.ok(tracks);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TrackModel>> getPendingTracks() {
        List<TrackModel> tracks = trackService.getTracksByStatus(TrackStatus.PENDING);
        return ResponseEntity.ok(tracks);
    }

    @PutMapping("/{id}/moderate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> moderateTrack(@PathVariable Long id, @RequestParam("status") String status, @RequestParam(value = "reason", required = false) String reason) {
        try {
            TrackStatus trackStatus = TrackStatus.valueOf(status.toUpperCase());
            TrackModel track = trackService.moderateTrack(id, trackStatus, reason);
            return ResponseEntity.ok(track);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Неверный статус: " + status);
        }
    }

    @PostMapping("/{id}/play")
    public ResponseEntity<?> registerPlay(@PathVariable Long id){
        try{
            trackService.incrementPlayCount(id);
            return ResponseEntity.ok().build();
        }
        catch (Exception e)
        {
            return ResponseEntity.badRequest().body("Ошибка: " + e.getMessage());
        }
    }

}