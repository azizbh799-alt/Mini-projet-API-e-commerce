# Shop API - TP NestJS + MySQL + Docker + Swagger

API REST e-commerce : catégories, produits, clients, commandes (transactionnelles, avec contrôle du stock).

## Démarrage rapide

```bash
cp .env.example .env          # variables pour l'exécution locale
npm ci
docker compose up -d db       # MySQL seul (hôte : localhost:3307)
npm run start:dev             # API sur http://localhost:3000
```

- Swagger UI : http://localhost:3000/api
- OpenAPI JSON : http://localhost:3000/api-json
- Santé : http://localhost:3000/health

### Tout dans Docker (API + MySQL)

```bash
# arrêter d'abord `npm run start:dev` pour libérer le port 3000
docker compose up -d --build
docker compose ps
docker compose logs -f api
```

Depuis le conteneur API, l'hôte MySQL est `db:3306` ; depuis la machine hôte c'est `localhost:3307`.

## Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run build` | compilation (`dist/`) |
| `npm run test` | tests unitaires (vitest) |
| `npm run lint` | oxlint |
| `docker compose down` | arrête, **conserve** le volume `mysql_data` |
| `docker compose down -v` | arrête et **supprime** les données |

## Endpoints

| Ressource | Endpoints |
|---|---|
| Categories | `POST /categories`, `GET /categories`, `GET /categories/:id`, `PATCH /categories/:id`, `DELETE /categories/:id` (409 si produits associés) |
| Products | `POST /products`, `GET /products?categoryId=&page=&limit=`, `GET /products/:id`, `PATCH /products/:id`, `DELETE /products/:id` (409 si lignes de commande) |
| Clients | `POST /clients`, `GET /clients`, `GET /clients/:id`, `GET /clients/:id/orders` |
| Orders | `POST /orders`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/cancel` (restitue le stock) |
| Health | `GET /health` |

## Scénario de test (ordre obligatoire)

```
POST /categories  { "name": "Informatique" }
POST /products    { "name": "Clavier", "price": 100.50, "stock": 8,  "categoryId": 1 }
POST /products    { "name": "Souris",  "price": 40,     "stock": 12, "categoryId": 1 }
POST /clients     { "fullName": "Amira Ben Ali", "email": "amira@example.com" }
POST /orders      { "clientId": 1, "items": [ {"productId":1,"quantity":2}, {"productId":2,"quantity":3} ] }
```

Attendus : total **321.00**, stock Clavier = **6**, stock Souris = **9**.

Tests négatifs : catégorie/client inexistant → 404 ; stock insuffisant → 400 (aucune commande, aucun stock modifié) ;
même `productId` deux fois → 400 ; prix négatif → 400 ; `items` vide → 400.

## Notes techniques

- Projet **ESM** (`"type": "module"`, `module: nodenext`) : tous les imports relatifs portent l'extension `.js`
  (`import { Product } from './product.entity.js'`), et les relations entre entités utilisent `Relation<T>`
  pour éviter l'erreur « Cannot access before initialization » due aux imports circulaires.
- `synchronize: true` est réservé au TP ; en production : migrations.
- Les identifiants MySQL du `compose.yaml` sont exclusivement destinés au TP. Ne jamais commiter `.env`.

## Réponses aux questions de compréhension

- **Ports `3307:3306` / volume** : le port 3306 du conteneur est publié sur le 3307 de l'hôte (évite un conflit avec un MySQL local). `mysql_data` persiste `/var/lib/mysql` : les données survivent à la suppression du conteneur.
- **OneToMany vs ManyToOne** : `ManyToOne` est le côté « plusieurs » et **porte la clé étrangère** ; `OneToMany` est le côté inverse, sans colonne.
- **Pourquoi `ORDER_ITEM`** : une relation ManyToMany simple ne peut pas stocker de données propres au lien (quantité, prix figé).
- **Pourquoi `unitPrice`** : le prix du produit peut changer ; la commande doit garder le prix payé.
- **Pourquoi un DTO** : valide et limite les champs acceptés (`whitelist`), n'expose pas la structure interne de la base.
- **`@ApiProperty`** : décrit types, exemples et contraintes dans Swagger.
- **Transaction** : commande, lignes et décrément du stock doivent réussir ou échouer ensemble (atomicité).
- **Commandes simultanées** : le `UPDATE ... WHERE stock >= :qty` est atomique ; la seconde commande échoue (400) si le stock est épuisé, sans survente.
- **`down` vs `down -v`** : `-v` supprime aussi le volume, donc les données.
- **`synchronize: true` en production** : peut modifier/supprimer colonnes et tables automatiquement → perte de données ; utiliser des migrations.
