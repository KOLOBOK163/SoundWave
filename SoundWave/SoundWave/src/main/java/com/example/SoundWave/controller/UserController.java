package com.example.SoundWave.controller;

import com.example.SoundWave.entity.UserEntity;
import com.example.SoundWave.models.UserModel;
import com.example.SoundWave.response.LoginResponse;
import com.example.SoundWave.services.UserService;
import com.example.SoundWave.services.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    @Autowired
    public UserController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

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
