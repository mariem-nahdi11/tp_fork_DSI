'use client';

import { Article } from '@/types/article';

interface ArticleListProps {
  articles: Article[];
  loading: boolean;
  onEdit: (article: Article) => void;
  onDelete: (id: number) => void;
}

export default function ArticleList({ articles, loading, onEdit, onDelete }: ArticleListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Chargement des articles...</span>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <p className="text-gray-500 text-lg">Aucun article disponible</p>
        <p className="text-gray-400 mt-2">Cliquez sur "Nouvel Article" pour en ajouter un</p>
      </div>
    );
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <div key={article.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
            <h3 className="text-white font-bold text-lg truncate">{article.nom}</h3>
          </div>
          <div className="p-4">
            <div className="mb-3">
              <span className="text-2xl font-bold text-indigo-600">{formatPrice(article.prix)}</span>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{article.description}</p>
            <div className="text-xs text-gray-400 mb-4">Ajouté le {formatDate(article.date_creation)}</div>
            <div className="flex gap-2">
              <button onClick={() => onEdit(article)} className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-3 rounded-md transition duration-200">
                ✏️ Modifier
              </button>
              <button onClick={() => onDelete(article.id)} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-3 rounded-md transition duration-200">
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}