// com.example.SoundWave.mappers.TrackMapper
package com.example.SoundWave.mappers;

import com.example.SoundWave.entity.Enum.TrackStatus;
import com.example.SoundWave.entity.TrackEntity;
import com.example.SoundWave.models.TrackModel;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TrackMapper {

    TrackModel trackEntityToTrackModel(TrackEntity trackEntity);

    TrackEntity trackModelToTrackEntity(TrackModel trackModel);

    // Преобразование TrackStatus в String
    default String map(TrackStatus status) {
        return status != null ? status.name() : "PENDING";
    }

    // Преобразование String в TrackStatus
    default TrackStatus map(String status) {
        return status != null ? TrackStatus.valueOf(status) : TrackStatus.PENDING;
    }
}