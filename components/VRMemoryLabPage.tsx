import React from 'react';
import { Page } from '../types';

interface VRMemoryLabPageProps {
  onNavigate: (page: Page) => void;
}

// This component is now obsolete and its content has been moved to VRLabPage.tsx.
const VRMemoryLabPage: React.FC<VRMemoryLabPageProps> = ({ onNavigate }) => {
    return null;
};

export default VRMemoryLabPage;