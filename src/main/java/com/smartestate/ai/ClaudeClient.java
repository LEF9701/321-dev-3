package com.smartestate.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.models.messages.Message;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.Model;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Optional Claude-backed generation for the FR-8 chatbot. Disabled by default — the RAG
 * answer is produced by the local extractive engine. When app.ai.claude.enabled=true and
 * ANTHROPIC_API_KEY is set, the retrieved bylaw context is sent to Claude for a fluent,
 * grounded answer. Any failure falls back silently to the local engine.
 */
@Component
public class ClaudeClient {

    private static final Logger log = LoggerFactory.getLogger(ClaudeClient.class);

    @Value("${app.ai.claude.enabled:true}")
    private boolean enabled;

    @Value("${app.ai.claude.model:claude-opus-4-8}")
    private String model;

    private volatile AnthropicClient client;

    public boolean isAvailable() {
        String key = System.getenv("ANTHROPIC_API_KEY");
        return enabled && key != null && !key.isBlank();
    }

    public String modelName() {
        return model;
    }

    /** Returns Claude's grounded answer, or empty if unavailable / on any error. */
    public Optional<String> generate(String instructions, String question, String context) {
        if (!isAvailable()) return Optional.empty();
        try {
            AnthropicClient c = client();
            String prompt = instructions
                    + "\n\nResident question:\n" + question
                    + "\n\nContext (cite facts as [doc-k]):\n" + context;
            MessageCreateParams params = MessageCreateParams.builder()
                    .model(resolveModel())
                    .maxTokens(1024L)
                    .addUserMessage(prompt)
                    .build();
            Message response = c.messages().create(params);
            StringBuilder sb = new StringBuilder();
            response.content().stream()
                    .flatMap(block -> block.text().stream())
                    .forEach(t -> sb.append(t.text()));
            String text = sb.toString().trim();
            return text.isEmpty() ? Optional.empty() : Optional.of(text);
        } catch (Exception e) {
            log.warn("Claude generation failed, falling back to local engine: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private Model resolveModel() {
        // Model.of() passes the configured id straight to the API, so it works for model
        // names newer than this SDK build's typed constants (e.g. claude-opus-4-8).
        return Model.of(model);
    }

    private AnthropicClient client() {
        AnthropicClient c = client;
        if (c == null) {
            synchronized (this) {
                c = client;
                if (c == null) {
                    c = AnthropicOkHttpClient.fromEnv();
                    client = c;
                }
            }
        }
        return c;
    }
}
