package com.goodgovit.stc.service;

import com.goodgovit.stc.dto.*;
import com.goodgovit.stc.entity.*;
import com.goodgovit.stc.entity.enums.StatutEvaluation;
import com.goodgovit.stc.entity.enums.TypeEvaluation;
import com.goodgovit.stc.exception.BadRequestException;
import com.goodgovit.stc.exception.ResourceNotFoundException;
import com.goodgovit.stc.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final CoursRepository coursRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final ReponseRepository reponseRepository;
    private final EtudiantRepository etudiantRepository;
    private final InscriptionCoursRepository inscriptionCoursRepository;
    private final AuditService auditService;

    // ── Evaluation CRUD ──

    @Transactional(readOnly = true)
    public List<EvaluationDto> getEvaluationsByCours(Long coursId) {
        return evaluationRepository.findByCoursId(coursId).stream()
                .map(this::toEvaluationDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EvaluationDto getEvaluationById(Long id) {
        return toEvaluationDto(findEvaluationOrThrow(id));
    }

    @Transactional
    public EvaluationDto createEvaluation(EvaluationRequest request) {
        Cours cours = coursRepository.findById(request.getCoursId())
                .orElseThrow(() -> new ResourceNotFoundException("Cours non trouvé avec l'id: " + request.getCoursId()));

        Evaluation evaluation = Evaluation.builder()
                .type(TypeEvaluation.valueOf(request.getType()))
                .date(request.getDate())
                .noteMaximale(request.getNoteMaximale())
                .seuilValidation(request.getSeuilValidation())
                .coefficient(request.getCoefficient())
                .cours(cours)
                .build();

        return toEvaluationDto(evaluationRepository.save(evaluation));
    }

    @Transactional
    public EvaluationDto publishEvaluation(Long id) {
        Evaluation evaluation = findEvaluationOrThrow(id);
        evaluation.setStatut(StatutEvaluation.PUBLIEE);
        return toEvaluationDto(evaluationRepository.save(evaluation));
    }

    // ── Quiz CRUD ──

    @Transactional(readOnly = true)
    public List<QuizDto> getQuizzesByCours(Long coursId) {
        return quizRepository.findByCoursId(coursId).stream()
                .map(this::toQuizDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public QuizDto getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz non trouvé avec l'id: " + id));
        return toQuizDto(quiz);
    }

    @Transactional
    public QuizDto createQuiz(QuizRequest request) {
        Cours cours = coursRepository.findById(request.getCoursId())
                .orElseThrow(() -> new ResourceNotFoundException("Cours non trouvé avec l'id: " + request.getCoursId()));

        Quiz quiz = Quiz.builder()
                .titre(request.getTitre())
                .description(request.getDescription())
                .cours(cours)
                .build();

        if (request.getQuestions() != null) {
            for (QuestionRequest qr : request.getQuestions()) {
                Question question = Question.builder()
                        .enonce(qr.getEnonce())
                        .type(qr.getType())
                        .quiz(quiz)
                        .build();

                if (qr.getReponses() != null) {
                    for (ReponseRequest rr : qr.getReponses()) {
                        Reponse reponse = Reponse.builder()
                                .texte(rr.getTexte())
                                .estCorrecte(rr.isEstCorrecte())
                                .question(question)
                                .build();
                        question.getReponses().add(reponse);
                    }
                }
                quiz.getQuestions().add(question);
            }
        }

        return toQuizDto(quizRepository.save(quiz));
    }

    // ── Quiz Submission & Grading ──

    @Transactional
    public QuizResultDto submitQuiz(QuizSubmissionRequest submission) {
        Quiz quiz = quizRepository.findById(submission.getQuizId())
                .orElseThrow(() -> new ResourceNotFoundException("Quiz non trouvé avec l'id: " + submission.getQuizId()));

        Etudiant etudiant = etudiantRepository.findById(submission.getEtudiantId())
                .orElseThrow(() -> new ResourceNotFoundException("Étudiant non trouvé avec l'id: " + submission.getEtudiantId()));

        List<Question> questions = questionRepository.findByQuizId(quiz.getId());
        int totalQuestions = questions.size();
        int correctAnswers = 0;
        List<QuestionResultDto> details = new ArrayList<>();

        for (Question question : questions) {
            List<Reponse> allReponses = reponseRepository.findByQuestionId(question.getId());
            List<Long> correctReponseIds = allReponses.stream()
                    .filter(Reponse::isEstCorrecte)
                    .map(Reponse::getId)
                    .collect(Collectors.toList());

            List<Long> selectedIds = submission.getReponses().getOrDefault(question.getId(), List.of());

            boolean isCorrect = !correctReponseIds.isEmpty()
                    && selectedIds.size() == correctReponseIds.size()
                    && selectedIds.containsAll(correctReponseIds);

            if (isCorrect) {
                correctAnswers++;
            }

            details.add(QuestionResultDto.builder()
                    .questionId(question.getId())
                    .enonce(question.getEnonce())
                    .correct(isCorrect)
                    .selectedReponseIds(selectedIds)
                    .correctReponseIds(correctReponseIds)
                    .build());
        }

        float percentage = totalQuestions > 0 ? (correctAnswers * 100.0f) / totalQuestions : 0;
        float score = totalQuestions > 0 ? (correctAnswers * 20.0f) / totalQuestions : 0;

        // Determine the seuil from the course evaluation if it exists
        float seuil = 80.0f;
        List<Evaluation> evals = evaluationRepository.findByCoursId(quiz.getCours().getId());
        if (!evals.isEmpty()) {
            seuil = evals.get(0).getSeuilValidation();
        }

        boolean passed = percentage >= seuil;

        // Update inscription progression if passed
        if (passed) {
            inscriptionCoursRepository.findByEtudiantIdAndCoursId(etudiant.getId(), quiz.getCours().getId())
                    .ifPresent(inscription -> {
                        inscription.setProgression(Math.max(inscription.getProgression(), percentage));
                        inscription.setNoteFinale(score);
                        inscriptionCoursRepository.save(inscription);
                    });
        }

        auditService.log("QUIZ_SUBMIT", "Quiz", quiz.getId(),
                etudiant.getUtilisateur().getId(),
                "Score: " + score + "/20 (" + percentage + "%) - " + (passed ? "REUSSI" : "ECHOUE"));

        return QuizResultDto.builder()
                .quizId(quiz.getId())
                .quizTitre(quiz.getTitre())
                .etudiantId(etudiant.getId())
                .totalQuestions(totalQuestions)
                .correctAnswers(correctAnswers)
                .score(score)
                .percentage(percentage)
                .passed(passed)
                .seuilValidation(seuil)
                .details(details)
                .build();
    }

    // ── Private helpers ──

    private Evaluation findEvaluationOrThrow(Long id) {
        return evaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluation non trouvée avec l'id: " + id));
    }

    private EvaluationDto toEvaluationDto(Evaluation e) {
        return EvaluationDto.builder()
                .id(e.getId())
                .type(e.getType().name())
                .date(e.getDate())
                .noteMaximale(e.getNoteMaximale())
                .seuilValidation(e.getSeuilValidation())
                .coefficient(e.getCoefficient())
                .statut(e.getStatut().name())
                .coursId(e.getCours().getId())
                .coursTitre(e.getCours().getTitre())
                .build();
    }

    private QuizDto toQuizDto(Quiz q) {
        return QuizDto.builder()
                .id(q.getId())
                .titre(q.getTitre())
                .description(q.getDescription())
                .coursId(q.getCours().getId())
                .coursTitre(q.getCours().getTitre())
                .questions(q.getQuestions() != null
                        ? q.getQuestions().stream().map(this::toQuestionDto).collect(Collectors.toList())
                        : null)
                .build();
    }

    private QuestionDto toQuestionDto(Question q) {
        return QuestionDto.builder()
                .id(q.getId())
                .enonce(q.getEnonce())
                .type(q.getType())
                .reponses(q.getReponses() != null
                        ? q.getReponses().stream().map(this::toReponseDto).collect(Collectors.toList())
                        : null)
                .build();
    }

    private ReponseDto toReponseDto(Reponse r) {
        return ReponseDto.builder()
                .id(r.getId())
                .texte(r.getTexte())
                .estCorrecte(r.isEstCorrecte())
                .build();
    }
}
