package com.example.SoundWave.repository;

import com.example.SoundWave.entity.Enum.TrackStatus;
import com.example.SoundWave.entity.TrackEntity;
import com.example.SoundWave.entity.UserEntity;
import org.springframework.data.repository.CrudRepository;

import javax.sound.midi.Track;
import java.util.List;

public interface TrackRepo extends CrudRepository<TrackEntity, Long> {
    List<TrackEntity> findByStatus(TrackStatus status);
    List<TrackEntity> findByUserId(Long userId);
}
