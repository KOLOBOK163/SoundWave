package com.example.SoundWave.controller;

import com.example.SoundWave.entity.UserEntity;
import com.example.SoundWave.models.UserModel;
import com.example.SoundWave.response.LoginResponse;
import com.example.SoundWave.services.UserService;
import com.example.SoundWave.services.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;


    @PostMapping("/register")
    public ResponseEntity<?> registration(@RequestBody UserModel userModel) {
        try {
            userService.registration(userModel);
            return ResponseEntity.ok("User was saved successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserModel userModel) {
        try {
            LoginResponse loginResponse = userService.login(userModel);
            return ResponseEntity.ok(loginResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/admin/create")
    public ResponseEntity<?> createAdmin(@RequestBody UserModel userModel)
    {
        try{
            UserEntity admin = userService.createAdmin(userModel);
            return ResponseEntity.ok("Админ создан успешно");
        }catch (Exception e) {
            return ResponseEntity.badRequest().body("Ошибка: " + e.getMessage());
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            return ResponseEntity.ok(userService.getUserProfile(userDetails.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/profile/edit")
    public ResponseEntity<?> updateUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestPart("username") String newUsername,
            @RequestPart(value = "password", required = false) String newPassword,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        try {
            UserEntity updatedUser = userService.updateUserProfile(
                    userDetails.getUsername(),
                    newUsername,
                    newPassword,
                    avatar
            );
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
