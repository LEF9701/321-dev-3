package com.smartestate.model;

public enum FeeStatus {
    PAID("Paid"),
    DUE("Due"),
    OVERDUE("Overdue");

    private final String label;
    FeeStatus(String label) { this.label = label; }
    public String getLabel() { return label; }
}
