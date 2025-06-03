// com.example.SoundWave.mappers.TrackMapper
package com.example.SoundWave.mappers;

import com.example.SoundWave.entity.Enum.TrackStatus;
import com.example.SoundWave.entity.TrackEntity;
import com.example.SoundWave.models.TrackModel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TrackMapper {

    @Mapping(source = "id", target = "id")
    @Mapping(source = "title", target = "title")
    @Mapping(source = "artist", target = "artist")
    @Mapping(source = "fileUrl", target = "fileUrl")
    @Mapping(source = "coverUrl", target = "coverUrl")
    @Mapping(source = "genre", target = "genre")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.username", target = "username")
    TrackModel trackEntityToTrackModel(TrackEntity trackEntity);

    TrackEntity trackModelToTrackEntity(TrackModel trackModel);

    default TrackStatus mapStatus(String status) {
        try {
            return TrackStatus.valueOf(status);
        }
        catch (Exception e)
        {
            return TrackStatus.PENDING;
        }

    }
}