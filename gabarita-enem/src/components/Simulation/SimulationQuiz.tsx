'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Question } from '@/types';

interface SimulationQuizProps {
    questions: Question[];
    onFinish: (results: any) => void;
}

export const SimulationQuiz: React.FC<SimulationQuizProps> = ({ questions, onFinish }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(true);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setTimeElapsed(time => time + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerSelect = (questionIndex: number, answer: string) => {
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
                    <h3>{questions[currentQuestion]?.title || `Questão ${currentQuestion + 1}`}</h3>
                    <div className="question-content">
                        {/* Contexto da questão */}
                        {questions[currentQuestion]?.context && (
                            <div className="question-context" style={{
                                marginBottom: '20px',
                                padding: '15px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px',
                                border: '1px solid #e9ecef'
                            }}>
                                <div dangerouslySetInnerHTML={{
                                    __html: questions[currentQuestion].context
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\n/g, '<br/>')
                                }} />
                            </div>
                        )}
                        
                        {/* Imagens da questão */}
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
                                    (e.target as HTMLImageElement).style.display = 'none';
                                    console.warn('Erro ao carregar imagem:', fileUrl);
                                }}
                            />
                        ))}
                        
                        {/* Enunciado da pergunta */}
                        {questions[currentQuestion]?.alternativesIntroduction && (
                            <div className="question-introduction" style={{
                                marginTop: '20px',
                                padding: '15px',
                                backgroundColor: '#fff3cd',
                                borderRadius: '8px',
                                border: '1px solid #ffeaa7',
                                fontWeight: '500'
                            }}>
                                {questions[currentQuestion].alternativesIntroduction}
                            </div>
                        )}
                    </div>
                </div>

                <div className="alternatives">
                    {questions[currentQuestion]?.alternatives?.map((alt, index) => (
                        <button
                            key={index}
                            className={`alternative ${answers[currentQuestion] === alt.letter ? 'selected' : ''}`}
                            onClick={() => handleAnswerSelect(currentQuestion, alt.letter)}
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                textAlign: 'left',
                                padding: '15px',
                                margin: '10px 0',
                                border: '2px solid #e9ecef',
                                borderRadius: '8px',
                                backgroundColor: answers[currentQuestion] === alt.letter ? '#e3f2fd' : '#fff',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span className="letter" style={{
                                fontWeight: 'bold',
                                marginRight: '10px',
                                minWidth: '25px'
                            }}>{alt.letter})</span>
                            <div className="alternative-content" style={{ flex: 1 }}>
                                {alt.text && (
                                    <span className="text">{alt.text}</span>
                                )}
                                {alt.file && (
                                    <img 
                                        src={alt.file} 
                                        alt={`Alternativa ${alt.letter}`}
                                        style={{
                                            maxWidth: '100%',
                                            height: 'auto',
                                            marginTop: alt.text ? '10px' : '0',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px'
                                        }}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            console.warn('Erro ao carregar imagem da alternativa:', alt.file);
                                        }}
                                    />
                                )}
                                {!alt.text && !alt.file && (
                                    <span className="text">Alternativa não carregada</span>
                                )}
                            </div>
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