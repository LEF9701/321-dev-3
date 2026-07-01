package com.smartestate.model;

public enum DeliveryStatus {
    PENDING("Pending"),
    SENT("Sent"),
    DELIVERED("Delivered"),
    READ("Read"),
    FAILED("Failed");

    private final String label;
    DeliveryStatus(String label) { this.label = label; }
    public String getLabel() { return label; }
}
