import React, { useState } from 'react';
import { Play, BookOpen } from 'lucide-react';

const subjects = [
    { value: 'ciencias-humanas', label: 'Ciências Humanas e suas Tecnologias', icon: '🌍' },
    { value: 'ciencias-natureza', label: 'Ciências da Natureza e suas Tecnologias', icon: '🧪' },
    { value: 'linguagens', label: 'Linguagens, Códigos e suas Tecnologias', icon: '📚' },
    { value: 'matematica', label: 'Matemática e suas Tecnologias', icon: '📐' }
];

export const SimulationSetup = ({ onStartSimulation }) => {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [questionCount, setQuestionCount] = useState(5);

    const handleStart = () => {
        if (!selectedSubject) {
            alert('Selecione uma matéria para continuar');
            return;
        }
        onStartSimulation(selectedSubject, questionCount);
    };

    return (
        <div className="simulation-setup">
            <div className="setup-header">
                <BookOpen size={48} />
                <h2>Configurar Simulado</h2>
                <p>Escolha a matéria e o número de questões para iniciar seu simulado</p>
            </div>
            
            <div className="subject-selection">
                <h3>Selecione a Matéria:</h3>
                <div className="subject-grid">
                    {subjects.map(subject => (
                        <button
                            key={subject.value}
                            className={`subject-card ${selectedSubject === subject.value ? 'selected' : ''}`}
                            onClick={() => setSelectedSubject(subject.value)}
                        >
                            <span className="subject-icon">{subject.icon}</span>
                            <span>{subject.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="question-count-selection">
                <h3>Número de Questões:</h3>
                <div className="count-options">
                    <button
                        className={`count-btn ${questionCount === 5 ? 'selected' : ''}`}
                        onClick={() => setQuestionCount(5)}
                    >
                        5 Questões
                    </button>
                    <button
                        className={`count-btn ${questionCount === 10 ? 'selected' : ''}`}
                        onClick={() => setQuestionCount(10)}
                    >
                        10 Questões
                    </button>
                </div>
            </div>

            <div className="simulation-info">
                <div className="info-item">
                    <strong>Questões:</strong> {questionCount} questões aleatórias
                </div>
                <div className="info-item">
                    <strong>Anos:</strong> 2009-2023 (aleatório)
                </div>
                <div className="info-item">
                    <strong>Tempo:</strong> Cronometrado
                </div>
            </div>

            <button 
                className="start-button" 
                onClick={handleStart}
                disabled={!selectedSubject}
            >
                <Play size={20} />
                Iniciar Simulado
            </button>
        </div>
    );
};