"""
API FastAPI pour la gestion d'articles (accessoires téléphoniques)
Cette API permet de:
- Récupérer la liste des articles
- Ajouter un nouvel article
- Modifier un article existant
- Supprimer un article
"""

# Importation des modules nécessaires
from fastapi import FastAPI, HTTPException  # FastAPI pour créer l'API, HTTPException pour gérer les erreurs
from fastapi.middleware.cors import CORSMiddleware  # Middleware CORS pour autoriser les requêtes du frontend
from pydantic import BaseModel  # Pydantic pour la validation des données
from typing import List, Optional  # Typage pour les listes et options
from datetime import datetime  # Pour les horodatages

# Création de l'instance FastAPI
# title: Titre de l'API (visible dans la documentation automatique)
# version: Version de l'API
# description: Description de l'API
app = FastAPI(
    title="API Accessoires Téléphoniques",
    version="1.0.0",
    description="API pour gérer une liste d'accessoires téléphoniques"
)

# Configuration CORS (Cross-Origin Resource Sharing)
# Permet au frontend Next.js (port 3000) de communiquer avec l'API (port 8000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # URL du frontend autorisée
    allow_credentials=True,  # Autorise les cookies/credentials
    allow_methods=["*"],  # Autorise toutes les méthodes HTTP (GET, POST, PUT, DELETE)
    allow_headers=["*"],  # Autorise tous les headers
)

# ==================== MODÈLES DE DONNÉES (Pydantic) ====================
# Ces modèles définissent la structure des données échangées avec l'API

class ArticleBase(BaseModel):
    """
    Modèle de base pour un article
    - nom: Nom de l'article (ex: "Coque iPhone")
    - prix: Prix en euros
    - description: Description détaillée
    """
    nom: str
    prix: float
    description: str

class ArticleCreate(ArticleBase):
    """
    Modèle pour la création d'un article
    Hérite de ArticleBase (mêmes champs)
    """
    pass

class ArticleUpdate(BaseModel):
    """
    Modèle pour la mise à jour partielle d'un article
    Tous les champs sont optionnels car on peut modifier seulement certains champs
    """
    nom: Optional[str] = None
    prix: Optional[float] = None
    description: Optional[str] = None

class Article(ArticleBase):
    """
    Modèle complet d'un article (avec ID et date de création)
    Hérite de ArticleBase et ajoute:
    - id: Identifiant unique
    - date_creation: Date d'ajout de l'article
    """
    id: int
    date_creation: datetime

    # Configuration pour permettre la conversion automatique depuis les dictionnaires
    class Config:
        from_attributes = True

# ==================== BASE DE DONNÉES EN MÉMOIRE ====================
# Liste simulée d'une base de données
articles_db = []
compteur_id = 1  # Compteur pour générer des IDs uniques

# Ajout d'articles d'exemple
articles_exemples = [
    {"nom": "Coque iPhone 15", "prix": 29.99, "description": "Coque de protection transparente avec renforts anti-chocs"},
    {"nom": "Chargeur Samsung 45W", "prix": 34.99, "description": "Chargeur super rapide compatible Galaxy S24"},
    {"nom": "Film hydrogel Pixel 8", "prix": 12.99, "description": "Protection d'écran flexible auto-cicatrisante"},
    {"nom": "Support magnétique voiture", "prix": 19.99, "description": "Support aimanté pour tableau de bord"},
    {"nom": "Câble USB-C 2m", "prix": 9.99, "description": "Câble tressé résistant avec protection renforcée"},
]

# Insertion des exemples dans la "base de données"
for exemple in articles_exemples:
    article = Article(
        id=compteur_id,
        nom=exemple["nom"],
        prix=exemple["prix"],
        description=exemple["description"],
        date_creation=datetime.now()
    )
    articles_db.append(article)
    compteur_id += 1

# ==================== ROUTES DE L'API ====================

@app.get("/")
def root():
    """
    Route racine - Point d'entrée de l'API
    Retourne un message de bienvenue
    """
    return {
        "message": "Bienvenue sur l'API Accessoires Téléphoniques",
        "endpoints": {
            "GET /articles": "Liste tous les articles",
            "GET /articles/{id}": "Récupère un article par son ID",
            "POST /articles": "Ajoute un nouvel article",
            "PUT /articles/{id}": "Modifie complètement un article",
            "PATCH /articles/{id}": "Modifie partiellement un article",
            "DELETE /articles/{id}": "Supprime un article"
        }
    }

