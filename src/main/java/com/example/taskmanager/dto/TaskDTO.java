package com.example.taskmanager.dto;

import java.time.LocalDate;

public class TaskDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDate dueDate;
    private boolean completed;
    private CategoryDTO category;

    public TaskDTO () {}

    public Long getId() { 
        return id; 
    }
    public void setId(Long id) { 
        this.id = id; 
    }

    public String getTitle() { 
        return title; 
    }
    public void setTitle(String title) { 
        this.title = title; 
    }

    public String getDescription() { 
        return description; 
    }
    public void setDescription(String description) { 
        this.description = description; 
    }

    public LocalDate getDueDate() { 
        return dueDate; 
    }
    public void setDueDate(LocalDate dueDate) { 
        this.dueDate = dueDate; 
    }

    public boolean isCompleted() { 
        return completed;
    }
    public void setCompleted(boolean completed) { 
        this.completed = completed; 
    }

    public CategoryDTO getCategory() { 
        return category; 
    }
    public void setCategory(CategoryDTO category) { 
        this.category = category; 
    }
}
