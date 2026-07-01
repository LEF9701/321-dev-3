package com.smartestate.model;

public enum Role {
    RESIDENT("Resident"),
    MANAGEMENT("Management"),
    ADMIN("Admin");

    private final String label;
    Role(String label) { this.label = label; }
    public String getLabel() { return label; }
}
