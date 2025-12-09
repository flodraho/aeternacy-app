
import React, { useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { storage, db } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';
import { Upload } from 'lucide-react';

export const PhotoUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    const storageRef = ref(storage, `user-uploads/${user.uid}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const prog = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(prog);
      },
      (error) => {
        console.error('Upload error:', error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, 'photos'), {
          userId: user.uid,
          url: downloadURL,
          createdAt: new Date(),
          fileName: file.name
        });
        setUploading(false);
        setProgress(0);
      }
    );
  };

  if (!user) {
    return <p className="text-center text-gray-400">Please login to upload photos.</p>;
  };

  return (
    <div className="p-6 border-2 border-dashed border-gray-600 rounded-lg text-center hover:border-gray-500 transition-colors">
      <Upload className="mx-auto mb-4 text-gray-400" size={48} />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
        id="photo-upload"
      />
      <label
        htmlFor="photo-upload"
        className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors inline-block"
      >
        {uploading ? `Uploading ${progress.toFixed(0)}%` : 'Choose Photo'}
      </label>
    </div>
  );
};
