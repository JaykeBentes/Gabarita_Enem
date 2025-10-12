import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export const SimulationQuiz = ({ questions, onFinish }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
        let interval;
        if (isRunning) {
            interval = setInterval(() => {
                setTimeElapsed(time => time + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (questionIndex, answer) => {
        setAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const handleFinish = () => {
        setIsRunning(false);
        const results = {
            answers,
            timeElapsed,
            totalQuestions: questions.length
        };
        onFinish(results);
    };

    const allAnswered = Object.keys(answers).length === questions.length;

    if (!questions || questions.length === 0) {
        return <div>Carregando questões...</div>;
    }

    // Debug: log da questão atual
    console.log('\n=== DEBUG FRONTEND QUESTÃO ===');
    console.log('Total de questões:', questions.length);
    console.log('Questão atual index:', currentQuestion);
    const currentQ = questions[currentQuestion];
    if (currentQ) {
        console.log('ID:', currentQ.id);
        console.log('Index:', currentQ.index);
        console.log('Year:', currentQ.year);
        console.log('Título (100 chars):', currentQ.title?.substring(0, 100));
        console.log('Alternativas:');
        currentQ.alternatives?.forEach((alt, i) => {
            console.log(`  ${alt.letter}) ${alt.text?.substring(0, 50)}...`);
        });
        console.log('Resposta correta:', currentQ.correctAnswer);
        console.log('Imagens:', currentQ.files?.length || 0);
    }

    return (
        <div className="simulation-quiz">
            <div className="quiz-header">
                <div className="timer">
                    <Clock size={20} />
                    <span>{formatTime(timeElapsed)}</span>
                </div>
                <div className="progress">
                    Questão {currentQuestion + 1} de {questions.length}
                </div>
            </div>

            <div className="question-container">
                <div className="question-text">
                    <h3>Questão {currentQuestion + 1}</h3>
                    <div className="question-content">
                        {questions[currentQuestion]?.title ? (
                            <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'inherit'}}>
                                {questions[currentQuestion].title}
                            </pre>
                        ) : (
                            <p>Carregando questão...</p>
                        )}
                        {questions[currentQuestion]?.files?.map((fileUrl, index) => (
                            <img 
                                key={index}
                                src={fileUrl} 
                                alt={`Imagem da questão ${currentQuestion + 1}`}
                                style={{
                                    maxWidth: '100%',
                                    height: 'auto',
                                    margin: '10px 0',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px'
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    console.warn('Erro ao carregar imagem:', fileUrl);
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="alternatives">
                    {questions[currentQuestion]?.alternatives?.map((alt, index) => (
                        <button
                            key={index}
                            className={`alternative ${answers[currentQuestion] === alt.letter ? 'selected' : ''}`}
                            onClick={() => handleAnswerSelect(currentQuestion, alt.letter)}
                        >
                            <span className="letter">{alt.letter})</span>
                            <span className="text">{alt.text || 'Alternativa não carregada'}</span>
                        </button>
                    )) || <div>Alternativas não carregadas</div>}
                </div>
            </div>

            <div className="quiz-navigation">
                <div className="navigation-buttons">
                    <button 
                        className="nav-button"
                        onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                        disabled={currentQuestion === 0}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Anterior
                    </button>
                    <button 
                        className="nav-button"
                        onClick={() => {
                            if (currentQuestion < questions.length - 1) {
                                setCurrentQuestion(currentQuestion + 1);
                            }
                        }}
                        disabled={currentQuestion >= questions.length - 1}
                    >
                        Próxima
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                <button 
                    className="finish-button"
                    onClick={handleFinish}
                    disabled={!allAnswered}
                >
                    Finalizar Simulado
                </button>
            </div>
        </div>
    );
};