package com.example.taskmanager.controller;

import java.security.Principal;

import org.springframework.web.bind.annotation.*;

import com.example.taskmanager.dto.TaskDTO;
import com.example.taskmanager.service.EditService;

@RestController
@RequestMapping("/tasks")
public class EditController {

    private final EditService editService;

    public EditController(EditService editService) {
        this.editService = editService;
    }

    @GetMapping("/{id}")
    public TaskDTO getTaskById(@PathVariable Long id, Principal principal) {
        return editService.getTaskById(id, principal.getName());
    }

    @PutMapping("/{id}")
    public TaskDTO updateTask(@PathVariable Long id, @RequestBody TaskDTO updatedTaskDTO, Principal principal) {
        return editService.updateTask(id, updatedTaskDTO, principal.getName());
    }
}
