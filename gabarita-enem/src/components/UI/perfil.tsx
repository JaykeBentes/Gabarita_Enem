'use client';

import React, { useState, useEffect } from 'react';
import { apiService } from '@/lib/api';
import { useAuth } from '@/components/AuthContext';
import { 
    User, BookOpen, NotebookText, BarChart, History, 
    Award, TrendingUp, Clock, Target, Flame, Play, ArrowLeft, Mail, Lock 
} from 'lucide-react';
import { SimulationSetup } from '@/components/Simulation/SimulationSetup';
import { SimulationQuiz } from '@/components/Simulation/SimulationQuiz';
import { SimulationResults } from '@/components/Simulation/SimulationResults';
import { User as UserType, Performance, HistoryItem } from '@/types';

const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
};

interface StatCardProps {
    icon: any;
    label: string;
    value: string;
    color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color }) => (
    <div className="stat-card">
        <div>
            <Icon size={24} />
        </div>
        <div>
            <p>{label}</p>
            <p className={`value ${color || 'text-gray-800'}`}>{value}</p>
        </div>
    </div>
);

export const ProfileTab = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState<UserType | null>(null);
    const [performanceData, setPerformanceData] = useState<Performance | null>(null);
    const [historyData, setHistoryData] = useState<{ recentHistory: HistoryItem[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userInfo, performance, history] = await Promise.all([
                    apiService.getUserProfile(),
                    apiService.getPerformance(),
                    apiService.getHistory()
                ]);
                setUserData(userInfo);
                setPerformanceData(performance);
                setHistoryData(history);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                setUserData(user || {
                    id: 0,
                    name: 'Usuário',
                    email: 'usuario@example.com',
                    birthDate: '2000-01-01',
                    memberSince: 'Janeiro 2024',
                    avatarUrl: 'https://ui-avatars.com/api/?name=Usuario&background=7c3aed&color=ffffff&size=100'
                });
                setPerformanceData({
                    generalStats: { totalSimulations: 0, averageScore: 0, totalHours: 0, evolution: '0%' },
                    subjectPerformance: [],
                    strongPoints: [],
                    improvementAreas: []
                });
                setHistoryData({ recentHistory: [] });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    if (loading) {
        return <div className="loading">Carregando dados...</div>;
    }

    const displayUser = userData || user;
    const stats = performanceData?.generalStats || { totalSimulations: 0, averageScore: 0, totalHours: 0, evolution: '0%' };
    const subjects = performanceData?.subjectPerformance || [];
    const history = historyData?.recentHistory || [];

    const userStats = [
        { id: 'provas', icon: BookOpen, label: 'Provas Realizadas', value: stats.totalSimulations?.toString() || '0' },
        { id: 'acertos', icon: Target, label: 'Média de Acertos', value: `${stats.averageScore || 0}%` },
        { id: 'horas', icon: Clock, label: 'Horas de Estudo', value: `${stats.totalHours || 0}h` },
        { id: 'evolucao', icon: TrendingUp, label: 'Evolução', value: stats.evolution || '0%', color: 'text-green-500' },
    ];

    return (
        <div>
            <div className="profile-header">
                <img src={displayUser?.avatarUrl} alt="Avatar do usuário" className="w-20 h-20 rounded-full border-4 border-white/50" />
                <div>
                    <h2>{displayUser?.name}</h2>
                    <p>{calculateAge(displayUser?.birthDate || '2000-01-01')} anos • {displayUser?.email}</p>
                    <p>Membro desde {displayUser?.memberSince}</p>
                </div>    
            </div>

            <div className="stats-grid">
                {userStats.map(stat => <StatCard key={stat.id} {...stat} />)}
            </div>
            
            <div className="content-grid">
                <div className="box performance-section">
                    <h3><BarChart size={20}/> Desempenho por Matéria</h3>
                    <div className="performance-tags">
                        <div className="tag-section">
                            <h4><Award size={16} /> Pontos Fortes</h4>
                            <div className="tags-container">
                                {(performanceData?.strongPoints || []).map(point => (
                                    <span key={point} className="tag green">{point}</span>
                                ))}
                            </div>
                        </div>
                        <div className="tag-section">
                            <h4><Flame size={16}/> Áreas para Melhoria</h4>
                            <div className="tags-container">
                                {(performanceData?.improvementAreas || []).map(area => (
                                    <span key={area} className="tag orange">{area}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="subjects-progress">
                        {subjects.map(subject => (
                            <div key={subject.name} className="progress-container">
                                <p className="progress-label">{subject.name}</p>
                                <div className="progress-bar">
                                    <div className="progress-fill" style={{ width: `${subject.score}%` }}>
                                        <span className="progress-text">{subject.score}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="box history-section">
                    <h3><History size={20}/> Histórico Recente</h3>
                    <div className="history-list">
                        {history.map((item, index) => (
                            <div className="history-item" key={index}>
                                <div>
                                    <p className="subject">{item.subject}</p>
                                    <p className="date">{item.date}</p>
                                </div>
                                <div className="history-score">
                                    <p className="score">{item.score}</p>
                                    <p className={`grade ${item.gradeColor}`}>{item.grade}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const StudyTab = () => {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedVideo, setSelectedVideo] = useState<any>(null);

    const subjects = [
        { id: 'matematica', name: 'Matemática', icon: '📐' },
        { id: 'ciencias-natureza', name: 'Ciências da Natureza', icon: '🧪' },
        { id: 'linguagens', name: 'Linguagens', icon: '📚' },
        { id: 'ciencias-humanas', name: 'Ciências Humanas', icon: '🌍' },
        { id: 'redacao', name: 'Redação', icon: '✍️' }
    ];

    const videos: { [key: string]: any[] } = {
        'matematica': [
            { id: 1, title: 'AULÃO DE MATEMÁTICA PARA O ENEM E VESTIBULARES: Resumo de 10 temas', duration: '1:22:51', thumbnail: 'https://img.youtube.com/vi/MSZdhDBoXe0/mqdefault.jpg', videoId: 'MSZdhDBoXe0' },
            { id: 2, title: 'AS PRINCIPAIS FÓRMULAS DE MATEMÁTICA DO ENEM EM 15 MINUTOS', duration: '15:06', thumbnail: 'https://img.youtube.com/vi/wLlQdu-q6dc/mqdefault.jpg', videoId: 'wLlQdu-q6dc' },
            { id: 3, title: 'Aprenda matemática em alguns dias! - Fundamentos e Bases', duration: '1:16:13', thumbnail: 'https://img.youtube.com/vi/OOmEI2Q33R0/mqdefault.jpg', videoId: 'OOmEI2Q33R0' },
            { id: 13, title: 'PADRÕES de QUESTÕES em MATEMÁTICA do ENEM!', duration: '38:57', thumbnail: 'https://img.youtube.com/vi/r7sGiwcwk3k/mqdefault.jpg', videoId: 'r7sGiwcwk3k' }
        ],
        'ciencias-natureza': [
            { id: 4, title: 'PADRÕES de QUESTÕES em CIÊNCIAS da NATUREZA no ENEM 2025', duration: '47:07', thumbnail: 'https://img.youtube.com/vi/XRasCb_uueQ/mqdefault.jpg', videoId: 'XRasCb_uueQ' },
            { id: 5, title: 'Como GABARITAR Ciências da NATUREZA do Enem', duration: '39:36', thumbnail: 'https://img.youtube.com/vi/JNhC5Vvm0/mqdefault.jpg', videoId: 'JNhC5Vvm0' },
            { id: 6, title: 'AULÃO DE BIOLOGIA PARA O ENEM: 10 temas que mais caem', duration: '1:20:07', thumbnail: 'https://img.youtube.com/vi/fo7JbUG5flY/mqdefault.jpg', videoId: 'fo7JbUG5flY' },
            { id: 14, title: 'TUDO de QUÍMICA GERAL pro ENEM 2025 ', duration: '5:52:35', thumbnail: 'https://img.youtube.com/vi/S5O-_kHn3W0/mqdefault.jpg', videoId: 'S5O-_kHn3W0' }
        ],
        'linguagens': [
            { id: 7, title: 'LTUDO de LITERATURA e VANGUARDAS EUROPÉIAS pro ENEM 2025', duration: '3:09:31', thumbnail: 'https://img.youtube.com/vi/K3g7l1hIREw/mqdefault.jpg', videoId: 'K3g7l1hIREw' },
            { id: 8, title: 'AULÃO DE ESPANHOL PARA O ENEM: temas e dicas essenciais', duration: '31:37', thumbnail: 'https://img.youtube.com/vi/uvZvp8dI9JM/mqdefault.jpg', videoId: 'uvZvp8dI9JM' },
            { id: 15, title: 'AULÃO DE INGLÊS PARA O ENEM: temas e técnicas essenciais ', duration: '25:23', thumbnail: 'https://img.youtube.com/vi/2mXyS6VFJh4/mqdefault.jpg', videoId: '2mXyS6VFJh4' }
        ],
        'ciencias-humanas': [
            { id: 9, title: 'TODA A HISTÓRIA DO ENEM - REVISÃO (Débora Aladim)', duration: '1:56:24', thumbnail: 'https://img.youtube.com/vi/cuHddXfinDE/mqdefault.jpg', videoId: 'cuHddXfinDE' },
            { id: 10, title: 'AULÃO ENEM DE GEOGRAFIA: 10 temas que mais caem', duration: '1:05:47', thumbnail: 'https://img.youtube.com/vi/5w4MOmECfaA/mqdefault.jpg', videoId: '5w4MOmECfaA' }
        ],
        'redacao': [
            { id: 11, title: 'SUPER REVISÃO DE REDAÇÃO PARA O ENEM 2025', duration: '28:11', thumbnail: 'https://img.youtube.com/vi/RyOZLgk-c5w/mqdefault.jpg', videoId: 'RyOZLgk-c5w' },
            { id: 12, title: 'AULÃO DE REDAÇÃO PARA O ENEM: como alcançar a nota 1000', duration: '1:12:55', thumbnail: 'https://img.youtube.com/vi/cVlfWDcIAfo/mqdefault.jpg', videoId: 'cVlfWDcIAfo' }
        ]
    };

    const handleVideoSelect = (video: any) => {
        setSelectedVideo(video);
    };

    const handleBackToList = () => {
        setSelectedVideo(null);
    };

    if (selectedVideo) {
        return (
            <div className="video-player-container">
                <div className="video-header">
                    <button onClick={handleBackToList} className="back-to-list-btn">
                        <ArrowLeft size={20} />
                        Voltar à lista
                    </button>
                    <h2>{selectedVideo.title}</h2>
                </div>
                <div className="video-player">
                    <iframe
                        width="100%"
                        height="500"
                        src={`https://www.youtube.com/embed/${selectedVideo.videoId}`}
                        title={selectedVideo.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        );
    }

    return (
        <div className="study-container">
            <div className="study-sidebar">
                <h3>Matérias</h3>
                <div className="subjects-menu">
                    {subjects.map(subject => (
                        <button
                            key={subject.id}
                            className={`subject-btn ${selectedSubject === subject.id ? 'active' : ''}`}
                            onClick={() => setSelectedSubject(subject.id)}
                        >
                            <span className="subject-icon">{subject.icon}</span>
                            <span>{subject.name}</span>
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="study-content">
                {!selectedSubject ? (
                    <div className="study-welcome">
                        <BookOpen size={64} />
                        <h2>Bem-vindo aos Estudos</h2>
                        <p>Selecione uma matéria no menu lateral para ver os vídeos disponíveis</p>
                    </div>
                ) : (
                    <div className="videos-section">
                        <h2>{subjects.find(s => s.id === selectedSubject)?.name}</h2>
                        <div className="videos-grid">
                            {videos[selectedSubject]?.map(video => (
                                <div key={video.id} className="video-card" onClick={() => handleVideoSelect(video)}>
                                    <div className="video-thumbnail">
                                        <img src={video.thumbnail} alt={video.title} />
                                        <div className="play-overlay">
                                            <Play size={32} />
                                        </div>
                                        <div className="video-duration">{video.duration}</div>
                                    </div>
                                    <div className="video-info">
                                        <h4>{video.title}</h4>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface SimulationTabProps {
    onGoToProfile: () => void;
}

export const SimulationTab: React.FC<SimulationTabProps> = ({ onGoToProfile }) => {
    const [simulationState, setSimulationState] = useState('setup');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [questions, setQuestions] = useState<any[]>([]);
    const [results, setResults] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleStartSimulation = async (subject: string, count = 10) => {
        setLoading(true);
        try {
            const response = await apiService.getQuestions(null, subject, count, true);
            
            if (!response.questions || response.questions.length === 0) {
                throw new Error('Nenhuma questão foi retornada pela API');
            }
            
            setSelectedSubject(subject);
            setQuestions(response.questions);
            setSimulationState('quiz');
        } catch (error) {
            console.error('Erro ao carregar questões:', error);
            alert(`Erro ao carregar questões: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFinishSimulation = async (simulationResults: any) => {
        try {
            const correctAnswers = questions.filter((q, index) => 
                simulationResults.answers[index] === q.correctAlternative
            ).length;
            
            const completeResults = {
                ...simulationResults,
                correctAnswers
            };
            
            const saveData = {
                subject: selectedSubject,
                totalQuestions: questions.length,
                correctAnswers: correctAnswers,
                timeElapsed: simulationResults.timeElapsed,
                answers: simulationResults.answers,
                questions: questions
            };
            
            await apiService.saveSimulation(saveData);
            
            setResults(completeResults);
            setSimulationState('results');
        } catch (error) {
            console.error('Erro ao salvar simulação:', error);
            const correctAnswers = questions.filter((q, index) => 
                simulationResults.answers[index] === q.correctAlternative
            ).length;
            
            const completeResults = {
                ...simulationResults,
                correctAnswers
            };
            
            setResults(completeResults);
            setSimulationState('results');
        }
    };

    const handleRestart = () => {
        setSimulationState('setup');
        setSelectedSubject('');
        setQuestions([]);
        setResults(null);
    };

    const handleBackToProfile = () => {
        if (onGoToProfile) {
            onGoToProfile();
        }
    };

    if (loading) {
        return <div className="loading">Carregando questões...</div>;
    }

    switch (simulationState) {
        case 'setup':
            return <SimulationSetup onStartSimulation={handleStartSimulation} />;
        case 'quiz':
            return <SimulationQuiz questions={questions} onFinish={handleFinishSimulation} />;
        case 'results':
            return (
                <SimulationResults 
                    results={results} 
                    questions={questions} 
                    onRestart={handleRestart} 
                    onBackToMenu={handleBackToProfile} 
                />
            );
        default:
            return <SimulationSetup onStartSimulation={handleStartSimulation} />;
    }
};