import React, { useState } from 'react';
import { Page, SuggestedMoment, SuggestedPhoto } from '../types';
import { ArrowLeft, Edit, Trash2, Check, X, Wand2, Bot } from 'lucide-react';
import { initialSuggestedMoments } from '../data/moments';

interface BulkUploadReviewPageProps {
  onNavigate: (page: Page) => void;
}

const BulkUploadReviewPage: React.FC<BulkUploadReviewPageProps> = ({ onNavigate }) => {
  const [suggestedMoments, setSuggestedMoments] = useState<SuggestedMoment[]>(initialSuggestedMoments);
  const [editingMoment, setEditingMoment] = useState<SuggestedMoment | null>(null);

  const handleEdit = (moment: SuggestedMoment) => {
    setEditingMoment(moment);
  };
  
  const handleSaveEdit = (updatedMoment: SuggestedMoment) => {
      setSuggestedMoments(prev => prev.map(m => m.id === updatedMoment.id ? updatedMoment : m));
      setEditingMoment(null);
  }

  const handleDeleteSuggestion = (id: string) => {
    setSuggestedMoments(prev => prev.filter(m => m.id !== id));
  };
  
  const handleImportAll = () => {
    alert(`Importing ${suggestedMoments.length} new momænts to your collection!`);
    onNavigate(Page.Moments);
  };

  const EditModal: React.FC<{ moment: SuggestedMoment, onSave: (moment: SuggestedMoment) => void, onClose: () => void }> = ({ moment, onSave, onClose }) => {
      const [title, setTitle] = useState(moment.title);
      const [photos, setPhotos] = useState(moment.photos);
      
      const handleTogglePhoto = (id: string) => {
        // In a real app, this would probably mark it for exclusion rather than removing it.
        setPhotos(prev => prev.filter(p => p.id !== id));
      };
      
      const handleSaveChanges = () => {
          onSave({ ...moment, title, photos });
      };
      
      const getSuggestionBadge = (suggestion?: SuggestedPhoto['suggestion']) => {
          if (!suggestion) return null;
          const styles = {
              'Best Shot': 'bg-green-500/20 text-green-300',
              'Duplicate': 'bg-yellow-500/20 text-yellow-300',
              'Low Quality': 'bg-red-500/20 text-red-300',
          };
          return <span className={`absolute top-1 right-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${styles[suggestion]}`}>{suggestion.replace(' ', '\n')}</span>
      }

      return (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={onClose}>
              <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col ring-1 ring-white/10" onClick={e => e.stopPropagation()}>
                  <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                      <h2 className="text-xl font-bold font-brand text-white">Edit Suggested Momænt</h2>
                      <button onClick={onClose} className="text-slate-400 hover:text-white"><X /></button>
                  </div>
                  <div className="flex-grow p-6 overflow-y-auto space-y-4">
                      <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-xl font-bold"/>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                          {photos.map(photo => (
                              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                                  <img src={photo.url} alt="" className="w-full h-full object-cover"/>
                                  {getSuggestionBadge(photo.suggestion)}
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <button onClick={() => handleTogglePhoto(photo.id)} className="w-8 h-8 rounded-full bg-red-500/80 text-white flex items-center justify-center"><Trash2 size={16}/></button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-700 flex justify-end gap-4">
                      <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-full">Cancel</button>
                      <button onClick={handleSaveChanges} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-full">Save Changes</button>
                  </div>
              </div>
          </div>
      )
  };


  return (
    <div className="container mx-auto px-6 pt-28 pb-12 animate-fade-in-up">
      <div className="mb-12">
        <button onClick={() => onNavigate(Page.BulkUpload)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm ring-1 ring-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm transition-all mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to Upload
        </button>
        <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-xl flex items-center justify-center ring-1 ring-cyan-500/20">
                <Bot className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white font-brand">Curator's Studio</h1>
                <p className="text-slate-400 mt-2">æterny has analyzed your archive. Review the suggestions below before adding them to your timestream.</p>
            </div>
        </div>
      </div>
      
      <div className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10 mb-8 flex flex-col md:flex-row justify-around text-center">
        <div className="p-4">
            <p className="text-4xl font-bold text-white font-mono">6,201</p>
            <p className="text-sm text-slate-400">Photos Analyzed</p>
        </div>
        <div className="p-4">
            <p className="text-4xl font-bold text-white font-mono">1,834</p>
            <p className="text-sm text-slate-400">Duplicates & Bad Photos Found</p>
        </div>
        <div className="p-4">
            <p className="text-4xl font-bold text-cyan-400 font-mono">{suggestedMoments.length}</p>
            <p className="text-sm text-cyan-400">New Momænts Suggested</p>
        </div>
      </div>

      <div className="space-y-8">
        {suggestedMoments.map(moment => (
          <div key={moment.id} className="bg-gray-800/50 p-6 rounded-2xl ring-1 ring-white/10">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-2xl font-bold font-brand text-white">{moment.title}</h3>
                <p className="text-sm text-slate-400">{moment.dateRange}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(moment)} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-3 rounded-full text-sm transition-colors"><Edit className="w-4 h-4"/> Edit</button>
                <button onClick={() => handleDeleteSuggestion(moment.id)} className="p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
            <div className="flex overflow-x-auto gap-4 pb-2">
              {moment.photos.map(photo => {
                  const isBestShot = photo.suggestion === 'Best Shot';
                  return (
                      <div key={photo.id} className={`flex-shrink-0 w-40 h-40 rounded-lg overflow-hidden relative ${isBestShot ? 'ring-2 ring-green-400' : ''}`}>
                          <img src={photo.url} alt="" className="w-full h-full object-cover"/>
                          {isBestShot && <span className="absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-500/80 text-white">Best Shot</span>}
                      </div>
                  )
              })}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <button onClick={handleImportAll} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-8 rounded-full text-lg transition-all transform hover:scale-105">
            Accept & Import All to Timestream
        </button>
      </div>
      {editingMoment && <EditModal moment={editingMoment} onSave={handleSaveEdit} onClose={() => setEditingMoment(null)} />}
    </div>
  );
};

export default BulkUploadReviewPage;