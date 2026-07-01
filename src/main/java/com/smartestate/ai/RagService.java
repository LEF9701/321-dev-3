package com.smartestate.ai;

import com.smartestate.model.BylawDoc;
import com.smartestate.model.Language;
import com.smartestate.repo.BylawDocRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Bilingual Retrieval-Augmented Generation over the bylaw / FAQ corpus (FR-8.1).
 * Retrieval (chunk → TF-IDF → top-K above a similarity threshold → [doc-k] citations) follows
 * rp.pdf §2. For usability the strict refusal is relaxed: when Claude is enabled it always
 * answers (greetings + general estate questions, grounded in retrieved context when relevant);
 * the offline engine cites passages when found and otherwise shows a friendly help message.
 */
@Service
public class RagService {

    private final BylawDocRepository bylawRepo;
    private final ClaudeClient claudeClient;

    @Value("${app.ai.rag.top-k:4}")
    private int topK;

    @Value("${app.ai.rag.threshold:0.06}")
    private double threshold;

    private final Tfidf index = new Tfidf();
    private final List<Chunk> chunks = new ArrayList<>();
    private volatile boolean built = false;

    private static final String CLAUDE_INSTRUCTIONS =
            "You are the friendly assistant for Evergreen Bay Estate, a Hong Kong residential estate, inside the "
            + "Smart Estate building-management system. Help residents with anything about estate rules, fees, "
            + "maintenance, facilities and daily living in the estate. Guidelines:\n"
            + "- When the provided context is relevant, base your answer on it and cite the passages you use as [doc-k].\n"
            + "- When the context does not fully cover the question, still give a helpful, sensible answer using general "
            + "knowledge of Hong Kong residential estate management, and note that the resident can confirm official "
            + "matters with the management office (Evergreen Property Management Ltd., 3000 0000).\n"
            + "- If the resident just greets you or makes small talk, respond warmly and invite their question.\n"
            + "- Reply in the resident's language (English or 中文) and keep it concise and friendly.\n"
            + "- Only decline if the request is clearly unrelated to the estate or inappropriate.";

    public RagService(BylawDocRepository bylawRepo, ClaudeClient claudeClient) {
        this.bylawRepo = bylawRepo;
        this.claudeClient = claudeClient;
    }

    /** Build the index once the corpus is seeded (after CommandLineRunners have run). */
    @EventListener(ApplicationReadyEvent.class)
    public void warmUp() {
        rebuild();
    }

    /** Rebuild the index — called after a new document is ingested (FR-8.2). */
    public synchronized void rebuild() {
        chunks.clear();
        for (BylawDoc doc : bylawRepo.findAllByOrderByCodeAsc()) {
            for (String piece : chunk(doc.getContent())) {
                chunks.add(new Chunk(doc.getCode(), doc.getTitle(), doc.getLanguage(), piece));
            }
        }
        List<String> corpus = new ArrayList<>();
        for (Chunk c : chunks) corpus.add(c.title + ". " + c.text);
        index.fit(corpus);
        built = true;
    }

    private void ensureBuilt() {
        if (!built || chunks.isEmpty()) rebuild();
    }

    public RagAnswer ask(String query) {
        ensureBuilt();
        RagAnswer answer = new RagAnswer();
        answer.query = query;
        if (query == null || query.isBlank()) {
            answer.answer = helpMessage();
            return answer;
        }

        // Retrieve citable context (top-K above threshold); may be empty for general questions.
        List<RetrievedChunk> sources = retrieveSources(query);
        answer.sources = sources;

        // Claude mode: always answer helpfully — usability over a strict retrieval gate.
        if (claudeClient.isAvailable()) {
            String context = sources.isEmpty()
                    ? "(No specific estate bylaw passage closely matched this question — use general knowledge.)"
                    : buildContext(sources);
            Optional<String> generated = claudeClient.generate(CLAUDE_INSTRUCTIONS, query, context);
            if (generated.isPresent()) {
                answer.answer = generated.get();
                answer.mode = "Claude (" + claudeClient.modelName() + ")";
                return answer;
            }
            // Claude errored — fall through to the local engine.
        }

        // Local (offline) mode: cite passages when found, otherwise a friendly help message.
        answer.mode = "Local (extractive TF-IDF)";
        answer.answer = sources.isEmpty() ? helpMessage() : extractiveAnswer(sources);
        return answer;
    }

