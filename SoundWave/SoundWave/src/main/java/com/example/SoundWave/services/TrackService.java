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

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
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

    public TrackModel uploadTrack(String title, String artist, String genre, MultipartFile trackFile, MultipartFile coverFile, String username) throws IOException {
        UserEntity user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));

        Path trackPath = Paths.get(uploadPath);
        Files.createDirectories(trackPath);

        String trackFileName = UUID.randomUUID().toString() + "_" + trackFile.getOriginalFilename();
        Path trackFilePath = trackPath.resolve(trackFileName);
        Files.write(trackFilePath, trackFile.getBytes());

        TrackEntity track = new TrackEntity();
        track.setTitle(title);
        track.setArtist(artist);
        track.setGenre(genre);
        track.setFileUrl("/uploads/tracks/" + trackFileName);
        track.setUser(user);
        track.setUploadDate(LocalDateTime.now());

        if(user.getRole().equals("ADMIN"))
        {
            track.setStatus(TrackStatus.APPROVED);
            track.setApprovalDate(LocalDateTime.now());
        }
        else{
            track.setStatus(TrackStatus.PENDING);
        }

        if(coverFile != null && !coverFile.isEmpty())
        {
            Path coverPath = Paths.get(uploadPath + "/covers");
            Files.createDirectories(coverPath);

            String coverFileName = UUID.randomUUID().toString() + "_" + coverFile.getOriginalFilename();
            Path coverFilePath = coverPath.resolve(coverFileName);
            Files.write(coverFilePath, coverFile.getBytes());

            track.setCoverUrl("/uploads/tracks/covers/" + coverFileName);
        }

        TrackEntity savedTrack = trackRepo.save(track);

        TrackModel trackModel = trackMapper.trackEntityToTrackModel(track);
        trackModel.setId(savedTrack.getId());
        trackModel.setTitle(savedTrack.getTitle());
        trackModel.setArtist(savedTrack.getArtist());
        trackModel.setGenre(savedTrack.getGenre());
        trackModel.setFileUrl(savedTrack.getFileUrl());
        trackModel.setCoverUrl(savedTrack.getCoverUrl());
        trackModel.setStatus(savedTrack.getStatus().name());
        trackModel.setUserId(savedTrack.getUser().getId());
        trackModel.setUsername(savedTrack.getUser().getUsername());
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

    public TrackModel moderateTrack(Long trackId, TrackStatus newStatus, String rejectionReason) {
        TrackEntity track = trackRepo.findById(trackId)
                .orElseThrow(() -> new RuntimeException("Трек не найден"));
        track.setStatus(newStatus);

        if( newStatus == TrackStatus.APPROVED)
        {
            track.setApprovalDate(LocalDateTime.now());
        }
        else if (newStatus == TrackStatus.REJECTED && rejectionReason != null)
        {
            track.setRejectionReason(rejectionReason);
        }

        trackRepo.save(track);

        TrackModel trackModel = trackMapper.trackEntityToTrackModel(track);
        trackModel.setStatus(track.getStatus().name());
        return trackModel;
    }

    public void incrementPlayCount(Long trackId)
    {
        TrackEntity track = trackRepo.findById(trackId)
                .orElseThrow(() -> new RuntimeException("Трек не найден"));

        track.setPlayCount(track.getPlayCount() + 1);
        trackRepo.save(track);
    }

    public List<TrackModel> getPopularTrack(int limit){
        return trackRepo.findTopByPlayCountOrderByDesc(limit).stream()
                .map(track -> {
                    TrackModel trackModel = trackMapper.trackEntityToTrackModel(track);
                    trackModel.setStatus(track.getStatus().name());
                    trackModel.setUsername(track.getUser().getUsername());
                    return  trackModel;
                })
                .collect(Collectors.toList());
    }

    public List<TrackModel> searchTracks(String query){
        String lowerCaseQuery = query.toLowerCase();
        return trackRepo.findByTitleContainingOrArtistContaining(lowerCaseQuery, lowerCaseQuery)
                .stream()
                .filter(track -> track.getStatus() == TrackStatus.APPROVED)
                .map(track -> {
                    TrackModel model = trackMapper.trackEntityToTrackModel(track);
                    model.setStatus(track.getStatus().name());
                    return model;
                })
                .collect(Collectors.toList());
    }
}