package com.example.taskmanager.repository;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.taskmanager.model.AppUser;


public interface AppUserRepository extends JpaRepository<AppUser, Long>{
    Optional<AppUser> findByUsername(String username);
}
