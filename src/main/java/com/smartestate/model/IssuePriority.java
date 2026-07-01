package com.smartestate.model;

public enum IssuePriority {
    LOW("Low"),
    MEDIUM("Medium"),
    HIGH("High");

    private final String label;
    IssuePriority(String label) { this.label = label; }
    public String getLabel() { return label; }
}