@app.get("/articles", response_model=List[Article])
def get_articles():
    """
    Route GET /articles
    Récupère la liste complète de tous les articles
    response_model=List[Article] indique le format de la réponse
    """
    return articles_db

@app.get("/articles/{article_id}", response_model=Article)
def get_article(article_id: int):
    """
    Route GET /articles/{id}
    Récupère un article spécifique par son ID
    - article_id: ID de l'article à récupérer
    """
    # Recherche de l'article dans la liste
    for article in articles_db:
        if article.id == article_id:
            return article
    
    # Si l'article n'existe pas, on lève une erreur 404
    raise HTTPException(status_code=404, detail=f"Article avec l'ID {article_id} non trouvé")

@app.post("/articles", response_model=Article, status_code=201)
def create_article(article: ArticleCreate):
    """
    Route POST /articles
    Crée un nouvel article
    - article: Données du nouvel article (nom, prix, description)
    Retourne l'article créé avec son ID et sa date de création
    status_code=201 indique que la ressource a été créée
    """
    global compteur_id
    
    # Validation des données
    if article.prix <= 0:
        raise HTTPException(status_code=400, detail="Le prix doit être supérieur à 0")
    
    if not article.nom or len(article.nom.strip()) == 0:
        raise HTTPException(status_code=400, detail="Le nom ne peut pas être vide")
    
    # Création du nouvel article
    nouvel_article = Article(
        id=compteur_id,
        nom=article.nom,
        prix=article.prix,
        description=article.description,
        date_creation=datetime.now()
    )
    
    # Ajout à la "base de données"
    articles_db.append(nouvel_article)
    compteur_id += 1
    
    return nouvel_article

@app.put("/articles/{article_id}", response_model=Article)
def update_article(article_id: int, article: ArticleCreate):
    """
    Route PUT /articles/{id}
    Modifie COMPLÈTEMENT un article existant (remplace toutes les valeurs)
    - article_id: ID de l'article à modifier
    - article: Nouvelles données complètes de l'article
    """
    # Recherche de l'article
    for i, existing_article in enumerate(articles_db):
        if existing_article.id == article_id:
            # Mise à jour de l'article
            articles_db[i] = Article(
                id=article_id,
                nom=article.nom,
                prix=article.prix,
                description=article.description,
                date_creation=existing_article.date_creation  # On conserve la date originale
            )
            return articles_db[i]
    
    raise HTTPException(status_code=404, detail=f"Article avec l'ID {article_id} non trouvé")

@app.patch("/articles/{article_id}", response_model=Article)
def patch_article(article_id: int, article_update: ArticleUpdate):
    """
    Route PATCH /articles/{id}
    Modifie PARTIELLEMENT un article existant (ne modifie que les champs fournis)
    - article_id: ID de l'article à modifier
    - article_update: Données à modifier (seulement les champs présents)
    """
    # Recherche de l'article
    for i, existing_article in enumerate(articles_db):
        if existing_article.id == article_id:
            # Mise à jour partielle : on ne modifie que les champs non None
            updated_article = Article(
                id=article_id,
                nom=article_update.nom if article_update.nom is not None else existing_article.nom,
                prix=article_update.prix if article_update.prix is not None else existing_article.prix,
                description=article_update.description if article_update.description is not None else existing_article.description,
                date_creation=existing_article.date_creation
            )
            articles_db[i] = updated_article
            return updated_article
    
    raise HTTPException(status_code=404, detail=f"Article avec l'ID {article_id} non trouvé")

@app.delete("/articles/{article_id}")
def delete_article(article_id: int):
    """
    Route DELETE /articles/{id}
    Supprime un article existant
    - article_id: ID de l'article à supprimer
    """
    # Recherche de l'article
    for i, article in enumerate(articles_db):
        if article.id == article_id:
            # Suppression de l'article
            deleted_article = articles_db.pop(i)
            return {"message": f"Article '{deleted_article.nom}' supprimé avec succès", "id": article_id}
    
    raise HTTPException(status_code=404, detail=f"Article avec l'ID {article_id} non trouvé")

# Point d'entrée pour exécuter l'API directement
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)