package com.example.taskmanager.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.taskmanager.model.Task;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByAppUser_Username(String username);

    Optional<Task> findByIdAndAppUser_Username(Long id, String username);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.appUser.username = :username")
    long findTasksNumberByUsername(@Param("username") String username);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.completed = true AND t.appUser.username = :username")
    long getCompletedTasksByUsername(@Param("username") String username);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.completed = false AND t.appUser.username = :username")
    long getNotCompletedTasksByUsername(@Param("username") String username);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.dueDate < :today AND t.completed = false AND t.appUser.username = :username")
    long getExpiredTasksByUsername(@Param("today") LocalDate today, @Param("username") String username);
}

