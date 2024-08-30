package com.example.SoundWave.mappers;

import com.example.SoundWave.entity.UserEntity;
import com.example.SoundWave.models.UserModel;
import org.mapstruct.Mapper;


@Mapper(componentModel = "spring")
public interface UserMapper {

    UserModel userEntityToUserModel(UserEntity userEntity);
    UserEntity userModelToUserEntity(UserModel userModel);
}
