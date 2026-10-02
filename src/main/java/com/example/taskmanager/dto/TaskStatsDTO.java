package com.example.taskmanager.dto;


public class TaskStatsDTO {
    private Long tasks;
    private Long completed;
    private Long notCompleted;
    private Long expired;

    public TaskStatsDTO() {};
    public TaskStatsDTO(Long tasks, Long completed, Long notCompleted, Long expired) {
        this.tasks = tasks;
        this.completed = completed;
        this.notCompleted = notCompleted;
        this.expired = expired;
    }

    public Long getTasks() {
        return tasks;
    }

    public void setTasks(Long tasks) {
        this.tasks = tasks;
    }

    public Long getCompleted() {
        return completed;
    }

    public void setCompleted(Long completed) {
        this.completed = completed;
    }

    public Long getNotCompleted() {
        return notCompleted;
    }
    
    public void setNotCompleted(Long notCompleted) {
        this.notCompleted = notCompleted;
    }
    
    public Long getExpired() {
        return expired;
    }

    public void setExpired(Long expired) {
        this.expired = expired;
    }
}
