import React, { useState, useCallback } from 'react';
import { Page, UserTier, FamilyTreeNode } from '../types';
import { ArrowLeft, GitBranch, Lock, Plus, Edit, Trash2, UserPlus, Save, X } from 'lucide-react';
import { familyTreeData } from '../data/familyTree';

interface FamilyTreePageProps {
  onNavigate: (page: Page) => void;
  userTier: UserTier;
}

// --- Recursive Tree Update Functions ---
const recursiveUpdate = (node: FamilyTreeNode, targetId: string, data: Partial<{ name: string; profilePic: string }>): FamilyTreeNode => {
    if (node.id === targetId) {
        return { ...node, ...data };
    }
    if (node.spouse && node.spouse.id === targetId) {
        return { ...node, spouse: { ...node.spouse, ...data } };
    }
    return {
        ...node,
        children: node.children?.map(child => recursiveUpdate(child, targetId, data))
    };
};

const recursiveRemove = (node: FamilyTreeNode, targetId: string): FamilyTreeNode | null => {
    if (node.id === targetId) return null; // This case shouldn't be hit if we don't allow removing root

    const newNode = { ...node };

    if (newNode.spouse && newNode.spouse.id === targetId) {
        delete newNode.spouse;
    }

    if (newNode.children) {
        newNode.children = newNode.children.map(child => recursiveRemove(child, targetId)).filter((c): c is FamilyTreeNode => c !== null);
    }

    return newNode;
};

const recursiveAdd = (node: FamilyTreeNode, parentId: string, newNodeData: FamilyTreeNode, type: 'child' | 'spouse'): FamilyTreeNode => {
    if (node.id === parentId) {
        if (type === 'child') {
            return { ...node, children: [...(node.children || []), newNodeData] };
        }
        if (type === 'spouse' && !node.spouse) {
            const { id, name, profilePic } = newNodeData;
            return { ...node, spouse: { id, name, profilePic } };
        }
    }
    return {
        ...node,
        children: node.children?.map(child => recursiveAdd(child, parentId, newNodeData, type))
    };
};

// --- Components ---

const UpgradePrompt: React.FC<{ onNavigate: (page: Page) => void }> = ({ onNavigate }) => (
    <div className="text-center max-w-lg mx-auto">
        <GitBranch className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white font-brand mb-2">Unlock Your Fæmily Tree</h2>
        <p className="text-slate-400 mb-6">Visually map your family's history, connect generations, and link moments to individuals. The Fæmily Tree is an exclusive feature for our <strong className="text-teal-300">Fæmily Plus</strong> and <strong className="text-amber-300">Lægacy</strong> members.</p>
        <button onClick={() => onNavigate(Page.Subscription)} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full transition-colors">
            Upgrade Your Plan
        </button>
    </div>
);


const EditMemberModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { name: string; profilePic: string }) => void;
    initialData?: { name: string; profilePic: string };
}> = ({ isOpen, onClose, onSave, initialData }) => {
    const [name, setName] = useState(initialData?.name || '');
    const [profilePic, setProfilePic] = useState(initialData?.profilePic || '');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ name, profilePic });
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold font-brand mb-4">{initialData ? 'Edit Family Member' : 'Add Family Member'}</h2>
                <div className="space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" required className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" />
                    <input type="text" value={profilePic} onChange={e => setProfilePic(e.target.value)} placeholder="Profile Picture URL" required className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" />
                </div>
                <div className="flex justify-end gap-4 mt-6">
                    <button type="button" onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-full text-sm">Cancel</button>
                    <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-full text-sm">Save</button>
                </div>
            </form>
        </div>
    );
};


