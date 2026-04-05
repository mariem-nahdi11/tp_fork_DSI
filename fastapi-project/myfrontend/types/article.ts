export interface Article {
  id: number;
  nom: string;
  prix: number;
  description: string;
  date_creation: string;
}

export interface ArticleFormData {
  nom: string;
  prix: number;
  description: string;
}