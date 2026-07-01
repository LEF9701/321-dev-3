package com.smartestate.model;

public enum Channel {
    SMS("SMS", true),
    WHATSAPP("WhatsApp", true),
    EMAIL("Email", true),
    VOICE("Voice Call", false);

    private final String label;
    private final boolean supportsReadReceipt;
    Channel(String label, boolean supportsReadReceipt) {
        this.label = label;
        this.supportsReadReceipt = supportsReadReceipt;
    }
    public String getLabel() { return label; }
    public boolean isSupportsReadReceipt() { return supportsReadReceipt; }
}
