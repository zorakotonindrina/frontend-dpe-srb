# CONCEPTION FONCTIONNELLE ET TECHNIQUE COMPLÈTE — v2

# Plateforme de gestion, suivi et contrôle des véhicules administratifs

**Projet :** Digitalisation du processus de suivi et de contrôle des véhicules administratifs au sein du Service Régional du Budget Analamanga
**Maître d'ouvrage :** Bureau du Suivi et de Contrôle des Véhicules Administratifs — BSCVA
**Rattachement :** Division Régionale du Patrimoine de l'État — DRPE / Service Régional du Budget Analamanga
**Niveau :** Master 2 Informatique / MBDS
**Durée cible :** 4 mois
**Stack cible :** Spring Boot + PostgreSQL + Next.js + Flutter

---

## Note de version

Cette version **v2** remplace la conception initiale (`conception_finale_complete` v1). Elle intègre deux évolutions majeures :

1. **Alignement sur le script SQL de production (`Script.sql`)**, qui a été écrit depuis la v1. La base physique n'était alors qu'esquissée sous forme de « blocs logiques » (section 12 de la v1). Elle est maintenant **actée** : 7 schémas PostgreSQL, plus de 55 tables, contraintes, index et données de référence. La section 12 de ce document est intégralement réécrite pour documenter ce schéma réel, table par table, et chaque processus métier (section 8) est désormais rattaché explicitement à ses tables physiques.
2. **Ajout d'une architecture d'initialisation de projet** (nouvelle section 14) : structure de dépôt, arborescence backend/frontend/mobile, stratégie de migration de base de données, environnements, checklist de démarrage « Jour 0 », et calage sur le planning du cahier des charges. Cette section répond au besoin de disposer d'un point de départ concret et non ambigu pour lancer le développement.

