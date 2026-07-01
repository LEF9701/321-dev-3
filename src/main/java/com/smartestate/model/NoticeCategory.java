package com.smartestate.model;

public enum NoticeCategory {
    EMERGENCY("Emergency", true),
    ANNOUNCEMENT("Announcement", false),
    MEETING("Meeting / AGM Notice", false),
    FEE_REMINDER("Fee Reminder", false),
    SERVICE_INTERRUPTION("Service Interruption", false),
    MAINTENANCE("Maintenance", false),
    OBSERVATORY("HK Observatory Alert", false),
    GENERAL("General", false);

    private final String label;
    private final boolean forcedAllChannels;
    NoticeCategory(String label, boolean forcedAllChannels) {
        this.label = label;
        this.forcedAllChannels = forcedAllChannels;
    }
    public String getLabel() { return label; }
    public boolean isForcedAllChannels() { return forcedAllChannels; }
}
