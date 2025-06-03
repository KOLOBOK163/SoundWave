package com.example.SoundWave.services;

import com.example.SoundWave.Exception.UserAlreadyExistException;
import com.example.SoundWave.Exception.UserNotFoundException;
import com.example.SoundWave.entity.UserEntity;
import com.example.SoundWave.mappers.UserMapper;
import com.example.SoundWave.models.UserModel;
import com.example.SoundWave.repository.UserRepo;
import com.example.SoundWave.response.LoginResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Value("${upload.avatars.path}")
    private String avatarsUploadPath;

    public UserService(
            UserRepo userRepo,
            UserMapper userMapper,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepo = userRepo;
        this.userMapper = userMapper;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserEntity registration(UserModel userModel) throws UserAlreadyExistException {
        if (userRepo.findByUsername(userModel.getUsername()).isPresent()) {
            throw new UserAlreadyExistException("Пользователь с таким именем уже существует");
        }
        UserEntity userEntity = userMapper.userModelToUserEntity(userModel);
        userEntity.setUsername(userModel.getUsername());
        userEntity.setEmail(userModel.getEmail());
        userEntity.setPassword(passwordEncoder.encode(userModel.getPassword()));
        userEntity.setRole("USER");
        return userRepo.save(userEntity);
    }

    public LoginResponse login(UserModel userModel) throws UserNotFoundException {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        userModel.getUsername(),
                        userModel.getPassword())
        );

        UserEntity authenticatedUser = userRepo.findByUsername(userModel.getUsername())
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));

        String jwtToken = jwtService.generateToken(authenticatedUser);
        Long expiresIn = jwtService.getExpirationTime();

        LoginResponse loginResponse = new LoginResponse();
        loginResponse.setToken(jwtToken);
        loginResponse.setExpiresIn(expiresIn);

        return loginResponse;
    }

    public UserEntity getUserProfile(String userName) throws UserNotFoundException {
        return userRepo.findByUsername(userName)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
    }

    public void updateAvatar(String userName, String avatarUrl) throws UserNotFoundException {
        UserEntity user = userRepo.findByUsername(userName)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));
        user.setAvatarUrl(avatarUrl);
        userRepo.save(user);
    }

    public UserEntity updateUserProfile(String username, String newUsername, String newPassword, MultipartFile avatar) throws IOException, UserNotFoundException {
        UserEntity user = userRepo.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("Пользователь не найден"));

        if (avatar != null && !avatar.isEmpty()) {
            String avatarUrl = saveAvatar(avatar);
            user.setAvatarUrl(avatarUrl);
        }

        if (newUsername != null && !newUsername.isEmpty()) {
            user.setUsername(newUsername);
        }

        if (newPassword != null && !newPassword.isEmpty()) {
            user.setPassword(passwordEncoder.encode(newPassword));
        }

        return userRepo.save(user);
    }

    private String saveAvatar(MultipartFile file) throws IOException {
        String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
        File uploadDir = new File(avatarsUploadPath);
        if (!uploadDir.exists()) {
            uploadDir.mkdirs();
        }

        File destFile = new File(uploadDir.getAbsolutePath() + File.separator + fileName);
        file.transferTo(destFile);

        return "/" + avatarsUploadPath + "/" + fileName;
    }

    public UserEntity createAdmin(UserModel userModel) throws UserAlreadyExistException{
        if(userRepo.findByUsername(userModel.getUsername()).isPresent()){
            throw new UserAlreadyExistException("Пользователь с таким именем уже существует");
        }

        UserEntity userEntity = userMapper.userModelToUserEntity(userModel);
        userEntity.setUsername(userModel.getUsername());
        userEntity.setEmail(userModel.getEmail());
        userEntity.setPassword(userModel.getPassword());
        userEntity.setRole("ADMIN");

        return userRepo.save(userEntity);
    }

}
