'use client';

import { useState, useEffect } from 'react';
import { ArticleFormData, Article } from '@/types/article';

interface ArticleFormProps {
  initialData?: Article;
  onSubmit: (data: ArticleFormData) => void;
  onCancel: () => void;
}

export default function ArticleForm({ initialData, onSubmit, onCancel }: ArticleFormProps) {
  const [formData, setFormData] = useState<ArticleFormData>({
    nom: '',
    prix: 0,
    description: '',
  });
  const [errors, setErrors] = useState<Partial<ArticleFormData>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        nom: initialData.nom,
        prix: initialData.prix,
        description: initialData.description,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ArticleFormData> = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    else if (formData.nom.length < 3) newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    
    if (formData.prix <= 0) newErrors.prix = 'Le prix doit être supérieur à 0';
    
    if (!formData.description.trim()) newErrors.description = 'La description est requise';
    else if (formData.description.length < 10) newErrors.description = 'La description doit contenir au moins 10 caractères';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'prix' ? parseFloat(value) || 0 : value,
    }));
    if (errors[name as keyof ArticleFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">Nom de l'article *</label>
        <input type="text" id="nom" name="nom" value={formData.nom} onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.nom ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Ex: Coque iPhone 15 Pro" />
        {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
      </div>

      <div>
        <label htmlFor="prix" className="block text-sm font-medium text-gray-700 mb-1">Prix (€) *</label>
        <input type="number" id="prix" name="prix" value={formData.prix || ''} onChange={handleChange}
          step="0.01" min="0.01"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.prix ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="0.00" />
        {errors.prix && <p className="mt-1 text-sm text-red-500">{errors.prix}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange}
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="Description détaillée de l'article..." />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200">
          {initialData ? 'Mettre à jour' : 'Ajouter'}
        </button>
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200">
          Annuler
        </button>
      </div>
    </form>
  );
}