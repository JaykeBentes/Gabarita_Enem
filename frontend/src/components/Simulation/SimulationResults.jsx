import React from 'react';
import { CheckCircle, XCircle, Clock, Target, RotateCcw } from 'lucide-react';

export const SimulationResults = ({ results, questions, onRestart, onBackToMenu }) => {
    const { answers, timeElapsed, totalQuestions } = results;
    
    const correctAnswers = questions.filter((q, index) => 
        answers[index] === q.correctAnswer
    ).length;
    
    const wrongAnswers = totalQuestions - correctAnswers;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}min ${secs}s`;
    };

    const getPerformanceColor = (percentage) => {
        if (percentage >= 80) return 'text-green-500';
        if (percentage >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getPerformanceText = (percentage) => {
        if (percentage >= 80) return 'Excelente';
        if (percentage >= 60) return 'Bom';
        return 'Precisa melhorar';
    };

    return (
        <div className="simulation-results">
            <div className="results-header">
                <h2>Resultado do Simulado</h2>
                <div className={`performance-badge ${getPerformanceColor(percentage)}`}>
                    {getPerformanceText(percentage)}
                </div>
            </div>

            <div className="results-summary">
                <div className="result-card correct">
                    <CheckCircle size={32} />
                    <div>
                        <h3>{correctAnswers}</h3>
                        <p>Acertos</p>
                    </div>
                </div>

                <div className="result-card wrong">
                    <XCircle size={32} />
                    <div>
                        <h3>{wrongAnswers}</h3>
                        <p>Erros</p>
                    </div>
                </div>

                <div className="result-card percentage">
                    <Target size={32} />
                    <div>
                        <h3 className={getPerformanceColor(percentage)}>{percentage}%</h3>
                        <p>Aproveitamento</p>
                    </div>
                </div>

                <div className="result-card time">
                    <Clock size={32} />
                    <div>
                        <h3>{formatTime(timeElapsed)}</h3>
                        <p>Tempo Total</p>
                    </div>
                </div>
            </div>

            <div className="detailed-results">
                <h3>Revisão das Questões</h3>
                <div className="questions-review">
                    {questions.map((question, index) => {
                        const userAnswer = answers[index];
                        const isCorrect = userAnswer === question.correctAnswer;
                        
                        return (
                            <div key={index} className={`question-review ${isCorrect ? 'correct' : 'wrong'}`}>
                                <div className="question-header">
                                    <span className="question-number">Questão {index + 1}</span>
                                    {isCorrect ? 
                                        <CheckCircle size={20} className="text-green-500" /> : 
                                        <XCircle size={20} className="text-red-500" />
                                    }
                                </div>
                                <div className="answer-comparison">
                                    <div>
                                        <strong>Sua resposta:</strong> {userAnswer}
                                    </div>
                                    <div>
                                        <strong>Resposta correta:</strong> {question.correctAnswer}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="results-actions">
                <button onClick={onRestart} className="restart-button">
                    <RotateCcw size={20} />
                    Novo Simulado
                </button>
                <button onClick={onBackToMenu} className="back-button">
                    Voltar ao Perfil
                </button>
            </div>
        </div>
    );
};