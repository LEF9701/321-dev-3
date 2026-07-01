package com.smartestate.ai;

import com.smartestate.model.Issue;
import com.smartestate.model.IssueCategory;
import com.smartestate.repo.IssueRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Offline evaluation of the AI module (rp.pdf §5): k-NN classification accuracy on a held-out
 * split, and retrieval Recall@K / MRR over a fixed bilingual question set. Numbers are
 * indicative on a small test set — exactly the caveat rp.pdf §6 states.
 */
@Service
public class AiEvaluationService {

    private final IssueRepository issueRepository;
    private final RagService ragService;

    @Value("${app.ai.knn.k:5}")
    private int k;

    public AiEvaluationService(IssueRepository issueRepository, RagService ragService) {
        this.issueRepository = issueRepository;
        this.ragService = ragService;
    }

    // ---- classification: train/test split, k-NN accuracy --------------------

    public ClassificationEval evaluateClassification() {
        List<Issue> labeled = new ArrayList<>();
        for (Issue i : issueRepository.findAll()) {
            if (i.getCategory() != null && i.getDescription() != null && !i.getDescription().isBlank()) {
                labeled.add(i);
            }
        }
        labeled.sort(Comparator.comparing(Issue::getId));

        List<Issue> trainSet = new ArrayList<>();
        List<Issue> testSet = new ArrayList<>();
        for (int idx = 0; idx < labeled.size(); idx++) {
            (idx % 4 == 0 ? testSet : trainSet).add(labeled.get(idx)); // deterministic 25% test
        }

        Tfidf index = new Tfidf(false); // TF-only space, matching the classifier
        List<String> corpus = new ArrayList<>();
        for (Issue t : trainSet) corpus.add(t.getDescription());
        index.fit(corpus);
        List<Map<String, Double>> trainVecs = new ArrayList<>();
        for (int i = 0; i < trainSet.size(); i++) trainVecs.add(index.docVector(i));

        ClassificationEval eval = new ClassificationEval();
        eval.k = Math.min(k, Math.max(1, trainSet.size()));
        eval.trainSize = trainSet.size();
        Map<IssueCategory, int[]> perCat = new EnumMap<>(IssueCategory.class); // [total, correct]

        for (Issue test : testSet) {
            IssueCategory predicted = knnPredict(index, trainVecs, trainSet, test.getDescription(), eval.k);
            boolean correct = predicted == test.getCategory();
            if (correct) eval.correct++;
            eval.n++;
            perCat.computeIfAbsent(test.getCategory(), c -> new int[2]);
            perCat.get(test.getCategory())[0]++;
            if (correct) perCat.get(test.getCategory())[1]++;

            Example ex = new Example();
            ex.refNumber = test.getRefNumber();
            ex.actual = test.getCategory();
            ex.predicted = predicted;
            ex.correct = correct;
            eval.examples.add(ex);
        }
        eval.accuracyPct = eval.n == 0 ? 0 : Math.round(eval.correct * 100f / eval.n);
        for (Map.Entry<IssueCategory, int[]> e : perCat.entrySet()) {
            PerCategory pc = new PerCategory();
            pc.category = e.getKey();
            pc.total = e.getValue()[0];
            pc.correct = e.getValue()[1];
            pc.accuracyPct = pc.total == 0 ? 0 : Math.round(pc.correct * 100f / pc.total);
            eval.perCategory.add(pc);
        }
        return eval;
    }

    private IssueCategory knnPredict(Tfidf index, List<Map<String, Double>> trainVecs,
                                     List<Issue> trainSet, String description, int kk) {
        Map<String, Double> qv = index.vectorize(description);
        Integer[] order = new Integer[trainVecs.size()];
        double[] scores = new double[trainVecs.size()];
        for (int i = 0; i < trainVecs.size(); i++) { scores[i] = Tfidf.cosine(qv, trainVecs.get(i)); order[i] = i; }
        Arrays.sort(order, (a, b) -> Double.compare(scores[b], scores[a]));
        Map<IssueCategory, Double> votes = new EnumMap<>(IssueCategory.class);
        for (int n = 0; n < Math.min(kk, order.length); n++) {
            int i = order[n];
            votes.merge(trainSet.get(i).getCategory(), Math.max(scores[i], 1e-6), Double::sum);
        }
        IssueCategory best = null; double bv = -1;
        for (Map.Entry<IssueCategory, Double> e : votes.entrySet()) {
            if (e.getValue() > bv) { bv = e.getValue(); best = e.getKey(); }
        }
        return best;
    }

