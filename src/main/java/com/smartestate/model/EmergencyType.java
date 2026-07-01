package com.smartestate.model;

public enum EmergencyType {
    FIRE("Fire"),
    TYPHOON("Typhoon"),
    FLOOD("Flood"),
    GAS_LEAK("Gas Leak"),
    STRUCTURAL("Structural"),
    OTHER("Other");

    private final String label;
    EmergencyType(String label) { this.label = label; }
    public String getLabel() { return label; }
}
