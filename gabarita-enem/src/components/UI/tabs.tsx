'use client';

import { useState } from 'react';
import { 
    User, BookOpen, NotebookText
} from 'lucide-react';
import { ProfileTab, StudyTab, SimulationTab } from './perfil';

export const TabMenu = () => {
    const [activeTab, setActiveTab] = useState('perfil');
    
    const options = [
        { id: 'perfil', icon: User, label: 'Perfil' },
        { id: 'estudos', icon: BookOpen, label: 'Estudos' },
        { id: 'simulado', icon: NotebookText, label: 'Simulado' },
    ];
    
    const handleGoToProfile = () => {
        setActiveTab('perfil');
    };
    
    return (
        <div>
            <div className="list">
                {options.map((option) => (
                    <button 
                        key={option.id} 
                        onClick={() => setActiveTab(option.id)}
                        className={`trigger ${activeTab === option.id ? 'active' : ''}`}
                    >
                        <option.icon size={20}/>
                        <span>{option.label}</span>
                    </button>
                ))}
            </div>
            {activeTab === 'perfil' && <ProfileTab />}
            {activeTab === 'estudos' && <StudyTab />}
            {activeTab === 'simulado' && <SimulationTab onGoToProfile={handleGoToProfile} />}
        </div>
    );
};