    // ---- retrieval: Recall@K + MRR over a fixed question set ----------------

    private static final String[][] RETRIEVAL_SET = {
            {"How do I pay my management fee and what happens if it is late?", "BL-FEES"},
            {"管理費逾期繳交會有甚麼後果？", "BL-FEES"},
            {"What are the quiet hours, when can I not make noise?", "BL-NOISE"},
            {"裝修工程可以在甚麼時間進行？", "BL-RENO"},
            {"Am I allowed to keep a dog in my flat?", "BL-PET"},
            {"Why must the corridor be kept clear of belongings?", "BL-FIRE"},
            {"火警發生時我應該怎麼做？", "BL-FIRE"},
            {"How do I book the lift to move house?", "FAQ-MOVE"},
            {"Water is seeping from the flat above me, what should I do?", "FAQ-LEAK"},
            {"How is an Owners Corporation general meeting called?", "BL-MEETING"},
    };

    public RetrievalEval evaluateRetrieval() {
        RetrievalEval eval = new RetrievalEval();
        int r1 = 0, r3 = 0, r5 = 0;
        double mrrSum = 0.0;
        for (String[] qa : RETRIEVAL_SET) {
            String question = qa[0];
            String expected = qa[1];
            List<String> ranked = ragService.rankedDocCodes(question);
            int rank = ranked.indexOf(expected) + 1; // 0 -> not found -> rank 0
            Row row = new Row();
            row.question = question;
            row.expected = expected;
            row.rank = rank == 0 ? "—" : String.valueOf(rank);
            row.topDocs = String.join(", ", ranked.subList(0, Math.min(3, ranked.size())));
            eval.rows.add(row);
            if (rank == 1) r1++;
            if (rank >= 1 && rank <= 3) r3++;
            if (rank >= 1 && rank <= 5) r5++;
            if (rank >= 1) mrrSum += 1.0 / rank;
        }
        eval.n = RETRIEVAL_SET.length;
        eval.recall1Pct = Math.round(r1 * 100f / eval.n);
        eval.recall3Pct = Math.round(r3 * 100f / eval.n);
        eval.recall5Pct = Math.round(r5 * 100f / eval.n);
        eval.mrr = Math.round(mrrSum / eval.n * 1000) / 1000.0;
        return eval;
    }

    // ---- value types ------------------------------------------------------

    public static class ClassificationEval {
        public int n, correct, accuracyPct, k, trainSize;
        public List<PerCategory> perCategory = new ArrayList<>();
        public List<Example> examples = new ArrayList<>();
        public int getN() { return n; }
        public int getCorrect() { return correct; }
        public int getAccuracyPct() { return accuracyPct; }
        public int getK() { return k; }
        public int getTrainSize() { return trainSize; }
        public List<PerCategory> getPerCategory() { return perCategory; }
        public List<Example> getExamples() { return examples; }
    }

    public static class PerCategory {
        public IssueCategory category;
        public int total, correct, accuracyPct;
        public IssueCategory getCategory() { return category; }
        public int getTotal() { return total; }
        public int getCorrect() { return correct; }
        public int getAccuracyPct() { return accuracyPct; }
    }

    public static class Example {
        public String refNumber;
        public IssueCategory actual, predicted;
        public boolean correct;
        public String getRefNumber() { return refNumber; }
        public IssueCategory getActual() { return actual; }
        public IssueCategory getPredicted() { return predicted; }
        public boolean isCorrect() { return correct; }
    }

    public static class RetrievalEval {
        public int n, recall1Pct, recall3Pct, recall5Pct;
        public double mrr;
        public List<Row> rows = new ArrayList<>();
        public int getN() { return n; }
        public int getRecall1Pct() { return recall1Pct; }
        public int getRecall3Pct() { return recall3Pct; }
        public int getRecall5Pct() { return recall5Pct; }
        public double getMrr() { return mrr; }
        public List<Row> getRows() { return rows; }
    }

    public static class Row {
        public String question, expected, topDocs, rank;
        public String getQuestion() { return question; }
        public String getExpected() { return expected; }
        public String getTopDocs() { return topDocs; }
        public String getRank() { return rank; }
    }
}
