import * as React from 'react';
import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
    User, BookOpen, NotebookText, BarChart, History, 
    Award, TrendingUp, Clock, Target, Flame, Play, ArrowLeft 
} from 'lucide-react';
import { SimulationSetup } from '../Simulation/SimulationSetup';
import { SimulationQuiz } from '../Simulation/SimulationQuiz';
import { SimulationResults } from '../Simulation/SimulationResults';  


const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
};


const StatCard = ({ icon: Icon, label, value, color }) => (
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

const ProfileTab = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [performanceData, setPerformanceData] = useState(null);
    const [historyData, setHistoryData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userInfo, performance, history] = await Promise.all([
                    apiService.getUserProfile(),
                    apiService.getPerformance(),
                    apiService.getHistory()
                ]);
                console.log('Dados recebidos:');
                console.log('UserInfo:', userInfo);
                console.log('Performance:', performance);
                console.log('History:', history);
                setUserData(userInfo);
                setPerformanceData(performance);
                setHistoryData(history);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
                // Usar dados do contexto como fallback
                setUserData(user || {
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
    const stats = performanceData?.generalStats || {};
    const subjects = performanceData?.subjectPerformance || [];
    const history = historyData?.recentHistory || [];

    // Criar userStats dinamicamente com dados do backend
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
                <p>{calculateAge(displayUser?.birthDate)} anos • {displayUser?.email}</p>
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
                                <p className="score">{item.score}%</p>
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

const StudyTab = () => {
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedVideo, setSelectedVideo] = useState(null);

    const subjects = [
        { id: 'matematica', name: 'Matemática', icon: '📐' },
        { id: 'ciencias-natureza', name: 'Ciências da Natureza', icon: '🧪' },
        { id: 'linguagens', name: 'Linguagens', icon: '📚' },
        { id: 'ciencias-humanas', name: 'Ciências Humanas', icon: '🌍' },
        { id: 'redacao', name: 'Redação', icon: '✍️' }
    ];

    const videos = {
        'matematica': [
            { id: 1, title: 'Funções do 1º Grau', duration: '15:30', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', videoId: 'dQw4w9WgXcQ' },
            { id: 2, title: 'Geometria Plana', duration: '22:45', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', videoId: 'dQw4w9WgXcQ' },
            { id: 3, title: 'Trigonometria Básica', duration: '18:20', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', videoId: 'dQw4w9WgXcQ' }
        ],
        'ciencias-natureza': [
            { id: 4, title: 'Química Orgânica', duration: '25:10', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', videoId: 'dQw4w9WgXcQ' },
            { id: 5, title: 'Física - Mecânica', duration: '30:15', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', videoId: 'dQw4w9WgXcQ' },
            { id: 6, title: 'Biologia - Genética', duration: '20:30', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', videoId: 'dQw4w9WgXcQ' }
        ],
        'linguagens': [
            { id: 7, title: 'Literatura Brasileira', duration: '28:45', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', videoId: 'dQw4w9WgXcQ' },
            { id: 8, title: 'Gramática - Sintaxe', duration: '24:20', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', videoId: 'dQw4w9WgXcQ' }
        ],
        'ciencias-humanas': [
            { id: 9, title: 'História do Brasil', duration: '35:10', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', videoId: 'dQw4w9WgXcQ' },
            { id: 10, title: 'Geografia - Geopolítica', duration: '27:30', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', videoId: 'dQw4w9WgXcQ' }
        ],
        'redacao': [
            { id: 11, title: 'Estrutura da Redação ENEM', duration: '32:15', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', videoId: 'dQw4w9WgXcQ' },
            { id: 12, title: 'Argumentação e Coesão', duration: '26:40', thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg', videoId: 'dQw4w9WgXcQ' }
        ]
    };

    const handleVideoSelect = (video) => {
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

const SimulationTab = ({ onGoToProfile }) => {
    const [simulationState, setSimulationState] = useState('setup');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [questions, setQuestions] = useState([]);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleStartSimulation = async (subject, count = 10) => {
        setLoading(true);
        try {
            console.log(`=== INICIANDO SIMULAÇÃO ===`);
            console.log(`Subject: ${subject}, Count: ${count}`);
            
            // Chamar API com parâmetros corretos
            const response = await apiService.getQuestions(null, subject, count, true);
            
            console.log('=== RESPOSTA DA API ===');
            console.log('Total de questões recebidas:', response.questions?.length);
            console.log('Debug info:', response.debug);
            
            if (!response.questions || response.questions.length === 0) {
                throw new Error('Nenhuma questão foi retornada pela API');
            }
            
            if (response.questions.length !== count) {
                console.warn(`ATENÇÃO: Solicitadas ${count} questões, recebidas ${response.questions.length}`);
            }
            
            setSelectedSubject(subject);
            setQuestions(response.questions);
            setSimulationState('quiz');
        } catch (error) {
            console.error('=== ERRO AO CARREGAR QUESTÕES ===');
            console.error('Erro completo:', error);
            alert(`Erro ao carregar questões: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFinishSimulation = async (simulationResults) => {
        try {
            // Calcular respostas corretas
            const correctAnswers = questions.filter((q, index) => 
                simulationResults.answers[index] === q.correctAnswer
            ).length;
            
            // Criar objeto com dados completos
            const completeResults = {
                ...simulationResults,
                correctAnswers
            };
            
            // Salvar simulação no backend
            const saveData = {
                subject: selectedSubject,
                totalQuestions: questions.length,
                correctAnswers: correctAnswers,
                timeElapsed: simulationResults.timeElapsed,
                answers: simulationResults.answers,
                questions: questions
            };
            
            console.log('Salvando simulação:', saveData);
            await apiService.saveSimulation(saveData);
            console.log('Simulação salva com sucesso!');
            
            setResults(completeResults);
            setSimulationState('results');
        } catch (error) {
            console.error('Erro ao salvar simulação:', error);
            // Calcular respostas corretas mesmo se não conseguir salvar
            const correctAnswers = questions.filter((q, index) => 
                simulationResults.answers[index] === q.correctAnswer
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

    const handleBackToMenu = () => {
        setSimulationState('setup');
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
export { ProfileTab, StudyTab, SimulationTab };