const TreeNode: React.FC<{ 
    node: FamilyTreeNode;
    isEditing: boolean;
    onEdit: (id: string, name: string, profilePic: string) => void;
    onRemove: (id: string, name: string) => void;
    onAdd: (parentId: string, type: 'child' | 'spouse') => void;
}> = ({ node, isEditing, onEdit, onRemove, onAdd }) => {
    
    const Person: React.FC<{person: {id: string; name: string; profilePic?: string}, isSpouse?: boolean}> = ({ person, isSpouse }) => (
         <div className="text-center w-24 group relative">
            <img src={person.profilePic} alt={person.name} className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-slate-600" />
            <p className="text-sm font-semibold text-white mt-2 truncate">{person.name}</p>
            {isEditing && (
                <div className="absolute -top-2 -right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(person.id, person.name, person.profilePic || '')} className="w-6 h-6 rounded-full bg-slate-600 hover:bg-blue-500 flex items-center justify-center"><Edit size={12}/></button>
                    <button onClick={() => onRemove(person.id, person.name)} className="w-6 h-6 rounded-full bg-slate-600 hover:bg-red-500 flex items-center justify-center"><Trash2 size={12}/></button>
                </div>
            )}
        </div>
    );
    
    return (
        <div className="flex flex-col items-center relative px-2">
            {/* Couple */}
            <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-xl ring-1 ring-white/10 relative">
                <Person person={node} />
                {node.spouse ? (
                    <>
                        <div className="w-6 h-0.5 bg-slate-600"></div>
                        <Person person={node.spouse} isSpouse />
                    </>
                ) : isEditing && (
                    <button onClick={() => onAdd(node.id, 'spouse')} className="w-24 flex flex-col items-center text-slate-500 hover:text-cyan-400">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-600 flex items-center justify-center"><UserPlus size={24}/></div>
                        <p className="text-sm font-semibold mt-2">Add Spouse</p>
                    </button>
                )}
                 {isEditing && (
                    <button onClick={() => onAdd(node.id, 'child')} className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-600 hover:bg-green-500 flex items-center justify-center z-10"><Plus size={12}/></button>
                 )}
            </div>

            {/* Connecting line to children */}
            {node.children && node.children.length > 0 && (
                <div className="w-0.5 h-8 bg-slate-600"></div>
            )}

            {/* Children container */}
            {node.children && node.children.length > 0 && (
                <div className="relative flex justify-center gap-8 pt-8">
                    {/* Horizontal connecting line */}
                    <div className="absolute top-0 left-1/2 h-0.5 bg-slate-600" style={{
                        width: `calc(100% - ${node.children.length === 1 ? '0px' : '150px'})`,
                        transform: 'translateX(-50%)'
                    }}></div>
                    
                    {node.children.map(child => (
                        <div key={child.id} className="relative">
                            {/* Vertical line up to horizontal bar */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-slate-600"></div>
                            <TreeNode node={child} isEditing={isEditing} onEdit={onEdit} onRemove={onRemove} onAdd={onAdd} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const FamilyTreePage: React.FC<FamilyTreePageProps> = ({ onNavigate, userTier }) => {
    const hasAccess = userTier === 'fæmilyPlus' || userTier === 'legacy';

    const [treeData, setTreeData] = useState<FamilyTreeNode>(familyTreeData);
    const [isEditing, setIsEditing] = useState(false);
    const [modalState, setModalState] = useState<{
        isOpen: boolean;
        mode: 'add-child' | 'add-spouse' | 'edit' | null;
        nodeId: string | null; // For editing or adding spouse
        parentId: string | null; // For adding child
        initialData?: { name: string; profilePic: string };
    }>({ isOpen: false, mode: null, nodeId: null, parentId: null });

    const handleOpenModal = (mode: 'add-child' | 'add-spouse' | 'edit', id: string, initialData?: { name: string; profilePic: string }) => {
        setModalState({
            isOpen: true,
            mode,
            nodeId: (mode === 'edit' || mode === 'add-spouse') ? id : null,
            parentId: mode === 'add-child' ? id : null,
            initialData,
        });
    };
    
    const handleCloseModal = () => setModalState({ isOpen: false, mode: null, nodeId: null, parentId: null });

    const handleSave = ({ name, profilePic }: { name: string; profilePic: string }) => {
        const { mode, nodeId, parentId } = modalState;
        
        if (mode === 'edit' && nodeId) {
            setTreeData(prevTree => recursiveUpdate(prevTree, nodeId, { name, profilePic }));
        } else if ((mode === 'add-child' || mode === 'add-spouse') && (parentId || nodeId)) {
            const newNode: FamilyTreeNode = { id: Date.now().toString(), name, profilePic, children: [] };
            setTreeData(prevTree => recursiveAdd(prevTree, (parentId || nodeId)!, newNode, mode === 'add-child' ? 'child' : 'spouse'));
        }
        
        handleCloseModal();
    };
    
    const handleRemove = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to remove ${name} from the family tree? This cannot be undone.`)) {
            setTreeData(prevTree => recursiveRemove(prevTree, id) || prevTree); // Don't allow removing root
        }
    };
    

    return (
        <div className="container mx-auto px-6 pt-28 pb-12">
            <button onClick={() => onNavigate(Page.FamilySpace)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all mb-8">
                <ArrowLeft className="w-4 h-4" /> Back to Fæmily Space
            </button>

            {!hasAccess ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                     <UpgradePrompt onNavigate={onNavigate} />
                </div>
            ) : (
                <>
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-12">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold text-white font-brand">Fæmily Tree</h1>
                            <p className="text-slate-400 mt-2">Visually map your family's history and see how everyone is connected.</p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                             <button onClick={() => setIsEditing(!isEditing)} className={`flex items-center gap-2 font-bold py-2 px-4 rounded-full transition-colors text-sm ${isEditing ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
                                {isEditing ? <><Save className="w-4 h-4" /> Done Editing</> : <><Edit className="w-4 h-4" /> Edit Tree</>}
                            </button>
                            <button onClick={() => handleOpenModal('add-child', treeData.id)} className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-full transition-colors text-sm">
                                <Plus className="w-4 h-4" /> Add Member
                            </button>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800/50 p-4 sm:p-8 rounded-2xl ring-1 ring-white/10">
                        <div className="overflow-x-auto pb-8">
                             <div className="inline-block min-w-full">
                                <TreeNode 
                                    node={treeData}
                                    isEditing={isEditing}
                                    onEdit={(id, name, profilePic) => handleOpenModal('edit', id, { name, profilePic })}
                                    onRemove={handleRemove}
                                    onAdd={(id, type) => handleOpenModal(type === 'child' ? 'add-child' : 'add-spouse', id)}
                                />
                             </div>
                        </div>
                    </div>
                </>
            )}

            <EditMemberModal
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                onSave={handleSave}
                initialData={modalState.initialData}
            />
        </div>
    );
};

export default FamilyTreePage;