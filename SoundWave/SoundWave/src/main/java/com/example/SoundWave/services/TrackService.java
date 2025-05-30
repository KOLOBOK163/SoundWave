// com.example.SoundWave.services.TrackService
package com.example.SoundWave.services;

import com.example.SoundWave.entity.TrackEntity;
import com.example.SoundWave.entity.Enum.TrackStatus;
import com.example.SoundWave.entity.UserEntity;
import com.example.SoundWave.mappers.TrackMapper;
import com.example.SoundWave.models.TrackModel;
import com.example.SoundWave.repository.TrackRepo;
import com.example.SoundWave.repository.UserRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TrackService {

    private final TrackRepo trackRepo;
    private final UserRepo userRepo;
    private final TrackMapper trackMapper;

    @Value("${upload.path}/tracks")
    private String uploadPath;

    public TrackService(TrackRepo trackRepo, UserRepo userRepo, TrackMapper trackMapper) {
        this.trackRepo = trackRepo;
        this.userRepo = userRepo;
        this.trackMapper = trackMapper;
    }

    public TrackModel uploadTrack(String title, String artist, MultipartFile file, String username) throws IOException {
        UserEntity user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadPath, fileName);
        Files.createDirectories(filePath.getParent());
        file.transferTo(filePath.toFile());

        TrackEntity track = new TrackEntity();
        track.setTitle(title);
        track.setArtist(artist);
        track.setFileUrl("/uploads/tracks/" + fileName);
        track.setStatus(TrackStatus.PENDING);
        track.setUser(user);

        trackRepo.save(track);

        TrackModel trackModel = trackMapper.trackEntityToTrackModel(track);
        trackModel.setStatus(track.getStatus().name()); // Ручной маппинг
        return trackModel;
    }

    public List<TrackModel> getTracksByStatus(TrackStatus status) {
        return trackRepo.findByStatus(status).stream()
                .map(track -> {
                    TrackModel trackModel = trackMapper.trackEntityToTrackModel(track);
                    trackModel.setStatus(track.getStatus().name()); // Ручной маппинг
                    return trackModel;
                })
                .collect(Collectors.toList());
    }

    public List<TrackModel> getTracksByUser(Long userId) {
        return trackRepo.findByUserId(userId).stream()
                .map(track -> {
                    TrackModel trackModel = trackMapper.trackEntityToTrackModel(track);
                    trackModel.setStatus(track.getStatus().name());
                    return trackModel;
                })
                .collect(Collectors.toList());
    }

    public TrackModel moderateTrack(Long trackId, TrackStatus newStatus) {
        TrackEntity track = trackRepo.findById(trackId)
                .orElseThrow(() -> new RuntimeException("Трек не найден"));
        track.setStatus(newStatus);
        trackRepo.save(track);

        TrackModel trackModel = trackMapper.trackEntityToTrackModel(track);
        trackModel.setStatus(track.getStatus().name()); // Ручной маппинг
        return trackModel;
    }
}