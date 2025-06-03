package com.example.SoundWave.repository;

import com.example.SoundWave.entity.Enum.TrackStatus;
import com.example.SoundWave.entity.TrackEntity;
import com.example.SoundWave.entity.UserEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import javax.sound.midi.Track;
import java.util.List;

public interface TrackRepo extends CrudRepository<TrackEntity, Long> {

    List<TrackEntity> findByStatus(TrackStatus status);

    List<TrackEntity> findByUserId(Long userId);

    @Query("SELECT t FROM TrackEntity t WHERE t.status = :status ORDER BY t.uploadDate DESC")
    List<TrackEntity> findByStatusOrderByUploadDateDesc(TrackStatus status, Pageable pageable);

    @Query("SELECT t FROM TrackEntity t WHERE t.status = :status ORDER BY t.playCount DESC")
    List<TrackEntity> findTopByPlayCountOrderByDesc(TrackStatus status, Pageable pageable);

    @Query(value = "SELECT * FROM track_entity WHERE status = 'APPROVED' ORDER BY play_count DESC LIMIT :limit",
            nativeQuery = true)
    List<TrackEntity> findTopByPlayCountOrderByDesc(int limit);

    @Query("SELECT t FROM TrackEntity t WHERE t.status = 'APPROVED' AND (LOWER(t.title) LIKE %:query% OR LOWER(t.artist) LIKE %:query%)")
    List<TrackEntity> findByTitleContainingOrArtistContainingAndStatus(String query);

    List<TrackEntity> findByGenreAndStatus(String genre, TrackStatus status);

    List<TrackEntity> findByTitleContainingOrArtistContaining(String title, String artist);

}
