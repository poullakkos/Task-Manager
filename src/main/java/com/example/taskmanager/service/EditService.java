package com.example.taskmanager.service;

import org.springframework.stereotype.Service;

import com.example.taskmanager.dto.TaskDTO;
import com.example.taskmanager.mapper.TaskMapper;
import com.example.taskmanager.model.Category;
import com.example.taskmanager.model.Task;
import com.example.taskmanager.repository.TaskRepository;

@Service
public class EditService {
    
    private final TaskRepository taskRepository;
    private final TaskMapper taskMapper;

    public EditService(TaskRepository taskRepository, TaskMapper taskMapper) {
        this.taskRepository = taskRepository;
        this.taskMapper = taskMapper;
    }

    public TaskDTO getTaskById(Long id, String username) {
        Task task = taskRepository.findByIdAndAppUser_Username(id, username).orElse(null);
        return taskMapper.convertToDTO(task);
    }

    public TaskDTO updateTask(Long id, TaskDTO updatedTaskDTO, String username) {
        Task existingTask = taskRepository.findByIdAndAppUser_Username(id, username).orElse(null);
        
        if (existingTask != null) {
            existingTask.setTitle(updatedTaskDTO.getTitle());
            existingTask.setDescription(updatedTaskDTO.getDescription());
            existingTask.setDueDate(updatedTaskDTO.getDueDate());
            existingTask.setCompleted(updatedTaskDTO.isCompleted());
            
            if (updatedTaskDTO.getCategory() != null) {
                Category category = new Category();
                category.setId(updatedTaskDTO.getCategory().getId());
                existingTask.setCategory(category);
            } else {
                existingTask.setCategory(null);
            }
            
            Task savedTask = taskRepository.save(existingTask);
            return taskMapper.convertToDTO(savedTask);
        }
        return null;
    }
}