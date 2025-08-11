import type { QuizResult } from '@/services/quiz-result-service';

interface QuizHistoryProps {
  quizResult: QuizResult;
}

const QuizHistory: React.FC<QuizHistoryProps> = ({ quizResult }) => {
  return (
    <div>
      <h3>{quizResult.topicName}</h3>
      <p>Score: {quizResult.score}/{quizResult.totalQuestions}</p>
    </div>
  );
};

export default QuizHistory;