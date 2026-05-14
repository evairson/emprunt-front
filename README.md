# Système d'emprunt de matériel — BDS Totally Sport

Front du système d'emprunt de matériel du BDS Télécom Paris, réalisé dans le cadre du défi pôle WEB de la campagne BDS pour la liste Totally Sport.

> Le code du back se trouve dans le repo voisin `emprunt-back` (NestJS + Prisma).

## Stack

- Front : Next.js, Tailwind CSS, react-day-picker
- Back : NestJS, Prisma, PostgreSQL
- Auth : OAuth2 / OIDC via Rezel, JWT en cookie httpOnly

## Cahier des charges

- Authentification Rezel
- Gestion des permissions sur la BDD (rôles `USER` / `ADMIN`)
- Espace administrateur
- Espace cotisant pour emprunter
- CRUD du matériel avec upload de photo
- Demande d'emprunt avec calendrier (jours déjà réservés barrés)
- Validation des chevauchements de période côté serveur
- Workflow demande → accept/refus admin → suivi → marquage de retour
- Notifications email (réponse à la demande, rappel le jour de fin)
- Historique complet (admin) filtrable, historique perso (cotisant)
- Locations en cours triées par date de retour, retards en rouge

### Fonctionnalités implémentées

#### Cotisants

- Authentification via Rezel.
- Visualisation du matériel disponible et de ses emprunts en cours/à venir.
- Demande d'emprunt avec sélection de la période souhaitée (calendrier).
- Historique de ses demandes d'emprunt avec statut (en attente, accepté, refusé).
- Recevoir un mail de la réponse de l'emprunt (accepté/refusé) et un mail de rappel le jour de fin de l'emprunt.

#### Administrateurs

- Gestion du matériel : création, édition, suppression (avec upload de photo).
- Visualisation des demandes d'emprunt en attente avec possibilité d'accepter ou refuser.
- Visualisation de l'historique complet des emprunts.
- Visualisation des emprunts en cours avec indication des retards (emprunts dépassant la date de fin).

### Modèle de données

```
User     { id, email, username, name, role: USER|ADMIN }
Material { id, name, description, photoUrl? }
Emprunt  { id, userId, materialId, startDate, endDate,
           status: PENDING|APPROVED|REJECTED, returnedAt?, createdAt }
```

## Limites connues

- Pas de système de caution/dépôt de garantie.
- Pas de notifications pour les administrateurs (ex. lorsqu'une nouvelle demande est faite).
- Pas de filtre/recherche sur la liste de matériel.
- Pas de pagination sur les historiques.
- Le rafraîchissement du token JWT n'est pas implémenté ; après 1 h le cookie expire et il faut se reconnecter.
- Pour la simplicité du projet tous les utilisateurs sont considérés comme des cotisants

## Sécurité

- OAuth2 via Rezel pour l'authentification, avec vérification du token côté serveur.
- JWT stocké en cookie httpOnly pour les sessions.
- Route protégée côté client : redirection vers la page de connexion si non authentifié, message d'erreur si accès à une page admin sans les droits.

> ATTENTION : dans le cadre de test du projet, tous les utilisateurs peuvent devenir administrateurs dans le panel admin. Pour une utilisation réelle, il faudrait implémenter un système pour qu'un premier utilisateur admin puisse ajouter les autres administrateurs.

## Lancer le projet

```bash
# back
cd ../emprunt-back
npm install
# .env (voir .env.example)
npx prisma migrate dev
npm run start:dev      # → http://localhost:3000

# front
cd ../emprunt-front
npm install
npm run dev            # → http://localhost:3001
```

Documentation API auto-générée Swagger : http://localhost:3000/api

### Régénérer les types depuis OpenAPI

```bash
npm run generate:api
```

---

## Structure des pages

| Route | Rôle | Description |
|---|---|---|
| `/` | Public | Page de connexion (Rezel). Redirige vers `/dashboard` si déjà connecté. |
| `/dashboard` | Cotisant | Locations en cours et à venir, liste du matériel disponible, historique de ses demandes. |
| `/dashboard/emprunt/[id]` | Cotisant | Calendrier de sélection de période pour demander un emprunt. |
| `/admin` | Admin | Demandes en attente, locations en cours (avec retards), accès gestion matériel. |
| `/admin/material` | Admin | Liste de tout le matériel avec actions Modifier / Supprimer. |
| `/admin/material/new` | Admin | Création d'un matériel (avec photo). |
| `/admin/material/[id]/edit` | Admin | Édition d'un matériel. |
| `/admin/emprunts` | Admin | Historique complet des emprunts, filtrable par statut. |

## Auteurs

- Eva Herson
- Gabriel Sabot