Le reste de la conception (vision, objectifs, processus métier, livrables) reste fonctionnellement stable par rapport à la v1 ; seuls les points impactés par le script SQL ont été corrigés ou précisés (noms de tables et de colonnes réels, valeurs des `CHECK` constraints, schémas PostgreSQL, conventions d'identifiants).

**Mise à jour 2026-08** : une revue d'alignement du frontend mock SRB (`dpe-srb-vehicules`) sur ce document et sur `Script.sql` a été menée processus par processus ; 6 des 11 processus métier (§8.1 à §8.6) sont désormais conformes. Voir §22 pour le détail et la liste des processus restants.

---

# 1. Vision générale du projet

Le projet vise à concevoir une plateforme numérique sécurisée permettant de centraliser, tracer, contrôler et automatiser les procédures administratives liées aux véhicules administratifs suivis par le Service Régional du Budget Analamanga.

Le système ne doit pas être conçu comme une simple base de données de véhicules. Le besoin réel est une **plateforme de gestion de dossiers administratifs appliquée aux véhicules administratifs**.

Un véhicule peut être recensé, contrôlé, entretenu, réparé, réceptionné, loué, évalué, ou faire l'objet d'une attestation. Chaque opération est portée par un dossier administratif, suit la procédure interne du service, contient des pièces justificatives et produit un ou plusieurs livrables officiels.

La conception reste centrée sur la chaîne suivante :

```text
Processus administratif
        ↓
Dossier (workflow.wf_dossier)
        ↓
Pièces justificatives (bscva.dossier_piece)
        ↓
Workflow interne existant (workflow.wf_activite / wf_tache_role_entite)
        ↓
Contrôle / validation / visa / refus
        ↓
Génération automatique du livrable (document_siigpe.document_genere)
        ↓
Archivage numérique
        ↓
Audit et traçabilité (workflow.audit_log)
```

Cette chaîne, purement conceptuelle en v1, est maintenant adossée à des tables réelles (entre parenthèses ci-dessus), ce qui confirme que la conception fonctionnelle initiale a été correctement traduite en base physique.

---

# 2. Objectifs du projet

## 2.1. Objectif général

Concevoir et développer une plateforme numérique sécurisée permettant la gestion centralisée et la traçabilité complète des dossiers relatifs aux véhicules administratifs du Service Régional du Budget Analamanga, afin d'améliorer le contrôle des dépenses, la transparence administrative, la conservation des documents et la performance du service.

## 2.2. Objectifs spécifiques

- Centraliser les informations relatives aux véhicules administratifs dans une base unique et sécurisée.
- Dématérialiser les procédures liées au suivi et au contrôle des véhicules.
- Respecter le workflow interne déjà utilisé dans les autres projets de l'administration.
- Automatiser la génération des livrables officiels à partir des modèles existants.
- Tracer toutes les validations, refus, visas, signatures et éditions de documents.
- Réduire les délais de traitement des dossiers d'entretien, de réparation et de réception.
- Faciliter la recherche de dossiers, pièces, actes et historiques.
- Produire des tableaux de bord de pilotage : dépenses, réparations, véhicules recensés, dossiers en attente, véhicules accidentés ou à condamner.

## 2.3. Objectifs chiffrés (cahier des charges)

| Indicateur | Cible | Échéance |
|---|---|---|
| Véhicules administratifs intégrés dans la base unique | 100 % | après mise en production |
| Procédures dématérialisées | ≥ 90 % | après mise en production |
| Enregistrement automatique des opérations (dépenses, interventions) | dès la mise en service | mise en service |
| Réduction du délai moyen de traitement des dossiers entretien/réparation | ≥ 40 % | après stabilisation |

---

# 3. Principes de conception retenus

## 3.1. Conserver le workflow interne existant

Le workflow ne doit pas être réinventé. La plateforme doit respecter la procédure interne déjà utilisée dans les autres projets.

La logique de workflow reste une couche transversale configurable, portée par les tables déjà existantes du schéma `workflow` :

| Concept | Table physique |
|---|---|
| Application | `workflow.wf_application` |
| Rôle | `workflow.wf_role` |
| Privilège | `workflow.wf_privilege`, `workflow.wf_privilege_role` |
| Utilisateur | `workflow.wf_utilisateur`, `workflow.wf_utilisateur_role` |
| Processus | `workflow.wf_processus` |
| Type d'acte | `workflow.wf_type_acte`, `workflow.wf_type_acte_groupe` |
| Dossier | `workflow.wf_dossier` |
| Activité | `workflow.wf_activite` |
| Tâche | `workflow.wf_tache_role_entite`, `workflow.wf_processus_activite_tache` |
| État / édition | `workflow.wf_referentiel_etat` |
| Trace / connexion | `workflow.wf_trace_session`, `workflow.wf_tentative_connexion` |

Les modules métier ne codent pas en dur les étapes. Ils créent un dossier dans `workflow.wf_dossier`, l'associent à un `processus_code` (ex. `VA_RECENS`, `VA_CONSTAT`, `VA_VISA_BC`…) et laissent le moteur de workflow gérer les étapes, les rôles, les droits et les validations via `wf_activite` / `wf_tache_role_entite`.

## 3.2. Réutiliser l'existant et étendre sans détruire — **confirmé par le script SQL**

L'ancien système contenait déjà des éléments importants : véhicules, utilisateurs, rôles, workflow, dossiers, quitus, entretien/réparation et référentiels. Le script SQL livré applique strictement cette stratégie :

```text
Base existante SIIGPE / Workflow (schémas : workflow, referentiel_national,
referentiel_rh, referentiel_siigpe, traitement_siigpe, document, audit)
        +
Nouveau schéma bscva (100 % additif, CREATE SCHEMA IF NOT EXISTS bscva)
        +
Compléments non destructifs sur l'existant :
  ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...
  (jamais de DROP COLUMN, jamais de RENAME)
```

Tous les `CREATE TABLE` du script utilisent `IF NOT EXISTS`, toutes les insertions de référentiels utilisent `ON CONFLICT ... DO NOTHING`, et tous les ajouts de colonnes sur les tables existantes utilisent `ADD COLUMN IF NOT EXISTS`. Le script est donc **idempotent et rejouable**, ce qui confirme que le principe retenu en v1 (« réutiliser les tables utiles et ajouter une surcouche métier propre ») a été respecté à la lettre dans l'implémentation.

## 3.3. Distinguer véhicule, dossier, pièce et acte

| Élément | Définition | Table physique |
|---|---|---|
| Véhicule | Bien patrimonial suivi par l'État | `traitement_siigpe.entite_vehicule` |
| Dossier | Demande administrative ouverte sur un ou plusieurs véhicules | `workflow.wf_dossier` (identifié par `reference_acte`) |
| Pièce justificative | Document fourni pour compléter le dossier | `bscva.piece_dossier` (référentiel) + `bscva.dossier_piece` (pièces reçues) |
| Acte / livrable | Document officiel généré par le système | `document_siigpe.document_genere` |

Cette séparation, déjà actée en v1, est confirmée physiquement : `entite_vehicule` (patrimoine permanent) n'est jamais mélangée avec `wf_dossier` (opération ponctuelle), et le lien entre les deux passe par une table de rattachement dédiée (`bscva.dossier_vehicule_ligne`, voir §12.8).

## 3.4. Création souple, validation contrôlée

Selon la note métier, aucune information ne doit bloquer totalement la création initiale d'un dossier. Le script SQL traduit cette règle par le champ `obligatoire` de `bscva.piece_dossier` : chaque pièce exigée par type d'acte est marquée `1` (obligatoire pour la validation finale) ou `0` (non bloquante, ex. « note explicative » en cas d'anomalie). Le statut réel de chaque pièce dans un dossier est porté par `bscva.dossier_piece.statut_piece`, avec la contrainte :

```sql
CHECK (statut_piece IN ('ATTENDUE','RECUE','ABSENTE','NON_CONFORME','REMPLACEE','VALIDEE'))
```

La logique retenue reste :

```text
Création dossier : souple
Contrôle dossier : signalement des manques (piece_dossier.obligatoire, dossier_piece.statut_piece)
Validation finale : contrôlée
Génération officielle : autorisée seulement si les règles sont respectées
```

Le système doit afficher : taux de complétude du dossier, pièces manquantes, informations manquantes, anomalies, date de clôture proposée, blocages éventuels avant validation finale.

## 3.5. Générer automatiquement les livrables

Les modèles contenus dans le fichier Excel des imprimés servent de base aux documents générés automatiquement. Le script SQL a déjà créé et peuplé le référentiel des modèles (`document_siigpe.modele_document`, 10 lignes seed — voir §12.7) ainsi que la table de génération (`document_siigpe.document_genere`) et l'historique d'impression (`document_siigpe.document_impression`).

Chaque livrable est généré à partir : des données du dossier, des données du véhicule, des pièces validées, de l'état du workflow, des signataires, des règles métier du processus. Les documents générés sont numérotés, archivés, versionnés (`document_genere.version`) et traçables (`document_siigpe.document_impression`).

---

# 4. Acteurs du système

| Acteur | Responsabilité principale | `role_code` (workflow.wf_role) |
|---|---|---|
| Administrateur | Gère les utilisateurs, rôles, privilèges, référentiels et paramètres | `ADMIN` |
| Agent de saisie | Enregistre les dossiers, véhicules, pièces et informations de base | `AGENT_SAISIE` |
| Agent de contrôle | Vérifie la complétude et la conformité des pièces | `AGENT_CONTROLE` |
| Technicien / expert administratif | Réalise les constatations, diagnostics, contrôles et réceptions | `EXPERT_TECH` |
| Chef BSCVA | Supervise le bureau, vise les actes internes | `CHEF_BSCVA` |
| Chef DRPE | Supervise la Division Régionale du Patrimoine de l'État | `CHEF_DRPE` |
| Chef SRB | Signataire officiel des actes (quitus, PV, attestations…) | `CHEF_SRB` |
| Dépositaire comptable / GAC | Intervient sur les livrets, pièces remplacées, service fait | `DEPOSITAIRE_CPT` |
| Auditeur / contrôleur interne / consultation | Consulte les historiques, documents, dépenses et traces | `CONSULT` |

Ces neuf rôles sont **déjà insérés** par le script SQL dans `workflow.wf_role` (section « Données minimales de workflow VA »). Chaque rôle est en outre rattaché, pour chacun des 11 processus VA, à une activité générique en 6 étapes (`DEPOT_DOSSIER → CONTROLE_PIECES → TRAITEMENT_TECHNIQUE → VISA_VALIDATION → EDITION_LIVRABLE → ARCHIVAGE`), générée automatiquement par un bloc PL/pgSQL (`DO $$ … $$`) qui peuple `workflow.wf_activite` et `workflow.wf_tache_role_entite` pour les 11 `processus_code` `VA_*`. C'est le squelette de workflow prêt à l'emploi pour démarrer le développement (voir §12.2).

---

# 5. Périmètre fonctionnel global

La plateforme couvre les domaines suivants :

1. Authentification et habilitations.
2. Gestion des véhicules administratifs.
3. Gestion des dossiers administratifs.
4. Gestion des pièces justificatives.
5. Workflow interne.
6. Contrôle technique et constatation.
7. Entretien, réparation et visa de bon de commande.
8. Réception technique après travaux.
9. Réception de véhicules nouvellement acquis.
10. Visa d'arrêtage des livrets.
11. Attestation d'aptitude et autorisation de location.
12. Attestation de caractéristiques.
13. Expertise, contre-expertise et condamnation.
14. Tests chauffeurs.
15. Génération et archivage des documents.
16. Reporting et tableaux de bord.
17. Audit et sécurité.

---

# 6. Cartographie des processus métier, livrables et tables associées

| N° | Processus | `processus_code` | `type_code` | Objet | Livrable(s) généré(s) | Table métier principale (`bscva`) |
|---|---|---|---|---|---|---|
| I | Recensement VA | `VA_RECENS` | `REC` | Recenser annuellement les véhicules administratifs | Canevas de recensement, quitus de recensement | `recensement`, `recensement_ligne` |
| II | Constatation technique | `VA_CONSTAT` | `CST` | Constater l'état technique avant entretien/réparation | Fiche de diagnostic, PV de constatation | `constatation_technique`, `constatation_element`, `constatation_piece_remplacer`, `constatation_reparation` |
| III | Visa bon de commande | `VA_VISA_BC` | `VBC` | Viser ou refuser un BC d'entretien/réparation | BC visé, BC refusé, BC visé sous réserve | `visa_bon_commande`, `visa_bc_piece` |
| IV | Réception technique | `VA_RECEPT` | `RCT` | Vérifier le service fait après grands travaux | PV de réception technique | `reception_technique`, `reception_constat` |
| V | Réception VA nouvellement acquis | `VA_RECEPT_NEUF` | `RNE` | Réceptionner les véhicules acquis, transférés ou donnés | PV d'ordre de recette / PV de réception | `reception_va_neuf`, `reception_neuf_ligne` |
| VI | Visa arrêtage livret | `VA_ARRET_LIV` | `ARL` | Viser les livrets SA, GSS et Parcours | Visa arrêtage livret | `arretage_livret`, `arretage_livret_detail` |
| VII | Attestation aptitude / location | `VA_LOCATION` | `LOC` | Contrôler un véhicule privé loué par l'État | Attestation d'aptitude, autorisation de location | `controle_aptitude` |
| VIII | Attestation de caractéristiques | `VA_ATT_CARAC` | `CAR` | Produire les caractéristiques pour carte grise perdue/détériorée | Attestation de caractéristiques | `attestation_caracteristique` |

Modules complémentaires (déjà présents dans le script SQL) :

| Processus | `processus_code` | `type_code` | Table métier |
|---|---|---|---|
| Expertise / contre-expertise véhicules accidentés | `VA_EXPERTISE` | `EXP` | `bscva.expertise_accident`, `bscva.expertise_dommage` |
| Évaluation / condamnation véhicule (mise à prix) | `VA_CONDAMN` | `CDN` | `bscva.evaluation_condamnation` |
| Test chauffeur | `VA_TEST_CHAUF` | `TCH` | `bscva.chauffeur` (référentiel chauffeur ; table de résultats de test à ajouter, voir §20) |
| Tableaux de bord et rapports | — | — | vues `bscva.v_va_*` (à créer, voir §20) |

---

# 7. Modules fonctionnels détaillés

## 7.1. Module authentification et habilitations

Fonctionnalités : authentification sécurisée, gestion des utilisateurs (`workflow.wf_utilisateur`), gestion des rôles (`workflow.wf_role`), gestion des privilèges (`workflow.wf_privilege`, `workflow.wf_privilege_role`), association utilisateur/rôle/entité (`workflow.wf_utilisateur_role`), suivi des tentatives de connexion (`workflow.wf_tentative_connexion`), journalisation des connexions (`workflow.wf_trace_session`), contrôle d'accès par rôle et par étape de workflow.

Le module s'intègre au workflow existant et ne crée pas de gestion de droits parallèle. L'identifiant utilisateur pivot est `utilisateur_matricule` (varchar 6), présent dans toutes les colonnes d'audit métier (`utilisateur_saisie`, `valide_par`, `genere_par`, etc.).

## 7.2. Module véhicules administratifs

Porté par `traitement_siigpe.entite_vehicule` (table pivot du patrimoine), enrichie par le script SQL avec les colonnes d'audit standard (`is_deleted`, `deleted_at`, `deleted_by`, `created_at`, `created_by`, `updated_at`, `updated_by`).

Fonctionnalités : création et mise à jour des fiches véhicules (immatriculation, marque, type, genre, modèle, carrosserie, puissance administrative, numéro moteur, VIN, source d'énergie, catégorie, année de première mise en circulation, état général, disponibilité carte grise, disponibilité livrets, détenteur effectif, propriétaire/ministère, SOA, région/district/commune), historique des affectations et utilisations (`traitement_siigpe.information_utilisation_vehicule`, `entite_utilisation_vehicule`), historique des interventions et dossiers (`traitement_siigpe.historique_vehicule`, table d'audit métier en `jsonb`).

## 7.3. Module dossiers administratifs

C'est le module central du système, porté par `workflow.wf_dossier`. Clé métier : `reference_acte` (varchar 19), utilisée comme clé étrangère textuelle dans **toutes** les tables `bscva.*` — c'est le fil rouge qui relie référentiel de pièces, processus métier et documents générés, sans dupliquer la logique de workflow.

Chaque dossier contient : référence unique (`reference_acte`), type de processus (`type_acte`, `processus_code`), date de dépôt/saisie, ministère demandeur (`ministere_code`), entité (`entite_code`), un ou plusieurs véhicules (via `bscva.dossier_vehicule_ligne`), pièces attendues/reçues (`bscva.piece_dossier` / `bscva.dossier_piece`), statut fonctionnel et étape workflow, observations, décisions (`motif_rejet`), livrables générés (`document_siigpe.document_genere`), historique complet.

Types de dossiers principaux : les 11 `type_code` du tableau §6 (`REC`, `CST`, `VBC`, `RCT`, `RNE`, `ARL`, `LOC`, `CAR`, `EXP`, `CDN`, `TCH`).

## 7.4. Module pièces justificatives

Porté par `bscva.piece_dossier` (référentiel des pièces exigibles par `type_code`, avec indicateur `obligatoire`) et `bscva.dossier_piece` (pièces réellement jointes à un dossier). Le script SQL a enrichi `dossier_piece` avec un jeu complet de colonnes de gestion documentaire : `statut_piece`, `version`, `obligatoire_validation`, `observation`, `motif_non_conformite`, `valide_par`, `date_validation`, `nom_original`, `chemin_fichier`, `mime_type`, `taille_octets`, `hash_fichier`.

Statuts possibles d'une pièce (`CHECK` sur `statut_piece`) :

| Statut | Signification |
|---|---|
| `ATTENDUE` | La pièce fait partie du dossier requis |
| `RECUE` | La pièce a été déposée |
| `ABSENTE` | La pièce n'a pas encore été fournie |
| `NON_CONFORME` | La pièce est présente mais invalide |
| `REMPLACEE` | Une nouvelle version a été déposée |
| `VALIDEE` | La pièce est acceptée pour traitement |

Le référentiel `bscva.piece_dossier` est déjà entièrement peuplé par le script SQL : 44 lignes couvrant les 8 processus principaux (I à VIII), reprises directement du cahier des charges et du fichier « DIGITALISATION VA 2026 ».

## 7.5. Module workflow interne

Couche transversale s'appuyant sur `workflow.wf_processus`, `workflow.wf_activite`, `workflow.wf_tache_role_entite`, `workflow.wf_processus_activite_tache`. Le module doit : créer le dossier dans le moteur interne, affecter le bon `processus_code`, afficher les tâches de l'utilisateur connecté (jointure `wf_tache_role_entite.role_code` ↔ `wf_utilisateur_role`), vérifier les rôles autorisés, gérer les actions (soumettre, valider, retourner, refuser, clôturer), tracer chaque action, autoriser la génération du livrable uniquement au bon moment.

Le script SQL a déjà instancié, pour chacun des 11 processus `VA_*`, une chaîne standard de 6 activités (voir §4) avec rang, URL de tâche et rôle assigné — ce squelette est directement exploitable en début de développement, quitte à être affiné processus par processus.

États fonctionnels affichés dans l'interface (ce sont des statuts d'affichage, indépendants des états internes bruts du moteur workflow) :

| État affiché | Signification |
|---|---|
| BROUILLON | Dossier créé mais non soumis |
| DÉPOSÉ | Dossier envoyé dans le circuit |
| EN_CONTRÔLE | Vérification des pièces et informations |
| À_COMPLÉTER | Dossier retourné pour complément |
| EN_TRAITEMENT_TECHNIQUE | Affecté à un technicien ou expert |
| EN_VALIDATION | En attente de visa ou décision |
| VALIDÉ | Dossier accepté |
| REFUSÉ | Dossier rejeté avec motif |
| LIVRABLE_GÉNÉRÉ | Acte officiel produit |
| CLÔTURÉ | Dossier terminé et archivé |

Le point d'entrée unique vers l'action de traitement est la recherche par référence : que la référence soit saisie manuellement ou obtenue en cliquant sur un dossier depuis une liste, elle doit systématiquement repasser par cette recherche, qui affiche l'étape courante du dossier et l'action possible (bouton « Traiter »). Un dossier ne doit jamais s'ouvrir directement sans passer par cette étape : c'est elle qui, une fois le backend AUGURE branché, interrogera réellement l'état du dossier — un raccourci créerait un chemin d'accès différent de celui utilisé en production.

## 7.6. Module contrôle technique et constatation

Porté par `bscva.constatation_technique` (en-tête : date, heure, lieu, expert, kilométrage, chauffeur, état général, synthèse texte) et `bscva.constatation_element` (grille détaillée : une ligne par élément contrôlé, conforme `C`/non conforme `N`, observation, ordre de priorité, et un champ dédié `pneu_pourcentage` pour les 4 mesures AVG/AVD/ARG/ARD).

Le référentiel des sections et éléments à contrôler est déjà entièrement seedé : `bscva.section_constatation` (17 sections : MOTEUR, ORGANE DE TRANSMISSION, FREINAGE, SUSPENSION, DIRECTION, ALIMENTATION, REFROIDISSEMENT, ÉLECTRICITÉ, CLIMATISATION, TÔLERIE, CAPITONNAGE, VITRERIE, OPTIQUES, FIBRES PLASTIQUES, PEINTURE, PNEUMATIQUE, RÉGLAGES) et `bscva.element_constatation` (plus de 100 éléments rattachés, ex. Culasse, Turbo, Disques/Plaquette/Ferodo, Batterie…). Les pièces à remplacer et réparations proposées sont portées par `bscva.constatation_piece_remplacer` et `bscva.constatation_reparation`.

## 7.7. Module entretien, réparation et visa de bon de commande

Porté par `bscva.visa_bon_commande`, relié à la table existante `traitement_siigpe.entretien_reparation_vehicule` via `entretien_reparation_vehicule_id` (clé texte varchar 20 conservée de l'ancienne base). Fonctionnalités : vérifier l'existence du quitus de l'année en cours, rattacher le PV de constatation (`reference_pv_constat`), saisir fournisseur/NIF/STAT/facture pro-forma/BC, identifier les grands travaux (`grands_travaux` 0/1), décider visa ou refus (`sens_visa` `V`/`R`, ou colonne normalisée `decision` `VISA`/`REFUS`), saisir motif de refus, générer le document visé ou refusé, déclencher la réception technique si grands travaux.

Règle majeure (portée par `visa_bon_commande.grands_travaux` et exploitée par `bscva.reception_technique.visa_bc_id`) :

```text
Si visa_bon_commande.grands_travaux = 1,
alors le visa est donné sous réserve : reception_technique doit exister et être validée
avant clôture du dossier.
```

## 7.8. Module réception technique après travaux

Porté par `bscva.reception_technique` (liée à `visa_bc_id`) et `bscva.reception_constat` (constats détaillés). Contrainte métier portée en base : `avis IN ('FAVORABLE','DEFAVORABLE')`, `service_fait_gac IN (0,1)`.

Règles : la réception se fait uniquement dans l'enceinte du service des garages administratifs ; les pièces usées remplacées doivent être présentées avec le véhicule ; ce processus est obligatoire pour lever la réserve des grands travaux.

## 7.9. Module réception véhicule nouvellement acquis

Porté par `bscva.reception_va_neuf` (en-tête budgétaire : budget, chapitre, article, compte, financement, commune, type d'acquisition, fournisseur/organisme, dépositaire, décision de commission) et `bscva.reception_neuf_ligne` (une ligne par véhicule reçu, avec quantité facturée/reconnue et décision par ligne : sans changement / réduction / rebutée).

Règle : après réception et immatriculation, le véhicule est créé ou rattaché dans `traitement_siigpe.entite_vehicule` et devient un véhicule administratif rattaché à un propriétaire et à un détenteur (`traitement_siigpe.vehicule_detenteur`).

## 7.10. Module visa arrêtage livret

Porté par `bscva.arretage_livret` (en-tête : date d'arrêtage, dernier BC, indicateur véhicule de fonction) et `bscva.arretage_livret_detail` (une ligne par rubrique arrêtée, rattachée à `bscva.type_livret` : `SA`, `GSS`, `PARCOURS`).

Règles : les rubriques doivent être arrêtées séparément par livret ; l'arrêtage est effectué à la date de l'année écoulée, généralement le 31 décembre ; une note explicative peut être demandée en cas de renouvellement, livret égaré ou anomalie.

## 7.11. Module attestation d'aptitude et autorisation de location

Porté par `bscva.controle_aptitude` (objet de mission, itinéraire, dates, contrat de location, NIF/STAT fournisseur, avis `apte` 0/1, ou colonne normalisée `avis_aptitude` `APTE`/`NON_APTE`).

> ⚠️ Point de vigilance signalé par le script SQL lui-même : `bscva.controle_aptitude` porte une contrainte `FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.entite_vehicule(vehicule_id)` alors que la colonne `vehicule_id` **n'est pas déclarée** dans le `CREATE TABLE` de cette table. Ce point doit être corrigé dans une migration de correctif avant mise en production (voir §20, point 11).

Règle : l'autorisation de location doit être liée à une attestation d'aptitude favorable (`apte = 1` / `avis_aptitude = 'APTE'`).

## 7.12. Module attestation de caractéristiques

Porté par `bscva.attestation_caracteristique` — reprend l'ensemble des champs techniques du véhicule (marque, genre, carrosserie, type, numéro série, numéro moteur, nombre de places, source d'énergie, puissance administrative, poids vide, charge utile, PTAC, année de première mise en circulation) et le motif (`motif_perte` : perte, détérioration ou indisponibilité de la carte grise).

## 7.13. Module expertise, contre-expertise et condamnation

Porté par `bscva.expertise_accident` (type `EXP`/`CONTRE_EXP`, date et lieu d'accident, véhicule privé impliqué le cas échéant, rapport, montant estimé), `bscva.expertise_dommage` (détail des dommages chiffrés) et `bscva.evaluation_condamnation` (valeur estimée, mise à prix, fiche technique, motif de condamnation).

## 7.14. Module tests chauffeurs

Le référentiel chauffeur (`bscva.chauffeur` : nom, matricule, CIN, permis, ministère, SOA) est créé par le script SQL. La table des résultats de test, initialement absente, a été ajoutée depuis en migration additive (`bscva.chauffeur_test`, Script.sql section 17, 2026-08-04) — résultat `APTE`/`NON_APTE`, observations, conforme au cahier des charges (§7.14 de la v1 : « saisir les résultats », « saisir les observations », « conserver l'historique des évaluations »). Reste à valider côté backend avant application en production (voir §20.2 point 13).

## 7.15. Module reporting et tableaux de bord

Indicateurs attendus (dépenses par véhicule/ministère/SOA, fréquence des réparations, véhicules en panne/marche/sur cale/épave, cartes grises manquantes, BC visés/refusés, véhicules loués, attestations générées, documents manquants par dossier…). Le script SQL prépare le terrain via `workflow.wf_referentiel_etat`, qui référence par avance 8 vues métier (`bscva.v_va_recens`, `v_va_constat`, `v_va_visa_bc`, `v_va_recept`, `v_va_recept_neuf`, `v_va_arret_liv`, `v_va_location`, `v_va_att_carac`) — **ces vues ne sont pas encore créées dans le script** ; elles constituent le premier chantier SQL du sprint 1 (voir §14).

---

# 8. Analyse détaillée des processus métier

Chaque processus ci-dessous reprend la structure de la v1 (objectif, pièces, données, règles, livrables) et ajoute un encart **« Tables associées »** reliant directement le fonctionnel au schéma physique du `Script.sql`.

## 8.1. Processus I — Recensement des véhicules administratifs

**Objectif :** recenser annuellement les véhicules administratifs au niveau régional et produire un quitus de recensement.

**Pièces à fournir :** bordereau d'envoi, demande de recensement, livrets GSS/SA/PE, photocopie carte grise ou rose.

**Règles métier :** recensement annuel et obligatoire ; un dossier de recensement peut concerner plusieurs véhicules ; le quitus indique le nombre total de véhicules recensés ; les véhicules doivent être rattachés à une région, district et commune ; l'absence d'une information ne bloque pas la saisie initiale, mais doit être signalée.

**Livrables générés :** canevas de recensement, quitus de recensement.

**Tables associées :** `workflow.wf_dossier` (type `REC`) · `bscva.recensement` (en-tête) · `bscva.recensement_ligne` (une ligne par véhicule, avec `carte_grise_dispo`, `livrets_dispo`, `etat_general`, `categorie_utilisation`) · `traitement_siigpe.quitus_vehicule` (quitus final, table déjà existante réutilisée) · `document_siigpe.modele_document` code `QUITUS_RECENSEMENT`.

## 8.2. Processus II — Constatation technique avant réparation

**Objectif :** constater l'état technique d'un véhicule avant entretien ou réparation et produire un PV de constatation.

**Règles métier :** la constatation précède le visa de bon de commande ; le PV doit pouvoir être rattaché au futur dossier de visa BC ; le technicien responsable doit être identifié ; les constats doivent être structurés par section technique.

**Livrables générés :** fiche de diagnostic technique, procès-verbal de constatation technique.

**Tables associées :** `workflow.wf_dossier` (type `CST`) · `bscva.constatation_technique` · `bscva.constatation_element` (+ référentiel `bscva.section_constatation` / `element_constatation`) · `bscva.constatation_piece_remplacer` · `bscva.constatation_reparation` · `document_siigpe.modele_document` codes `FICHE_CONSTATATION` et `PV_CONSTATATION`.

## 8.3. Processus III — Visa du bon de commande

**Objectif :** contrôler, viser ou refuser un bon de commande relatif à l'entretien ou à la réparation d'un véhicule administratif.

**Règles métier :** le PV de constatation est nécessaire pour la validation finale ; les pièces détachées doivent être inscrites dans le livret Service Automobile ; un visa peut être accordé sous réserve de réception technique pour les grands travaux ; le dossier peut aboutir à un visa ou à un refus, toujours motivé.

**Livrables générés :** bon de commande visé, bon de commande refusé, visa avec mention « sous réserve de réception technique ».

**Tables associées :** `workflow.wf_dossier` (type `VBC`) · `bscva.visa_bon_commande` (relié à `traitement_siigpe.entretien_reparation_vehicule` via `numero_bc`) · `bscva.visa_bc_piece` · `document_siigpe.modele_document` code `BC_VISE`.

## 8.4. Processus IV — Réception technique après travaux

**Objectif :** vérifier le service fait après réparation ou grands travaux et produire un PV de réception technique.

**Règles métier :** réception uniquement dans l'enceinte du service des garages administratifs ; pièces usées remplacées présentées avec le véhicule ; obligatoire lorsque le visa BC a été donné sous réserve ; permet de lever la réserve liée aux grands travaux.

**Livrables générés :** fiche de réception technique, procès-verbal de réception technique.

**Tables associées :** `workflow.wf_dossier` (type `RCT`) · `bscva.reception_technique` (FK `visa_bc_id` → `bscva.visa_bon_commande`) · `bscva.reception_constat` · `document_siigpe.modele_document` code `PV_RECEPTION`.

## 8.5. Processus V — Réception technique véhicule nouvellement acquis

**Objectif :** réceptionner les véhicules nouvellement acquis par l'État (achat, donation, transfert, convention, marché, organisme).

**Règles métier :** si le véhicule est acheté, la convention ou le marché doit être exigé ; le PV doit tracer la différence entre propriétaire et détenteur ; après immatriculation, le véhicule devient véhicule administratif.

**Livrable généré :** procès-verbal de réception / ordre de recette.

**Tables associées :** `workflow.wf_dossier` (type `RNE`) · `bscva.reception_va_neuf` (en-tête budgétaire) · `bscva.reception_neuf_ligne` (FK `vehicule_id` → `traitement_siigpe.entite_vehicule`) · `document_siigpe.modele_document` code `PV_ORDRE_RECETTE`.

## 8.6. Processus VI — Visa arrêtage livret

**Objectif :** valider l'arrêtage annuel ou périodique des livrets du véhicule.

**Livrables générés :** visa arrêtage livret SA, GSS, Parcours.

**Tables associées :** `workflow.wf_dossier` (type `ARL`) · `bscva.arretage_livret` · `bscva.arretage_livret_detail` (FK `type_livret_code` → `bscva.type_livret`) · `document_siigpe.modele_document` code `VISA_ARRETAGE_LIVRET`.

## 8.7. Processus VII — Attestation d'aptitude et autorisation de location

**Objectif :** vérifier l'aptitude d'un véhicule privé loué par l'État et produire l'attestation d'aptitude puis l'autorisation de location.

**Règles métier :** le constat d'aptitude se fait uniquement dans l'enceinte du service des garages administratifs ; l'autorisation de location doit être basée sur une attestation d'aptitude favorable.

**Livrables générés :** attestation d'aptitude, autorisation de location.

**Tables associées :** `workflow.wf_dossier` (type `LOC`) · `bscva.controle_aptitude` (à corriger, voir §7.11 et §20) · `document_siigpe.modele_document` codes `ATTESTATION_APTITUDE` et `AUTORISATION_LOCATION`.

## 8.8. Processus VIII — Attestation de caractéristiques

**Objectif :** délivrer une attestation de caractéristiques, notamment pour permettre l'obtention d'une nouvelle carte grise en cas de perte ou détérioration.

**Tables associées :** `workflow.wf_dossier` (type `CAR`) · `bscva.attestation_caracteristique` · `document_siigpe.modele_document` code `ATTESTATION_CARACTERISTIQUE`.

---

# 9. Chaînage entre processus

| Processus source | Condition | Processus lié | Traduction technique |
|---|---|---|---|
| Recensement | Quitus généré pour l'année | Constatation, visa BC, réception, arrêtage | `traitement_siigpe.quitus_vehicule.date_quitus` de l'exercice en cours |
| Constatation technique | PV validé | Visa bon de commande possible | `visa_bon_commande.reference_pv_constat` |
| Visa bon de commande | Grands travaux = 1 | Réception technique obligatoire | `reception_technique.visa_bc_id` |
| Réception technique | Service fait validé | Clôture du dossier entretien/réparation | `reception_technique.avis = 'FAVORABLE'` |
| Attestation d'aptitude | Avis favorable | Autorisation de location possible | `controle_aptitude.avis_aptitude = 'APTE'` |
| Réception véhicule neuf | PV validé + immatriculation | Création/MàJ fiche véhicule administratif | `reception_neuf_ligne.vehicule_id` → `entite_vehicule` |
| Attestation caractéristiques | Carte grise perdue/détériorée | Support pour nouvelle carte grise | `attestation_caracteristique.motif_perte` |

---

# 10. Génération automatique des documents

## 10.1. Principe général

```text
Validation workflow
        ↓
Sélection du modèle selon le type de processus (document_siigpe.modele_document, filtré par type_acte)
        ↓
Chargement des données dossier + véhicule + pièces + signataires
        ↓
Génération du document (document_siigpe.document_genere, statut='BROUILLON')
        ↓
Attribution du numéro officiel (document_siigpe.sequence_document)
        ↓
Archivage dans le dossier (document_genere.statut='VALIDE')
        ↓
Journalisation de l'action (workflow.audit_log)
```

## 10.2. Technologie recommandée

**JasperReports**, cohérente avec `document_siigpe.modele_document.format_modele = 'JASPER'` et la convention de chemin `jasper/<nom>.jrxml` déjà utilisée dans les 10 lignes seedées de `document_siigpe.modele_document`.

## 10.3. Numérotation

Portée par `document_siigpe.sequence_document` (clé `type_acte`, compteur `dernier_numero`). Règle proposée, à confirmer avec le métier :

```text
Numéro séquentiel par type d'acte et par exercice
Exemple : 0001-2026/MEF/SG/DGBF/DB/SRB Anala/DRPE/BSCVA
```

## 10.4. Gestion des versions et statuts

`document_siigpe.document_genere.statut` est désormais contraint en base :

```sql
CHECK (statut IN ('BROUILLON','VALIDE','ANNULE','REMPLACE'))
```

| Statut | Usage |
|---|---|
| `BROUILLON` | Prévisualisation interne |
| `VALIDE` | Document officiel signé ou validé |
| `ANNULE` | Document invalidé |
| `REMPLACE` | Document remplacé par une nouvelle version |

Une réimpression d'un document validé conserve le même numéro mais est tracée dans `document_siigpe.document_impression` (`imprime_par`, `date_impression`, `motif`, `adresse_ip`).

## 10.5. Formats de sortie

PDF pour les actes officiels, Excel pour les canevas et exports, archive ZIP pour l'export complet d'un dossier, aperçu web pour consultation avant édition.

---

# 11. Spécification synthétique des livrables

*(Contenu inchangé par rapport à la v1 — reportez-vous à la version précédente pour le détail champ par champ de chaque livrable : quitus de recensement, fiche de diagnostic, PV de constatation, BC visé/refusé, PV de réception, PV d'ordre de recette, visa arrêtage livret, attestation d'aptitude, autorisation de location, attestation de caractéristiques. Chaque livrable correspond désormais à une ligne de `document_siigpe.modele_document` listée en §10.2 et au §20.9 du script SQL.)*

---

# 12. Modèle physique de données — schéma réel (`Script.sql`)

Cette section remplace intégralement la section 12 de la v1 (« Proposition de modèle logique cible, sans détailler la base physique »). La base est maintenant définie : **7 schémas PostgreSQL**, organisés du plus stable (référentiels nationaux) au plus métier (bscva).

## 12.1. Vue d'ensemble des schémas

| Schéma | Rôle | Statut | Nb. tables (approx.) |
|---|---|---|---|
| `referentiel_national` | Découpage administratif (province, région, district, commune, fokontany) | Existant, réutilisé | 5 |
| `referentiel_rh` | Ministères et SOA | Existant, réutilisé | 2 |
| `referentiel_siigpe` | Référentiels véhicule (catégorie, énergie, état, genre, carrosserie, marque, fournisseur) | Existant, réutilisé | 8 |
| `workflow` | Moteur de workflow interne (rôles, dossiers, activités, tâches, traces) | Existant, réutilisé | 13 |
| `traitement_siigpe` | Noyau véhicule (fiche véhicule, utilisation, détenteur, quitus, entretien, historique) | Existant, réutilisé, enrichi | 9 |
| `document` | Modèles, documents générés, séquences, impressions | Existant, réutilisé, enrichi | 4 |
| `audit` | Journal d'audit global | Existant, réutilisé | 1 |
| `bscva` | **Nouveau schéma métier BSCVA** (100 % additif) | **Nouveau** | 25 |

## 12.2. Schéma `workflow` — moteur générique

```text
wf_application ──┬── wf_privilege ── wf_privilege_role ── wf_role
                  ├── wf_utilisateur ── wf_utilisateur_role
                  └── wf_tentative_connexion

wf_type_acte_groupe ── wf_type_acte ── wf_processus
                                │
wf_dossier (pivot, reference_acte)
                                │
wf_activite (processus_code, rang, avant/suivant)
                                │
wf_tache_role_entite (role_code, page, condition)
                                │
wf_processus_activite_tache
                                │
wf_referentiel_etat (jasper, etat_view)
```

Clé pivot : `wf_dossier.reference_acte` (varchar 19). C'est la clé métier utilisée, sous forme de FK textuelle non contrainte, par toutes les tables `bscva.*` — un choix délibéré de compatibilité avec l'ancienne base (pas de FK physique cross-schéma sur cette colonne, pour rester non intrusif).

## 12.3. Schéma `referentiel_siigpe` et `traitement_siigpe` — noyau véhicule

Table pivot : `traitement_siigpe.entite_vehicule` (clé `vehicule_id uuid`, immatriculation unique). Elle référence les référentiels :

```text
entite_vehicule
  ├── vehicule_marque_id  → traitement_siigpe.vehicule_marque
  ├── vehicule_source_energie → referentiel_siigpe.energie_vehicule
  ├── categorie_vehicule  → referentiel_siigpe.categorie_vehicule
  ├── etat_vehicule       → referentiel_siigpe.etat_vehicule
  └── region_id           → referentiel_national.rn_region
```

Tables satellites : `information_utilisation_vehicule` / `entite_utilisation_vehicule` (usage et affectation), `vehicule_detenteur` (détenteur effectif dans le temps), `quitus_vehicule` (quitus annuel — réutilisé par le processus Recensement), `entretien_reparation_vehicule` / `reparation_effectue_vehicule` (historique BC — réutilisé par Visa BC), `historique_vehicule` (journal `jsonb` avant/après).

Le script ajoute à `entite_vehicule` les colonnes d'audit standard : `is_deleted`, `deleted_at`, `deleted_by`, `created_at`, `created_by`, `updated_at`, `updated_by` — pattern de suppression logique appliqué de façon cohérente sur les tables les plus sensibles (`entite_vehicule`, `bscva.dossier_piece`, `document_siigpe.document_genere`).

## 12.4. Schéma `document` — génération et archivage

```text
modele_document (code UNIQUE, type_acte → wf_type_acte, fichier_modele, format_modele)
        │
document_genere (reference_acte, modele_id, numero_document, version, statut)
        │
document_impression (document_id, imprime_par, date_impression, motif)

sequence_document (type_acte PK, dernier_numero)
```

`document_genere.statut` est contraint (`BROUILLON`/`VALIDE`/`ANNULE`/`REMPLACE`, §10.4). Colonnes ajoutées par le script : `chemin_fichier_source`, `hash_fichier`, `qr_code` — prêtes pour l'intégrité et la vérification des PDF générés.

## 12.5. Schéma `audit` — traçabilité globale

Table unique `workflow.audit_log` : `utilisateur_id`, `action`, `schema_nom`, `table_nom`, `entite_id`, `reference_acte`, `ancienne_valeur`/`nouvelle_valeur` (`jsonb`), `date_action`, `adresse_ip`, `user_agent`. Générique par construction (colonnes `schema_nom`/`table_nom`) : peut journaliser n'importe quelle table du système sans modification de structure, y compris les futures tables `bscva`.

## 12.6. Schéma `bscva` — cœur métier nouveau

C'est le schéma central de ce projet. Il regroupe :

**Référentiels nouveaux**
- `section_constatation`, `element_constatation` — grille de contrôle technique (17 sections, >100 éléments, seedés)
- `type_livret` — `SA` / `GSS` / `PARCOURS` (seedé)
- `piece_dossier` — pièces exigibles par `type_code` (44 lignes seedées, cf. §7.4)
- `dossier_piece` — pièces effectivement reçues par dossier (enrichie en gestion documentaire complète, §7.4)

**Tables de processus (une par processus métier, cf. §6 et §8)**
- `recensement`, `recensement_ligne`
- `constatation_technique`, `constatation_element`, `constatation_piece_remplacer`, `constatation_reparation`
- `visa_bon_commande`, `visa_bc_piece`
- `reception_technique`, `reception_constat`
- `reception_va_neuf`, `reception_neuf_ligne`
- `arretage_livret`, `arretage_livret_detail`
- `controle_aptitude`
- `attestation_caracteristique`
- `expertise_accident`, `expertise_dommage`
- `evaluation_condamnation`
- `chauffeur`

**Table transverse**
- `dossier_vehicule_ligne` — rattachement générique dossier ↔ véhicule pour les dossiers multi-véhicules (recensement, réception VA neuf, location…), avec un `role_vehicule` contraint : `PRINCIPAL`, `CONCERNE`, `LOUE`, `ACQUIS`, `ACCIDENTE`, `REMPLACE`.

## 12.7. Conventions de conception observées dans le script

| Convention | Détail |
|---|---|
| Clés primaires | `uuid`, par défaut `gen_random_uuid()` (extension `pgcrypto`) sur les nouvelles tables `bscva`/`referentiel_siigpe`/`traitement_siigpe`/`document` ; anciennes tables `workflow` conservent `uuid_in(md5(random()::text)::cstring)` pour compatibilité avec l'existant — **ne pas harmoniser sans migration dédiée**, les deux méthodes produisent des UUID valides mais avec des générateurs différents |
| Clé métier pivot | `reference_acte varchar(19)` : identifiant fonctionnel du dossier, repris tel quel (sans FK physique) dans toutes les tables `bscva.*` |
| Idempotence | `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `ON CONFLICT DO NOTHING` partout — le script est rejouable sans erreur |
| Suppression logique | `is_deleted` / `deleted_at` / `deleted_by` + `created_at/by`, `updated_at/by` sur les tables sensibles (`entite_vehicule`, `dossier_piece`, `document_genere`) |
| Statuts métier | Systématiquement contraints par `CHECK` plutôt que par table de référence à part (ex. `dossier_piece.statut_piece`, `document_genere.statut`, `visa_bon_commande.decision/sens_visa/grands_travaux`, `reception_technique.avis/service_fait_gac`, `controle_aptitude.avis_aptitude/apte`) |
| Nommage | `snake_case`, préfixe implicite par le nom du schéma (pas de préfixe redondant dans le nom de table) |
| Non-destructivité | Aucun `DROP`, aucun `RENAME` dans tout le script — seulement `CREATE` et `ALTER ... ADD` |

## 12.8. Diagramme relationnel simplifié

```text
                         workflow.wf_dossier (reference_acte)
                                     │
        ┌────────────────┬──────────┼───────────┬──────────────────┐
        │                │          │           │                  │
bscva.dossier_piece  bscva.dossier_vehicule_ligne │     document_siigpe.document_genere
        │                │          │           │                  │
bscva.piece_dossier   traitement_siigpe   bscva.recensement   document_siigpe.modele_document
                       .entite_vehicule    bscva.constatation_technique
                            │              bscva.visa_bon_commande
                            │              bscva.reception_technique
              ┌─────────────┼─────────────┐ bscva.reception_va_neuf
              │             │             │  bscva.arretage_livret
    referentiel_siigpe  referentiel_     traitement_siigpe  bscva.controle_aptitude
    (marque, énergie,   national         .quitus_vehicule    bscva.attestation_caracteristique
     état, catégorie)   (région)         .entretien_reparation_vehicule  bscva.expertise_accident
                                                              bscva.evaluation_condamnation
```

## 12.9. Modèles de documents déjà seedés (`document_siigpe.modele_document`)

| Code | Libellé | `type_acte` | Fichier Jasper |
|---|---|---|---|
| `QUITUS_RECENSEMENT` | Quitus de recensement | `REC` | `jasper/quitus_recensement.jrxml` |
| `FICHE_CONSTATATION` | Fiche de diagnostic technique | `CST` | `jasper/fiche_constatation.jrxml` |
| `PV_CONSTATATION` | PV de constatation technique | `CST` | `jasper/pv_constatation.jrxml` |
| `BC_VISE` | Bon de commande visé ou refusé | `VBC` | `jasper/bc_vise.jrxml` |
| `PV_RECEPTION` | PV de réception technique | `RCT` | `jasper/pv_reception.jrxml` |
| `PV_ORDRE_RECETTE` | PV d'ordre de recette VA neuf | `RNE` | `jasper/pv_ordre_recette.jrxml` |
| `VISA_ARRETAGE_LIVRET` | Visa arrêtage livret | `ARL` | `jasper/visa_arretage_livret.jrxml` |
| `ATTESTATION_APTITUDE` | Attestation d'aptitude | `LOC` | `jasper/attestation_aptitude.jrxml` |
| `AUTORISATION_LOCATION` | Autorisation de location | `LOC` | `jasper/autorisation_location.jrxml` |
| `ATTESTATION_CARACTERISTIQUE` | Attestation de caractéristiques | `CAR` | `jasper/attestation_caracteristique.jrxml` |

Ces `.jrxml` n'existent pas encore physiquement — c'est un livrable de conception UI/Jasper à produire en phase de développement (voir §14.7).

---

# 13. Architecture technique cible (composants)

```text
                    Utilisateurs administratifs
                              ↓
                       Application Web Next.js
                              ↓
                           API REST HTTPS
                              ↓
                       Backend Spring Boot
                              ↓
 ┌────────────────────────────┼────────────────────────────┐
 ↓                            ↓                            ↓
PostgreSQL              Stockage fichiers          Générateur documents
(7 schémas, cf. §12)    Scans / photos / PDF       JasperReports
                              ↑
                     Application mobile Flutter
                 Agents terrain / techniciens / consultation
```

## 13.1. Backend Spring Boot — responsabilités

Exposer les API REST, gérer la logique métier, appliquer les droits, intégrer le workflow interne, gérer les pièces et fichiers, générer les documents, produire les tableaux de bord, assurer l'audit.

## 13.2. Frontend Web Next.js — pages principales

Tableau de bord, liste/détail véhicules, création/liste/détail dossiers, pièces justificatives, écrans par processus (constatation, visa BC, réception, réception VA neuf, aptitude/location, attestation caractéristiques, arrêtage livret), documents générés, workflow/mes tâches, administration, reporting.

## 13.3. Application mobile Flutter — fonctionnalités prioritaires

Recherche véhicule par immatriculation, consultation fiche véhicule/dossier, saisie rapide de constatation, ajout photo/observation, consultation pièces, suivi statut dossier, synchronisation avec l'API.

## 13.4. Stockage documentaire

Pièces scannées, photos terrain, modèles de documents, PDF générés, versions, métadonnées, droits d'accès. Deux options : stockage local sécurisé sur serveur, ou stockage objet/NAS interne selon l'infrastructure disponible (cf. cahier des charges — hébergement géré par le DSI).

---

# 14. Architecture d'initialisation du projet *(nouveau)*

Cette section donne un point de départ concret, non ambigu, pour démarrer le développement dès demain matin : structure de dépôt, arborescence par composant, stratégie de migration de base de données à partir du `Script.sql` existant, environnements, et checklist « Jour 0 ».

## 14.1. Organisation du dépôt

Recommandation : **un dépôt par composant** (backend / web / mobile), plus un dépôt de conception, cohérent avec la séparation nette des cycles de release (le mobile ne se déploie pas au même rythme que l'API) et avec une équipe réduite qui doit pouvoir cloner uniquement ce dont elle a besoin.

```text
va-bscva-backend/      → API Spring Boot + migrations SQL
va-bscva-web/          → Application Next.js
va-bscva-mobile/       → Application Flutter
va-bscva-conception/   → Ce document, diagrammes .drawio, cahier des charges, imprimés Excel
```

Si l'équipe est très réduite (1 à 3 personnes), un **monorepo** avec dossiers `backend/`, `web/`, `mobile/`, `docs/` à la racine est acceptable et évite la charge de synchronisation multi-dépôt ; le reste de cette section s'applique à l'identique en substituant les chemins.

## 14.2. Arborescence backend Spring Boot

Le découpage en packages Java doit refléter directement les schémas PostgreSQL du §12, pas l'inverse — cela évite le décalage conception/code observé entre la v1 (blocs logiques abstraits) et le script SQL (structure réelle) :

```text
mg.gov.srb.vehicules
 ├── config/              # sécurité, CORS, OpenAPI, JPA, multipart
 ├── security/            # JWT, filtres, UserDetailsService sur workflow.wf_utilisateur
 ├── common/              # audit listener, pagination, exceptions, mapping
 ├── referentiel/         # referentiel_national, referentiel_rh, referentiel_siigpe
 ├── vehicule/            # traitement_siigpe.entite_vehicule et satellites
 ├── workflow/            # wf_dossier, wf_activite, wf_tache_role_entite, moteur de tâches
 ├── bscva/
 │    ├── recensement/
 │    ├── constatation/
 │    ├── visabc/
 │    ├── receptiontechnique/
 │    ├── receptionneuf/
 │    ├── arretagelivret/
 │    ├── aptitudelocation/
 │    ├── attestationcaracteristique/
 │    ├── expertise/
 │    ├── condamnation/
 │    ├── chauffeur/
 │    └── piecejointe/     # piece_dossier / dossier_piece, transverse à tous les processus
 ├── document/             # modele_document, document_genere, sequence_document, jasper
 ├── reporting/            # vues bscva.v_va_*, exports PDF/Excel
 └── audit/                # workflow.audit_log, aspect AOP transverse
 
src/main/resources/
 ├── db/migration/         # scripts Flyway, cf. §14.3
 ├── jasper/               # .jrxml, un sous-dossier par processus
 └── application.yml (+ -dev / -test / -prod)
```

## 14.3. Base de données : Flyway par-dessus le `Script.sql` existant

Le script fourni est un DDL brut, pensé pour être exécuté une fois manuellement. Pour l'exploiter comme base de départ d'un projet versionné, la recommandation est d'y appliquer **Flyway** (déjà standard avec Spring Boot) selon ce découpage :

```text
db/migration/
 ├── V1__baseline_siigpe_workflow_existant.sql   # sections 1-7 du Script.sql (schemas existants + seed)
 ├── V2__bscva_schema_metier.sql                 # sections "PLATEFORME VA — DDL ADDITIF" (schéma bscva)
 ├── V3__bscva_seed_referentiels.sql             # seeds piece_dossier, type_livret, section/element_constatation
 ├── V4__bscva_completements.sql                 # section 16 du Script.sql (colonnes d'audit, CHECK, dossier_vehicule_ligne, document_impression)
 ├── V5__bscva_vues_reporting.sql                # NOUVEAU : création des vues v_va_* attendues par wf_referentiel_etat (§20, point 1)
 └── V6__bscva_correctif_controle_aptitude.sql   # NOUVEAU : ajout de la colonne vehicule_id manquante (§20, point 11)
```

Le script `Script.sql` original est déjà quasiment prêt pour ce découpage (il est lui-même organisé en 2 grandes parties + une section 16 de compléments) : il suffit de le scinder aux séparateurs `/* ===== */` déjà présents dans le fichier, sans réécrire une seule ligne de DDL. `V5` et `V6` sont les deux seuls scripts réellement nouveaux à écrire.

Convention Flyway : `application.yml` pointe `spring.flyway.locations=classpath:db/migration`, `baseline-on-migrate: true` si la base de dev est amorcée directement avec le `Script.sql` d'origine avant l'introduction de Flyway.

## 14.4. Arborescence frontend Next.js

```text
va-bscva-web/
 ├── app/
 │    ├── (auth)/login
 │    ├── (dashboard)/dashboard
 │    ├── vehicules/[id]
 │    ├── dossiers/[reference]
 │    ├── processus/
 │    │    ├── recensement/
 │    │    ├── constatation/
 │    │    ├── visa-bc/
 │    │    ├── reception-technique/
 │    │    ├── reception-va-neuf/
 │    │    ├── arretage-livret/
 │    │    ├── aptitude-location/
 │    │    └── attestation-caracteristiques/
 │    ├── documents/
 │    ├── workflow/mes-taches
 │    ├── administration/
 │    └── reporting/
 ├── components/ui, components/forms, components/tables
 ├── lib/api-client.ts        # wrapper fetch typé sur l'API REST (§15)
 └── lib/auth.ts
```

## 14.5. Arborescence mobile Flutter

```text
va_bscva_mobile/
 lib/
  ├── features/
  │    ├── auth/
  │    ├── vehicule_search/     # recherche par immatriculation
  │    ├── dossier_consultation/
  │    ├── constatation_saisie/ # saisie rapide + photo terrain
  │    └── sync/                # file d'attente offline → API
  ├── core/api/, core/models/, core/storage/ (cache local, mode dégradé réseau)
  └── main.dart
```

## 14.6. Environnements et déploiement

Repris directement du planning du cahier des charges :

| Environnement | Usage | Responsable |
|---|---|---|
| **Développement** | Local, Docker Compose, migrations Flyway automatiques | équipe dev |
| **Test** | Serveur de test dédié — intégration, performance, sécurité | équipe dev / QA |
| **Production** | Installation, configuration, mise en ligne | Département DSI |

`docker-compose.yml` minimal pour le poste de développement :

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: va_bscva
      POSTGRES_USER: va_bscva
      POSTGRES_PASSWORD: changeme_dev
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
  adminer:
    image: adminer
    ports: ["8081:8080"]
volumes:
  pgdata:
```

## 14.7. Checklist « Jour 0 »

1. Créer la base PostgreSQL 16, activer `pgcrypto` (déjà fait en tête du `Script.sql`).
2. Scinder `Script.sql` en migrations Flyway `V1` à `V4` (voir §14.3) et les faire tourner sur une base vierge — valider qu'elles sont idempotentes en les rejouant deux fois.
3. Écrire et exécuter `V5__bscva_vues_reporting.sql` (les 8 vues `v_va_*` attendues par `wf_referentiel_etat`, cf. §20 point 1) — sans elles, aucun report Jasper ne peut être branché.
4. Écrire et exécuter `V6__bscva_correctif_controle_aptitude.sql` (colonne `vehicule_id` manquante, §20 point 11).
5. Initialiser le projet Spring Boot (Spring Initializr : Web, Security, Data JPA, Validation, Flyway, PostgreSQL Driver) avec l'arborescence de packages du §14.2.
6. Brancher Spring Security sur `workflow.wf_utilisateur` / `wf_role` / `wf_privilege_role` (authentification + RBAC).
7. Initialiser le projet Next.js (App Router) et le projet Flutter avec les arborescences des §14.4/14.5.
8. Déployer le `docker-compose.yml` de développement et vérifier la connexion des trois applications à la même base.
9. Implémenter le premier bout-en-bout vertical : **dossier de recensement** (processus le plus simple, §8.1) — création dossier → pièces → saisie ligne recensement → génération quitus. Sert de patron pour les 10 autres processus.
10. Mettre en place la CI (lint + tests + migration Flyway sur base éphémère) avant d'ajouter le deuxième processus.

## 14.8. Ordre d'implémentation recommandé (dépendances physiques)

L'ordre suit les dépendances de clés étrangères du schéma (§12), pas l'ordre de numérotation I à VIII du cahier des charges :

```text
1. Référentiels (referentiel_national, referentiel_rh, referentiel_siigpe) — déjà seedés, à valider
2. Authentification / workflow générique (wf_utilisateur, wf_role, wf_dossier, wf_activite)
3. Véhicule (traitement_siigpe.entite_vehicule) — bloquant pour tout le reste
4. Pièces justificatives génériques (bscva.piece_dossier / dossier_piece) — bloquant pour la complétude de dossier
5. Processus I — Recensement (le plus simple, sert de patron)
6. Processus II — Constatation technique
7. Processus III — Visa bon de commande (dépend de II)
8. Processus IV — Réception technique (dépend de III)
9. Processus V à VIII (indépendants entre eux, peuvent être parallélisés entre développeurs)
10. Génération documentaire (Jasper) — transverse, à brancher au fur et à mesure de chaque processus
11. Reporting / tableaux de bord — en dernier, une fois les vues v_va_* stabilisées
```

## 14.9. Calage sur le planning du cahier des charges

| Phase (cahier des charges) | Durée | Ce que couvre cette architecture |
|---|---|---|
| Préparation | 5 j | §14.1–14.6 : dépôts, environnements, docker-compose |
| Analyse et conception | 10 j | Ce document (v2) |
| Conception UI/UX | 7 j | Maquettes Next.js/Flutter par processus |
| Développement backend | 25 j | §14.8, points 1 à 10 |
| Développement frontend | 18 j | §14.4/14.5, en parallèle du backend dès l'API stabilisée sur un processus |
| Intégration et tests | 12 j | §17 |
| Déploiement | 5 j | §14.6, environnement production géré par le DSI |
| Documentation et formation | 5 j | Guides utilisateurs par rôle (§4) |

---

# 15. API REST principales

## 15.1. Dossiers

```text
GET    /api/dossiers
POST   /api/dossiers
GET    /api/dossiers/{referenceActe}
PUT    /api/dossiers/{referenceActe}
POST   /api/dossiers/{referenceActe}/soumettre
POST   /api/dossiers/{referenceActe}/valider
POST   /api/dossiers/{referenceActe}/refuser
POST   /api/dossiers/{referenceActe}/retourner-complement
GET    /api/dossiers/{referenceActe}/historique
GET    /api/dossiers/{referenceActe}/workflow
```

`{referenceActe}` correspond à `workflow.wf_dossier.reference_acte` (varchar 19) — c'est la clé fonctionnelle utilisée dans toute l'API, cohérente avec son usage comme clé pivot dans le schéma `bscva` (§12.2).

## 15.2. Véhicules

```text
GET    /api/vehicules
POST   /api/vehicules
GET    /api/vehicules/{vehiculeId}
PUT    /api/vehicules/{vehiculeId}
GET    /api/vehicules/{vehiculeId}/dossiers
GET    /api/vehicules/{vehiculeId}/historique
```

`{vehiculeId}` correspond à `traitement_siigpe.entite_vehicule.vehicule_id` (uuid).

## 15.3. Pièces

```text
GET    /api/dossiers/{referenceActe}/pieces
POST   /api/dossiers/{referenceActe}/pieces
PUT    /api/pieces/{dossierPieceId}/statut
GET    /api/pieces/{dossierPieceId}/download
```

## 15.4. Documents générés

```text
GET    /api/dossiers/{referenceActe}/documents
POST   /api/dossiers/{referenceActe}/documents/generer/{modeleCode}
GET    /api/documents/{documentId}/download
POST   /api/documents/{documentId}/valider
POST   /api/documents/{documentId}/annuler
POST   /api/documents/{documentId}/reimprimer
```

`{modeleCode}` correspond aux codes de `document_siigpe.modele_document` listés en §12.9 (ex. `QUITUS_RECENSEMENT`, `BC_VISE`…).

## 15.5. Workflow

```text
GET    /api/workflow/mes-taches
GET    /api/workflow/dossiers/{referenceActe}/etat
POST   /api/workflow/dossiers/{referenceActe}/action
GET    /api/workflow/dossiers/{referenceActe}/trace
```

## 15.6. Processus métier

```text
POST   /api/recensements
POST   /api/constatations
POST   /api/visas-bc
POST   /api/receptions-techniques
POST   /api/receptions-va-neuf
POST   /api/arretages-livret
POST   /api/locations/aptitude
POST   /api/locations/autorisation
POST   /api/attestations-caracteristiques
POST   /api/expertises
POST   /api/tests-chauffeurs
```

## 15.7. Reporting

```text
GET    /api/reporting/dashboard
GET    /api/reporting/vehicules
GET    /api/reporting/depenses
GET    /api/reporting/dossiers
GET    /api/reporting/export/excel
GET    /api/reporting/export/pdf
```

Ces endpoints s'appuient sur les vues `bscva.v_va_*` à créer (§14.7, point 3).

---

# 16. Sécurité

- authentification sécurisée, JWT ou session sécurisée selon le standard interne ;
- mots de passe hashés (`workflow.wf_utilisateur.utilisateur_password`) ;
- gestion des rôles et privilèges via `wf_role` / `wf_privilege` / `wf_privilege_role` / `wf_utilisateur_role` ;
- contrôle d'accès par endpoint et par étape workflow (`wf_tache_role_entite.role_code`) ;
- journalisation des connexions (`wf_trace_session`) et limitation des tentatives (`wf_tentative_connexion`) ;
- protection des documents archivés et contrôle des fichiers uploadés (`dossier_piece.mime_type`, `taille_octets`, `hash_fichier`) ;
- sauvegardes automatiques ;
- séparation développement / test / production (§14.6) ;
- traçabilité des validations et signatures (`workflow.audit_log`) ;
- protection contre les accès non autorisés et l'injection SQL (paramétrage systématique côté ORM/JPA, jamais de concaténation SQL).

---

# 17. Tests à prévoir

## 17.1. Tests unitaires

Création véhicule, création dossier, calcul de complétude, vérification des pièces obligatoires, génération numéro document, règles grands travaux, règles location, règles attestation caractéristiques, règles de chaînage entre processus.

## 17.2. Tests d'intégration

Dossier + workflow, dossier + pièces, dossier + génération document, visa BC + réception technique, attestation aptitude + autorisation location, frontend + backend + PostgreSQL, mobile + API + upload photo.

## 17.3. Tests de sécurité

Accès sans authentification, accès avec mauvais rôle, accès à un document non autorisé, modification d'un dossier clôturé, injection SQL, upload fichier invalide, tentative de réimpression non autorisée.

## 17.4. Tests fonctionnels métier

Recensement annuel multi-véhicules, dossier avec pièces manquantes, visa BC refusé, visa BC avec grands travaux, réception technique défavorable, génération quitus, génération PV constatation, génération attestation caractéristiques, génération autorisation de location.

## 17.5. Tests de performance (cahier des charges)

Capacité du système à supporter plusieurs utilisateurs simultanés ; génération de rapports sur un grand volume de données ; mesure du temps de réponse des API.

---

# 18. Priorités de développement / Roadmap

Voir également §14.8 (ordre technique détaillé) et §14.9 (calage sur les durées du cahier des charges).

## Phase 1 — Socle

Authentification, utilisateurs et rôles, référentiels, véhicules, dossiers, pièces justificatives, intégration workflow interne.

## Phase 2 — Processus principaux

Recensement, constatation technique, visa bon de commande, réception technique, génération quitus/fiche/PV.

## Phase 3 — Processus complémentaires

Réception véhicule neuf, attestation de caractéristiques, attestation d'aptitude, autorisation de location, visa arrêtage livret.

## Phase 4 — Extension et pilotage

Expertise/contre-expertise, condamnation/mise à prix, tests chauffeurs, tableaux de bord, exports PDF/Excel, application mobile Flutter, notifications, optimisation.

---

# 19. Règles métier importantes à ne pas oublier

1. Le workflow interne existant reste la référence.
2. La création d'un dossier ne doit pas être bloquée par l'absence d'une pièce.
3. La validation finale peut être bloquée si une pièce obligatoire manque (`piece_dossier.obligatoire = 1`).
4. Le recensement des véhicules administratifs est annuel.
5. Le quitus de l'année en cours est nécessaire dans plusieurs procédures.
6. La constatation technique précède le visa BC pour entretien/réparation.
7. Les grands travaux entraînent une réception technique obligatoire (`visa_bon_commande.grands_travaux = 1`).
8. La réception technique se fait dans l'enceinte du service des garages administratifs.
9. Les pièces usées remplacées doivent être présentées lors de la réception technique.
10. L'attestation d'aptitude précède l'autorisation de location.
11. L'attestation de caractéristiques sert notamment à obtenir une nouvelle carte grise.
12. Le visa arrêtage livret concerne les trois livrets SA, GSS et Parcours.
13. Tous les actes générés doivent être archivés.
14. Toutes les validations, refus et signatures doivent être tracés.
15. Les documents générés doivent avoir une référence unique (`document_siigpe.sequence_document`).
16. Un dossier peut concerner un ou plusieurs véhicules (`bscva.dossier_vehicule_ligne`).
17. Un véhicule peut apparaître dans plusieurs dossiers au cours de son cycle de vie.
18. Les données financières doivent être suivies par véhicule, période, ministère et SOA.
19. Les documents doivent pouvoir être exportés en PDF et Excel.
20. Les actions sensibles doivent être visibles dans le journal d'audit (`workflow.audit_log`).
21. Une date de clôture proposée doit être gérée pour chaque dossier.
22. Un refus doit toujours avoir un motif (`motif_refus`, `motif_rejet`).
23. Une réimpression doit être tracée (`document_siigpe.document_impression`).
24. Un document validé ne doit pas être modifié directement : il doit être remplacé par une nouvelle version (`statut = 'REMPLACE'`).
25. **(nouveau)** Les statuts métier critiques sont désormais garantis par des contraintes `CHECK` en base (§10.4, §7.4, §7.7, §7.8, §7.11) — l'application ne doit donc jamais s'appuyer sur des chaînes libres non validées pour ces champs.
26. **(nouveau)** Le script SQL est idempotent et non destructif (§3.2, §12.7) : toute évolution future du schéma doit continuer à suivre ce même principe (`IF NOT EXISTS`, `ADD COLUMN`, jamais de `DROP`/`RENAME` sans migration de compatibilité explicite).

---

# 20. Points à confirmer avec le métier / écarts techniques identifiés

## 20.1. Points fonctionnels (hérités de la v1, toujours ouverts)

1. Signataire exact du quitus : GAC, Chef SRB ou les deux selon le cas.
2. Règle officielle de numérotation des actes.
3. Gabarit exact du bon de commande visé/refusé, car le modèle Excel semble incomplet ou vide.
4. Rubriques exactes des trois livrets SA, GSS et Parcours.
5. Champs d'imputation budgétaire du PV d'ordre de recette.
6. Liste finale des rôles et signataires dans le workflow interne.
7. Conditions exactes de blocage avant génération officielle.
8. Durée standard de traitement par type de dossier.
9. Gestion des signatures : signature numérique, signature scannée ou validation applicative.
10. Emplacement final de stockage des documents archivés.

## 20.2. Écarts techniques identifiés dans le `Script.sql` (nouveaux, à traiter en priorité — voir §14.7)

11. **`bscva.controle_aptitude`** porte une contrainte `FOREIGN KEY (vehicule_id) …` sans que la colonne `vehicule_id` soit déclarée dans la table — à corriger par une migration `V6` avant toute mise en production (cf. §7.11, §14.3).
12. **Les 8 vues `bscva.v_va_*`** référencées par `workflow.wf_referentiel_etat.etat_view` (recensement, constatation, visa BC, réception, réception neuf, arrêtage livret, aptitude/location, attestation caractéristiques) ne sont pas créées dans le script fourni — à écrire en `V5` (cf. §12.9, §14.3, §14.7).
13. **Table des résultats de test chauffeur** — `bscva.chauffeur_test` a été ajoutée en migration additive le 2026-08-04 (Script.sql, section 17 ; voir §22.1), avec un résultat `APTE`/`NON_APTE` conforme au cahier des charges. Reste à valider côté backend avant application en production.
14. **Fichiers `.jrxml`** listés dans `document_siigpe.modele_document` (10 modèles) n'existent pas encore physiquement — livrable de conception UI/Jasper à produire pendant la phase « Conception UI/UX » du planning (§14.9).
15. Deux conventions de génération d'UUID coexistent (`gen_random_uuid()` vs `uuid_in(md5(random()::text)::cstring)`) selon l'ancienneté de la table (§12.7) — à documenter clairement pour l'équipe afin d'éviter toute tentative d'harmonisation destructive sur les tables historiques.

---

# 21. Conclusion de conception

La conception transforme le projet en une plateforme complète de gestion numérique des dossiers relatifs aux véhicules administratifs. Le point essentiel reste de ne pas limiter le système à une base de véhicules : la valeur métier réside dans la gestion des procédures, la conservation des pièces, le respect du workflow interne, la traçabilité des décisions, la génération automatique des actes officiels, l'archivage sécurisé, le suivi des coûts et le pilotage par tableaux de bord.

Ce qui change par rapport à la v1 : la base de données n'est plus une hypothèse de travail mais un **artefact livré et analysé** (§12), et le projet dispose désormais d'une **architecture de démarrage exécutable** (§14) — dépôts, arborescences, stratégie de migration Flyway, environnements et checklist Jour 0 — permettant à l'équipe de commencer le développement sans période d'incertitude supplémentaire. Les cinq écarts techniques identifiés en §20.2 constituent la liste de tâches SQL à traiter avant le premier sprint fonctionnel.

---

# 22. État d'avancement — Frontend mock SRB (`dpe-srb-vehicules`)

Le frontend mock SRB (Next.js, données en mémoire — aucun backend réel) est corrigé et aligné sur ce document et sur `Script.sql` **processus par processus**, en croisant à chaque fois trois sources : ce document, `Script.sql`, et les imprimés réels (`IMPRIMES DIGITALISATION 2026.xlsx`, `DIGITALISATION VA 2026.docx`). Le schéma physique n'a jamais eu besoin d'être modifié à cette occasion — c'est systématiquement l'application qui rattrapait un schéma déjà correct. Chaque processus corrigé génère désormais immédiatement son livrable (aperçu HTML imprimable, faute de moteur Jasper réel dans ce mock).

## 22.1. Processus conformes

- **Recensement (§8.1)** — catégorie d'utilisation et état général du véhicule désormais saisis par ligne recensée (`recensement_ligne.categorie_utilisation`, `etat_general`), fiche véhicule pré-remplie depuis le véhicule choisi mais modifiable.
- **Constatation technique (§8.2)** — checklist des ~110 éléments de contrôle par section reprise fidèlement depuis le seed `Script.sql` (au lieu d'une liste partielle) ; la section pneumatiques utilise des champs pourcentage dédiés plutôt que conforme/non-conforme ; le PV de constatation (`PV_CONSTATATION`) est généré à la demande.
- **Visa bon de commande (§8.3)** — les lignes `visa_bc_piece` (désignation, quantité, prix unitaire) sont désormais saisies et le montant total est calculé automatiquement au lieu d'être saisi à la main ; la décision de visa (`decision`, `motif_refus`, `numero_visa`, `date_visa`) est capturée au moment de la génération du livrable (`BC_VISE`), avec distinction visa sans réserve / visa sous réserve de réception technique (grands travaux) / refus motivé.
- **Réception technique (§8.4)** — les constats de réception (`reception_constat`) sont désormais saisis en liste dynamique ; le sélecteur de visa BC lié ne propose plus que les BC visés sous réserve de grands travaux ; l'avis (`avis`) est capturé à la génération du PV (`PV_RECEPTION`).
- **Réception VA neuf (§8.5)** — l'en-tête (adresse/STAT/NIF fournisseur, décision de la commission) et les lignes véhicule (`reception_neuf_ligne` : genre, marque, carrosserie, numéro de série, numéro moteur, puissance, nombre de places, date de première mise en circulation, décision sans changement/réduction/rebutée) sont désormais intégralement saisis, plutôt que 3 champs sur les ~17 disponibles ; PV d'ordre de recette (`PV_ORDRE_RECETTE`) généré.
- **Arrêtage livret (§8.6)** — le détail par livret (`arretage_livret_detail` : rubrique, valeur arrêtée, observation, groupé par type de livret SA/GSS/Parcours) est désormais saisi, alors que seul l'en-tête (véhicule/date/dernier BC) existait auparavant ; visa d'arrêtage (`VISA_ARRETAGE_LIVRET`) généré.

- **Aptitude / Location (§8.7)** — `bscva.controle_aptitude` déjà conforme au schéma physique et aux imprimés réels (onglets « attestation d'aptitude » et « autorisation Location ») dès l'audit du 2026-08 : tous les champs de `controle_aptitude` (objet_mission, itineraire, date_debut/fin, contrat_location, fournisseur_nif_stat, avis_aptitude) sont saisis et l'avis d'aptitude est capturé au bon moment (génération du livrable, pas à la création), comme pour visa BC et réception technique.
- **Attestation de caractéristiques (§8.8)** — `bscva.attestation_caracteristique` déjà conforme : les 17 champs techniques (marque, genre, carrosserie, type, n° série, n° moteur, nombre de places, source énergie, puissance administrative, poids vide, charge utile, PTAC, année de première mise en circulation, motif de perte) correspondent exactement au schéma physique et à l'imprimé réel (exemple rempli TOYOTA / 29528 WWT).
- **Expertise / contre-expertise (§7.13, §8)** — `bscva.expertise_accident` / `expertise_dommage` : champs conformes au schéma ; correctif appliqué le 2026-08 : le champ `rapport` (texte du rapport d'expertise), saisi à la création mais absent de l'onglet du dossier, est désormais affiché sur la fiche dossier. Aucun imprimé officiel n'existe pour ce processus (ni dans le fichier Excel, ni dans le Word compagnon) — la mise en forme du livrable `RAPPORT_EXPERTISE` reste une composition sur le gabarit visuel commun.
- **Condamnation (§7.13, §8)** — `bscva.evaluation_condamnation` : champs conformes au schéma ; correctif appliqué le 2026-08 : la liste des évaluations n'affichait que le véhicule, la valeur estimée et le statut — `mise_a_prix` et `motif_condamnation` (les deux autres champs métier centraux de la table) sont désormais également des colonnes de la liste. Aucun imprimé officiel n'existe pour ce processus ; le livrable `PV_CONDAMNATION` reste une composition sur le gabarit visuel commun.
- **Test chauffeur (§7.14)** — écart structurel corrigé le 2026-08 : le mock avait inventé deux notes chiffrées (`noteTheorique`/`notePratique`, 0–20) sans existence dans le schéma physique. `bscva.chauffeur_test` (Script.sql, section 17, migration additive ajoutée le 2026-08-04 — voir mise à jour du §20.2 point 13 ci-dessous) définit en réalité un résultat binaire `resultat varchar(20) CHECK (resultat IS NULL OR resultat IN ('APTE','NON_APTE'))`, conforme au cahier des charges (« enregistrer les résultats et observations »). Le frontend a été corrigé pour capturer ce `resultat` au moment de la génération du livrable `RESULTAT_TEST_CHAUFFEUR`, exactement comme `controle_aptitude.avis_aptitude` et `reception_technique.avis`. Les fixtures, vides jusque-là (seul processus sur 11 sans donnée de départ), sont désormais seedées d'un enregistrement réaliste.

Les 11 processus métier sont désormais alignés sur le document de conception et sur `Script.sql`.
