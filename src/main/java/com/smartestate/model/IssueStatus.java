package com.smartestate.model;

public enum IssueStatus {
    SUBMITTED("Submitted"),
    UNDER_REVIEW("Under Review"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved"),
    WITHDRAWN("Withdrawn");

    private final String label;
    IssueStatus(String label) { this.label = label; }
    public String getLabel() { return label; }
}
