import { ActiveRitual } from '../types';

export const initialActiveRituals: ActiveRitual[] = [
    { 
        id: 'weekly-reflection', 
        templateId: 'weekly-reflection',
        title: 'Sunday Dinner', 
        description: "Each Sunday, share a photo or thought from your family dinner.", 
        iconName: 'UtensilsCrossed',
        frequency: 'Weekly',
        progress: 75,
        participants: [
            { id: 'jd', name: 'John Doe', avatar: 'JD' },
            { id: 'ad', name: 'Alex Doe', avatar: 'AD' },
            { id: 'md', name: 'Mia Doe', avatar: 'MD' },
        ]
    }
];
