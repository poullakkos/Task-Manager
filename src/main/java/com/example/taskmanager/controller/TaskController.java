package com.example.taskmanager.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

import com.example.taskmanager.dto.TaskDTO;
import com.example.taskmanager.dto.TaskStatsDTO;
import com.example.taskmanager.service.TaskService;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public TaskDTO addTask(@RequestBody TaskDTO taskDTO, Principal principal) {
        return taskService.saveTask(taskDTO, principal.getName());
    }

    @GetMapping
    public List<TaskDTO> getAllTasks(Principal principal) {
        return taskService.getAllTasks(principal.getName());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, Principal principal) {
        taskService.deleteTask(id, principal.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public TaskStatsDTO getTaskStats(Principal principal) {
        return taskService.getStats(principal.getName());
    }
}
