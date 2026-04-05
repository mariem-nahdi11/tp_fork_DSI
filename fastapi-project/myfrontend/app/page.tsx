'use client';

import { useState, useEffect } from 'react';
import { Article, ArticleFormData } from '@/types/article';
import ArticleList from '@/components/ArticleList';
import ArticleForm from '@/components/ArticleForm';

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showForm, setShowForm] = useState(false);

  const API_URL = 'http://localhost:8000';

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/articles`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      setArticles(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArticle = async (articleData: ArticleFormData) => {
    try {
      const response = await fetch(`${API_URL}/articles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      });
      if (!response.ok) throw new Error('Erreur lors de la création');
      await fetchArticles();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleUpdateArticle = async (id: number, articleData: ArticleFormData) => {
    try {
      const response = await fetch(`${API_URL}/articles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      });
      if (!response.ok) throw new Error('Erreur lors de la mise à jour');
      await fetchArticles();
      setEditingArticle(null);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleDeleteArticle = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) return;
    try {
      const response = await fetch(`${API_URL}/articles/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erreur lors de la suppression');
      await fetchArticles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleEdit = (article: Article) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleCancel = () => {
    setEditingArticle(null);
    setShowForm(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-800 mb-2">📱 Accessoires Téléphoniques</h1>
          <p className="text-gray-600">Gérez votre collection d'accessoires pour smartphones</p>
        </header>

        <div className="flex justify-center mb-6">
          <button onClick={() => { setEditingArticle(null); setShowForm(!showForm); }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300">
            {showForm ? '❌ Fermer' : '➕ Nouvel Article'}
          </button>
        </div>

        {showForm && (
          <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {editingArticle ? '✏️ Modifier l\'article' : '➕ Ajouter un article'}
            </h2>
            <ArticleForm
              initialData={editingArticle || undefined}
              onSubmit={(data) => {
                if (editingArticle) handleUpdateArticle(editingArticle.id, data);
                else handleCreateArticle(data);
              }}
              onCancel={handleCancel}
            />
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <strong>Erreur :</strong> {error}
          </div>
        )}

        <ArticleList articles={articles} loading={loading} onEdit={handleEdit} onDelete={handleDeleteArticle} />
      </div>
    </main>
  );
}