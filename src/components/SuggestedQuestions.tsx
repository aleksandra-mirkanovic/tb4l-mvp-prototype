import './SuggestedQuestions.css';

interface SuggestedQuestionsProps {
  heading?: string;
  questions: string[];
  onSelect: (question: string) => void;
  disabled?: boolean;
}

export function SuggestedQuestions({
  heading = 'Here are some of the things you can ask me',
  questions,
  onSelect,
  disabled,
}: SuggestedQuestionsProps) {
  return (
    <section className="suggested" aria-label="Suggested questions">
      <h2 className="suggested__heading">{heading}</h2>
      <div className="suggested__list">
        {questions.map((q) => (
          <button
            key={q}
            type="button"
            className="suggested__item"
            onClick={() => onSelect(q)}
            disabled={disabled}
          >
            {q}
          </button>
        ))}
      </div>
    </section>
  );
}
