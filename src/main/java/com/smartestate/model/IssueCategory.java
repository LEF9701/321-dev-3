package com.smartestate.model;

public enum IssueCategory {
    PLUMBING("Plumbing"),
    ELECTRICAL("Electrical"),
    AC_HEATING("Air-con / Heating"),
    SECURITY("Security"),
    COMMON_AREA("Common Area"),
    NOISE("Noise"),
    OTHER("Other");

    private final String label;
    IssueCategory(String label) { this.label = label; }
    public String getLabel() { return label; }
}
