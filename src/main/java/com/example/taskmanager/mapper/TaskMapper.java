package com.example.taskmanager.mapper;

import org.springframework.stereotype.Component;

import com.example.taskmanager.dto.CategoryDTO;
import com.example.taskmanager.dto.TaskDTO;
import com.example.taskmanager.model.Category;
import com.example.taskmanager.model.Task;


@Component
public class TaskMapper {
    public TaskDTO convertToDTO(Task task) { 
        TaskDTO dto = new TaskDTO();
        
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setDueDate(task.getDueDate());
        dto.setCompleted(task.isCompleted());

        if (task.getCategory() != null) {
            CategoryDTO categoryDTO = new CategoryDTO(
                task.getCategory().getId(),
                task.getCategory().getName()
            );
            dto.setCategory(categoryDTO);
        }
        
        return dto;
    }

    public Task convertToEntity(TaskDTO dto) {
        Task task = new Task();

        if (dto.getId() != null) {
            task.setId(dto.getId());
        }

        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setDueDate(dto.getDueDate());
        task.setCompleted(dto.isCompleted());

        if (dto.getCategory() != null && dto.getCategory().getId() != null) {
            Category category = new Category();
            category.setId(dto.getCategory().getId());
            category.setName(dto.getCategory().getName());
            task.setCategory(category);
        }
        
        return task;
    }
}
