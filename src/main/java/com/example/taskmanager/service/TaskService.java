package com.example.taskmanager.service;
import org.springframework.stereotype.Service;

import com.example.taskmanager.model.AppUser;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.repository.AppUserRepository;
import com.example.taskmanager.repository.TaskRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import com.example.taskmanager.mapper.TaskMapper;
import com.example.taskmanager.dto.TaskDTO;
import com.example.taskmanager.dto.TaskStatsDTO;

@Service
public class TaskService {
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;
    private final AppUserRepository userRepository;

    public TaskService(TaskRepository taskRepository, TaskMapper taskMapper, AppUserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
        this.userRepository = userRepository;
    }

    public TaskDTO saveTask(TaskDTO taskDTO, String username) {
        AppUser currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Ο χρήστης δεν βρέθηκε"));
        Task task = taskMapper.convertToEntity(taskDTO);
        task.setAppUser(currentUser);
        Task savedTask = taskRepository.save(task);
        return taskMapper.convertToDTO(savedTask);
    }

    public void deleteTask(Long id, String username) {
        Task task = taskRepository.findByIdAndAppUser_Username(id, username)
                .orElseThrow(() -> new RuntimeException("Το task δεν βρέθηκε ή δεν σου ανήκει!"));
        taskRepository.delete(task);
    }
    

    public List<TaskDTO> getAllTasks(String username) {
        List<Task> tasks = taskRepository.findByAppUser_Username(username);
        
        return tasks.stream()
            .map(taskMapper::convertToDTO)
            .collect(Collectors.toList());  
    }

    public TaskStatsDTO getStats(String username) {
        TaskStatsDTO stats = new TaskStatsDTO();
        stats.setTasks(taskRepository.findTasksNumberByUsername(username));
        stats.setCompleted(taskRepository.getCompletedTasksByUsername(username));
        stats.setNotCompleted(taskRepository.getNotCompletedTasksByUsername(username));
        stats.setExpired(taskRepository.getExpiredTasksByUsername(LocalDate.now(), username));
        return stats;
    }
}

