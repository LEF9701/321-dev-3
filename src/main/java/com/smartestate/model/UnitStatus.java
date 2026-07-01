package com.smartestate.model;

public enum UnitStatus {
    VACANT("Vacant"),
    OCCUPIED("Occupied");

    private final String label;
    UnitStatus(String label) { this.label = label; }
    public String getLabel() { return label; }
}