    private List<RetrievedChunk> retrieveSources(String query) {
        if (query == null || query.isBlank() || chunks.isEmpty()) return List.of();
        Map<String, Double> qv = index.vectorize(query);
        double[] scores = new double[chunks.size()];
        for (int i = 0; i < chunks.size(); i++) scores[i] = Tfidf.cosine(qv, index.docVector(i));
        Integer[] order = new Integer[chunks.size()];
        for (int i = 0; i < order.length; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> Double.compare(scores[b], scores[a]));

        List<RetrievedChunk> sources = new ArrayList<>();
        for (int rank = 0; rank < order.length && sources.size() < topK; rank++) {
            int i = order[rank];
            if (scores[i] < threshold) break;
            Chunk c = chunks.get(i);
            RetrievedChunk rc = new RetrievedChunk();
            rc.label = "doc-" + (sources.size() + 1);
            rc.docCode = c.docCode;
            rc.title = c.title;
            rc.snippet = c.text;
            rc.language = c.language;
            rc.score = Math.round(scores[i] * 1000) / 1000.0;
            sources.add(rc);
        }
        return sources;
    }

    /** Friendly fallback that points the resident at what they CAN ask, instead of a flat refusal. */
    private String helpMessage() {
        Set<String> cats = new LinkedHashSet<>();
        for (BylawDoc d : bylawRepo.findAllByOrderByCodeAsc()) {
            if (d.getCategory() != null && !d.getCategory().isBlank()) cats.add(d.getCategory());
        }
        String topics = cats.isEmpty() ? "estate rules and FAQs" : String.join(", ", cats);
        return "Hi! I'm the Evergreen Bay Estate assistant. I can help with questions about: " + topics + ".\n\n"
                + "For example, try: \"What are the quiet hours?\", \"What happens if my management fee is late?\", "
                + "or \"Can I keep a dog?\".\n\n"
                + "For anything official, please contact the management office (Evergreen Property Management Ltd., 3000 0000).";
    }

    /** Distinct doc codes in descending similarity order (no threshold) — for retrieval evaluation. */
    public List<String> rankedDocCodes(String query) {
        ensureBuilt();
        if (query == null || query.isBlank() || chunks.isEmpty()) return List.of();
        Map<String, Double> qv = index.vectorize(query);
        double[] scores = new double[chunks.size()];
        for (int i = 0; i < chunks.size(); i++) scores[i] = Tfidf.cosine(qv, index.docVector(i));
        Integer[] order = new Integer[chunks.size()];
        for (int i = 0; i < order.length; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> Double.compare(scores[b], scores[a]));
        List<String> docs = new ArrayList<>();
        for (int rank = 0; rank < order.length; rank++) {
            String code = chunks.get(order[rank]).docCode();
            if (!docs.contains(code)) docs.add(code);
        }
        return docs;
    }

    private String buildContext(List<RetrievedChunk> sources) {
        StringBuilder sb = new StringBuilder();
        for (RetrievedChunk r : sources) {
            sb.append("[").append(r.label).append("] ").append(r.title).append(": ").append(r.snippet).append("\n");
        }
        return sb.toString();
    }

    private String extractiveAnswer(List<RetrievedChunk> sources) {
        StringBuilder sb = new StringBuilder("Based on the estate bylaws and FAQs:\n\n");
        for (RetrievedChunk r : sources) {
            sb.append("[").append(r.label).append("] ").append(r.snippet).append("\n\n");
        }
        sb.append("(Sources are listed below. This answer is assembled directly from the cited passages.)");
        return sb.toString();
    }

    /** Split text into ~400-char chunks on sentence-ish boundaries. */
    private List<String> chunk(String text) {
        List<String> out = new ArrayList<>();
        if (text == null || text.isBlank()) return out;
        String[] parts = text.split("(?<=[.!?。！？])\\s+");
        StringBuilder cur = new StringBuilder();
        for (String p : parts) {
            if (cur.length() + p.length() > 400 && cur.length() > 0) {
                out.add(cur.toString().trim());
                cur.setLength(0);
            }
            cur.append(p).append(" ");
        }
        if (cur.length() > 0) out.add(cur.toString().trim());
        return out;
    }

    // ---- value types ------------------------------------------------------

    private record Chunk(String docCode, String title, Language language, String text) {}

    public static class RagAnswer {
        public String query;
        public String answer;
        public boolean refused;
        public String mode = "Local (extractive TF-IDF)";
        public List<RetrievedChunk> sources = new ArrayList<>();

        public String getQuery() { return query; }
        public String getAnswer() { return answer; }
        public boolean isRefused() { return refused; }
        public String getMode() { return mode; }
        public List<RetrievedChunk> getSources() { return sources; }
    }

    public static class RetrievedChunk {
        public String label;
        public String docCode;
        public String title;
        public String snippet;
        public double score;
        public Language language;

        public String getLabel() { return label; }
        public String getDocCode() { return docCode; }
        public String getTitle() { return title; }
        public String getSnippet() { return snippet; }
        public double getScore() { return score; }
        public Language getLanguage() { return language; }
    }
}
