package com.smartestate.web;

import com.smartestate.ai.AiEvaluationService;
import com.smartestate.ai.ClaudeClient;
import com.smartestate.ai.IssueClassifier;
import com.smartestate.ai.RagService;
import com.smartestate.model.BylawDoc;
import com.smartestate.model.Language;
import com.smartestate.repo.BylawDocRepository;
import com.smartestate.service.AuditService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/ai")
public class AiController {

    private final RagService ragService;
    private final IssueClassifier issueClassifier;
    private final AiEvaluationService evaluationService;
    private final BylawDocRepository bylawRepo;
    private final ClaudeClient claudeClient;
    private final AuditService auditService;

    public AiController(RagService ragService, IssueClassifier issueClassifier,
                        AiEvaluationService evaluationService, BylawDocRepository bylawRepo,
                        ClaudeClient claudeClient, AuditService auditService) {
        this.ragService = ragService;
        this.issueClassifier = issueClassifier;
        this.evaluationService = evaluationService;
        this.bylawRepo = bylawRepo;
        this.claudeClient = claudeClient;
        this.auditService = auditService;
    }

    // ---- FR-8.1 chatbot ---------------------------------------------------

    @GetMapping("/chat")
    public String chat(Model model) {
        model.addAttribute("claudeAvailable", claudeClient.isAvailable());
        return "ai/chat";
    }

    @PostMapping("/chat")
    public String ask(@RequestParam String question, Model model) {
        model.addAttribute("claudeAvailable", claudeClient.isAvailable());
        model.addAttribute("question", question);
        model.addAttribute("result", ragService.ask(question));
        auditService.log("AI_CHAT", "Bylaw query: " + question);
        return "ai/chat";
    }

    // ---- FR-8.2 document ingestion (admin) --------------------------------

    @GetMapping("/documents")
    public String documents(Model model) {
        model.addAttribute("docs", bylawRepo.findAllByOrderByCodeAsc());
        model.addAttribute("languages", Language.values());
        return "ai/documents";
    }

    @PostMapping("/documents")
    public String ingest(@RequestParam(required = false) String code, @RequestParam String title,
                         @RequestParam Language language, @RequestParam(required = false) String category,
                         @RequestParam String content, RedirectAttributes ra) {
        BylawDoc doc = new BylawDoc();
        doc.setCode(code == null || code.isBlank() ? "DOC-" + (bylawRepo.count() + 1) : code.trim());
        doc.setTitle(title);
        doc.setLanguage(language);
        doc.setCategory(category);
        doc.setContent(content);
        bylawRepo.save(doc);
        ragService.rebuild();
        auditService.log("AI_INGEST", "Indexed bylaw doc " + doc.getCode() + " (" + title + ")");
        ra.addFlashAttribute("msg", "Document \"" + title + "\" ingested and indexed. The chatbot can now use it.");
        return "redirect:/ai/documents";
    }

    /** FR-8.2: edit an existing document and re-index it so the chatbot uses the new text. */
    @PostMapping("/documents/{id}")
    public String updateDoc(@PathVariable Long id, @RequestParam String title,
                            @RequestParam Language language, @RequestParam(required = false) String category,
                            @RequestParam String content, RedirectAttributes ra) {
        bylawRepo.findById(id).ifPresent(d -> {
            d.setTitle(title);
            d.setLanguage(language);
            d.setCategory(category);
            d.setContent(content);
            bylawRepo.save(d);
            ragService.rebuild();
            auditService.log("AI_DOC_EDIT", "Edited & re-indexed bylaw doc " + d.getCode());
        });
        ra.addFlashAttribute("msg", "Document updated and re-indexed. The chatbot now uses the new text.");
        return "redirect:/ai/documents";
    }

    @PostMapping("/documents/{id}/delete")
    public String deleteDoc(@PathVariable Long id, RedirectAttributes ra) {
        bylawRepo.findById(id).ifPresent(d -> {
            bylawRepo.delete(d);
            ragService.rebuild();
            auditService.log("AI_DOC_DELETE", "Removed bylaw doc " + d.getCode());
        });
        ra.addFlashAttribute("msg", "Document removed and index rebuilt.");
        return "redirect:/ai/documents";
    }

    // ---- FR-8.3 evaluation (rp.pdf §5) ------------------------------------

    @GetMapping("/evaluation")
    public String evaluation(Model model) {
        // ensure the classifier index reflects current issues
        issueClassifier.rebuild();
        model.addAttribute("classification", evaluationService.evaluateClassification());
        model.addAttribute("retrieval", evaluationService.evaluateRetrieval());
        return "ai/evaluation";
    }
}
