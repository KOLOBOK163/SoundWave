package com.example.SoundWave.entity.AdminInitializr;

import com.example.SoundWave.entity.UserEntity;
import com.example.SoundWave.repository.UserRepo;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements ApplicationRunner {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;

    public AdminInitializer(UserRepo userRepo, PasswordEncoder passwordEncoder)
    {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if(userRepo.findByRole("ADMIN").isEmpty()){
            UserEntity admin = new UserEntity();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin1"));
            admin.setEmail("admin@soundwave.com");
            admin.setRole("ADMIN");

            userRepo.save(admin);

            System.out.println("Администратор создан: username=admin, password=admin1");
        }

    }
}
