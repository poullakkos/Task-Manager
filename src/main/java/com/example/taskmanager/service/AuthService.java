package com.example.taskmanager.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.taskmanager.dto.RegisterDTO;
import com.example.taskmanager.model.AppUser;
import com.example.taskmanager.repository.AppUserRepository;

@Service
public class AuthService {
    private final AppUserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    public AuthService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public void createUser(RegisterDTO dto) {
        if (userRepository.findByUsername(dto.username()).isPresent()) {
            throw new RuntimeException("Το username υπάρχει ήδη");
        } else {
            AppUser user = new AppUser();
            user.setUsername(dto.username());
            user.setPassword(passwordEncoder.encode(dto.password()));
            user.setRole("USER");
            userRepository.save(user);
        }
    }
}
