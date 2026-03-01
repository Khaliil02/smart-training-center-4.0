export interface EvaluationDto {
  id: number;
  type: string;
  date: string;
  noteMaximale: number;
  seuilValidation: number;
  coefficient: number;
  statut: string;
  coursId: number;
  coursTitre: string;
}

export interface EvaluationRequest {
  type: string;
  date: string;
  noteMaximale: number;
  seuilValidation: number;
  coefficient: number;
  coursId: number;
}

export interface QuizDto {
  id: number;
  titre: string;
  description: string;
  coursId: number;
  coursTitre: string;
  questions: QuestionDto[];
}

export interface QuizRequest {
  titre: string;
  description: string;
  coursId: number;
  questions: QuestionRequest[];
}

export interface QuestionDto {
  id: number;
  enonce: string;
  type: string;
  reponses: ReponseDto[];
}

export interface QuestionRequest {
  enonce: string;
  type: string;
  reponses: ReponseRequest[];
}

export interface ReponseDto {
  id: number;
  texte: string;
  estCorrecte: boolean;
}

export interface ReponseRequest {
  texte: string;
  estCorrecte: boolean;
}

export interface QuizSubmissionRequest {
  quizId: number;
  etudiantId: number;
  reponses: { [questionId: number]: number[] };
}

export interface QuizResultDto {
  quizId: number;
  quizTitre: string;
  etudiantId: number;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  percentage: number;
  passed: boolean;
  seuilValidation: number;
  details: QuestionResultDto[];
}

export interface QuestionResultDto {
  questionId: number;
  enonce: string;
  correct: boolean;
  selectedReponseIds: number[];
  correctReponseIds: number[];
}
