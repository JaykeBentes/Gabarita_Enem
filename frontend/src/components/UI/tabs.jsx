import * as Tabs from '@radix-ui/react-tabs';
import { useState } from 'react';
import { 
    User, BookOpen, NotebookText, BarChart, History, 
    Award, TrendingUp, Clock, Target, Flame 
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
        <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
            <Tabs.List className="list">
                {options.map((option) => (
                    <Tabs.Trigger key={option.id} value={option.id} className="trigger">
                        <option.icon size={20}/>
                        <span>{option.label}</span>
                    </Tabs.Trigger>
                ))}
            </Tabs.List>
            <Tabs.Content value="perfil"><ProfileTab /></Tabs.Content>
            <Tabs.Content value="estudos"><StudyTab /></Tabs.Content>
            <Tabs.Content value="simulado"><SimulationTab onGoToProfile={handleGoToProfile} /></Tabs.Content>
        </Tabs.Root>
    );
};

