package com.smartestate.model;

public enum Severity {
    INFO("Info"),
    WARNING("Warning"),
    CRITICAL("Critical");

    private final String label;
    Severity(String label) { this.label = label; }
    public String getLabel() { return label; }
}
