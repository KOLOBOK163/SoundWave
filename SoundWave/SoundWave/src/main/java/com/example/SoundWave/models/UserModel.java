package com.example.SoundWave.models;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserModel {
    private Long id;
    private String username;
    private String email;
    private String password;
    private String avatarUrl;
}
