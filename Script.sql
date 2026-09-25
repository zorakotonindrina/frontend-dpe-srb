/* =====================================================================
   BASE PRINCIPALE — Plateforme VA
   Digitalisation du suivi et contrôle des véhicules administratifs


   Contient uniquement :
   - referentiel
   - workflow interne
   - noyau véhicule SIIGPE conservé utile
   - document
   - audit
   ===================================================================== */

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS workflow;
CREATE SCHEMA IF NOT EXISTS referentiel_national;
CREATE SCHEMA IF NOT EXISTS referentiel_rh;
CREATE SCHEMA IF NOT EXISTS referentiel_siigpe;
CREATE SCHEMA IF NOT EXISTS traitement_siigpe;
CREATE SCHEMA IF NOT EXISTS document;
CREATE SCHEMA IF NOT EXISTS audit;

/* =====================================================================
   0. RENOMMAGE DES TABLES traitement_siigpe (préfixe tsi_) ET
   referentiel_siigpe (préfixe rsi_) — pour que chaque table porte le nom
   de son schéma. Exécuté ICI, avant toute création de table plus bas dans
   ce fichier : sur une base déjà en place (ancien nom présent), renomme la
   table existante (et ses données) au lieu de laisser les CREATE TABLE IF
   NOT EXISTS suivants créer une table neuve vide sous le nouveau nom à
   côté de l'ancienne. Sur une base vierge, chaque ALTER TABLE IF EXISTS
   ci-dessous ne trouve rien et ne fait rien — les CREATE TABLE plus bas
   créent alors directement les tables sous leur nom définitif.
   Idempotent (rejouable sans erreur) : IF EXISTS porte sur l'ancien nom,
   donc un second passage ne trouve plus rien à renommer.
   ===================================================================== */

-- traitement_siigpe : ts_xxx -> tsi_xxx
ALTER TABLE IF EXISTS traitement_siigpe.ts_recensement RENAME TO tsi_recensement;
ALTER TABLE IF EXISTS traitement_siigpe.ts_recensement_ligne RENAME TO tsi_recensement_ligne;
ALTER TABLE IF EXISTS traitement_siigpe.ts_constatation_technique RENAME TO tsi_constatation_technique;
ALTER TABLE IF EXISTS traitement_siigpe.ts_constatation_element RENAME TO tsi_constatation_element;
ALTER TABLE IF EXISTS traitement_siigpe.ts_constatation_piece_remplacer RENAME TO tsi_constatation_piece_remplacer;
ALTER TABLE IF EXISTS traitement_siigpe.ts_constatation_reparation RENAME TO tsi_constatation_reparation;
ALTER TABLE IF EXISTS traitement_siigpe.ts_visa_bon_commande RENAME TO tsi_visa_bon_commande;
ALTER TABLE IF EXISTS traitement_siigpe.ts_visa_bc_piece RENAME TO tsi_visa_bc_piece;
ALTER TABLE IF EXISTS traitement_siigpe.ts_reception_technique RENAME TO tsi_reception_technique;
ALTER TABLE IF EXISTS traitement_siigpe.ts_reception_constat RENAME TO tsi_reception_constat;
ALTER TABLE IF EXISTS traitement_siigpe.ts_reception_va_neuf RENAME TO tsi_reception_va_neuf;
ALTER TABLE IF EXISTS traitement_siigpe.ts_reception_neuf_ligne RENAME TO tsi_reception_neuf_ligne;
ALTER TABLE IF EXISTS traitement_siigpe.ts_arretage_livret RENAME TO tsi_arretage_livret;
ALTER TABLE IF EXISTS traitement_siigpe.ts_arretage_livret_detail RENAME TO tsi_arretage_livret_detail;
ALTER TABLE IF EXISTS traitement_siigpe.ts_controle_aptitude RENAME TO tsi_controle_aptitude;
ALTER TABLE IF EXISTS traitement_siigpe.ts_attestation_caracteristique RENAME TO tsi_attestation_caracteristique;
ALTER TABLE IF EXISTS traitement_siigpe.ts_expertise_accident RENAME TO tsi_expertise_accident;
ALTER TABLE IF EXISTS traitement_siigpe.ts_expertise_dommage RENAME TO tsi_expertise_dommage;
ALTER TABLE IF EXISTS traitement_siigpe.ts_evaluation_condamnation RENAME TO tsi_evaluation_condamnation;
ALTER TABLE IF EXISTS traitement_siigpe.ts_chauffeur RENAME TO tsi_chauffeur;
ALTER TABLE IF EXISTS traitement_siigpe.ts_chauffeur_test RENAME TO tsi_chauffeur_test;
ALTER TABLE IF EXISTS traitement_siigpe.ts_dossier_piece RENAME TO tsi_dossier_piece;
ALTER TABLE IF EXISTS traitement_siigpe.ts_dossier_vehicule_ligne RENAME TO tsi_dossier_vehicule_ligne;

-- traitement_siigpe : tables sans préfixe -> ajout du préfixe tsi_
ALTER TABLE IF EXISTS traitement_siigpe.entite_vehicule RENAME TO tsi_entite_vehicule;
ALTER TABLE IF EXISTS traitement_siigpe.vehicule_marque RENAME TO tsi_vehicule_marque;
ALTER TABLE IF EXISTS traitement_siigpe.vehicule_serie RENAME TO tsi_vehicule_serie;
ALTER TABLE IF EXISTS traitement_siigpe.information_utilisation_vehicule RENAME TO tsi_information_utilisation_vehicule;
ALTER TABLE IF EXISTS traitement_siigpe.entite_utilisation_vehicule RENAME TO tsi_entite_utilisation_vehicule;
ALTER TABLE IF EXISTS traitement_siigpe.vehicule_detenteur RENAME TO tsi_vehicule_detenteur;
ALTER TABLE IF EXISTS traitement_siigpe.quitus_vehicule RENAME TO tsi_quitus_vehicule;
ALTER TABLE IF EXISTS traitement_siigpe.entretien_reparation_vehicule RENAME TO tsi_entretien_reparation_vehicule;
ALTER TABLE IF EXISTS traitement_siigpe.reparation_effectue_vehicule RENAME TO tsi_reparation_effectue_vehicule;
ALTER TABLE IF EXISTS traitement_siigpe.historique_vehicule RENAME TO tsi_historique_vehicule;
ALTER TABLE IF EXISTS traitement_siigpe.sequence_dossier RENAME TO tsi_sequence_dossier;

-- referentiel_siigpe : rs_xxx -> rsi_xxx
ALTER TABLE IF EXISTS referentiel_siigpe.rs_recensement RENAME TO rsi_recensement;
ALTER TABLE IF EXISTS referentiel_siigpe.rs_constatation_technique RENAME TO rsi_constatation_technique;
ALTER TABLE IF EXISTS referentiel_siigpe.rs_visa_bon_commande RENAME TO rsi_visa_bon_commande;
ALTER TABLE IF EXISTS referentiel_siigpe.rs_reception_technique RENAME TO rsi_reception_technique;
ALTER TABLE IF EXISTS referentiel_siigpe.rs_reception_va_neuf RENAME TO rsi_reception_va_neuf;
ALTER TABLE IF EXISTS referentiel_siigpe.rs_arretage_livret RENAME TO rsi_arretage_livret;
ALTER TABLE IF EXISTS referentiel_siigpe.rs_controle_aptitude RENAME TO rsi_controle_aptitude;
ALTER TABLE IF EXISTS referentiel_siigpe.rs_attestation_caracteristique RENAME TO rsi_attestation_caracteristique;
ALTER TABLE IF EXISTS referentiel_siigpe.rs_expertise_accident RENAME TO rsi_expertise_accident;
ALTER TABLE IF EXISTS referentiel_siigpe.rs_evaluation_condamnation RENAME TO rsi_evaluation_condamnation;
ALTER TABLE IF EXISTS referentiel_siigpe.rs_chauffeur_test RENAME TO rsi_chauffeur_test;

-- referentiel_siigpe : tables sans préfixe -> ajout du préfixe rsi_
ALTER TABLE IF EXISTS referentiel_siigpe.categorie_vehicule RENAME TO rsi_categorie_vehicule;
ALTER TABLE IF EXISTS referentiel_siigpe.categorie_utilisation_vehicule RENAME TO rsi_categorie_utilisation_vehicule;
ALTER TABLE IF EXISTS referentiel_siigpe.energie_vehicule RENAME TO rsi_energie_vehicule;
ALTER TABLE IF EXISTS referentiel_siigpe.etat_vehicule RENAME TO rsi_etat_vehicule;
ALTER TABLE IF EXISTS referentiel_siigpe.genre_vehicule RENAME TO rsi_genre_vehicule;
ALTER TABLE IF EXISTS referentiel_siigpe.carrosserie_vehicule RENAME TO rsi_carrosserie_vehicule;
ALTER TABLE IF EXISTS referentiel_siigpe.marque_vehicule RENAME TO rsi_marque_vehicule;
ALTER TABLE IF EXISTS referentiel_siigpe.fournisseur RENAME TO rsi_fournisseur;
ALTER TABLE IF EXISTS referentiel_siigpe.section_constatation RENAME TO rsi_section_constatation;
ALTER TABLE IF EXISTS referentiel_siigpe.element_constatation RENAME TO rsi_element_constatation;
ALTER TABLE IF EXISTS referentiel_siigpe.type_livret RENAME TO rsi_type_livret;
ALTER TABLE IF EXISTS referentiel_siigpe.piece_dossier RENAME TO rsi_piece_dossier;

-- Contraintes des 11 tables rs_xxx -> rsi_xxx (pas de IF EXISTS pour RENAME
-- CONSTRAINT en PostgreSQL : on encadre chaque renommage d'un test explicite
-- sur pg_constraint pour rester idempotent au rejeu).
DO $$
DECLARE
    pairs text[][] := ARRAY[
        ARRAY['referentiel_siigpe.rsi_recensement', 'rs_recensement_pk', 'rsi_recensement_pk'],
        ARRAY['referentiel_siigpe.rsi_recensement', 'rs_recensement_uk', 'rsi_recensement_uk'],
        ARRAY['referentiel_siigpe.rsi_constatation_technique', 'rs_constatation_pk', 'rsi_constatation_pk'],
        ARRAY['referentiel_siigpe.rsi_constatation_technique', 'rs_constatation_uk', 'rsi_constatation_uk'],
        ARRAY['referentiel_siigpe.rsi_constatation_technique', 'rs_constatation_veh_fk', 'rsi_constatation_veh_fk'],
        ARRAY['referentiel_siigpe.rsi_visa_bon_commande', 'rs_visa_bc_pk', 'rsi_visa_bc_pk'],
        ARRAY['referentiel_siigpe.rsi_visa_bon_commande', 'rs_visa_bc_uk', 'rsi_visa_bc_uk'],
        ARRAY['referentiel_siigpe.rsi_visa_bon_commande', 'rs_visa_bc_veh_fk', 'rsi_visa_bc_veh_fk'],
        ARRAY['referentiel_siigpe.rsi_reception_technique', 'rs_reception_pk', 'rsi_reception_pk'],
        ARRAY['referentiel_siigpe.rsi_reception_technique', 'rs_reception_uk', 'rsi_reception_uk'],
        ARRAY['referentiel_siigpe.rsi_reception_technique', 'rs_reception_veh_fk', 'rsi_reception_veh_fk'],
        ARRAY['referentiel_siigpe.rsi_reception_va_neuf', 'rs_reception_neuf_pk', 'rsi_reception_neuf_pk'],
        ARRAY['referentiel_siigpe.rsi_reception_va_neuf', 'rs_reception_neuf_uk', 'rsi_reception_neuf_uk'],
        ARRAY['referentiel_siigpe.rsi_arretage_livret', 'rs_arretage_pk', 'rsi_arretage_pk'],
        ARRAY['referentiel_siigpe.rsi_arretage_livret', 'rs_arretage_uk', 'rsi_arretage_uk'],
        ARRAY['referentiel_siigpe.rsi_arretage_livret', 'rs_arretage_veh_fk', 'rsi_arretage_veh_fk'],
        ARRAY['referentiel_siigpe.rsi_controle_aptitude', 'rs_aptitude_pk', 'rsi_aptitude_pk'],
        ARRAY['referentiel_siigpe.rsi_controle_aptitude', 'rs_aptitude_uk', 'rsi_aptitude_uk'],
        ARRAY['referentiel_siigpe.rsi_controle_aptitude', 'rs_aptitude_veh_fk', 'rsi_aptitude_veh_fk'],
        ARRAY['referentiel_siigpe.rsi_attestation_caracteristique', 'rs_attestation_pk', 'rsi_attestation_pk'],
        ARRAY['referentiel_siigpe.rsi_attestation_caracteristique', 'rs_attestation_uk', 'rsi_attestation_uk'],
        ARRAY['referentiel_siigpe.rsi_attestation_caracteristique', 'rs_attestation_veh_fk', 'rsi_attestation_veh_fk'],
        ARRAY['referentiel_siigpe.rsi_expertise_accident', 'rs_expertise_pk', 'rsi_expertise_pk'],
        ARRAY['referentiel_siigpe.rsi_expertise_accident', 'rs_expertise_uk', 'rsi_expertise_uk'],
        ARRAY['referentiel_siigpe.rsi_expertise_accident', 'rs_expertise_veh_fk', 'rsi_expertise_veh_fk'],
        ARRAY['referentiel_siigpe.rsi_evaluation_condamnation', 'rs_evaluation_pk', 'rsi_evaluation_pk'],
        ARRAY['referentiel_siigpe.rsi_evaluation_condamnation', 'rs_evaluation_uk', 'rsi_evaluation_uk'],
        ARRAY['referentiel_siigpe.rsi_evaluation_condamnation', 'rs_evaluation_veh_fk', 'rsi_evaluation_veh_fk'],
        ARRAY['referentiel_siigpe.rsi_chauffeur_test', 'rs_chauffeur_test_pk', 'rsi_chauffeur_test_pk'],
        ARRAY['referentiel_siigpe.rsi_chauffeur_test', 'rs_chauffeur_test_uk', 'rsi_chauffeur_test_uk'],
        ARRAY['referentiel_siigpe.rsi_chauffeur_test', 'rs_chauffeur_test_chauffeur_fk', 'rsi_chauffeur_test_chauffeur_fk'],
        ARRAY['referentiel_siigpe.rsi_chauffeur_test', 'rs_chauffeur_test_veh_fk', 'rsi_chauffeur_test_veh_fk']
    ];
    p text[];
BEGIN
    FOREACH p SLICE 1 IN ARRAY pairs LOOP
        IF to_regclass(p[1]) IS NOT NULL AND EXISTS (
            SELECT 1 FROM pg_constraint c
            WHERE c.conname = p[2] AND c.conrelid = to_regclass(p[1])
        ) THEN
            EXECUTE format('ALTER TABLE %s RENAME CONSTRAINT %I TO %I', p[1], p[2], p[3]);
        END IF;
    END LOOP;
END $$;

/* =====================================================================
   1. APPLICATION WORKFLOW MINIMALE
   ===================================================================== */


-- Correctif : IF NOT EXISTS manquant (cette table existe déjà dans la base SIIGPE/AUGURE
-- existante, ex. augure_local) + colonne "statut" absente alors que le seed juste après
-- l'utilise. Les deux étaient invisibles sur une base vierge (bscva_local), où la table
-- n'existait pas encore — mais bloquants sur une base réelle où workflow.wf_application
-- préexiste déjà (constaté par audit read-only, 2026-09-01).
CREATE TABLE IF NOT EXISTS workflow.wf_application (
	application_code int4 NOT NULL,
	application_libelle varchar(250) NOT NULL,
	CONSTRAINT application_utilisateur_pkey PRIMARY KEY (application_code)
);

ALTER TABLE workflow.wf_application
ADD COLUMN IF NOT EXISTS statut int4;

INSERT INTO workflow.wf_application(application_code, application_libelle, statut)
VALUES (1, 'Plateforme VA', 1)
ON CONFLICT (application_code) DO NOTHING;

-- Code dédié SIIGPE (2026-09-08) : sur une base réelle (augure_local), le code 1 ci-dessus
-- correspond en fait à l'application AUGURE Administratif existante (collision) — les comptes/rôles
-- BSCVA utilisent donc désormais le code 4, propre à ce projet (voir migration plus bas, §18.4).
INSERT INTO workflow.wf_application(application_code, application_libelle, statut)
VALUES (4, 'SIIGPE', 1)
ON CONFLICT (application_code) DO NOTHING;

/* =====================================================================
   2. RÉFÉRENTIELS UTILES AU PROJET VA
   ===================================================================== */

CREATE TABLE IF NOT EXISTS referentiel_national.rn_province (
	province_code varchar(1024) NOT NULL,
	pays_code varchar(2) NOT NULL,
	province_libelle varchar(1024) NULL,
	CONSTRAINT pk_rn_province PRIMARY KEY (province_code)
);

CREATE TABLE IF NOT EXISTS referentiel_national.rn_region (
	id_region uuid DEFAULT uuid_in(md5(random()::text)::cstring) NOT NULL,
	reg_code varchar(1024) NOT NULL,
	province_code varchar(1024) NULL,
	region_libelle varchar(1024) NULL,
	district_code varchar(3) NOT NULL,
	CONSTRAINT pk_rn_region PRIMARY KEY (id_region)
);
CREATE INDEX IF NOT EXISTS rn_region_reg_code_idx ON referentiel_national.rn_region USING btree (reg_code, district_code);



CREATE TABLE IF NOT EXISTS referentiel_national.rn_district (
	district_code varchar(3) NOT NULL,
	reg_code varchar(2) NOT NULL,
	district_libelle varchar(250) NULL,
	district_zone varchar(1) NULL,
	district_zone_512 varchar(1) NULL,
	district_zone_530 varchar(1) NULL,
	CONSTRAINT pk_rn_district PRIMARY KEY (district_code)
);
CREATE UNIQUE INDEX IF NOT EXISTS rn_district_pk ON referentiel_national.rn_district USING btree (district_code);




CREATE TABLE IF NOT EXISTS referentiel_national.rn_commune (
	commune_code varchar(5) NOT NULL,
	district_code varchar(4) NOT NULL,
	commune_libelle varchar(1024) NULL,
	CONSTRAINT pk_rn_commune PRIMARY KEY (commune_code)
);
CREATE UNIQUE INDEX IF NOT EXISTS rn_commune_pk ON referentiel_national.rn_commune USING btree (commune_code);




CREATE TABLE IF NOT EXISTS referentiel_national.rn_fokontany (
	fokontany_code varchar(7) NOT NULL,
	commune_code varchar(5) NULL,
	fokontany_libelle varchar(1500) NULL
);
CREATE INDEX IF NOT EXISTS rn_fokontany_fokontany_code_idx ON referentiel_national.rn_fokontany USING btree (fokontany_code, commune_code, fokontany_libelle);



CREATE TABLE IF NOT EXISTS referentiel_rh.rh_ministere (
	ministere_id_ministere int4 NULL,
	ministere_abreviation varchar(255) NULL,
	ministere_code varchar(255) NULL,
	ministere_id_ref_exo int4 NULL,
	ministere_libelle varchar(255) NULL,
	ministere_status int4 NULL,
	reference_texte varchar(255) NULL,
	ministere_id_secteur int4 NULL,
	old_id int4 NULL,
	cdmt_valide int4 NULL,
	is_institution int4 NULL,
	ministere_lib_min varchar(255) NULL
);

CREATE TABLE IF NOT EXISTS referentiel_rh.rh_soa (
	ref_exercice_exercice int4 NULL,
	ref_exercice_id_lf int4 NULL,
	budget_code varchar(255) NULL,
	cf_code varchar(255) NULL,
	cf_libelle varchar(255) NULL,
	gac_code varchar(255) NULL,
	gac_libelle varchar(255) NULL,
	ordonnateur_code varchar(255) NULL,
	ordonnateur_libelle varchar(255) NULL,
	pcomptable_code varchar(255) NULL,
	pcomptable_libelle varchar(255) NULL,
	commune_code varchar(255) NULL,
	commune_libelle varchar(255) NULL,
	soa_code varchar(255) NULL,
	soa_libelle varchar(1500) NULL,
	soa_flag varchar(255) NULL
);


-- referentiel siigpe vao noforonina 
CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_categorie_vehicule (
    categorie_code       varchar(10) PRIMARY KEY,
    categorie_libelle    varchar(250) NOT NULL
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_categorie_utilisation_vehicule (
    categorie_utilisation varchar(10) PRIMARY KEY,
    categorie_utilisation_libelle varchar(250) NOT NULL
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_energie_vehicule (
    energie_code         varchar(10) PRIMARY KEY,
    energie_libelle      varchar(250) NOT NULL
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_etat_vehicule (
    etat_vehicule        varchar(10) PRIMARY KEY,
    etat_libelle         varchar(250) NOT NULL
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_genre_vehicule (
    genre_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    genre_code           varchar(10) UNIQUE,
    genre_libelle        varchar(250) NOT NULL
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_carrosserie_vehicule (
    carrosserie_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    carrosserie_code     varchar(10) UNIQUE,
    carrosserie_libelle  varchar(250) NOT NULL
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_marque_vehicule (
    marque_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    marque_code          varchar(20) UNIQUE,
    marque_libelle       varchar(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_fournisseur (
    fournisseur_id       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    raison_sociale       varchar(250) NOT NULL,
    nif                  varchar(50),
    stat                 varchar(50),
    adresse              varchar(250),
    telephone            varchar(30),
    email                varchar(150)
);

/* =====================================================================
   3. WORKFLOW INTERNE CONSERVÉ
   ===================================================================== */

CREATE TABLE IF NOT EXISTS workflow.wf_role (
	role_code varchar(250) NOT NULL,
	role_libelle varchar(250) NOT NULL,
	role_entite varchar(20) NULL,
	id_role uuid DEFAULT uuid_in(md5(random()::text)::cstring) NULL,
	is_processus int4 NULL,
	CONSTRAINT wf_role_pkey PRIMARY KEY (role_code)
);



CREATE TABLE IF NOT EXISTS workflow.wf_privilege (
	code_privilege varchar(20) NOT NULL,
	libelle_privilege varchar(250) NULL,
	description_privilege varchar(250) NULL,
	statut numeric NULL,
	application_code int4 NULL,
	id_privilege uuid DEFAULT uuid_in(md5(random()::text)::cstring) NOT NULL,
	CONSTRAINT privilege_pk PRIMARY KEY (id_privilege),
	CONSTRAINT wf_privilege_fk FOREIGN KEY (application_code) REFERENCES workflow.wf_application(application_code)
);
CREATE INDEX IF NOT EXISTS privilege_code_privilege_idx ON workflow.wf_privilege USING btree (code_privilege, application_code);




CREATE TABLE IF NOT EXISTS workflow.wf_privilege_role (
	code_privilege varchar(20) NOT NULL,
	role_code varchar(20) NOT NULL,
	application_code int4 NULL,
	id_privilege_role uuid DEFAULT uuid_in(md5(random()::text)::cstring) NOT NULL,
	CONSTRAINT wf_privilege_role_pk PRIMARY KEY (id_privilege_role)
);
CREATE INDEX IF NOT EXISTS wf_privilege_role_role_code_idx ON workflow.wf_privilege_role USING btree (role_code, code_privilege);




CREATE TABLE IF NOT EXISTS workflow.wf_utilisateur (
	utilisateur_matricule varchar(6) NOT NULL,
	utilisateur_type varchar(20) NULL,
	utilisateur_nom varchar(250) NULL,
	utilisateur_prenom varchar(250) NULL,
	utilisateur_password varchar(250) NOT NULL,
	login varchar(250) NOT NULL,
	sigle varchar(20) NULL,
	email varchar(100) NULL,
	statut numeric NULL,
	site varchar(20) NULL,
	cin varchar(12) NULL,
	contact varchar(10) NULL,
	application_code int4 NULL,
	id_utilisateur uuid DEFAULT uuid_in(md5(random()::text)::cstring) NOT NULL,
	date_init_mdp date NULL,
	porte varchar NULL,
	poste varchar NULL,
	CONSTRAINT wf_utilisateur_pk PRIMARY KEY (id_utilisateur),
	CONSTRAINT wf_utilisateur_fk FOREIGN KEY (application_code) REFERENCES workflow.wf_application(application_code)
);
CREATE INDEX IF NOT EXISTS wf_utilisateur_utilisateur_matricule_idx ON workflow.wf_utilisateur USING btree (utilisateur_matricule, application_code, utilisateur_password);





CREATE TABLE IF NOT EXISTS workflow.wf_utilisateur_role (
	utilisateur_matricule varchar(6) NOT NULL,
	role_code varchar(20) NOT NULL,
	uadm_code varchar(25) NOT NULL,
	is_region numeric NULL,
	is_master numeric NULL,
	is_valider numeric NULL,
	application_code int4 NULL,
	CONSTRAINT wf_utilisateur_role_fk FOREIGN KEY (application_code) REFERENCES workflow.wf_application(application_code)
);
CREATE INDEX IF NOT EXISTS utilisateur_role_utilisateur_matricule_idx ON workflow.wf_utilisateur_role USING btree (utilisateur_matricule, role_code);



CREATE TABLE IF NOT EXISTS workflow.wf_type_acte_groupe (
	type_groupe_code varchar(3) NOT NULL,
	type_groupe_libelle varchar(250) NULL,
	CONSTRAINT type_acte_groupe_pkey PRIMARY KEY (type_groupe_code)
);



CREATE TABLE IF NOT EXISTS workflow.wf_processus (
	processus_code varchar(250) NOT NULL,
	processus_libelle varchar(250) NOT NULL,
	processus_etat varchar(2) NULL,
	processus_id uuid DEFAULT uuid_in(md5(random()::text)::cstring) NOT NULL,
	CONSTRAINT wf_processus_pk PRIMARY KEY (processus_code),
	CONSTRAINT wf_processus_un UNIQUE (processus_code, processus_libelle)
);



CREATE TABLE IF NOT EXISTS workflow.wf_type_acte (
	type_code varchar(3) NOT NULL,
	type_libelle varchar(250) NOT NULL,
	type_groupe_code varchar(3) NOT NULL,
	sanction_code varchar(2) NULL,
	processus_code varchar NULL,
	mouvement_code varchar NULL,
	type_creation numeric NULL,
	CONSTRAINT type_acte_pkey PRIMARY KEY (type_code)
);



CREATE TABLE IF NOT EXISTS workflow.wf_dossier (
	reference_acte varchar(19) NOT NULL,
	dossier_date_depot date NULL,
	dossier_motif varchar(250) NULL,
	reference_ministere varchar(250) NULL,
	type_acte varchar(3) NULL,
	nombre_agent int4 NULL,
	commentaire text NULL,
	date_reference_ministere date NULL,
	motif_rejet varchar(500) NULL,
	comptable_detenteur varchar(50) NULL,
	nombre_projet int4 NULL,
	dossier_date_saisie date NULL,
	entite_code varchar(250) NULL,
	activite_code varchar(250) NULL,
	ministere_code varchar(2) NULL,
	processus_code varchar(150) NULL,
	type_groupe_code varchar(3) NULL,
	region_creation varchar(5) NULL,
	type_guichet varchar(2) NULL,
	reference_sortie varchar(250) NULL,
	date_sortie date NULL,
	id_dossier uuid DEFAULT uuid_in(md5(random()::text)::cstring) NOT NULL,
	CONSTRAINT wf_dossier_unique UNIQUE (id_dossier)
);
CREATE INDEX IF NOT EXISTS wf_dossier_reference_acte_idx ON workflow.wf_dossier USING btree (reference_acte, type_acte, entite_code, processus_code);



CREATE TABLE IF NOT EXISTS workflow.wf_activite (
	activite_code varchar(150) NOT NULL,
	activite_libelle varchar(250) NULL,
	processus_code varchar(150) NOT NULL,
	activite_avant varchar(150) NULL,
	activite_suivant varchar(150) NULL,
	entite_code varchar(20) NOT NULL,
	url varchar(100) NULL,
	rang numeric NULL,
	"condition" varchar(1) NULL
);
CREATE INDEX IF NOT EXISTS wf_activite_activite_code_idx ON workflow.wf_activite USING btree (activite_code, processus_code);



CREATE TABLE IF NOT EXISTS workflow.wf_tache_role_entite (
	tache_code varchar(150) NOT NULL,
	tache_libelle varchar(250) NULL,
	activite_code varchar(150) NOT NULL,
	tache_avant varchar(150) NULL,
	tache_suivant varchar(150) NULL,
	role_code varchar(20) NOT NULL,
	url varchar(250) NULL,
	sous_entite_code varchar(50) NOT NULL,
	rang int4 NULL,
	page varchar(150) NULL,
	duree int4 NULL,
	"condition" varchar(150) NULL
);
CREATE INDEX IF NOT EXISTS wf_tache_role_entite_tache_code_idx ON workflow.wf_tache_role_entite USING btree (tache_code, activite_code);



CREATE TABLE IF NOT EXISTS workflow.wf_processus_activite_tache (
	processus_code varchar(250) NOT NULL,
	activite_code varchar(250) NOT NULL,
	tache_a_faire varchar(250) NOT NULL,
	date_debut date NULL,
	date_fin date NULL,
	reference_acte varchar(17) NOT NULL,
	detenteur varchar(50) NULL,
	rang int4 NULL,
	id_processus_activite_tache uuid DEFAULT uuid_in(md5(random()::text)::cstring) NOT NULL,
	CONSTRAINT wf_processus_activite_tache_pk PRIMARY KEY (id_processus_activite_tache)
);
CREATE INDEX IF NOT EXISTS wf_processus_activite_tache_processus_code_idx ON workflow.wf_processus_activite_tache USING btree (processus_code, activite_code, tache_a_faire, reference_acte);



CREATE TABLE IF NOT EXISTS workflow.wf_referentiel_etat (
	etat_code varchar(20) NULL,
	etat_libelle varchar(150) NULL,
	jasper varchar(150) NULL,
	parametre varchar(400) NULL,
	etat_type varchar(1) NULL,
	query_verif text NULL,
	etat_view varchar(250) NULL,
	application_code int4 NULL
);



CREATE TABLE IF NOT EXISTS workflow.wf_trace_session (
	reference_securite uuid DEFAULT uuid_in(md5(random()::text)::cstring) NOT NULL,
	login text NOT NULL,
	adresse_mac text NOT NULL,
	date_intervention date NOT NULL,
	adresse_ip text NOT NULL,
	machine text NOT NULL,
	actions varchar(250) NULL,
	application text NOT NULL,
	"action" varchar(250) NULL,
	"password" varchar(250) NULL,
	CONSTRAINT trace_session_pkey PRIMARY KEY (reference_securite)
);

CREATE TABLE IF NOT EXISTS workflow.wf_tentative_connexion (
	utilisateur_matricule varchar(6) NOT NULL,
	login varchar(250) NOT NULL,
	utilisateur_cin varchar(12) NOT NULL,
	nombre_connexion int4 NULL,
	date_connexion date NULL,
	code_tentative uuid DEFAULT uuid_in(md5(random()::text)::cstring) NOT NULL,
	application_code int4 NOT NULL,
	CONSTRAINT wf_tentative_connexion_pk PRIMARY KEY (code_tentative)
);
/* =====================================================================
   4. NOYAU VÉHICULE PRINCIPAL
   Les noms traitement_siigpe.* sont conservés car ils proviennent de l'ancienne base.
   ===================================================================== */

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_vehicule_marque (
    vehicule_marque_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicule_marque_nom  varchar(255),
    vehicule_marque_photo text
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_vehicule_serie (
    vehicule_serie_id    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicule_marque_id   uuid NOT NULL REFERENCES traitement_siigpe.tsi_vehicule_marque(vehicule_marque_id),
    vehicule_serie_nom   varchar(250)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_entite_vehicule (
    vehicule_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicule_immatriculation varchar(20) UNIQUE,
    min_code             varchar(2),
    soa_depositaire      varchar(20),
    vehicule_marque_id   uuid REFERENCES traitement_siigpe.tsi_vehicule_marque(vehicule_marque_id),
    serie_id             varchar(250),
    vehicule_type        varchar(50),
    vehicule_autre_type  varchar(250),
    vehicule_genre       varchar(10),
    vehicule_carroserie  varchar(250),
    vehicule_puissance_administrative varchar(10),
    vehicule_numero_moteur varchar(30),
    vehicule_vin         varchar(30),
    vehicule_source_energie varchar(10) REFERENCES referentiel_siigpe.rsi_energie_vehicule(energie_code),
    vehicule_pls         varchar(10),
    vehicule_pv          varchar(10),
    vehicule_cu          varchar(10),
    vehicule_pt          varchar(10),
    vehicule_date_premier_mise date,
    vehicule_date_immatriculation_preced date,
    categorie_vehicule   varchar(10) REFERENCES referentiel_siigpe.rsi_categorie_vehicule(categorie_code),
    etat_vehicule        varchar(10) REFERENCES referentiel_siigpe.rsi_etat_vehicule(etat_vehicule),
    carte_grise          varchar(1),
    livrets_disponibles  varchar(1),
    detenteur_effectif   varchar(250),
    region_id            uuid REFERENCES referentiel_national.rn_region(id_region),
    district_id          uuid,
    commune_id           uuid,
    reference_acte       varchar(19),
    statut               varchar(20) DEFAULT 'ACTIF',
    statut_doublon       varchar(1),
    utilisateur_saisie   varchar(6),
    date_saisie          date DEFAULT CURRENT_DATE,
    utilisateur_modifier varchar(6),
    date_modifier        date,
    utilisateur_supprimer varchar(6),
    date_suppression     date,
    motif_suppression    varchar(250),
    vehicule_projet      varchar(250)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_information_utilisation_vehicule (
    information_utilisation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicule_id          uuid REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id),
    categorie_utilisation varchar(10) REFERENCES referentiel_siigpe.rsi_categorie_utilisation_vehicule(categorie_utilisation),
    date_saisie          date DEFAULT CURRENT_DATE,
    utilisateur_saisie   varchar(6),
    utilisation_rang     numeric,
    province_code        varchar(4),
    region_id            uuid REFERENCES referentiel_national.rn_region(id_region),
    district_id          uuid,
    commune_id           uuid,
    reference_acte       varchar(19),
    utilisateur_service  varchar(250),
    utilisateur_ministere varchar(2),
    detenteur_representation varchar(250),
    detenteur_fonction   varchar(250),
    utilisateur_validation varchar(6),
    date_validation      date,
    utilisateur_modifier varchar(6),
    date_modifier        date
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_entite_utilisation_vehicule (
    entite_utilisation_vehicule_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    information_utilisation_id uuid REFERENCES traitement_siigpe.tsi_information_utilisation_vehicule(information_utilisation_id),
    soa_code             varchar(20),
    min_code             varchar(2),
    direction_generale   varchar(250),
    direction            varchar(250),
    service              varchar(250),
    autre                varchar(250)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_vehicule_detenteur (
    detenteur_id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicule_id          uuid NOT NULL REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id),
    detenteur_nom_prenom varchar(250),
    detenteur_cin        varchar(20),
    reference_acte       varchar(19),
    date_debut           date,
    date_fin             date,
    actif                numeric DEFAULT 1
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_quitus_vehicule (
    quitus_vehicule_id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_quitus     varchar(30),
    id_vehicule          uuid REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id),
    date_quitus          date,
    utilisateur_valider  varchar(6),
    rang                 numeric,
    utilisateur_soa      varchar(20),
    reference_acte       varchar(19)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_entretien_reparation_vehicule (
    entretien_reparation_vehicule_id varchar(20) PRIMARY KEY,
    vehicule_id          uuid REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id),
    reference_acte       varchar(19),
    numero_bc            varchar(20),
    numero_bc_scan       text,
    date_numero_bc       date,
    numero_tef           varchar(20),
    numero_tef_scan      text,
    date_numero_tef      date,
    fournisseur          uuid REFERENCES referentiel_siigpe.rsi_fournisseur(fournisseur_id),
    numero_convention    varchar(50),
    numero_convention_scan text,
    date_convention      date,
    date_saisie          date DEFAULT CURRENT_DATE,
    utilisateur_saisie   varchar(6),
    entretien_reparation_rang numeric,
    repartition_effectue varchar(250),
    montant_repartition  numeric,
    depense_total        numeric
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_reparation_effectue_vehicule (
    reparation_effectue_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    entretien_reparation_vehicule_id varchar(20) REFERENCES traitement_siigpe.tsi_entretien_reparation_vehicule(entretien_reparation_vehicule_id),
    reparation_effectue_detail varchar(250)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_historique_vehicule (
    historique_vehicule_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicule_id          uuid REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id),
    historique_type      varchar(30),
    historique_date      timestamp DEFAULT CURRENT_TIMESTAMP,
    historique_utilisateur varchar(6),
    ancienne_valeur_json jsonb,
    nouvelle_valeur_json jsonb,
    reference_acte       varchar(19)
);

/* =====================================================================
   5. DOCUMENTS GÉNÉRÉS ET ARCHIVES
   ===================================================================== */

CREATE TABLE IF NOT EXISTS document.modele_document (
    modele_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code                 varchar(50) NOT NULL UNIQUE,
    libelle              varchar(250) NOT NULL,
    type_acte            varchar(30) REFERENCES workflow.wf_type_acte(type_code),
    fichier_modele       text NOT NULL,
    format_modele        varchar(20) DEFAULT 'JASPER',
    actif                numeric DEFAULT 1,
    created_at           timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document.document_genere (
    document_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_acte       varchar(19),
    modele_id            uuid REFERENCES document.modele_document(modele_id),
    numero_document      varchar(50),
    version              numeric DEFAULT 1,
    statut               varchar(20) DEFAULT 'BROUILLON',
    fichier_pdf          text,
    fichier_source       text,
    genere_par           varchar(6),
    genere_le            timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par           varchar(6),
    valide_le            timestamp,
    annule_par           varchar(6),
    annule_le            timestamp,
    motif_annulation     text
);

CREATE TABLE IF NOT EXISTS document.sequence_document (
    type_acte            varchar(30) NOT NULL REFERENCES workflow.wf_type_acte(type_code),
    dernier_numero       numeric NOT NULL DEFAULT 0,
    PRIMARY KEY (type_acte)
);

/* =====================================================================
   6. AUDIT GLOBAL
   ===================================================================== */

CREATE TABLE IF NOT EXISTS audit.audit_log (
    audit_id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id       varchar(6),
    action               varchar(100) NOT NULL,
    schema_nom           varchar(50),
    table_nom            varchar(100),
    entite_id            varchar(100),
    reference_acte       varchar(30),
    ancienne_valeur      jsonb,
    nouvelle_valeur      jsonb,
    date_action          timestamp DEFAULT CURRENT_TIMESTAMP,
    adresse_ip           varchar(50),
    user_agent           text
);

/* =====================================================================
   7. INDEX PRINCIPAUX
   ===================================================================== */



CREATE INDEX IF NOT EXISTS idx_vehicule_immat ON traitement_siigpe.tsi_entite_vehicule(vehicule_immatriculation);
CREATE INDEX IF NOT EXISTS idx_vehicule_min_soa ON traitement_siigpe.tsi_entite_vehicule(min_code, soa_depositaire);
CREATE INDEX IF NOT EXISTS idx_vehicule_etat ON traitement_siigpe.tsi_entite_vehicule(etat_vehicule);
CREATE INDEX IF NOT EXISTS idx_utilisation_vehicule ON traitement_siigpe.tsi_information_utilisation_vehicule(vehicule_id);
CREATE INDEX IF NOT EXISTS idx_quitus_vehicule_periode ON traitement_siigpe.tsi_quitus_vehicule(id_vehicule);
CREATE INDEX IF NOT EXISTS idx_entretien_vehicule ON traitement_siigpe.tsi_entretien_reparation_vehicule(vehicule_id);

CREATE INDEX IF NOT EXISTS idx_document_reference ON document.document_genere(reference_acte);
CREATE INDEX IF NOT EXISTS idx_audit_reference ON audit.audit_log(reference_acte);
CREATE INDEX IF NOT EXISTS idx_audit_table ON audit.audit_log(schema_nom, table_nom, entite_id);










/* =====================================================================
   PLATEFORME VA — référentiels (referentiel_siigpe) + brouillons
   traitement (traitement_siigpe). Remplace l'ancien schéma bscva
   (supprimé le 2026-09-02 — voir db/README.md pour l'historique de la
   bascule). Additif/idempotent — CREATE TABLE IF NOT EXISTS partout.
   ===================================================================== */

/* --- GROUPE A : référentiels statiques, sans préfixe --- */

-- Sections de la Fiche de Constatation (MOTEUR, FREINAGE, ...)
CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_section_constatation (
    section_id      uuid NOT NULL DEFAULT gen_random_uuid(),
    section_code    varchar(30) NOT NULL,
    section_libelle varchar(150) NOT NULL,
    rang            numeric NULL,
    CONSTRAINT section_constatation_pk PRIMARY KEY (section_id),
    CONSTRAINT section_constatation_uk UNIQUE (section_code)
);

-- Éléments à contrôler dans chaque section (Culasse, Turbo, ...)
CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_element_constatation (
    element_id      uuid NOT NULL DEFAULT gen_random_uuid(),
    section_id      uuid NOT NULL,
    element_libelle varchar(200) NOT NULL,
    rang            numeric NULL,
    CONSTRAINT element_constatation_pk PRIMARY KEY (element_id),
    CONSTRAINT element_constatation_fk FOREIGN KEY (section_id)
        REFERENCES referentiel_siigpe.rsi_section_constatation(section_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS element_constatation_uk ON referentiel_siigpe.rsi_element_constatation(section_id, element_libelle);

-- Types de livret (SA, GSS, Parcours)
CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_type_livret (
    type_livret_code    varchar(10) NOT NULL,
    type_livret_libelle varchar(150) NOT NULL,
    CONSTRAINT type_livret_pk PRIMARY KEY (type_livret_code)
);

-- Référentiel des pièces exigibles par type d'acte (contrôle de complétude)
CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_piece_dossier (
    piece_id        uuid NOT NULL DEFAULT gen_random_uuid(),
    type_code       varchar(3) NOT NULL,
    piece_libelle   varchar(250) NOT NULL,
    obligatoire     numeric NOT NULL DEFAULT 1,    -- 1=oui 0=non (cf. note: non bloquant)
    rang            numeric NULL,
    CONSTRAINT piece_dossier_pk PRIMARY KEY (piece_id),
    CONSTRAINT piece_dossier_type_fk FOREIGN KEY (type_code)
        REFERENCES workflow.wf_type_acte(type_code)
);

CREATE UNIQUE INDEX IF NOT EXISTS piece_dossier_uk ON referentiel_siigpe.rsi_piece_dossier(type_code, piece_libelle);

/* --- compteur technique de numérotation des dossiers (pas un brouillon
   d'acte, donc sans préfixe ts_ ; remplace db/V1__sequence_dossier.sql,
   désormais plié ici) --- */
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_sequence_dossier (
    type_acte      varchar(3) NOT NULL REFERENCES workflow.wf_type_acte(type_code),
    annee          integer NOT NULL,
    mois           integer NOT NULL,
    dernier_numero integer NOT NULL DEFAULT 0,
    PRIMARY KEY (type_acte, annee, mois)
);

-- Pièces réellement jointes / scannées pour un dossier (brouillon)
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_dossier_piece (
    dossier_piece_id uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte   varchar(19) NOT NULL,
    piece_id         uuid NULL,
    libelle_libre    varchar(250) NULL,
    scan_path        text NULL,
    fournie          numeric NOT NULL DEFAULT 0,
    date_saisie      date NULL,
    statut_piece     varchar(30) DEFAULT 'ATTENDUE',
    version          integer DEFAULT 1,
    obligatoire_validation boolean DEFAULT false,
    observation      text,
    motif_non_conformite text,
    valide_par       varchar(6),
    date_validation  timestamp,
    nom_original     varchar(255),
    chemin_fichier   text,
    mime_type        varchar(150),
    taille_octets    bigint,
    hash_fichier     varchar(255),
    is_deleted       boolean DEFAULT false,
    deleted_at       timestamp,
    deleted_by       varchar(6),
    created_at       timestamp DEFAULT CURRENT_TIMESTAMP,
    created_by       varchar(6),
    updated_at       timestamp,
    updated_by       varchar(6),
    CONSTRAINT dossier_piece_pk PRIMARY KEY (dossier_piece_id),
    CONSTRAINT dossier_piece_piece_fk FOREIGN KEY (piece_id)
        REFERENCES referentiel_siigpe.rsi_piece_dossier(piece_id),
    CONSTRAINT dossier_piece_statut_chk CHECK (statut_piece IN
        ('ATTENDUE','RECUE','ABSENTE','NON_CONFORME','REMPLACEE','VALIDEE'))
);

-- Rattachement générique dossier <-> véhicule (brouillon)
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_dossier_vehicule_ligne (
    dossier_vehicule_ligne_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_acte            varchar(19) NOT NULL,
    vehicule_id               uuid NOT NULL,
    role_vehicule             varchar(30) DEFAULT 'PRINCIPAL',
    observation               text,
    date_saisie               timestamp DEFAULT CURRENT_TIMESTAMP,
    utilisateur_saisie        varchar(6),
    CONSTRAINT dossier_vehicule_ligne_vehicule_fk FOREIGN KEY (vehicule_id)
        REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id),
    CONSTRAINT dossier_vehicule_ligne_role_chk CHECK (role_vehicule IN
        ('PRINCIPAL','CONCERNE','LOUE','ACQUIS','ACCIDENTE','REMPLACE'))
);

/* ---------------------------------------------------------------------
   I — RECENSEMENT (brouillon traitement_siigpe.ts_*)
   (le quitus final est porté par siigpe.quitus_vehicule existant)
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_recensement (
    recensement_id    uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NULL,
    min_code          varchar(2) NULL,
    soa_code          varchar(20) NULL,
    niveau            varchar(20) NULL,            -- Central / Régional
    point_focal_nom   varchar(250) NULL,
    point_focal_fonction varchar(150) NULL,
    point_focal_tel   varchar(20) NULL,
    point_focal_email varchar(150) NULL,
    date_saisie       date NULL,
    utilisateur_saisie varchar(6) NULL,
    statut            varchar(1) NULL,
    rang              numeric NULL,
    CONSTRAINT recensement_pk PRIMARY KEY (recensement_id)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_recensement_ligne (
    recensement_ligne_id uuid NOT NULL DEFAULT gen_random_uuid(),
    recensement_id    uuid NOT NULL,
    vehicule_id       uuid NULL,                   -- rattachement si déjà connu
    detenteur_effectif varchar(250) NULL,
    carte_grise_dispo varchar(1) NULL,             -- Oui/Non
    livrets_dispo     varchar(1) NULL,
    etat_general      varchar(1) NULL,             -- 1 marche / 2 panne / 3 calle / 4 epave
    categorie_utilisation varchar(1) NULL,         -- 1 repr / 2 fonction / 3 service
    rang              numeric NULL,
    CONSTRAINT recensement_ligne_pk PRIMARY KEY (recensement_ligne_id),
    CONSTRAINT recensement_ligne_fk FOREIGN KEY (recensement_id) REFERENCES traitement_siigpe.tsi_recensement(recensement_id),
    CONSTRAINT recensement_ligne_veh_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id)
);

/* ---------------------------------------------------------------------
   II — CONSTATATION TECHNIQUE (Fiche diagnostic + PV)
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_constatation_technique (
    constatation_id   uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NULL,
    vehicule_id       uuid NULL,
    numero_constat    varchar(20) NULL,
    date_constat      date NULL,
    heure_constat     varchar(10) NULL,
    lieu              varchar(250) NULL,
    expert_nom        varchar(250) NULL,
    equipement_verif  varchar(250) NULL,
    kilometrage       numeric NULL,
    nom_chauffeur     varchar(250) NULL,
    etat_general      varchar(1) NULL,             -- marche/panne/calle
    constats          text NULL,                   -- synthèse texte (PV)
    date_saisie       date NULL,
    utilisateur_saisie varchar(6) NULL,
    statut            varchar(1) NULL,
    rang              numeric NULL,
    CONSTRAINT constatation_pk PRIMARY KEY (constatation_id)
);

-- Une ligne par élément contrôlé (grille de la fiche diagnostic)
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_constatation_element (
    constatation_element_id uuid NOT NULL DEFAULT gen_random_uuid(),
    constatation_id   uuid NOT NULL,
    element_id        uuid NULL,
    conforme          varchar(1) NULL,             -- C / N
    observation       varchar(500) NULL,
    ordre_priorite    numeric NULL,
    pneu_pourcentage  numeric NULL,                -- pour AVG/AVD/ARG/ARD
    CONSTRAINT constatation_element_pk PRIMARY KEY (constatation_element_id),
    CONSTRAINT constatation_element_fk FOREIGN KEY (constatation_id) REFERENCES traitement_siigpe.tsi_constatation_technique(constatation_id),
    CONSTRAINT constatation_element_ref_fk FOREIGN KEY (element_id) REFERENCES referentiel_siigpe.rsi_element_constatation(element_id)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_constatation_piece_remplacer (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    constatation_id uuid NOT NULL,
    libelle varchar(250) NOT NULL,
    rang numeric NULL,
    CONSTRAINT constatation_piece_pk PRIMARY KEY (id),
    CONSTRAINT constatation_piece_fk FOREIGN KEY (constatation_id) REFERENCES traitement_siigpe.tsi_constatation_technique(constatation_id)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_constatation_reparation (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    constatation_id uuid NOT NULL,
    libelle varchar(250) NOT NULL,
    rang numeric NULL,
    CONSTRAINT constatation_reparation_pk PRIMARY KEY (id),
    CONSTRAINT constatation_reparation_fk FOREIGN KEY (constatation_id) REFERENCES traitement_siigpe.tsi_constatation_technique(constatation_id)
);

/* ---------------------------------------------------------------------
   III — VISA BON DE COMMANDE
   (lié à siigpe.entretien_reparation_vehicule existant via numero_bc)
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_visa_bon_commande (
    visa_bc_id        uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NULL,
    vehicule_id       uuid NULL,
    entretien_reparation_vehicule_id varchar(20) NULL, -- FK siigpe
    numero_bc         varchar(20) NULL,
    date_bc           date NULL,
    fournisseur       varchar(250) NULL,
    nif_stat          varchar(50) NULL,
    montant           numeric NULL,
    reference_pv_constat varchar(20) NULL,
    grands_travaux    numeric NULL,                -- 0 = sans réserve / 1 = sous réserve réception
    numero_visa       varchar(20) NULL,
    date_visa         date NULL,
    sens_visa         varchar(1) NULL,             -- V=visé / R=refus
    motif_refus       varchar(500) NULL,
    decision          varchar(20) NULL,            -- VISA / REFUS (décision métier normalisée)
    date_saisie       date NULL,
    utilisateur_saisie varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT visa_bc_pk PRIMARY KEY (visa_bc_id),
    CONSTRAINT visa_bc_er_fk FOREIGN KEY (entretien_reparation_vehicule_id)
        REFERENCES traitement_siigpe.tsi_entretien_reparation_vehicule(entretien_reparation_vehicule_id),
    CONSTRAINT visa_bon_commande_decision_chk CHECK (decision IS NULL OR decision IN ('VISA','REFUS')),
    CONSTRAINT visa_bon_commande_sens_chk CHECK (sens_visa IS NULL OR sens_visa IN ('V','R')),
    CONSTRAINT visa_bon_commande_grands_travaux_chk CHECK (grands_travaux IS NULL OR grands_travaux IN (0,1))
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_visa_bc_piece (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    visa_bc_id uuid NOT NULL,
    designation varchar(250) NOT NULL,             -- pneumatique / accessoires (livret SA)
    quantite numeric NULL,
    prix_unitaire numeric NULL,
    CONSTRAINT visa_bc_piece_pk PRIMARY KEY (id),
    CONSTRAINT visa_bc_piece_fk FOREIGN KEY (visa_bc_id) REFERENCES traitement_siigpe.tsi_visa_bon_commande(visa_bc_id)
);

/* ---------------------------------------------------------------------
   IV — RÉCEPTION TECHNIQUE (levée grands travaux)
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_reception_technique (
    reception_id      uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NULL,
    vehicule_id       uuid NULL,
    visa_bc_id        uuid NULL,                   -- lien vers le BC visé sous réserve
    date_reception    date NULL,
    heure_reception   varchar(10) NULL,
    min_soa           varchar(250) NULL,
    service_fait_gac  numeric NULL,                -- validé par GAC : 0/1
    expert_nom        varchar(250) NULL,
    responsable_nom   varchar(250) NULL,
    avis              varchar(20) NULL,            -- FAVORABLE / DEFAVORABLE
    date_saisie       date NULL,
    utilisateur_saisie varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT reception_pk PRIMARY KEY (reception_id),
    CONSTRAINT reception_visa_fk FOREIGN KEY (visa_bc_id) REFERENCES traitement_siigpe.tsi_visa_bon_commande(visa_bc_id),
    CONSTRAINT reception_technique_avis_chk CHECK (avis IS NULL OR avis IN ('FAVORABLE','DEFAVORABLE')),
    CONSTRAINT reception_technique_service_fait_chk CHECK (service_fait_gac IS NULL OR service_fait_gac IN (0,1))
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_reception_constat (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    reception_id uuid NOT NULL,
    libelle varchar(500) NOT NULL,
    rang numeric NULL,
    CONSTRAINT reception_constat_pk PRIMARY KEY (id),
    CONSTRAINT reception_constat_fk FOREIGN KEY (reception_id) REFERENCES traitement_siigpe.tsi_reception_technique(reception_id)
);

/* ---------------------------------------------------------------------
   V — RÉCEPTION VA NOUVELLEMENT ACQUIS (PV Ordre de recette)
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_reception_va_neuf (
    reception_neuf_id uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NULL,
    budget_code       varchar(20) NULL,
    chapitre          varchar(20) NULL,
    article           varchar(20) NULL,
    compte            varchar(20) NULL,
    financement       varchar(50) NULL,
    commune           varchar(150) NULL,
    type_acquisition  varchar(30) NULL,            -- donation/transfert/convention/marché
    reference_marche  varchar(50) NULL,
    date_consultation date NULL,
    fournisseur_nom   varchar(250) NULL,
    fournisseur_adresse varchar(250) NULL,
    fournisseur_stat  varchar(50) NULL,
    fournisseur_nif   varchar(50) NULL,
    depositaire_nom   varchar(250) NULL,
    decision_commission text NULL,                 -- sans réserve / avec réduction...
    date_pv           date NULL,
    date_saisie       date NULL,
    utilisateur_saisie varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT reception_neuf_pk PRIMARY KEY (reception_neuf_id)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_reception_neuf_ligne (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    reception_neuf_id uuid NOT NULL,
    vehicule_id       uuid NULL,
    designation       varchar(250) NULL,           -- VOITURE / matière-objet
    immatriculation   varchar(20) NULL,
    genre             varchar(50) NULL,
    type_veh          varchar(50) NULL,
    marque            varchar(50) NULL,
    numero_serie      varchar(30) NULL,
    carrosserie       varchar(50) NULL,
    numero_moteur     varchar(30) NULL,
    puissance         varchar(10) NULL,
    source_energie    varchar(20) NULL,
    nombre_place      numeric NULL,
    date_premiere_mise date NULL,
    quantite_facturee numeric NULL,
    quantite_reconnue numeric NULL,
    decision          varchar(50) NULL,            -- sans changement / réduction / rebutée
    rang numeric NULL,
    CONSTRAINT reception_neuf_ligne_pk PRIMARY KEY (id),
    CONSTRAINT reception_neuf_ligne_fk FOREIGN KEY (reception_neuf_id) REFERENCES traitement_siigpe.tsi_reception_va_neuf(reception_neuf_id),
    CONSTRAINT reception_neuf_ligne_veh_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id)
);

/* ---------------------------------------------------------------------
   VI — ARRÊTAGE LIVRET (SA / Garage-Station / Parcours)
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_arretage_livret (
    arretage_id       uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NULL,
    vehicule_id       uuid NULL,
    date_arretage     date NULL,                   -- 31/12/N-1
    dernier_bc        varchar(20) NULL,
    vehicule_fonction numeric NULL,                -- nécessite attestation catégorie
    date_saisie       date NULL,
    utilisateur_saisie varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT arretage_pk PRIMARY KEY (arretage_id)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_arretage_livret_detail (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    arretage_id uuid NOT NULL,
    type_livret_code varchar(10) NOT NULL,         -- SA / GSS / Parcours
    rubrique varchar(150) NULL,
    valeur_arretee numeric NULL,
    observation varchar(500) NULL,
    CONSTRAINT arretage_detail_pk PRIMARY KEY (id),
    CONSTRAINT arretage_detail_fk FOREIGN KEY (arretage_id) REFERENCES traitement_siigpe.tsi_arretage_livret(arretage_id),
    CONSTRAINT arretage_detail_livret_fk FOREIGN KEY (type_livret_code) REFERENCES referentiel_siigpe.rsi_type_livret(type_livret_code)
);

/* ---------------------------------------------------------------------
   VII — CONTRÔLE D'APTITUDE + AUTORISATION DE LOCATION
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_controle_aptitude (
    aptitude_id       uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NULL,
    vehicule_id       uuid NULL,                   -- correctif : colonne manquante référencée par la FK ci-dessous
    objet_mission     text NULL,                   -- transport missionnaires...
    itineraire        varchar(250) NULL,
    date_debut        date NULL,
    date_fin          date NULL,
    contrat_location  varchar(50) NULL,
    fournisseur_nif_stat varchar(50) NULL,
    apte              numeric NULL,                -- constat de visu : 0/1
    avis_aptitude     varchar(20) NULL,             -- APTE / NON_APTE
    date_saisie       date NULL,
    utilisateur_saisie varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT aptitude_pk PRIMARY KEY (aptitude_id),
    CONSTRAINT autorisation_ligne_veh_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id),
    CONSTRAINT controle_aptitude_avis_chk CHECK (avis_aptitude IS NULL OR avis_aptitude IN ('APTE','NON_APTE')),
    CONSTRAINT controle_aptitude_apte_chk CHECK (apte IS NULL OR apte IN (0,1))
);

/* ---------------------------------------------------------------------
   VIII — ATTESTATION DE CARACTÉRISTIQUES
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_attestation_caracteristique (
    attestation_id    uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NULL,
    vehicule_id       uuid NULL,
    min_code          varchar(2) NULL,
    soa_libelle       varchar(250) NULL,
    immatriculation   varchar(20) NULL,
    marque            varchar(50) NULL,
    genre             varchar(50) NULL,
    carrosserie       varchar(50) NULL,
    type_veh          varchar(50) NULL,
    numero_serie_type varchar(30) NULL,
    numero_moteur     varchar(30) NULL,
    nombre_place      numeric NULL,
    source_energie    varchar(20) NULL,
    puissance_admin   varchar(10) NULL,
    poids_vide        numeric NULL,
    charge_utile      numeric NULL,
    ptac              numeric NULL,
    annee_premiere_mise numeric NULL,
    motif_perte       varchar(250) NULL,           -- perte/détérioration carte grise
    date_saisie       date NULL,
    utilisateur_saisie varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT attestation_carac_pk PRIMARY KEY (attestation_id)
);

/* ---------------------------------------------------------------------
   MODULES TRANSVERSES (cahier des charges)
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_expertise_accident (
    expertise_id      uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NULL,
    vehicule_id       uuid NULL,
    type_expertise    varchar(20) NULL,            -- EXP / CONTRE_EXP
    date_accident     date NULL,
    lieu_accident     varchar(250) NULL,
    vehicule_prive_immat varchar(20) NULL,         -- pour contre-expertise
    rapport           text NULL,
    montant_estime    numeric NULL,
    date_saisie       date NULL,
    utilisateur_saisie varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT expertise_pk PRIMARY KEY (expertise_id)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_expertise_dommage (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    expertise_id uuid NOT NULL,
    libelle varchar(250) NOT NULL,
    cout_estime numeric NULL,
    CONSTRAINT expertise_dommage_pk PRIMARY KEY (id),
    CONSTRAINT expertise_dommage_fk FOREIGN KEY (expertise_id) REFERENCES traitement_siigpe.tsi_expertise_accident(expertise_id)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_evaluation_condamnation (
    evaluation_id     uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NULL,
    vehicule_id       uuid NULL,
    valeur_estimee    numeric NULL,
    mise_a_prix       numeric NULL,
    fiche_technique   text NULL,
    motif_condamnation varchar(250) NULL,
    date_saisie       date NULL,
    utilisateur_saisie varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT evaluation_pk PRIMARY KEY (evaluation_id)
);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_chauffeur (
    chauffeur_id      uuid NOT NULL DEFAULT gen_random_uuid(),
    nom               varchar(250) NOT NULL,
    matricule         varchar(20) NULL,
    cin               varchar(12) NULL,
    permis            varchar(30) NULL,
    min_code          varchar(2) NULL,
    soa_code          varchar(20) NULL,
    CONSTRAINT chauffeur_pk PRIMARY KEY (chauffeur_id)
);

-- IX — TEST CHAUFFEUR (résultats de test de conduite ; anciennement §17)
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_chauffeur_test (
    test_id             uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte      varchar(19) NULL,
    chauffeur_id        uuid NOT NULL,
    vehicule_id         uuid NULL,
    date_test           date NULL,
    examinateur_nom     varchar(250) NULL,
    resultat            varchar(20) NULL,          -- APTE / NON_APTE
    observations        text NULL,
    date_saisie         date NULL,
    utilisateur_saisie  varchar(6) NULL,
    statut              varchar(1) NULL,
    CONSTRAINT chauffeur_test_pk PRIMARY KEY (test_id),
    CONSTRAINT chauffeur_test_chauffeur_fk FOREIGN KEY (chauffeur_id) REFERENCES traitement_siigpe.tsi_chauffeur(chauffeur_id),
    CONSTRAINT chauffeur_test_vehicule_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id),
    CONSTRAINT chauffeur_test_resultat_chk CHECK (resultat IS NULL OR resultat IN ('APTE','NON_APTE'))
);

/* Index usuels */
CREATE INDEX IF NOT EXISTS idx_constatation_vehicule ON traitement_siigpe.tsi_constatation_technique(vehicule_id);
CREATE INDEX IF NOT EXISTS idx_visa_bc_vehicule ON traitement_siigpe.tsi_visa_bon_commande(vehicule_id);
CREATE INDEX IF NOT EXISTS idx_recens_ligne_recens ON traitement_siigpe.tsi_recensement_ligne(recensement_id);
CREATE INDEX IF NOT EXISTS idx_dossier_piece_ref ON traitement_siigpe.tsi_dossier_piece(reference_acte);
CREATE INDEX IF NOT EXISTS idx_dossier_vehicule_ligne_reference ON traitement_siigpe.tsi_dossier_vehicule_ligne(reference_acte);
CREATE INDEX IF NOT EXISTS idx_dossier_vehicule_ligne_vehicule ON traitement_siigpe.tsi_dossier_vehicule_ligne(vehicule_id);
CREATE INDEX IF NOT EXISTS idx_dossier_piece_piece ON traitement_siigpe.tsi_dossier_piece(piece_id);
CREATE INDEX IF NOT EXISTS idx_dossier_piece_statut ON traitement_siigpe.tsi_dossier_piece(statut_piece);
CREATE INDEX IF NOT EXISTS idx_recensement_reference ON traitement_siigpe.tsi_recensement(reference_acte);
CREATE INDEX IF NOT EXISTS idx_constatation_reference ON traitement_siigpe.tsi_constatation_technique(reference_acte);
CREATE INDEX IF NOT EXISTS idx_visa_bc_reference ON traitement_siigpe.tsi_visa_bon_commande(reference_acte);
CREATE INDEX IF NOT EXISTS idx_reception_reference ON traitement_siigpe.tsi_reception_technique(reference_acte);
CREATE INDEX IF NOT EXISTS idx_reception_vehicule ON traitement_siigpe.tsi_reception_technique(vehicule_id);
CREATE INDEX IF NOT EXISTS idx_chauffeur_test_reference ON traitement_siigpe.tsi_chauffeur_test(reference_acte);
CREATE INDEX IF NOT EXISTS idx_chauffeur_test_chauffeur ON traitement_siigpe.tsi_chauffeur_test(chauffeur_id);

/* =====================================================================
   RÉFÉRENTIEL SIIGPE — contreparties réduites des 11 tables "acte"
   Alimentées uniquement à la validation finale (double-écriture
   applicative, jamais de trigger/fonction PL/pgSQL). Liaison par
   reference_acte (clé naturelle), AUCUNE FK physique vers
   traitement_siigpe.ts_* (modèle AUGURE ta_ / ra_).
   ===================================================================== */

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_recensement (
    rs_recensement_id uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NOT NULL,
    min_code          varchar(2) NULL,
    soa_code          varchar(20) NULL,
    niveau            varchar(20) NULL,
    date_validation   timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par        varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT rsi_recensement_pk PRIMARY KEY (rs_recensement_id),
    CONSTRAINT rsi_recensement_uk UNIQUE (reference_acte)
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_constatation_technique (
    rs_constatation_id uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NOT NULL,
    vehicule_id       uuid NULL,
    numero_constat    varchar(20) NULL,
    date_constat      date NULL,
    etat_general      varchar(1) NULL,
    date_validation   timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par        varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT rsi_constatation_pk PRIMARY KEY (rs_constatation_id),
    CONSTRAINT rsi_constatation_uk UNIQUE (reference_acte),
    CONSTRAINT rsi_constatation_veh_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id)
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_visa_bon_commande (
    rs_visa_bc_id     uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NOT NULL,
    vehicule_id       uuid NULL,
    numero_bc         varchar(20) NULL,
    date_bc           date NULL,
    montant           numeric NULL,
    numero_visa       varchar(20) NULL,
    date_visa         date NULL,
    sens_visa         varchar(1) NULL,
    decision          varchar(20) NULL,
    date_validation   timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par        varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT rsi_visa_bc_pk PRIMARY KEY (rs_visa_bc_id),
    CONSTRAINT rsi_visa_bc_uk UNIQUE (reference_acte),
    CONSTRAINT rsi_visa_bc_veh_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id)
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_reception_technique (
    rs_reception_id   uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NOT NULL,
    vehicule_id       uuid NULL,
    date_reception    date NULL,
    service_fait_gac  numeric NULL,
    avis              varchar(20) NULL,
    date_validation   timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par        varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT rsi_reception_pk PRIMARY KEY (rs_reception_id),
    CONSTRAINT rsi_reception_uk UNIQUE (reference_acte),
    CONSTRAINT rsi_reception_veh_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id)
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_reception_va_neuf (
    rs_reception_neuf_id uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NOT NULL,
    budget_code       varchar(20) NULL,
    type_acquisition  varchar(30) NULL,
    reference_marche  varchar(50) NULL,
    fournisseur_nom   varchar(250) NULL,
    date_pv           date NULL,
    date_validation   timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par        varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT rsi_reception_neuf_pk PRIMARY KEY (rs_reception_neuf_id),
    CONSTRAINT rsi_reception_neuf_uk UNIQUE (reference_acte)
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_arretage_livret (
    rs_arretage_id    uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NOT NULL,
    vehicule_id       uuid NULL,
    date_arretage     date NULL,
    dernier_bc        varchar(20) NULL,
    date_validation   timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par        varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT rsi_arretage_pk PRIMARY KEY (rs_arretage_id),
    CONSTRAINT rsi_arretage_uk UNIQUE (reference_acte),
    CONSTRAINT rsi_arretage_veh_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id)
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_controle_aptitude (
    rs_aptitude_id    uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte    varchar(19) NOT NULL,
    vehicule_id       uuid NULL,
    date_debut        date NULL,
    date_fin          date NULL,
    apte              numeric NULL,
    avis_aptitude     varchar(20) NULL,
    date_validation   timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par        varchar(6) NULL,
    statut            varchar(1) NULL,
    CONSTRAINT rsi_aptitude_pk PRIMARY KEY (rs_aptitude_id),
    CONSTRAINT rsi_aptitude_uk UNIQUE (reference_acte),
    CONSTRAINT rsi_aptitude_veh_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id)
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_attestation_caracteristique (
    rs_attestation_id  uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte     varchar(19) NOT NULL,
    vehicule_id        uuid NULL,
    immatriculation    varchar(20) NULL,
    marque             varchar(50) NULL,
    genre              varchar(50) NULL,
    carrosserie        varchar(50) NULL,
    type_veh           varchar(50) NULL,
    numero_serie_type  varchar(30) NULL,
    numero_moteur      varchar(30) NULL,
    nombre_place       numeric NULL,
    source_energie     varchar(20) NULL,
    puissance_admin    varchar(10) NULL,
    poids_vide         numeric NULL,
    charge_utile       numeric NULL,
    ptac               numeric NULL,
    annee_premiere_mise numeric NULL,
    date_validation    timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par         varchar(6) NULL,
    statut             varchar(1) NULL,
    CONSTRAINT rsi_attestation_pk PRIMARY KEY (rs_attestation_id),
    CONSTRAINT rsi_attestation_uk UNIQUE (reference_acte),
    CONSTRAINT rsi_attestation_veh_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id)
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_expertise_accident (
    rs_expertise_id    uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte     varchar(19) NOT NULL,
    vehicule_id        uuid NULL,
    type_expertise     varchar(20) NULL,
    date_accident      date NULL,
    montant_estime     numeric NULL,
    date_validation    timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par         varchar(6) NULL,
    statut             varchar(1) NULL,
    CONSTRAINT rsi_expertise_pk PRIMARY KEY (rs_expertise_id),
    CONSTRAINT rsi_expertise_uk UNIQUE (reference_acte),
    CONSTRAINT rsi_expertise_veh_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id)
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_evaluation_condamnation (
    rs_evaluation_id   uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte     varchar(19) NOT NULL,
    vehicule_id        uuid NULL,
    valeur_estimee     numeric NULL,
    mise_a_prix        numeric NULL,
    motif_condamnation varchar(250) NULL,
    date_validation    timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par         varchar(6) NULL,
    statut             varchar(1) NULL,
    CONSTRAINT rsi_evaluation_pk PRIMARY KEY (rs_evaluation_id),
    CONSTRAINT rsi_evaluation_uk UNIQUE (reference_acte),
    CONSTRAINT rsi_evaluation_veh_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id)
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_chauffeur_test (
    rs_test_id         uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte     varchar(19) NOT NULL,
    chauffeur_id       uuid NULL,
    vehicule_id        uuid NULL,
    date_test          date NULL,
    resultat           varchar(20) NULL,
    date_validation    timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par         varchar(6) NULL,
    statut             varchar(1) NULL,
    CONSTRAINT rsi_chauffeur_test_pk PRIMARY KEY (rs_test_id),
    CONSTRAINT rsi_chauffeur_test_uk UNIQUE (reference_acte),
    CONSTRAINT rsi_chauffeur_test_chauffeur_fk FOREIGN KEY (chauffeur_id) REFERENCES traitement_siigpe.tsi_chauffeur(chauffeur_id),
    CONSTRAINT rsi_chauffeur_test_veh_fk FOREIGN KEY (vehicule_id) REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id)
);












/* =====================================================================
   8. DONNÉES MINIMALES DE WORKFLOW VA
   Compatible ancienne base :
   - processus_code long conservé dans workflow.wf_processus
   - type_code court obligatoire car workflow.wf_type_acte.type_code = varchar(3)
   ===================================================================== */

INSERT INTO workflow.wf_type_acte_groupe(type_groupe_code, type_groupe_libelle)
VALUES ('VA', 'Véhicules Administratifs')
ON CONFLICT (type_groupe_code) DO NOTHING;

INSERT INTO workflow.wf_role(role_code, role_libelle, role_entite) VALUES
  ('ADMIN','Administrateur plateforme','BSCVA'),
  ('AGENT_SAISIE','Agent de saisie','BSCVA'),
  ('AGENT_CONTROLE','Agent de contrôle des pièces','BSCVA'),
  ('EXPERT_TECH','Expert administratif / Technicien','BSCVA'),
  ('CHEF_BSCVA','Chef du BSCVA','BSCVA'),
  ('CHEF_DRPE','Chef Division Régionale du Patrimoine de l''État','DRPE'),
  ('CHEF_SRB','Chef de Service Régional du Budget (signataire)','SRB'),
  ('DEPOSITAIRE_CPT','Dépositaire comptable / GAC','BSCVA'),
  ('CONSULT','Consultation (lecture seule)','BSCVA')
ON CONFLICT (role_code) DO NOTHING;

INSERT INTO workflow.wf_processus(processus_code, processus_libelle, processus_etat)
VALUES
('VA_RECENS', 'Recensement des véhicules administratifs', '1'),
('VA_CONSTAT', 'Entretien / Constatation technique', '1'),
('VA_VISA_BC', 'Visa de bon de commande', '1'),
('VA_RECEPT', 'Réception technique', '1'),
('VA_RECEPT_NEUF', 'Réception VA nouvellement acquis', '1'),
('VA_ARRET_LIV', 'Visa arrêtage livret', '1'),
('VA_LOCATION', 'Attestation aptitude et autorisation location', '1'),
('VA_ATT_CARAC', 'Attestation de caractéristiques', '1'),
('VA_EXPERTISE', 'Expertise et contre-expertise', '1'),
('VA_CONDAMN', 'Évaluation et condamnation véhicule', '1'),
('VA_TEST_CHAUF', 'Test chauffeur', '1')
ON CONFLICT (processus_code) DO NOTHING;

INSERT INTO workflow.wf_type_acte(type_code, type_libelle, type_groupe_code, processus_code, type_creation)
VALUES
('REC', 'Recensement véhicule administratif', 'VA', 'VA_RECENS', 1),
('CST', 'Constatation technique', 'VA', 'VA_CONSTAT', 1),
('VBC', 'Visa bon de commande', 'VA', 'VA_VISA_BC', 1),
('RCT', 'Réception technique après travaux', 'VA', 'VA_RECEPT', 1),
('RNE', 'Réception véhicule nouvellement acquis', 'VA', 'VA_RECEPT_NEUF', 1),
('ARL', 'Visa arrêtage livret', 'VA', 'VA_ARRET_LIV', 1),
('LOC', 'Attestation aptitude et autorisation location', 'VA', 'VA_LOCATION', 1),
('CAR', 'Attestation de caractéristiques', 'VA', 'VA_ATT_CARAC', 1),
('EXP', 'Expertise et contre-expertise', 'VA', 'VA_EXPERTISE', 1),
('CDN', 'Évaluation et condamnation véhicule', 'VA', 'VA_CONDAMN', 1),
('TCH', 'Test chauffeur', 'VA', 'VA_TEST_CHAUF', 1)
ON CONFLICT (type_code) DO NOTHING;

INSERT INTO workflow.wf_referentiel_etat(etat_code, etat_libelle, jasper, etat_type, etat_view)
SELECT v.etat_code, v.etat_libelle, v.jasper, 'P', v.etat_view
FROM (VALUES
  ('ET_QUITUS_RECENS','Quitus de recensement','quitus_recensement.jrxml','traitement_siigpe.v_va_recens'),
  ('ET_PV_CONSTAT','PV de constatation technique','pv_constatation.jrxml','traitement_siigpe.v_va_constat'),
  ('ET_BC_VISE','Bon de commande visé','bc_vise.jrxml','traitement_siigpe.v_va_visa_bc'),
  ('ET_PV_RECEPT','PV de réception technique','pv_reception.jrxml','traitement_siigpe.v_va_recept'),
  ('ET_PV_ORDRE_REC','PV ordre de recette','pv_ordre_recette.jrxml','traitement_siigpe.v_va_recept_neuf'),
  ('ET_LIVRET_VISE','Visa arrêtage livret','livret_vise.jrxml','traitement_siigpe.v_va_arret_liv'),
  ('ET_ATT_APTITUDE','Attestation aptitude','attestation_aptitude.jrxml','traitement_siigpe.v_va_location'),
  ('ET_ATT_CARAC','Attestation de caractéristiques','attestation_caracteristique.jrxml','traitement_siigpe.v_va_att_carac')
) AS v(etat_code, etat_libelle, jasper, etat_view)
WHERE NOT EXISTS (
  SELECT 1 FROM workflow.wf_referentiel_etat e WHERE e.etat_code = v.etat_code
);

-- Modèle AUGURE : 1 activité par processus (nommée d'après le processus),
-- portant une chaîne de 6 tâches ordonnées (tache_avant/tache_suivant).
-- Remplace l'ancien seed (6 activités x 1 tâche/processus) - voir purge ci-dessous
-- pour rester rejouable sur une base déjà initialisée avec l'ancienne forme.
DO $$
DECLARE
  p record;
  acts text[] := ARRAY['DEPOT_DOSSIER','CONTROLE_PIECES','TRAITEMENT_TECHNIQUE','VISA_VALIDATION','EDITION_LIVRABLE','ARCHIVAGE'];
  libs text[] := ARRAY['Dépôt du dossier','Contrôle des pièces','Traitement technique','Visa / Validation','Édition du livrable','Archivage'];
  roles text[] := ARRAY['AGENT_SAISIE','AGENT_CONTROLE','EXPERT_TECH','CHEF_SRB','ADMIN','ADMIN'];
  i int;
  v_activite text;
BEGIN
  -- Purge de l'ancien seed (activite_code = <processus>_<ETAPE>) au profit du
  -- nouveau (activite_code = <processus>_ACTIVITE).
  DELETE FROM workflow.wf_tache_role_entite t
  USING workflow.wf_activite a
  WHERE t.activite_code = a.activite_code
    AND a.processus_code LIKE 'VA_%'
    AND a.activite_code <> a.processus_code || '_ACTIVITE';

  DELETE FROM workflow.wf_activite
  WHERE processus_code LIKE 'VA_%'
    AND activite_code <> processus_code || '_ACTIVITE';

  FOR p IN SELECT processus_code, processus_libelle FROM workflow.wf_processus WHERE processus_code LIKE 'VA_%'
  LOOP
    v_activite := p.processus_code || '_ACTIVITE';

    IF NOT EXISTS (
      SELECT 1 FROM workflow.wf_activite
      WHERE processus_code = p.processus_code AND activite_code = v_activite
    ) THEN
      INSERT INTO workflow.wf_activite(
        activite_code, activite_libelle, processus_code,
        activite_avant, activite_suivant, entite_code, url, rang
      )
      VALUES (
        v_activite, 'Activité ' || p.processus_libelle, p.processus_code,
        NULL, NULL, 'BSCVA', '/dossiers/' || p.processus_code, 1
      );
    END IF;

    FOR i IN 1..array_length(acts,1) LOOP
      IF NOT EXISTS (
        SELECT 1 FROM workflow.wf_tache_role_entite
        WHERE activite_code = v_activite AND tache_code = acts[i]
      ) THEN
        INSERT INTO workflow.wf_tache_role_entite(
          tache_code, tache_libelle, activite_code,
          tache_avant, tache_suivant,
          role_code, url, sous_entite_code, rang, page, duree, "condition"
        )
        VALUES (
          acts[i], libs[i], v_activite,
          CASE WHEN i > 1 THEN acts[i-1] END,
          CASE WHEN i < array_length(acts,1) THEN acts[i+1] END,
          roles[i],
          '/dossiers/' || p.processus_code || '/' || lower(acts[i]),
          'BSCVA',
          i,
          lower(acts[i]),
          NULL,
          CASE WHEN acts[i] = 'VISA_VALIDATION' THEN 'VISA|REFUS' END
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;

/* ------------------------------------------------------------
   3.9) Complète VISA_VALIDATION en OR à 3 rôles (CHEF_BSCVA, CHEF_DRPE, CHEF_SRB) — conforme à la
   conception d'origine (rapport.txt §3.3 : "VISA_VALIDATION → CHEF_BSCVA, CHEF_DRPE, CHEF_SRB"),
   pas une escalade séquentielle. Le seed ci-dessus n'avait câblé que CHEF_SRB. wf_tache_role_entite
   n'a pas de contrainte d'unicité sur (activite_code, tache_code) — plusieurs rôles peuvent
   légitimement coexister pour la même tâche (sémantique OR, vérifiée côté Java par
   DossierService.verifierRoleAutorise/mesTaches). Idempotent : n'ajoute que les rôles manquants,
   ne duplique jamais CHEF_SRB.
   ------------------------------------------------------------ */
DO $$
DECLARE
  p record;
  v_activite text;
  v_role text;
  roles_a_ajouter text[] := ARRAY['CHEF_BSCVA','CHEF_DRPE'];
  tache_ref record;
BEGIN
  FOR p IN SELECT processus_code FROM workflow.wf_processus WHERE processus_code LIKE 'VA_%'
  LOOP
    v_activite := p.processus_code || '_ACTIVITE';

    SELECT tache_libelle, tache_avant, tache_suivant, url, sous_entite_code, rang, page, duree, "condition"
    INTO tache_ref
    FROM workflow.wf_tache_role_entite
    WHERE activite_code = v_activite AND tache_code = 'VISA_VALIDATION'
    LIMIT 1;

    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    FOREACH v_role IN ARRAY roles_a_ajouter LOOP
      IF NOT EXISTS (
        SELECT 1 FROM workflow.wf_tache_role_entite
        WHERE activite_code = v_activite AND tache_code = 'VISA_VALIDATION' AND role_code = v_role
      ) THEN
        INSERT INTO workflow.wf_tache_role_entite(
          tache_code, tache_libelle, activite_code, tache_avant, tache_suivant,
          role_code, url, sous_entite_code, rang, page, duree, "condition"
        )
        VALUES (
          'VISA_VALIDATION', tache_ref.tache_libelle, v_activite, tache_ref.tache_avant, tache_ref.tache_suivant,
          v_role, tache_ref.url, tache_ref.sous_entite_code, tache_ref.rang, tache_ref.page, tache_ref.duree, tache_ref."condition"
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;

/* ------------------------------------------------------------
   4) Pièces exigibles par type d'acte (contrôle de complétude)
      Codes type_acte courts compatibles ancienne base :
      REC, CST, VBC, RCT, RNE, ARL, LOC, CAR
   ------------------------------------------------------------ */

INSERT INTO referentiel_siigpe.rsi_piece_dossier(type_code, piece_libelle, obligatoire, rang)
VALUES
-- I — Recensement
('REC', 'Bordereau d''envoi (contact + n° téléphone)', 1, 1),
('REC', 'Demande de recensement (Mme le Chef SRB Analamanga)', 1, 2),
('REC', 'Livret (GSS, SA, PE)', 1, 3),
('REC', 'Photocopie carte grise ou rose', 1, 4),

-- II — Constatation
('CST', 'Bordereau d''envoi (contact + tél pour rendez-vous)', 1, 1),
('CST', 'Demande de constatation technique (M. le Chef SRB)', 1, 2),
('CST', 'Photocopie quitus de l''année en cours', 1, 3),
('CST', 'Proposition de constatation', 1, 4),
('CST', 'Livret (GSS, SA, PE)', 1, 5),
('CST', 'Photocopie carte grise', 1, 6),
('CST', 'Note de présentation / explicative (si anomalies)', 0, 7),

-- III — Visa BC
('VBC', 'Bordereau d''envoi (contact + tél)', 1, 1),
('VBC', 'Demande de visa de bon de commande (Mme le Chef SRB)', 1, 2),
('VBC', 'Photocopie quitus de l''année en cours', 1, 3),
('VBC', 'Photocopie carte grise ou rose', 1, 4),
('VBC', 'Photocopie PV de constatation technique', 1, 5),
('VBC', 'Bon de commande original', 1, 6),
('VBC', 'Photocopie du bon de commande', 1, 7),
('VBC', 'Photocopie NIF/STAT fournisseur', 1, 8),
('VBC', 'Facture pro-forma + photocopie', 1, 9),
('VBC', 'Photocopie convention ou marché', 1, 10),
('VBC', 'Livret Service Automobile (SA) renseigné', 1, 11),
('VBC', 'Note explicative (si TEF visé par le CF avant visa)', 0, 12),

-- IV — Réception technique
('RCT', 'Bordereau d''envoi (contact + tél pour rendez-vous)', 1, 1),
('RCT', 'Demande de réception technique (Mme le Chef SRB)', 1, 2),
('RCT', 'Photocopie quitus de l''année en cours', 1, 3),
('RCT', 'Photocopie PV de constatation', 1, 4),
('RCT', 'Photocopie du bon de commande', 1, 5),
('RCT', 'Photocopie NIF/STAT fournisseur', 1, 6),
('RCT', 'Photocopie TEF', 1, 7),
('RCT', 'Liste de pièces remplacées', 1, 8),

-- V — Réception VA neuf
('RNE', 'Bordereau d''envoi (contact + tél pour rendez-vous)', 1, 1),
('RNE', 'Demande de réception technique (M. le Chef SRB)', 1, 2),
('RNE', 'Photocopie quitus de l''année en cours', 1, 3),
('RNE', 'Liste des véhicules à réceptionner', 1, 4),
('RNE', 'Photocopie carte rose ou grise des véhicules', 1, 5),
('RNE', 'Photocopie légalisée marché ou convention', 1, 6),
('RNE', 'Décision de nomination du dépositaire comptable', 1, 7),
('RNE', 'Décision de nomination des membres de commission (1 président + 2 membres)', 1, 8),

-- VI — Arrêtage livret
('ARL', 'Bordereau d''envoi (contact + tél)', 1, 1),
('ARL', 'Demande de visa arrêtage livret (Mme le Chef SRB)', 1, 2),
('ARL', 'Attestation de catégorie (véhicule de fonction)', 0, 3),
('ARL', 'Les 3 livrets arrêtés au 31/12 (par rubrique)', 1, 4),
('ARL', 'Photocopie du dernier bon de commande', 1, 5),
('ARL', 'Note explicative (renouvellement / égaré / anomalie)', 0, 6),

-- VII — Location
('LOC', 'Bordereau d''envoi (contact + tél pour rendez-vous)', 1, 1),
('LOC', 'Demande d''attestation d''aptitude / de location (Mme le Chef SRB)', 1, 2),
('LOC', 'Photocopie carte grise ou carte rose', 1, 3),
('LOC', 'Contrat de location original + photocopie', 1, 4),
('LOC', 'Photocopie NIF/STAT fournisseur', 1, 5),
('LOC', 'Photocopie facture pro-forma / marché / convention', 1, 6),

-- VIII — Attestation de caractéristiques
('CAR', 'Bordereau d''envoi (contact + tél pour rendez-vous)', 1, 1),
('CAR', 'Demande d''attestation de caractéristiques (Mme le Chef SRB)', 1, 2),
('CAR', 'Photocopie de la carte grise', 1, 3),
('CAR', 'Attestation de déclaration de perte', 1, 4)
ON CONFLICT (type_code, piece_libelle) DO NOTHING;


/* ============================================================
   PLATEFORME VA — SEED RÉFÉRENTIELS (bscva)
   Source : onglet 'Fiche de Constatation' + 'DIGITALISATION VA 2026'
   ============================================================ */

-- Types de livret
INSERT INTO referentiel_siigpe.rsi_type_livret(type_livret_code,type_livret_libelle) VALUES
  ('SA','Livret Service Automobile'),
  ('GSS','Livret Garage Station Service'),
  ('PARCOURS','Livret Parcours (véhicule de service)')
ON CONFLICT (type_livret_code) DO NOTHING;

-- Sections et éléments de la Fiche de Constatation technique
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('MOTEUR','MOTEUR',1)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('ORGANE_DE_TRANSMISSION_ET_D_UT','ORGANE DE  TRANSMISSION  ET  D’UTILISATION',2)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('SYSTEME_DE_FREINAGE','SYSTEME  DE  FREINAGE',3)
ON CONFLICT (section_code) DO NOTHING;
-- Correctif : point-virgule erroné coupant l'INSERT avant sa clause ON CONFLICT (celle-ci se
-- retrouvait alors seule, syntaxiquement invalide) — constaté au premier chargement réel.
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('TRAINS_ET_SUSPENSION_AVANT_ET_','TRAINS  ET  SUSPENSION  (avant  et  arrière)',4)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('SYSTEME_DE_DIRECTION','SYSTEME  DE  DIRECTION',5)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('ALIMENTATION_CARBURANT','ALIMENTATION  CARBURANT',6)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('SYSTEME_DE_REFROIDISSEMENT_MOT','SYSTEME DE REFROIDISSEMENT  MOTEUR',7)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('ELECTRICITE','ELECTRICITE',8)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('CLIMATISATION','CLIMATISATION',9)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('TOLERIE','TOLERIE',10)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('CAPITONNAGE','CAPITONNAGE',11)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('VITRERIE','VITRERIE',12)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('OPTIQUES','OPTIQUES',13)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('FIBRES_PLASTIQUES','FIBRES  PLASTIQUES',14)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('PEINTURES','PEINTURES',15)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('PNEUMATIQUE','PNEUMATIQUE',16)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_section_constatation(section_code,section_libelle,rang) VALUES ('REGLAGES','REGLAGES',17)
ON CONFLICT (section_code) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Culasse',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='MOTEUR'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Turbo',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='MOTEUR'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Système admission air',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='MOTEUR'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Bas  moteur',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='MOTEUR'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Collecteur échappement',5 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='MOTEUR'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Filtres',6 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='MOTEUR'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Courroies crantée',7 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='MOTEUR'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Tendeur',8 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='MOTEUR'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Avertisseur  sonore',9 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='MOTEUR'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Supports  moteur',10 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='MOTEUR'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Boîte de  vitesse',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ORGANE_DE_TRANSMISSION_ET_D_UT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Boîte de   transfert',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ORGANE_DE_TRANSMISSION_ET_D_UT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Relais',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ORGANE_DE_TRANSMISSION_ET_D_UT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Système d’embrayage',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ORGANE_DE_TRANSMISSION_ET_D_UT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Pont avant',5 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ORGANE_DE_TRANSMISSION_ET_D_UT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Pont  arrière',6 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ORGANE_DE_TRANSMISSION_ET_D_UT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Arbre transmission',7 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ORGANE_DE_TRANSMISSION_ET_D_UT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Supports boîte',8 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ORGANE_DE_TRANSMISSION_ET_D_UT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Disques/Plaquette/ Ferodo',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_FREINAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Tambours',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_FREINAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Cylindre  de  roues',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_FREINAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Etriers',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_FREINAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Garnitures',5 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_FREINAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Pompe centrale',6 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_FREINAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Servofrein',7 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_FREINAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Circuit  freinage',8 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_FREINAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Frein à  main',9 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_FREINAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Barre  de  torsion',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TRAINS_ET_SUSPENSION_AVANT_ET_'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Barre stabilisatrice',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TRAINS_ET_SUSPENSION_AVANT_ET_'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Biellettes  barre  stabilisatrice',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TRAINS_ET_SUSPENSION_AVANT_ET_'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Bras de suspension',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TRAINS_ET_SUSPENSION_AVANT_ET_'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Sillent bloc   bras',5 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TRAINS_ET_SUSPENSION_AVANT_ET_'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Ressorts / Amortisseurs',6 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TRAINS_ET_SUSPENSION_AVANT_ET_'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Roulements',7 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TRAINS_ET_SUSPENSION_AVANT_ET_'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Rotules  pivot',8 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TRAINS_ET_SUSPENSION_AVANT_ET_'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Colonne de direction',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_DIRECTION'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Servodirection',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_DIRECTION'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Boîtiers  de direction',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_DIRECTION'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Cylindres direction',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_DIRECTION'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Crémaillère',5 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_DIRECTION'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Barre d’accouplement',6 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_DIRECTION'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Pompe assistée',7 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_DIRECTION'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Bielle d’accouplement',8 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_DIRECTION'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Réservoir',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ALIMENTATION_CARBURANT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Pompe à main',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ALIMENTATION_CARBURANT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Pompe HP',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ALIMENTATION_CARBURANT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Capteurs',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ALIMENTATION_CARBURANT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Rampe  commune',5 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ALIMENTATION_CARBURANT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Carburateurs',6 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ALIMENTATION_CARBURANT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Injecteurs',7 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ALIMENTATION_CARBURANT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Pompe  à eau',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_REFROIDISSEMENT_MOT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Radiateur',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_REFROIDISSEMENT_MOT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Visco coupleur',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_REFROIDISSEMENT_MOT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Durites',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_REFROIDISSEMENT_MOT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Thermostats',5 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_REFROIDISSEMENT_MOT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Ventilateur',6 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_REFROIDISSEMENT_MOT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Thermo  contact',7 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_REFROIDISSEMENT_MOT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Vase  expansion',8 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='SYSTEME_DE_REFROIDISSEMENT_MOT'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Calculateur',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Modules',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Bougies',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Bobines',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Faisceaux',5 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Allumeur',6 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Préchauffage',7 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Temporisateur',8 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Eclairage (Codes, phares, stop, clignotant, position, recul…)',9 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Batterie',10 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Alternateur',11 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Démarreur',12 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Régulateur',13 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Courroies',14 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Tendeur',15 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Tableau  de  bord',16 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Voyants',17 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Tachymètre',18 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Compte tour',19 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='ELECTRICITE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Compresseur',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='CLIMATISATION'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Condenseur',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='CLIMATISATION'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Tuyauterie',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='CLIMATISATION'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Carrosserie (Portières, capot, Hayon, Ailes)',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TOLERIE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Pares choc',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TOLERIE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Châssis',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TOLERIE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Longeron',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TOLERIE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Berceau',5 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TOLERIE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Bas de  caisse / Passage  roues',6 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='TOLERIE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Sièges',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='CAPITONNAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Capitonnage intérieur',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='CAPITONNAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Console  de bord',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='CAPITONNAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Serrures',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='CAPITONNAGE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Pare-brise',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='VITRERIE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Lunette  arrière',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='VITRERIE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Vitres  portières',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='VITRERIE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Custode G/D',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='VITRERIE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Retro viseurs',5 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='VITRERIE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Globes  G/D',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='OPTIQUES'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Clignotant AVG/AVD',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='OPTIQUES'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Feux arrières G/D',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='OPTIQUES'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Elargisseurs',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='FIBRES_PLASTIQUES'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Pare choc',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='FIBRES_PLASTIQUES'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Baguettes',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='FIBRES_PLASTIQUES'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Calendres',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='FIBRES_PLASTIQUES'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Extérieure  et Intérieure',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='PEINTURES'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'AVG  …………………….%',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='PNEUMATIQUE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'AVD …………………….%',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='PNEUMATIQUE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'ARG …………………….%',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='PNEUMATIQUE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'ARD …………………….%',4 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='PNEUMATIQUE'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Equilibrage',1 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='REGLAGES'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Carrossage',2 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='REGLAGES'
ON CONFLICT (section_id, element_libelle) DO NOTHING;
INSERT INTO referentiel_siigpe.rsi_element_constatation(section_id,element_libelle,rang) SELECT section_id,'Parallélisme',3 FROM referentiel_siigpe.rsi_section_constatation WHERE section_code='REGLAGES'
ON CONFLICT (section_id, element_libelle) DO NOTHING;




/* =====================================================================
   16. CORRECTIONS FINALES INTÉGRÉES
   ===================================================================== */

/* ---------------------------------------------------------------------
   16.1/16.2 — table dossier_vehicule_ligne et compléments dossier_piece :
   déplacées/pliées directement dans les CREATE TABLE
   traitement_siigpe.tsi_dossier_vehicule_ligne / ts_dossier_piece
   ci-dessus lors de la bascule bscva → traitement_siigpe (2026-09-02).
   --------------------------------------------------------------------- */

/* ---------------------------------------------------------------------
   16.3. Complément des documents générés
   --------------------------------------------------------------------- */

ALTER TABLE document.document_genere
ADD COLUMN IF NOT EXISTS chemin_fichier_source text,
ADD COLUMN IF NOT EXISTS hash_fichier varchar(255),
ADD COLUMN IF NOT EXISTS qr_code varchar(255);

ALTER TABLE document.document_genere
DROP CONSTRAINT IF EXISTS document_genere_statut_chk;

ALTER TABLE document.document_genere
ADD CONSTRAINT document_genere_statut_chk
CHECK (statut IN (
    'BROUILLON',
    'VALIDE',
    'ANNULE',
    'REMPLACE'
));


/* ---------------------------------------------------------------------
   16.4. Historique des impressions et réimpressions
   --------------------------------------------------------------------- */

CREATE TABLE IF NOT EXISTS document.document_impression (
    document_impression_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id            uuid NOT NULL,
    imprime_par            varchar(6),
    date_impression        timestamp DEFAULT CURRENT_TIMESTAMP,
    motif                  text,
    adresse_ip             varchar(100),

    CONSTRAINT document_impression_document_fk
        FOREIGN KEY (document_id)
        REFERENCES document.document_genere(document_id)
);


/* ---------------------------------------------------------------------
   16.5. Colonnes métier normalisées sur certains processus : decision
   (visa_bon_commande), avis (reception_technique), avis_aptitude
   (controle_aptitude) — pliées directement dans les CREATE TABLE
   traitement_siigpe.ts_* ci-dessus lors de la bascule (2026-09-02).
   --------------------------------------------------------------------- */


/* ---------------------------------------------------------------------
   16.6. Suppression logique + audit commun
   (le fragment ts_dossier_piece est déjà plié dans son CREATE TABLE)
   --------------------------------------------------------------------- */

ALTER TABLE traitement_siigpe.tsi_entite_vehicule
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamp,
ADD COLUMN IF NOT EXISTS deleted_by varchar(6),
ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_by varchar(6),
ADD COLUMN IF NOT EXISTS updated_at timestamp,
ADD COLUMN IF NOT EXISTS updated_by varchar(6);

ALTER TABLE document.document_genere
ADD COLUMN IF NOT EXISTS is_deleted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at timestamp,
ADD COLUMN IF NOT EXISTS deleted_by varchar(6),
ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_by varchar(6),
ADD COLUMN IF NOT EXISTS updated_at timestamp,
ADD COLUMN IF NOT EXISTS updated_by varchar(6);


/* ---------------------------------------------------------------------
   16.7. Index importants pour les recherches et les jointures
   --------------------------------------------------------------------- */

CREATE INDEX IF NOT EXISTS idx_workflow_dossier_type_acte
ON workflow.wf_dossier(type_acte);

CREATE INDEX IF NOT EXISTS idx_workflow_dossier_ministere
ON workflow.wf_dossier(ministere_code);

CREATE INDEX IF NOT EXISTS idx_workflow_dossier_date_depot
ON workflow.wf_dossier(dossier_date_depot);

CREATE INDEX IF NOT EXISTS idx_entite_vehicule_immatriculation
ON traitement_siigpe.tsi_entite_vehicule(vehicule_immatriculation);

CREATE INDEX IF NOT EXISTS idx_entite_vehicule_ministere
ON traitement_siigpe.tsi_entite_vehicule(min_code);

CREATE INDEX IF NOT EXISTS idx_entite_vehicule_soa
ON traitement_siigpe.tsi_entite_vehicule(soa_depositaire);

CREATE INDEX IF NOT EXISTS idx_entite_vehicule_etat
ON traitement_siigpe.tsi_entite_vehicule(etat_vehicule);

CREATE INDEX IF NOT EXISTS idx_entite_vehicule_statut
ON traitement_siigpe.tsi_entite_vehicule(statut);

CREATE INDEX IF NOT EXISTS idx_document_genere_reference
ON document.document_genere(reference_acte);

CREATE INDEX IF NOT EXISTS idx_document_genere_numero
ON document.document_genere(numero_document);

CREATE INDEX IF NOT EXISTS idx_document_genere_statut
ON document.document_genere(statut);

CREATE INDEX IF NOT EXISTS idx_document_impression_document
ON document.document_impression(document_id);

/* ---------------------------------------------------------------------
   16.9. Modèles de documents principaux
   --------------------------------------------------------------------- */

INSERT INTO document.modele_document (
    code,
    libelle,
    type_acte,
    fichier_modele,
    format_modele,
    actif
)
VALUES
('QUITUS_RECENSEMENT', 'Quitus de recensement', 'REC', 'jasper/quitus_recensement.jrxml', 'JASPER', 1),
('FICHE_CONSTATATION', 'Fiche de diagnostic technique', 'CST', 'jasper/fiche_constatation.jrxml', 'JASPER', 1),
('PV_CONSTATATION', 'Procès-verbal de constatation technique', 'CST', 'jasper/pv_constatation.jrxml', 'JASPER', 1),
('BC_VISE', 'Bon de commande visé ou refusé', 'VBC', 'jasper/bc_vise.jrxml', 'JASPER', 1),
('PV_RECEPTION', 'PV de réception technique', 'RCT', 'jasper/pv_reception.jrxml', 'JASPER', 1),
('PV_ORDRE_RECETTE', 'PV d''ordre de recette véhicule nouvellement acquis', 'RNE', 'jasper/pv_ordre_recette.jrxml', 'JASPER', 1),
('VISA_ARRETAGE_LIVRET', 'Visa arrêtage livret', 'ARL', 'jasper/visa_arretage_livret.jrxml', 'JASPER', 1),
('ATTESTATION_APTITUDE', 'Attestation d''aptitude', 'LOC', 'jasper/attestation_aptitude.jrxml', 'JASPER', 1),
('AUTORISATION_LOCATION', 'Autorisation de location', 'LOC', 'jasper/autorisation_location.jrxml', 'JASPER', 1),
('ATTESTATION_CARACTERISTIQUE', 'Attestation de caractéristiques', 'CAR', 'jasper/attestation_caracteristique.jrxml', 'JASPER', 1),
('RAPPORT_EXPERTISE', 'Rapport d''expertise / contre-expertise', 'EXP', 'jasper/rapport_expertise.jrxml', 'JASPER', 1),
('PV_CONDAMNATION', 'PV d''évaluation et de mise à prix', 'CDN', 'jasper/pv_condamnation.jrxml', 'JASPER', 1)
ON CONFLICT (code) DO NOTHING;

/* =====================================================================
   17. AJOUT TEST CHAUFFEUR — résultats de test de conduite
       (table traitement_siigpe.tsi_chauffeur_test déjà créée plus haut lors
       de la bascule bscva → traitement_siigpe du 2026-09-02 ; ce modèle de
       document reste ici tel quel)
   ===================================================================== */

INSERT INTO document.modele_document (code, libelle, type_acte, fichier_modele, format_modele, actif)
VALUES ('RESULTAT_TEST_CHAUFFEUR', 'Résultat de test chauffeur', 'TCH', 'jasper/resultat_test_chauffeur.jrxml', 'JASPER', 1)
ON CONFLICT (code) DO NOTHING;

/* =====================================================================
   18. COMPLÉMENTS RÉFÉRENTIELS + WORKFLOW POUR EXP/CDN/TCH + COMPTES DE TEST
       (migration additive, idempotente et non destructive — ajoutée le 2026-09-01 pour
       aligner Script.sql sur ce qu'attendent à la fois le frontend mock (dpe-srb-vehicules,
       src/lib/fixtures/referentiels.fixtures.ts — valeurs reprises mot pour mot ci-dessous)
       et le backend api-financiere (17 modules Spring Boot). Testé sur une base vierge
       (bscva_local) ET sur une copie réelle de la base SIIGPE/AUGURE existante (augure_local) :
       aucune collision de role_code/type_code, tables déjà existantes structurellement
       identiques à celles créées plus haut dans ce fichier.)
   ===================================================================== */

/* ---------------------------------------------------------------------
   18.1. Référentiels véhicule (referentiel_siigpe.*) — tables créées en
   section 2 mais jamais seedées. Valeurs reprises du mock frontend.
   --------------------------------------------------------------------- */

INSERT INTO referentiel_siigpe.rsi_categorie_vehicule (categorie_code, categorie_libelle) VALUES
  ('BERLINE', 'Berline'),
  ('4X4',     'Tout-terrain (4x4)'),
  ('CAMION',  'Camion'),
  ('MOTO',    'Moto'),
  ('BUS',     'Bus / Minibus'),
  ('PICKUP',  'Pick-up')
ON CONFLICT (categorie_code) DO NOTHING;

INSERT INTO referentiel_siigpe.rsi_categorie_utilisation_vehicule (categorie_utilisation, categorie_utilisation_libelle) VALUES
  ('1', 'Représentation'),
  ('2', 'Fonction'),
  ('3', 'Service')
ON CONFLICT (categorie_utilisation) DO NOTHING;

INSERT INTO referentiel_siigpe.rsi_energie_vehicule (energie_code, energie_libelle) VALUES
  ('ESSENCE',    'Essence'),
  ('GASOIL',     'Gasoil'),
  ('HYBRIDE',    'Hybride'),
  ('ELECTRIQUE', 'Électrique')
ON CONFLICT (energie_code) DO NOTHING;

INSERT INTO referentiel_siigpe.rsi_etat_vehicule (etat_vehicule, etat_libelle) VALUES
  ('BON',     'Bon état'),
  ('MOYEN',   'État moyen'),
  ('MAUVAIS', 'Mauvais état'),
  ('HS',      'Hors service')
ON CONFLICT (etat_vehicule) DO NOTHING;

INSERT INTO referentiel_siigpe.rsi_genre_vehicule (genre_code, genre_libelle) VALUES
  ('VP',   'Véhicule particulier'),
  ('VU',   'Véhicule utilitaire'),
  ('CTTE', 'Camionnette'),
  ('TCP',  'Transport en commun de personnes')
ON CONFLICT (genre_code) DO NOTHING;

INSERT INTO referentiel_siigpe.rsi_carrosserie_vehicule (carrosserie_code, carrosserie_libelle) VALUES
  ('BERLINE', 'Berline'),
  ('BREAK',   'Break'),
  ('4X4',     'Tout-terrain'),
  ('PLATEAU', 'Plateau')
ON CONFLICT (carrosserie_code) DO NOTHING;

/* ---------------------------------------------------------------------
   18.2. traitement_siigpe.tsi_vehicule_marque — VRAIE cible de la FK
   entite_vehicule.vehicule_marque_id (pas referentiel_siigpe.rsi_marque_vehicule,
   qui est une table séparée sans FK — vérifié via information_schema, voir
   plan api-financiere). Pas de colonne "code" ni de contrainte UNIQUE sur le
   nom dans cette table : idempotence assurée par WHERE NOT EXISTS plutôt que
   ON CONFLICT.
   --------------------------------------------------------------------- */

INSERT INTO traitement_siigpe.tsi_vehicule_marque (vehicule_marque_nom)
SELECT v.nom FROM (VALUES
  ('Toyota'), ('Nissan'), ('Mitsubishi'), ('Hyundai'), ('Mercedes-Benz')
) AS v(nom)
WHERE NOT EXISTS (
  SELECT 1 FROM traitement_siigpe.tsi_vehicule_marque m WHERE m.vehicule_marque_nom = v.nom
);

/* ---------------------------------------------------------------------
   18.3. wf_referentiel_etat pour EXP/CDN/TCH — même patron que les 8
   entrées déjà seedées plus haut (ET_QUITUS_RECENS...ET_ATT_CARAC). Les
   vues traitement_siigpe.v_va_* référencées ne sont pas créées ici (aucune des 8
   déjà existantes ne l'est non plus dans ce script — chantier reporting
   séparé, non bloquant pour le CRUD).
   --------------------------------------------------------------------- */

INSERT INTO workflow.wf_referentiel_etat(etat_code, etat_libelle, jasper, etat_type, etat_view)
SELECT v.etat_code, v.etat_libelle, v.jasper, 'P', v.etat_view
FROM (VALUES
  ('ET_RAPPORT_EXP', 'Rapport expertise / contre-expertise', 'rapport_expertise.jrxml', 'traitement_siigpe.v_va_expertise'),
  ('ET_PV_CONDAMNATION', 'PV de condamnation', 'pv_condamnation.jrxml', 'traitement_siigpe.v_va_condamnation'),
  ('ET_RESULT_TEST_CHAUF', 'Résultat test chauffeur', 'resultat_test_chauffeur.jrxml', 'traitement_siigpe.v_va_test_chauffeur')
) AS v(etat_code, etat_libelle, jasper, etat_view)
WHERE NOT EXISTS (
  SELECT 1 FROM workflow.wf_referentiel_etat e WHERE e.etat_code = v.etat_code
);

/* ---------------------------------------------------------------------
   18.4. Comptes de test BSCVA — 9 utilisateurs fictifs dédiés (matricules
   900001-900009, hors plage des matricules réels), un par rôle. N'affecte
   aucun compte réel existant. Mot de passe en clair ("password") : le
   hachage n'est pas encore implémenté côté backend (voir plan api-financiere,
   point de vigilance déjà documenté) — à réaligner quand ce sera corrigé.
   --------------------------------------------------------------------- */

-- Ni wf_utilisateur (PK = id_utilisateur uuid généré aléatoirement, jamais en conflit) ni
-- wf_utilisateur_role (aucune contrainte unique déclarée du tout) n'ont de contrainte sur
-- laquelle un ON CONFLICT DO NOTHING pourrait s'appuyer — rejouer le script dupliquerait ces
-- lignes à chaque exécution. Idempotence assurée ici par WHERE NOT EXISTS, comme pour 18.2.
-- Mot de passe : hash BCrypt de 'password' (coût 10), généré avec le même
-- BCryptPasswordEncoder que RuleAuthentificationController.java (voir db/README.md,
-- correctif 2026-09-04) — le texte clair d'origine cassait la comparaison BCrypt ajoutée
-- côté login. Toujours 'password' en clair pour se connecter, seul le stockage a changé.
INSERT INTO workflow.wf_utilisateur
  (utilisateur_matricule, utilisateur_nom, utilisateur_prenom, utilisateur_password, login, sigle, site, statut, application_code)
SELECT v.matricule, v.nom, v.prenom, v.password, v.login, v.sigle, v.site, v.statut, v.application_code
FROM (VALUES
  ('900001', 'BSCVA', 'Admin',        '$2a$10$2/dkxh2yYRY5uZhNZbxiweFH6tZQkziMi2xo.67fsiwClME057Ute', 'bscva.admin',        'ADM',  'BSCVA', 1, 4),
  ('900002', 'BSCVA', 'AgentSaisie',  '$2a$10$2/dkxh2yYRY5uZhNZbxiweFH6tZQkziMi2xo.67fsiwClME057Ute', 'bscva.saisie',       'AGS',  'BSCVA', 1, 4),
  ('900003', 'BSCVA', 'AgentControle','$2a$10$2/dkxh2yYRY5uZhNZbxiweFH6tZQkziMi2xo.67fsiwClME057Ute', 'bscva.controle',     'AGC',  'BSCVA', 1, 4),
  ('900004', 'BSCVA', 'ExpertTech',   '$2a$10$2/dkxh2yYRY5uZhNZbxiweFH6tZQkziMi2xo.67fsiwClME057Ute', 'bscva.expert',       'EXT',  'BSCVA', 1, 4),
  ('900005', 'BSCVA', 'ChefBscva',    '$2a$10$2/dkxh2yYRY5uZhNZbxiweFH6tZQkziMi2xo.67fsiwClME057Ute', 'bscva.chef.bscva',   'CHB',  'BSCVA', 1, 4),
  ('900006', 'BSCVA', 'ChefDrpe',     '$2a$10$2/dkxh2yYRY5uZhNZbxiweFH6tZQkziMi2xo.67fsiwClME057Ute', 'bscva.chef.drpe',    'CHD',  'BSCVA', 1, 4),
  ('900007', 'BSCVA', 'ChefSrb',      '$2a$10$2/dkxh2yYRY5uZhNZbxiweFH6tZQkziMi2xo.67fsiwClME057Ute', 'bscva.chef.srb',     'CHS',  'BSCVA', 1, 4),
  ('900008', 'BSCVA', 'Depositaire',  '$2a$10$2/dkxh2yYRY5uZhNZbxiweFH6tZQkziMi2xo.67fsiwClME057Ute', 'bscva.depositaire',  'DEP',  'BSCVA', 1, 4),
  ('900009', 'BSCVA', 'Consult',      '$2a$10$2/dkxh2yYRY5uZhNZbxiweFH6tZQkziMi2xo.67fsiwClME057Ute', 'bscva.consult',      'CON',  'BSCVA', 1, 4)
) AS v(matricule, nom, prenom, password, login, sigle, site, statut, application_code)
WHERE NOT EXISTS (
  SELECT 1 FROM workflow.wf_utilisateur u WHERE u.utilisateur_matricule = v.matricule
);

INSERT INTO workflow.wf_utilisateur_role (utilisateur_matricule, role_code, uadm_code, application_code)
SELECT v.matricule, v.role_code, v.uadm_code, v.application_code
FROM (VALUES
  ('900001', 'ADMIN',           'BSCVA', 4),
  ('900002', 'AGENT_SAISIE',    'BSCVA', 4),
  ('900003', 'AGENT_CONTROLE',  'BSCVA', 4),
  ('900004', 'EXPERT_TECH',     'BSCVA', 4),
  ('900005', 'CHEF_BSCVA',      'BSCVA', 4),
  ('900006', 'CHEF_DRPE',       'BSCVA', 4),
  ('900007', 'CHEF_SRB',        'BSCVA', 4),
  ('900008', 'DEPOSITAIRE_CPT', 'BSCVA', 4),
  ('900009', 'CONSULT',         'BSCVA', 4)
) AS v(matricule, role_code, uadm_code, application_code)
WHERE NOT EXISTS (
  SELECT 1 FROM workflow.wf_utilisateur_role r
  WHERE r.utilisateur_matricule = v.matricule AND r.role_code = v.role_code
);

-- Migration 2026-09-08 : les comptes/rôles SIIGPE (uadm_code='BSCVA') utilisaient par erreur
-- application_code=1, qui sur une base réelle (augure_local) correspond à l'application AUGURE
-- Administratif déjà existante (collision) — migrés vers le code 4 dédié 'SIIGPE' (§1 ci-dessus).
-- Idempotent : la clause application_code=1 ne retrouve plus rien après le premier passage.
UPDATE workflow.wf_utilisateur_role SET application_code = 4
WHERE uadm_code = 'BSCVA' AND application_code = 1;

UPDATE workflow.wf_utilisateur SET application_code = 4
WHERE application_code = 1
  AND utilisateur_matricule IN (
      SELECT utilisateur_matricule FROM workflow.wf_utilisateur_role WHERE uadm_code = 'BSCVA'
  );

/* ---------------------------------------------------------------------
   18.5. referentiel_siigpe.rsi_piece_dossier pour EXP/CDN/TCH — BROUILLON
   PROVISOIRE, non issu d'un document métier officiel (contrairement aux 8
   listes ci-dessus en §1504-1576, sourcées de "DIGITALISATION VA 2026") :
   À VALIDER OU CORRIGER PAR LE MÉTIER AVANT MISE EN PRODUCTION. Construit
   par analogie structurelle avec les 8 processus existants et les champs
   réels des tables tsi_expertise_accident / tsi_evaluation_condamnation /
   tsi_chauffeur_test.
   --------------------------------------------------------------------- */

INSERT INTO referentiel_siigpe.rsi_piece_dossier(type_code, piece_libelle, obligatoire, rang)
VALUES
-- IX — Expertise / contre-expertise (BROUILLON)
('EXP', 'Bordereau d''envoi (contact + tél pour rendez-vous)', 1, 1),
('EXP', 'Demande d''expertise / contre-expertise (Mme le Chef SRB)', 1, 2),
('EXP', 'Photocopie carte grise ou rose du véhicule administratif', 1, 3),
('EXP', 'Rapport de police ou de gendarmerie / constat d''accident', 1, 4),
('EXP', 'Photocopie carte grise du véhicule privé impliqué (contre-expertise)', 0, 5),
('EXP', 'Devis de réparation ou facture pro-forma des dommages', 1, 6),

-- X — Condamnation / évaluation véhicule (BROUILLON)
('CDN', 'Bordereau d''envoi (contact + tél)', 1, 1),
('CDN', 'Demande d''évaluation et de mise à prix (Mme le Chef SRB)', 1, 2),
('CDN', 'Photocopie carte grise ou rose', 1, 3),
('CDN', 'Fiche technique du véhicule', 1, 4),
('CDN', 'Photocopie du dernier PV de constatation technique', 1, 5),
('CDN', 'Note explicative du motif de condamnation', 0, 6),

-- XI — Test chauffeur (BROUILLON)
('TCH', 'Bordereau d''envoi (contact + tél pour rendez-vous)', 1, 1),
('TCH', 'Demande de test de conduite (Mme/M. le Chef SRB)', 1, 2),
('TCH', 'Photocopie CIN du chauffeur', 1, 3),
('TCH', 'Photocopie permis de conduire', 1, 4),
('TCH', 'Décision d''affectation ou de nomination du chauffeur (SOA)', 0, 5)
ON CONFLICT (type_code, piece_libelle) DO NOTHING;

/* ---------------------------------------------------------------------
   18.6. Champs recensement sans équivalent dans le schéma d'origine —
   std/ctd (ts_recensement) et type (ts_recensement_ligne) existaient déjà
   côté frontend (mock) mais n'avaient jamais été portés en base. ALTER TABLE
   (pas CREATE TABLE IF NOT EXISTS, sans effet sur une table déjà existante)
   pour rester idempotent sur bscva_local ET augure_local.
   --------------------------------------------------------------------- */

ALTER TABLE traitement_siigpe.tsi_recensement ADD COLUMN IF NOT EXISTS std varchar(100);
ALTER TABLE traitement_siigpe.tsi_recensement ADD COLUMN IF NOT EXISTS ctd varchar(100);
ALTER TABLE traitement_siigpe.tsi_recensement_ligne ADD COLUMN IF NOT EXISTS type varchar(100);

/* ---------------------------------------------------------------------
   18.7. numero_arretage — existait côté frontend (mock) sans colonne réelle
   correspondante, renseigné au moment de la génération du visa d'arrêtage
   livret (pas à la création du dossier).
   --------------------------------------------------------------------- */
ALTER TABLE traitement_siigpe.tsi_arretage_livret ADD COLUMN IF NOT EXISTS numero_arretage varchar(20);

/* ---------------------------------------------------------------------
   18.8. tsi_entite_vehicule.district_id/commune_id : uuid -> varchar + FK
   réelle vers referentiel_national.rn_district/rn_commune (clés varchar,
   jamais des uuid — colonnes toujours NULL jusqu'ici, aucune donnée à
   convertir). Le formulaire véhicule demande déjà districtCode/communeCode
   en champs requis, jamais persistés faute de colonnes compatibles.
   valeur_estimative : idem, déjà demandé côté formulaire, aucune colonne.
   N'affecte PAS traitement_siigpe.tsi_information_utilisation_vehicule,
   qui a les mêmes colonnes mais n'est utilisée nulle part dans le code.
   --------------------------------------------------------------------- */

ALTER TABLE traitement_siigpe.tsi_entite_vehicule
  ALTER COLUMN district_id TYPE varchar(3) USING district_id::text,
  ALTER COLUMN commune_id TYPE varchar(5) USING commune_id::text;

-- PostgreSQL n'a pas de ADD CONSTRAINT IF NOT EXISTS — encadré d'un test pg_constraint pour
-- rester idempotent au rejeu (même patron que le renommage de contraintes rsi_* précédent).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'tsi_entite_vehicule_district_fk'
    ) THEN
        ALTER TABLE traitement_siigpe.tsi_entite_vehicule
            ADD CONSTRAINT tsi_entite_vehicule_district_fk FOREIGN KEY (district_id) REFERENCES referentiel_national.rn_district(district_code);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'tsi_entite_vehicule_commune_fk'
    ) THEN
        ALTER TABLE traitement_siigpe.tsi_entite_vehicule
            ADD CONSTRAINT tsi_entite_vehicule_commune_fk FOREIGN KEY (commune_id) REFERENCES referentiel_national.rn_commune(commune_code);
    END IF;
END $$;

ALTER TABLE traitement_siigpe.tsi_entite_vehicule
  ADD COLUMN IF NOT EXISTS valeur_estimative numeric;

/* ---------------------------------------------------------------------
   18.9. Historisation de l'état mutable du véhicule par campagne de
   recensement — retour métier : SOA/détenteur/type/catégorie d'utilisation/
   état général/carte grise/livrets peuvent changer d'une année sur l'autre
   pour un même véhicule (ex. réaffecté à un autre SOA), donc ne doivent
   PAS être écrits dans tsi_entite_vehicule (fiche permanente) mais dans une
   table d'état historisé, une ligne active par véhicule + lignes archivées
   à chaque revalidation — même patron que traitement_siigpe.tsi_vehicule_
   detenteur déjà en place (actif=1 = ligne courante), alimentée uniquement
   à la validation du dossier de recensement (RecensementService.
   validerRecensement), jamais au brouillon.

   tsi_recensement_ligne gagne soa_code (le SOA est une propriété par
   véhicule recensé, pas par dossier — le canevas papier l'affiche en
   colonne du tableau véhicule) et std_ctd (fusion des deux anciens champs
   d'en-tête std/ctd §18.6 en un champ libre optionnel, porté par le
   véhicule plutôt que par le dossier). tsi_recensement.niveau redevient
   son intention documentée d'origine (le TYPE Central/Régional, voir
   §906) ; niveau_libelle porte le nom libre associé (ex. "District
   d'Antananarivo VI").
   --------------------------------------------------------------------- */

ALTER TABLE traitement_siigpe.tsi_recensement ADD COLUMN IF NOT EXISTS niveau_libelle varchar(250);

ALTER TABLE traitement_siigpe.tsi_recensement_ligne ADD COLUMN IF NOT EXISTS soa_code varchar(20);
ALTER TABLE traitement_siigpe.tsi_recensement_ligne ADD COLUMN IF NOT EXISTS std_ctd varchar(150);
CREATE INDEX IF NOT EXISTS idx_recensement_ligne_vehicule_soa ON traitement_siigpe.tsi_recensement_ligne(vehicule_id, soa_code);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_vehicule_etat (
    rs_vehicule_etat_id  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicule_id          uuid NOT NULL REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id),
    reference_acte       varchar(19),
    soa_code             varchar(20),
    detenteur_effectif   varchar(250),
    type                 varchar(100),
    categorie_utilisation varchar(1),
    etat_general         varchar(1),
    carte_grise_dispo    varchar(1),
    livrets_dispo        varchar(1),
    std_ctd              varchar(150),
    exercice             varchar(4),
    date_validation      timestamp DEFAULT CURRENT_TIMESTAMP,
    valide_par           varchar(6),
    actif                numeric DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_rsi_vehicule_etat_vehicule ON referentiel_siigpe.rsi_vehicule_etat(vehicule_id, actif);

/* ---------------------------------------------------------------------
   18.10. Non-doublon recensement : un même véhicule ne doit pas être
   recensé deux fois la même année pour le même SOA (contrôlé côté
   applicatif dans RecensementService.creerRecensement — pas de contrainte
   UNIQUE ici, un même véhicule DOIT pouvoir apparaître dans deux
   recensements distincts la même année si le SOA diffère). Index de
   support pour cette vérification.
   --------------------------------------------------------------------- */
CREATE INDEX IF NOT EXISTS idx_recensement_date_saisie ON traitement_siigpe.tsi_recensement(date_saisie);

/* ---------------------------------------------------------------------
   18.11. Refonte Constatation technique (retour BSCVA) — la STRUCTURE
   (ex-SOA) saisie par l'utilisateur est désormais persistée (confrontée
   au dernier recensement du véhicule côté ConstatationService, voir
   verifierVehiculeRecense) au lieu d'être résolue par jointure obsolète
   vers tsi_entite_vehicule.soa_depositaire. Le chauffeur passe en champ
   libre côté frontend (nom_chauffeur, déjà varchar sans FK, inchangé) +
   nouveau champ contact. Accessoires indispensables : nouvelle table,
   miroir exact de tsi_constatation_piece_remplacer/tsi_constatation_
   reparation (n'existait nulle part avant, y compris en base).
   --------------------------------------------------------------------- */
ALTER TABLE traitement_siigpe.tsi_constatation_technique ADD COLUMN IF NOT EXISTS soa_code varchar(20);
ALTER TABLE traitement_siigpe.tsi_constatation_technique ADD COLUMN IF NOT EXISTS chauffeur_contact varchar(20);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_constatation_accessoire (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    constatation_id uuid NOT NULL,
    libelle varchar(250) NOT NULL,
    rang numeric NULL,
    CONSTRAINT constatation_accessoire_pk PRIMARY KEY (id),
    CONSTRAINT constatation_accessoire_fk FOREIGN KEY (constatation_id) REFERENCES traitement_siigpe.tsi_constatation_technique(constatation_id)
);

/* ---------------------------------------------------------------------
   18.12. Kilométrage saisi lors d'une constatation technique répercuté sur
   la fiche véhicule permanente (retour BSCVA) — écrit directement par
   ConstatationService via le hub partagé, même patron que CondamnationService
   qui écrit déjà sur tsi_entite_vehicule depuis un autre module.
   --------------------------------------------------------------------- */
ALTER TABLE traitement_siigpe.tsi_entite_vehicule ADD COLUMN IF NOT EXISTS kilometrage numeric;

/* ---------------------------------------------------------------------
   18.13. Visa bon de commande (retour BSCVA) — adresse du fournisseur et
   année de la carte fiscale (contrôle purement informatif côté applicatif,
   non bloquant, voir VisaBcService — pas de contrainte CHECK ici).
   --------------------------------------------------------------------- */
ALTER TABLE traitement_siigpe.tsi_visa_bon_commande ADD COLUMN IF NOT EXISTS adresse_fournisseur varchar(250);
ALTER TABLE traitement_siigpe.tsi_visa_bon_commande ADD COLUMN IF NOT EXISTS annee_carte_fiscale varchar(4);

/* ---------------------------------------------------------------------
   18.14. Signataire configurable (retour BSCVA) — "Le Chef de Service
   Régional du Budget Analamanga" était codé en dur sur les 12 livrables
   générés (PDF Jasper + aperçus HTML) ; désormais lu depuis ce référentiel
   à chaque génération, éditable depuis Administration > Référentiels, sans
   effet rétroactif sur les documents déjà générés (fichiers statiques).
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_signataire (
    signataire_id     uuid NOT NULL DEFAULT gen_random_uuid(),
    signataire_code   varchar(30) NOT NULL,
    signataire_titre  varchar(250) NOT NULL,
    CONSTRAINT signataire_pk PRIMARY KEY (signataire_id),
    CONSTRAINT signataire_code_uk UNIQUE (signataire_code)
);
INSERT INTO referentiel_siigpe.rsi_signataire (signataire_code, signataire_titre)
VALUES ('CHEF_SRB_BUDGET', 'Le Chef de Service Régional du Budget Analamanga')
ON CONFLICT (signataire_code) DO NOTHING;

/* ---------------------------------------------------------------------
   18.15. Référentiel Experts — utilisé par les listes déroulantes
   "Expert" de Constatation technique et de Réception technique (au lieu
   des comptes utilisateurs de rôle EXPERT_TECH), éditable depuis
   Administration > Référentiels. Volontairement non pré-remplie.
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_expert (
    expert_id  uuid NOT NULL DEFAULT gen_random_uuid(),
    expert_nom varchar(250) NOT NULL,
    CONSTRAINT expert_pk PRIMARY KEY (expert_id)
);

/* ---------------------------------------------------------------------
   18.16. Réception véhicule neuf — 3 types d'acquisition (DOTATION /
   TRANSFERT / ACHAT), financement Convention|Marché + nom du financement,
   année de carte fiscale du fournisseur, commission scindée (membres
   entité / membres DPE), structure bénéficiaire, heure du PV ; lignes :
   kilométrage, valeur, observation. date_consultation et
   decision_commission restent en base, inertes (retirés de l'écran).
   --------------------------------------------------------------------- */
ALTER TABLE traitement_siigpe.tsi_reception_va_neuf ADD COLUMN IF NOT EXISTS nom_financement varchar(250);
ALTER TABLE traitement_siigpe.tsi_reception_va_neuf ADD COLUMN IF NOT EXISTS fournisseur_annee_carte_fiscale varchar(4);
ALTER TABLE traitement_siigpe.tsi_reception_va_neuf ADD COLUMN IF NOT EXISTS commission_membres_entite text;
ALTER TABLE traitement_siigpe.tsi_reception_va_neuf ADD COLUMN IF NOT EXISTS commission_membres_dpe text;
ALTER TABLE traitement_siigpe.tsi_reception_va_neuf ADD COLUMN IF NOT EXISTS soa_code varchar(20);
ALTER TABLE traitement_siigpe.tsi_reception_va_neuf ADD COLUMN IF NOT EXISTS heure_pv varchar(10);
ALTER TABLE traitement_siigpe.tsi_reception_neuf_ligne ADD COLUMN IF NOT EXISTS kilometrage numeric;
ALTER TABLE traitement_siigpe.tsi_reception_neuf_ligne ADD COLUMN IF NOT EXISTS valeur numeric;
ALTER TABLE traitement_siigpe.tsi_reception_neuf_ligne ADD COLUMN IF NOT EXISTS observation varchar(250);

-- Migration des anciennes valeurs (idempotente) : DONATION -> DOTATION ; CONVENTION/MARCHE -> ACHAT
-- avec financement = ancienne valeur (le 1er UPDATE ne touche que les lignes encore à l'ancien format).
UPDATE traitement_siigpe.tsi_reception_va_neuf SET type_acquisition = 'DOTATION' WHERE type_acquisition = 'DONATION';
UPDATE traitement_siigpe.tsi_reception_va_neuf SET financement = type_acquisition, type_acquisition = 'ACHAT'
 WHERE type_acquisition IN ('CONVENTION', 'MARCHE');

/* ---------------------------------------------------------------------
   18.17. Fiche d'évaluation du véhicule (composant réutilisable :
   réception neuve, réception technique, évaluation/condamnation).
   Référentiel section/élément propre (2 valeurs possibles par élément,
   ex. AV/AR) — distinct de la grille de constatation (C/N).
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_section_evaluation (
    section_evaluation_id uuid NOT NULL DEFAULT gen_random_uuid(),
    section_code          varchar(30) NOT NULL,
    section_libelle       varchar(150) NOT NULL,
    rang                  numeric NULL,
    CONSTRAINT section_evaluation_pk PRIMARY KEY (section_evaluation_id),
    CONSTRAINT section_evaluation_uk UNIQUE (section_code)
);

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_element_evaluation (
    element_evaluation_id uuid NOT NULL DEFAULT gen_random_uuid(),
    section_evaluation_id uuid NOT NULL,
    element_libelle       varchar(200) NOT NULL,
    rang                  numeric NULL,
    libelle_valeur1       varchar(20) NULL,   -- NULL = une seule valeur, sans étiquette
    libelle_valeur2       varchar(20) NULL,   -- non NULL = second pourcentage (ex. AV / AR)
    CONSTRAINT element_evaluation_pk PRIMARY KEY (element_evaluation_id),
    CONSTRAINT element_evaluation_fk FOREIGN KEY (section_evaluation_id)
        REFERENCES referentiel_siigpe.rsi_section_evaluation(section_evaluation_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS element_evaluation_uk
    ON referentiel_siigpe.rsi_element_evaluation(section_evaluation_id, element_libelle);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_evaluation_fiche (
    fiche_id           uuid NOT NULL DEFAULT gen_random_uuid(),
    reference_acte     varchar(19) NOT NULL,
    vehicule_id        uuid NULL,
    immatriculation    varchar(20) NULL,
    kilometrage        numeric NULL,
    observation        text NULL,
    rang               numeric NULL,
    date_saisie        date NULL,
    utilisateur_saisie varchar(6) NULL,
    CONSTRAINT evaluation_fiche_pk PRIMARY KEY (fiche_id)
);
CREATE INDEX IF NOT EXISTS idx_evaluation_fiche_reference ON traitement_siigpe.tsi_evaluation_fiche(reference_acte);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_evaluation_fiche_element (
    id                    uuid NOT NULL DEFAULT gen_random_uuid(),
    fiche_id              uuid NOT NULL,
    element_evaluation_id uuid NOT NULL,
    valeur1               numeric NULL,
    valeur2               numeric NULL,
    CONSTRAINT evaluation_fiche_element_pk PRIMARY KEY (id),
    CONSTRAINT evaluation_fiche_element_fiche_fk FOREIGN KEY (fiche_id)
        REFERENCES traitement_siigpe.tsi_evaluation_fiche(fiche_id),
    CONSTRAINT evaluation_fiche_element_ref_fk FOREIGN KEY (element_evaluation_id)
        REFERENCES referentiel_siigpe.rsi_element_evaluation(element_evaluation_id)
);

INSERT INTO referentiel_siigpe.rsi_section_evaluation (section_code, section_libelle, rang) VALUES
('CARROSSERIE', 'Carrosserie', 1),
('PNEUMATIQUE', 'Pneumatique', 2),
('ECLAIRAGE', 'Éclairage', 3),
('MOTEUR', 'Moteur', 4),
('ORGANE_MECANIQUE', 'Organe mécanique', 5),
('SUSPENSION', 'Suspension', 6),
('FREINAGE', 'Freinage', 7),
('HABILLAGE_INTERIEUR', 'Habillage intérieur', 8)
ON CONFLICT (section_code) DO NOTHING;

INSERT INTO referentiel_siigpe.rsi_element_evaluation (section_evaluation_id, element_libelle, rang, libelle_valeur1, libelle_valeur2)
SELECT s.section_evaluation_id, v.libelle, v.rang, v.v1, v.v2
FROM (VALUES
  ('CARROSSERIE', 'Caisse', 1, NULL, NULL),
  ('CARROSSERIE', 'Cadre (moto)', 2, NULL, NULL),
  ('CARROSSERIE', 'Capot', 3, NULL, NULL),
  ('CARROSSERIE', 'Portière + Malle', 4, NULL, NULL),
  ('CARROSSERIE', 'Ailes AV/AR', 5, 'AIG', 'AID'),
  ('CARROSSERIE', 'Parechoc', 6, NULL, NULL),
  ('CARROSSERIE', 'Parebrise/Lunette AR', 7, NULL, NULL),
  ('CARROSSERIE', 'Plateau (camion/pickup)', 8, NULL, NULL),
  ('CARROSSERIE', 'Châssis', 9, NULL, NULL),
  ('PNEUMATIQUE', 'Jante', 1, 'AV', 'AR'),
  ('PNEUMATIQUE', 'Pneu', 2, 'AV', 'AR'),
  ('ECLAIRAGE', 'Feux AV', 1, NULL, NULL),
  ('ECLAIRAGE', 'Feux AR', 2, NULL, NULL),
  ('MOTEUR', 'Bloc + Accessoires', 1, NULL, NULL),
  ('MOTEUR', 'Calculateur', 2, NULL, NULL),
  ('ORGANE_MECANIQUE', 'Boîte de vitesse', 1, NULL, NULL),
  ('ORGANE_MECANIQUE', 'Système d''embrayage', 2, NULL, NULL),
  ('ORGANE_MECANIQUE', 'Boîte de transfert (4x4/Camion)', 3, NULL, NULL),
  ('ORGANE_MECANIQUE', 'Arbre de transmission', 4, NULL, NULL),
  ('ORGANE_MECANIQUE', 'Pont AV', 5, NULL, NULL),
  ('ORGANE_MECANIQUE', 'Pont AR', 6, NULL, NULL),
  ('SUSPENSION', 'Trains AV', 1, NULL, NULL),
  ('SUSPENSION', 'Trains AR', 2, NULL, NULL),
  ('SUSPENSION', 'Amortisseur', 3, 'AV', 'AR'),
  ('FREINAGE', 'Frein AV/AR', 1, 'AV', 'AR'),
  ('HABILLAGE_INTERIEUR', 'Sièges + capitonnage', 1, NULL, NULL),
  ('HABILLAGE_INTERIEUR', 'Capitonnage plafonnier', 2, NULL, NULL),
  ('HABILLAGE_INTERIEUR', 'Console de bord', 3, NULL, NULL)
) AS v(section_code, libelle, rang, v1, v2)
JOIN referentiel_siigpe.rsi_section_evaluation s ON s.section_code = v.section_code
ON CONFLICT (section_evaluation_id, element_libelle) DO NOTHING;

INSERT INTO document.modele_document (code, libelle, type_acte, fichier_modele, format_modele, actif)
VALUES ('FICHE_EVALUATION', 'Fiche d''évaluation du véhicule', 'CDN', 'jasper/fiche_evaluation.jrxml', 'JASPER', 1)
ON CONFLICT (code) DO NOTHING;

/* ---------------------------------------------------------------------
   18.18. Arrêtage livret — une table par feuille de livret (champs des
   feuilles papier : carburants et lubrifiants, pneumatiques et accessoires,
   entretien courant, réparations, parcours) + totaux et consommation
   persistés sur l'en-tête (prévisions et reporting). L'ancienne table
   plate tsi_arretage_livret_detail est conservée pour les dossiers
   existants mais n'est plus écrite par le nouvel écran.
   --------------------------------------------------------------------- */
ALTER TABLE traitement_siigpe.tsi_arretage_livret ADD COLUMN IF NOT EXISTS annee_arretage integer;
ALTER TABLE traitement_siigpe.tsi_arretage_livret ADD COLUMN IF NOT EXISTS type_carburant varchar(30);
ALTER TABLE traitement_siigpe.tsi_arretage_livret ADD COLUMN IF NOT EXISTS dotation_mensuelle numeric;
ALTER TABLE traitement_siigpe.tsi_arretage_livret ADD COLUMN IF NOT EXISTS dotation_exceptionnelle numeric;
ALTER TABLE traitement_siigpe.tsi_arretage_livret ADD COLUMN IF NOT EXISTS total_litres numeric;
ALTER TABLE traitement_siigpe.tsi_arretage_livret ADD COLUMN IF NOT EXISTS total_huile numeric;
ALTER TABLE traitement_siigpe.tsi_arretage_livret ADD COLUMN IF NOT EXISTS total_km numeric;
ALTER TABLE traitement_siigpe.tsi_arretage_livret ADD COLUMN IF NOT EXISTS total_pneumatiques numeric;
ALTER TABLE traitement_siigpe.tsi_arretage_livret ADD COLUMN IF NOT EXISTS total_reparations numeric;
ALTER TABLE traitement_siigpe.tsi_arretage_livret ADD COLUMN IF NOT EXISTS consommation_100km numeric;

ALTER TABLE referentiel_siigpe.rsi_arretage_livret ADD COLUMN IF NOT EXISTS annee_arretage integer;
ALTER TABLE referentiel_siigpe.rsi_arretage_livret ADD COLUMN IF NOT EXISTS type_carburant varchar(30);
ALTER TABLE referentiel_siigpe.rsi_arretage_livret ADD COLUMN IF NOT EXISTS total_litres numeric;
ALTER TABLE referentiel_siigpe.rsi_arretage_livret ADD COLUMN IF NOT EXISTS total_huile numeric;
ALTER TABLE referentiel_siigpe.rsi_arretage_livret ADD COLUMN IF NOT EXISTS total_km numeric;
ALTER TABLE referentiel_siigpe.rsi_arretage_livret ADD COLUMN IF NOT EXISTS total_pneumatiques numeric;
ALTER TABLE referentiel_siigpe.rsi_arretage_livret ADD COLUMN IF NOT EXISTS total_reparations numeric;
ALTER TABLE referentiel_siigpe.rsi_arretage_livret ADD COLUMN IF NOT EXISTS consommation_100km numeric;

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_arretage_carburant (
    id             uuid NOT NULL DEFAULT gen_random_uuid(),
    arretage_id    uuid NOT NULL,
    rang           numeric NULL,
    date_operation date NULL,
    nature         varchar(250) NULL,
    quantite_litres numeric NULL,
    huile_litres   numeric NULL,
    CONSTRAINT arretage_carburant_pk PRIMARY KEY (id),
    CONSTRAINT arretage_carburant_fk FOREIGN KEY (arretage_id) REFERENCES traitement_siigpe.tsi_arretage_livret(arretage_id)
);
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_arretage_pneumatique (
    id             uuid NOT NULL DEFAULT gen_random_uuid(),
    arretage_id    uuid NOT NULL,
    rang           numeric NULL,
    date_livraison date NULL,
    nature         varchar(250) NULL,
    prix           numeric NULL,
    CONSTRAINT arretage_pneumatique_pk PRIMARY KEY (id),
    CONSTRAINT arretage_pneumatique_fk FOREIGN KEY (arretage_id) REFERENCES traitement_siigpe.tsi_arretage_livret(arretage_id)
);
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_arretage_entretien (
    id             uuid NOT NULL DEFAULT gen_random_uuid(),
    arretage_id    uuid NOT NULL,
    rang           numeric NULL,
    kilometrage    numeric NULL,
    date_lavage    date NULL,
    date_vidange   date NULL,
    date_graissage date NULL,
    CONSTRAINT arretage_entretien_pk PRIMARY KEY (id),
    CONSTRAINT arretage_entretien_fk FOREIGN KEY (arretage_id) REFERENCES traitement_siigpe.tsi_arretage_livret(arretage_id)
);
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_arretage_reparation (
    id             uuid NOT NULL DEFAULT gen_random_uuid(),
    arretage_id    uuid NOT NULL,
    rang           numeric NULL,
    date_entree    date NULL,
    date_sortie    date NULL,
    nature         varchar(250) NULL,
    prix           numeric NULL,
    CONSTRAINT arretage_reparation_pk PRIMARY KEY (id),
    CONSTRAINT arretage_reparation_fk FOREIGN KEY (arretage_id) REFERENCES traitement_siigpe.tsi_arretage_livret(arretage_id)
);
CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_arretage_parcours (
    id             uuid NOT NULL DEFAULT gen_random_uuid(),
    arretage_id    uuid NOT NULL,
    rang           numeric NULL,
    date_sortie    date NULL,
    date_rentree   date NULL,
    motif          varchar(500) NULL,
    distance_km    numeric NULL,
    CONSTRAINT arretage_parcours_pk PRIMARY KEY (id),
    CONSTRAINT arretage_parcours_fk FOREIGN KEY (arretage_id) REFERENCES traitement_siigpe.tsi_arretage_livret(arretage_id)
);
CREATE INDEX IF NOT EXISTS idx_arretage_carburant_arretage ON traitement_siigpe.tsi_arretage_carburant(arretage_id);
CREATE INDEX IF NOT EXISTS idx_arretage_pneumatique_arretage ON traitement_siigpe.tsi_arretage_pneumatique(arretage_id);
CREATE INDEX IF NOT EXISTS idx_arretage_entretien_arretage ON traitement_siigpe.tsi_arretage_entretien(arretage_id);
CREATE INDEX IF NOT EXISTS idx_arretage_reparation_arretage ON traitement_siigpe.tsi_arretage_reparation(arretage_id);
CREATE INDEX IF NOT EXISTS idx_arretage_parcours_arretage ON traitement_siigpe.tsi_arretage_parcours(arretage_id);

/* ---------------------------------------------------------------------
   18.19. Évaluation / condamnation — PV d'évaluation (état actuel,
   dépréciation, valeur en AR, commission) et document « Mise à prix »
   (grille de prix par composant, jeu Véhicule ou Motocyclette). La
   valeur estimative (valeur_estimee) = somme des prix ; valeur_en_ar =
   valeur estimative × (1 − dépréciation %), calculés côté serveur.
   fiche_technique et mise_a_prix restent en base, inertes.
   --------------------------------------------------------------------- */
ALTER TABLE traitement_siigpe.tsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS type_mise_a_prix varchar(20);
ALTER TABLE traitement_siigpe.tsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS type_veh varchar(50);
ALTER TABLE traitement_siigpe.tsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS etat_actuel varchar(20);
ALTER TABLE traitement_siigpe.tsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS depreciation_pct numeric;
ALTER TABLE traitement_siigpe.tsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS valeur_en_ar numeric;
ALTER TABLE traitement_siigpe.tsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS date_pv date;
ALTER TABLE traitement_siigpe.tsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS heure_pv varchar(10);
ALTER TABLE traitement_siigpe.tsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS commission_membres_entite text;
ALTER TABLE traitement_siigpe.tsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS commission_membres_dpe text;
ALTER TABLE traitement_siigpe.tsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS soa_code varchar(20);
ALTER TABLE traitement_siigpe.tsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS ministere_code varchar(255);

ALTER TABLE referentiel_siigpe.rsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS type_mise_a_prix varchar(20);
ALTER TABLE referentiel_siigpe.rsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS etat_actuel varchar(20);
ALTER TABLE referentiel_siigpe.rsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS depreciation_pct numeric;
ALTER TABLE referentiel_siigpe.rsi_evaluation_condamnation ADD COLUMN IF NOT EXISTS valeur_en_ar numeric;

CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_section_mise_prix (
    section_id      uuid NOT NULL DEFAULT gen_random_uuid(),
    categorie       varchar(20) NOT NULL,          -- VEHICULE | MOTOCYCLE
    section_code    varchar(40) NOT NULL,
    section_libelle varchar(150) NOT NULL,
    ligne           integer NOT NULL DEFAULT 1,    -- rangée d'impression : les sections d'une même ligne partagent une rangée de la grille
    rang            integer NULL,
    CONSTRAINT section_mise_prix_pk PRIMARY KEY (section_id),
    CONSTRAINT section_mise_prix_uk UNIQUE (categorie, section_code)
);
CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_element_mise_prix (
    element_id      uuid NOT NULL DEFAULT gen_random_uuid(),
    section_id      uuid NOT NULL,
    element_libelle varchar(200) NOT NULL,
    rang            integer NULL,
    CONSTRAINT element_mise_prix_pk PRIMARY KEY (element_id),
    CONSTRAINT element_mise_prix_fk FOREIGN KEY (section_id) REFERENCES referentiel_siigpe.rsi_section_mise_prix(section_id)
);
CREATE UNIQUE INDEX IF NOT EXISTS element_mise_prix_uk ON referentiel_siigpe.rsi_element_mise_prix(section_id, element_libelle);

CREATE TABLE IF NOT EXISTS traitement_siigpe.tsi_evaluation_prix (
    id            uuid NOT NULL DEFAULT gen_random_uuid(),
    evaluation_id uuid NOT NULL,
    element_id    uuid NOT NULL,
    prix          numeric NULL,
    CONSTRAINT evaluation_prix_pk PRIMARY KEY (id),
    CONSTRAINT evaluation_prix_eval_fk FOREIGN KEY (evaluation_id) REFERENCES traitement_siigpe.tsi_evaluation_condamnation(evaluation_id),
    CONSTRAINT evaluation_prix_elt_fk FOREIGN KEY (element_id) REFERENCES referentiel_siigpe.rsi_element_mise_prix(element_id)
);
CREATE INDEX IF NOT EXISTS idx_evaluation_prix_evaluation ON traitement_siigpe.tsi_evaluation_prix(evaluation_id);

-- Seed d'après les photos « MISE A PRIX D'UN VEHICULE / D'UNE MOTOCYCLETTE A EVALUER »
INSERT INTO referentiel_siigpe.rsi_section_mise_prix (categorie, section_code, section_libelle, ligne, rang) VALUES
('VEHICULE',  'MOTEUR',            'MOTEUR', 1, 1),
('VEHICULE',  'CARROSSERIE',       'CARROSSERIE', 2, 2),
('VEHICULE',  'HABILLAGE',         'HABILLAGES INTERIEUR', 2, 3),
('VEHICULE',  'FREINAGE',          'FREINAGE AV/AR', 2, 4),
('VEHICULE',  'TRANSMISSION',      'ORGANE DE TRANSMISSION ET D''UTILISATION', 3, 5),
('VEHICULE',  'SUSPENSIONS',       'SUSPENSIONS (AV/AR)', 4, 6),
('VEHICULE',  'EQUIPEMENT_ELEC',   'EQUIPEMENT ELECTRIQUE', 4, 7),
('VEHICULE',  'PNEUMATIQUES',      'PNEUMATIQUES', 4, 8),
('MOTOCYCLE', 'MOTEUR',            'MOTEUR', 1, 1),
('MOTOCYCLE', 'ECHAPPEMENTS',      'ECHAPPEMENTS', 1, 2),
('MOTOCYCLE', 'AMORTISSEUR',       'AMORTISSEUR', 1, 3),
('MOTOCYCLE', 'CARENAGES',         'CARENAGES', 1, 4),
('MOTOCYCLE', 'CADRES',            'CADRES', 1, 5),
('MOTOCYCLE', 'EQUIPEMENTS_ELEC',  'EQUIPEMENTS ELECTRIQUES', 2, 6),
('MOTOCYCLE', 'PNEUMATIQUES',      'PNEUMATIQUES', 2, 7),
('MOTOCYCLE', 'FREINS',            'FREINS AV/AR', 2, 8)
ON CONFLICT (categorie, section_code) DO NOTHING;

INSERT INTO referentiel_siigpe.rsi_element_mise_prix (section_id, element_libelle, rang)
SELECT s.section_id, v.libelle, v.rang
FROM (VALUES
  ('VEHICULE',  'MOTEUR',          'Moteur', 1),
  ('VEHICULE',  'CARROSSERIE',     'Portières + malle', 1),
  ('VEHICULE',  'CARROSSERIE',     'Châssis', 2),
  ('VEHICULE',  'HABILLAGE',       'Sièges + capitonnage', 1),
  ('VEHICULE',  'HABILLAGE',       'Capitonnage plafonnier', 2),
  ('VEHICULE',  'HABILLAGE',       'Console de bord', 3),
  ('VEHICULE',  'FREINAGE',        'Freinage AV/AR', 1),
  ('VEHICULE',  'TRANSMISSION',    'Boîte de vitesse', 1),
  ('VEHICULE',  'TRANSMISSION',    'Embrayage', 2),
  ('VEHICULE',  'TRANSMISSION',    'Pont AR', 3),
  ('VEHICULE',  'TRANSMISSION',    'Arbre Tr', 4),
  ('VEHICULE',  'TRANSMISSION',    'Boîte de transfert', 5),
  ('VEHICULE',  'SUSPENSIONS',     'Trains AV', 1),
  ('VEHICULE',  'SUSPENSIONS',     'Trains AR', 2),
  ('VEHICULE',  'EQUIPEMENT_ELEC', 'Feux avants (x 2)', 1),
  ('VEHICULE',  'EQUIPEMENT_ELEC', 'Feux arrières (x 2)', 2),
  ('VEHICULE',  'PNEUMATIQUES',    'Jantes', 1),
  ('VEHICULE',  'PNEUMATIQUES',    'Enveloppe', 2),
  ('MOTOCYCLE', 'MOTEUR',          'Moteur', 1),
  ('MOTOCYCLE', 'ECHAPPEMENTS',    'Echappements', 1),
  ('MOTOCYCLE', 'AMORTISSEUR',     'Amortisseur', 1),
  ('MOTOCYCLE', 'CARENAGES',       'Carénages', 1),
  ('MOTOCYCLE', 'CADRES',          'Cadres', 1),
  ('MOTOCYCLE', 'EQUIPEMENTS_ELEC','Optique AV', 1),
  ('MOTOCYCLE', 'EQUIPEMENTS_ELEC','Optique AR', 2),
  ('MOTOCYCLE', 'PNEUMATIQUES',    'Jantes', 1),
  ('MOTOCYCLE', 'PNEUMATIQUES',    'Enveloppe', 2),
  ('MOTOCYCLE', 'FREINS',          'Freins AV/AR', 1)
) AS v(categorie, section_code, libelle, rang)
JOIN referentiel_siigpe.rsi_section_mise_prix s ON s.categorie = v.categorie AND s.section_code = v.section_code
ON CONFLICT (section_id, element_libelle) DO NOTHING;

INSERT INTO document.modele_document (code, libelle, type_acte, fichier_modele, format_modele, actif)
VALUES ('MISE_A_PRIX', 'Mise à prix d''un véhicule / d''une motocyclette', 'CDN', 'jasper/mise_a_prix.jrxml', 'JASPER', 1)
ON CONFLICT (code) DO NOTHING;

/* ---------------------------------------------------------------------
   18.20. Attestation de caractéristiques — champ « Observation » :
   enregistré en base (tsi puis rsi à la validation), jamais imprimé
   sur le livrable.
   --------------------------------------------------------------------- */
ALTER TABLE traitement_siigpe.tsi_attestation_caracteristique ADD COLUMN IF NOT EXISTS observation text NULL;
ALTER TABLE referentiel_siigpe.rsi_attestation_caracteristique ADD COLUMN IF NOT EXISTS observation text NULL;

/* ---------------------------------------------------------------------
   18.21. Brique IA / ML — socle de données (phase 1).
   - Référentiel annuel des tarifs (carburant, huile, entretien) : l'entretien
     courant du livret ne porte que des dates, le carburant que des litres.
   - Schéma `ia` : registre des modèles et tables de résultats (prévisions de
     dépense par véhicule et par STRUCTURE, anomalies de carburant, délai
     prévu des dossiers), séparés des données métier.
   - Vues d'extraction lues par le service Python (entraînement / évaluation).
   Définition retenue (décision métier) : dépense annuelle d'un véhicule =
   livret arrêté et validé (statut 'V') — carburant + huile (litres × tarif),
   pneumatiques et réparations (prix saisis), entretien (nombre d'opérations
   × tarif). Les bons de commande visés ne sont PAS additionnés (double
   compte) : ils ne servent que de variables explicatives / contrôle.
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS referentiel_siigpe.rsi_tarif_depense (
    tarif_id   uuid NOT NULL DEFAULT gen_random_uuid(),
    annee      integer NOT NULL,
    code       varchar(30) NOT NULL,      -- CARBURANT_ESSENCE | CARBURANT_GASOIL | HUILE | LAVAGE | VIDANGE | GRAISSAGE
    libelle    varchar(150) NOT NULL,
    unite      varchar(20) NOT NULL,      -- LITRE | OPERATION
    prix       numeric NOT NULL,          -- Ariary par unité
    CONSTRAINT tarif_depense_pk PRIMARY KEY (tarif_id),
    CONSTRAINT tarif_depense_uk UNIQUE (annee, code)
);

-- Valeurs INDICATIVES (ordres de grandeur 2025-2026), à remplacer par les prix officiels via Administration > Référentiels.
INSERT INTO referentiel_siigpe.rsi_tarif_depense (annee, code, libelle, unite, prix) VALUES
(2025, 'CARBURANT_ESSENCE', 'Essence (litre)', 'LITRE', 5300),
(2025, 'CARBURANT_GASOIL',  'Gasoil (litre)',  'LITRE', 4800),
(2025, 'HUILE',             'Huile moteur (litre)', 'LITRE', 30000),
(2025, 'LAVAGE',            'Lavage', 'OPERATION', 10000),
(2025, 'VIDANGE',           'Vidange (main d''oeuvre + filtre)', 'OPERATION', 40000),
(2025, 'GRAISSAGE',         'Graissage', 'OPERATION', 15000),
(2026, 'CARBURANT_ESSENCE', 'Essence (litre)', 'LITRE', 5400),
(2026, 'CARBURANT_GASOIL',  'Gasoil (litre)',  'LITRE', 4900),
(2026, 'HUILE',             'Huile moteur (litre)', 'LITRE', 32000),
(2026, 'LAVAGE',            'Lavage', 'OPERATION', 10000),
(2026, 'VIDANGE',           'Vidange (main d''oeuvre + filtre)', 'OPERATION', 42000),
(2026, 'GRAISSAGE',         'Graissage', 'OPERATION', 15000)
ON CONFLICT (annee, code) DO NOTHING;

CREATE SCHEMA IF NOT EXISTS ia;

CREATE TABLE IF NOT EXISTS ia.modele (
    modele_id          uuid NOT NULL DEFAULT gen_random_uuid(),
    code               varchar(40) NOT NULL,      -- DELAI_DOSSIER | DEPENSE_VEHICULE | GROSSE_REPARATION | ANOMALIE_CARBURANT
    version            varchar(20) NOT NULL,
    algorithme         varchar(150) NULL,
    date_entrainement  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    periode_donnees    varchar(100) NULL,         -- ex. « 2025 → 2026 »
    nb_exemples        integer NULL,
    metriques          jsonb NULL,                -- ex. {"mae": ..., "r2": ..., "baseline_mae": ...}
    parametres         jsonb NULL,
    actif              numeric NOT NULL DEFAULT 0, -- 1 = modèle utilisé par l'application (un seul par code)
    commentaire        text NULL,
    CONSTRAINT modele_pk PRIMARY KEY (modele_id),
    CONSTRAINT modele_uk UNIQUE (code, version)
);

CREATE TABLE IF NOT EXISTS ia.prevision_vehicule (
    id                        uuid NOT NULL DEFAULT gen_random_uuid(),
    modele_id                 uuid NOT NULL REFERENCES ia.modele(modele_id),
    vehicule_id               uuid NOT NULL REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id),
    annee_cible               integer NOT NULL,
    depense_prevue            numeric NULL,
    borne_basse               numeric NULL,
    borne_haute               numeric NULL,
    detail                    jsonb NULL,          -- par poste : carburant, huile, pneumatiques, entretien, reparations
    proba_grosse_reparation   numeric NULL,        -- 0..1 (modèle GROSSE_REPARATION)
    date_calcul               timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT prevision_vehicule_pk PRIMARY KEY (id),
    CONSTRAINT prevision_vehicule_uk UNIQUE (modele_id, vehicule_id, annee_cible)
);
CREATE INDEX IF NOT EXISTS idx_prevision_vehicule_vehicule ON ia.prevision_vehicule(vehicule_id, annee_cible);

CREATE TABLE IF NOT EXISTS ia.prevision_structure (
    id              uuid NOT NULL DEFAULT gen_random_uuid(),
    modele_id       uuid NOT NULL REFERENCES ia.modele(modele_id),
    soa_code        varchar(20) NOT NULL,
    annee_cible     integer NOT NULL,
    nb_vehicules    integer NULL,
    depense_prevue  numeric NULL,
    borne_basse     numeric NULL,
    borne_haute     numeric NULL,
    detail          jsonb NULL,
    date_calcul     timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT prevision_structure_pk PRIMARY KEY (id),
    CONSTRAINT prevision_structure_uk UNIQUE (modele_id, soa_code, annee_cible)
);

CREATE TABLE IF NOT EXISTS ia.anomalie_carburant (
    id                 uuid NOT NULL DEFAULT gen_random_uuid(),
    modele_id          uuid NOT NULL REFERENCES ia.modele(modele_id),
    vehicule_id        uuid NOT NULL REFERENCES traitement_siigpe.tsi_entite_vehicule(vehicule_id),
    mois               date NOT NULL,              -- 1er jour du mois
    litres             numeric NULL,
    km                 numeric NULL,
    consommation_100km numeric NULL,
    score              numeric NULL,               -- plus élevé = plus anormal
    est_anomalie       numeric NOT NULL DEFAULT 0, -- 0 | 1
    motif              varchar(500) NULL,
    statut             varchar(20) NOT NULL DEFAULT 'NOUVELLE',  -- NOUVELLE | VERIFIEE | JUSTIFIEE
    date_calcul        timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT anomalie_carburant_pk PRIMARY KEY (id),
    CONSTRAINT anomalie_carburant_uk UNIQUE (modele_id, vehicule_id, mois),
    CONSTRAINT anomalie_carburant_statut_chk CHECK (statut IN ('NOUVELLE','VERIFIEE','JUSTIFIEE'))
);

CREATE TABLE IF NOT EXISTS ia.prevision_delai_dossier (
    id               uuid NOT NULL DEFAULT gen_random_uuid(),
    modele_id        uuid NOT NULL REFERENCES ia.modele(modele_id),
    reference_acte   varchar(19) NOT NULL,
    delai_prevu_jours numeric NULL,
    borne_basse      numeric NULL,
    borne_haute      numeric NULL,
    date_calcul      timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT prevision_delai_dossier_pk PRIMARY KEY (id),
    CONSTRAINT prevision_delai_dossier_uk UNIQUE (modele_id, reference_acte)
);

-- Vues d'extraction (recréées à chaque rejeu : DROP puis CREATE, dans l'ordre des dépendances)
DROP VIEW IF EXISTS ia.v_vehicule_annuel;
DROP VIEW IF EXISTS ia.v_depense_vehicule_annuelle;
DROP VIEW IF EXISTS ia.v_carburant_mensuel;
DROP VIEW IF EXISTS ia.v_delai_dossier;

/* Dépense annuelle par véhicule × année d'arrêtage (livrets validés). */
CREATE VIEW ia.v_depense_vehicule_annuelle AS
WITH a AS (
    SELECT l.arretage_id, l.vehicule_id, l.annee_arretage AS annee,
           CASE
             WHEN upper(coalesce(l.type_carburant, '')) LIKE '%ESS%' THEN 'CARBURANT_ESSENCE'
             WHEN upper(coalesce(l.type_carburant, '')) LIKE '%GAS%'
               OR upper(coalesce(l.type_carburant, '')) LIKE '%DIES%' THEN 'CARBURANT_GASOIL'
             WHEN ev.vehicule_source_energie = 'ESSENCE' THEN 'CARBURANT_ESSENCE'
             WHEN ev.vehicule_source_energie = 'GASOIL' THEN 'CARBURANT_GASOIL'
             ELSE NULL
           END AS code_carburant
    FROM traitement_siigpe.tsi_arretage_livret l
    LEFT JOIN traitement_siigpe.tsi_entite_vehicule ev ON ev.vehicule_id = l.vehicule_id
    WHERE l.statut = 'V' AND l.vehicule_id IS NOT NULL AND l.annee_arretage IS NOT NULL
),
agg AS (
    SELECT a.vehicule_id, a.annee, max(a.code_carburant) AS code_carburant,
      coalesce(sum((SELECT sum(c.quantite_litres) FROM traitement_siigpe.tsi_arretage_carburant c WHERE c.arretage_id = a.arretage_id)), 0) AS litres,
      coalesce(sum((SELECT sum(c.huile_litres) FROM traitement_siigpe.tsi_arretage_carburant c WHERE c.arretage_id = a.arretage_id)), 0) AS huile_litres,
      coalesce(sum((SELECT sum(p.distance_km) FROM traitement_siigpe.tsi_arretage_parcours p WHERE p.arretage_id = a.arretage_id)), 0) AS km,
      coalesce(sum((SELECT count(e.date_lavage) FROM traitement_siigpe.tsi_arretage_entretien e WHERE e.arretage_id = a.arretage_id)), 0) AS nb_lavages,
      coalesce(sum((SELECT count(e.date_vidange) FROM traitement_siigpe.tsi_arretage_entretien e WHERE e.arretage_id = a.arretage_id)), 0) AS nb_vidanges,
      coalesce(sum((SELECT count(e.date_graissage) FROM traitement_siigpe.tsi_arretage_entretien e WHERE e.arretage_id = a.arretage_id)), 0) AS nb_graissages,
      coalesce(sum((SELECT count(*) FROM traitement_siigpe.tsi_arretage_pneumatique p WHERE p.arretage_id = a.arretage_id)), 0) AS nb_pneumatiques,
      coalesce(sum((SELECT sum(p.prix) FROM traitement_siigpe.tsi_arretage_pneumatique p WHERE p.arretage_id = a.arretage_id)), 0) AS cout_pneumatiques,
      coalesce(sum((SELECT count(*) FROM traitement_siigpe.tsi_arretage_reparation r WHERE r.arretage_id = a.arretage_id)), 0) AS nb_reparations,
      coalesce(sum((SELECT sum(r.prix) FROM traitement_siigpe.tsi_arretage_reparation r WHERE r.arretage_id = a.arretage_id)), 0) AS cout_reparations,
      coalesce(sum((SELECT max(r.prix) FROM traitement_siigpe.tsi_arretage_reparation r WHERE r.arretage_id = a.arretage_id)), 0) AS plus_grosse_reparation,
      coalesce(sum((SELECT sum(r.date_sortie - r.date_entree) FROM traitement_siigpe.tsi_arretage_reparation r
                     WHERE r.arretage_id = a.arretage_id AND r.date_sortie >= r.date_entree)), 0) AS jours_immobilisation
    FROM a
    GROUP BY a.vehicule_id, a.annee
)
SELECT g.vehicule_id, g.annee, g.code_carburant,
       g.litres, g.huile_litres, g.km,
       g.nb_lavages, g.nb_vidanges, g.nb_graissages,
       g.nb_pneumatiques, g.nb_reparations, g.plus_grosse_reparation, g.jours_immobilisation,
       CASE WHEN g.km > 0 THEN round(g.litres / g.km * 100, 2) END AS consommation_100km,
       round(g.litres * coalesce(tc.prix, 0)) AS cout_carburant,
       round(g.huile_litres * coalesce(th.prix, 0)) AS cout_huile,
       g.cout_pneumatiques,
       round(g.nb_lavages * coalesce(tl.prix, 0) + g.nb_vidanges * coalesce(tv.prix, 0) + g.nb_graissages * coalesce(tg.prix, 0)) AS cout_entretien,
       g.cout_reparations,
       round(g.litres * coalesce(tc.prix, 0)) + round(g.huile_litres * coalesce(th.prix, 0)) + g.cout_pneumatiques
         + round(g.nb_lavages * coalesce(tl.prix, 0) + g.nb_vidanges * coalesce(tv.prix, 0) + g.nb_graissages * coalesce(tg.prix, 0))
         + g.cout_reparations AS depense_totale,
       (tc.prix IS NULL AND g.litres > 0) AS tarif_carburant_manquant
FROM agg g
LEFT JOIN referentiel_siigpe.rsi_tarif_depense tc ON tc.annee = g.annee AND tc.code = g.code_carburant
LEFT JOIN referentiel_siigpe.rsi_tarif_depense th ON th.annee = g.annee AND th.code = 'HUILE'
LEFT JOIN referentiel_siigpe.rsi_tarif_depense tl ON tl.annee = g.annee AND tl.code = 'LAVAGE'
LEFT JOIN referentiel_siigpe.rsi_tarif_depense tv ON tv.annee = g.annee AND tv.code = 'VIDANGE'
LEFT JOIN referentiel_siigpe.rsi_tarif_depense tg ON tg.annee = g.annee AND tg.code = 'GRAISSAGE';

/* Carburant et kilomètres par véhicule × mois (livrets validés) — base de la détection d'anomalies. */
CREATE VIEW ia.v_carburant_mensuel AS
WITH carb AS (
    SELECT l.vehicule_id, date_trunc('month', c.date_operation)::date AS mois,
           sum(c.quantite_litres) AS litres, sum(c.huile_litres) AS huile_litres, count(*) AS nb_pleins
    FROM traitement_siigpe.tsi_arretage_livret l
    JOIN traitement_siigpe.tsi_arretage_carburant c ON c.arretage_id = l.arretage_id
    WHERE l.statut = 'V' AND l.vehicule_id IS NOT NULL AND c.date_operation IS NOT NULL
    GROUP BY 1, 2
),
parc AS (
    SELECT l.vehicule_id, date_trunc('month', p.date_sortie)::date AS mois,
           sum(p.distance_km) AS km, count(*) AS nb_sorties
    FROM traitement_siigpe.tsi_arretage_livret l
    JOIN traitement_siigpe.tsi_arretage_parcours p ON p.arretage_id = l.arretage_id
    WHERE l.statut = 'V' AND l.vehicule_id IS NOT NULL AND p.date_sortie IS NOT NULL
    GROUP BY 1, 2
)
SELECT coalesce(carb.vehicule_id, parc.vehicule_id) AS vehicule_id,
       coalesce(carb.mois, parc.mois) AS mois,
       coalesce(carb.litres, 0) AS litres, coalesce(carb.huile_litres, 0) AS huile_litres,
       coalesce(carb.nb_pleins, 0) AS nb_pleins,
       coalesce(parc.km, 0) AS km, coalesce(parc.nb_sorties, 0) AS nb_sorties,
       CASE WHEN coalesce(parc.km, 0) > 0 THEN round(coalesce(carb.litres, 0) / parc.km * 100, 2) END AS consommation_100km
FROM carb
FULL OUTER JOIN parc ON parc.vehicule_id = carb.vehicule_id AND parc.mois = carb.mois;

/* Variables par véhicule × année (une ligne par année de dépense connue ou de recensement) : caractéristiques
   permanentes, recensement de l'année (le plus récent si plusieurs), constatations, BC visés, dépense de l'année. */
CREATE VIEW ia.v_vehicule_annuel AS
WITH annees AS (
    SELECT vehicule_id, annee FROM ia.v_depense_vehicule_annuelle
    UNION
    SELECT vehicule_id, exercice::integer FROM referentiel_siigpe.rsi_vehicule_etat WHERE exercice ~ '^[0-9]{4}$'
),
recens AS (
    SELECT DISTINCT ON (vehicule_id, exercice) vehicule_id, exercice::integer AS annee,
           soa_code, etat_general, categorie_utilisation, detenteur_effectif
    FROM referentiel_siigpe.rsi_vehicule_etat
    WHERE exercice ~ '^[0-9]{4}$'
    ORDER BY vehicule_id, exercice, date_validation DESC NULLS LAST
),
constat AS (
    SELECT ct.vehicule_id, extract(year FROM ct.date_constat)::integer AS annee,
           count(DISTINCT ct.constatation_id) AS nb_constatations,
           count(el.constatation_element_id) FILTER (WHERE el.conforme = 'N') AS nb_non_conformites,
           max(ct.kilometrage) AS kilometrage_constate
    FROM traitement_siigpe.tsi_constatation_technique ct
    LEFT JOIN traitement_siigpe.tsi_constatation_element el ON el.constatation_id = ct.constatation_id
    WHERE ct.vehicule_id IS NOT NULL AND ct.date_constat IS NOT NULL
    GROUP BY 1, 2
),
bc AS (
    SELECT vehicule_id, extract(year FROM coalesce(date_visa, date_bc))::integer AS annee,
           count(*) AS nb_bc_vises, coalesce(sum(montant), 0) AS montant_bc_vises
    FROM traitement_siigpe.tsi_visa_bon_commande
    WHERE vehicule_id IS NOT NULL AND decision = 'VISA' AND coalesce(date_visa, date_bc) IS NOT NULL
    GROUP BY 1, 2
)
SELECT an.vehicule_id, an.annee,
       ev.vehicule_immatriculation AS immatriculation,
       ev.vehicule_genre AS genre, ev.vehicule_source_energie AS energie, ev.categorie_vehicule AS categorie_vehicule,
       nullif(regexp_replace(coalesce(ev.vehicule_puissance_administrative, ''), '[^0-9]', '', 'g'), '')::integer AS puissance_cv,
       CASE WHEN ev.vehicule_date_premier_mise IS NOT NULL
            THEN an.annee - extract(year FROM ev.vehicule_date_premier_mise)::integer END AS age_ans,
       r.soa_code, r.etat_general, r.categorie_utilisation, r.detenteur_effectif,
       coalesce(c.nb_constatations, 0) AS nb_constatations, coalesce(c.nb_non_conformites, 0) AS nb_non_conformites,
       c.kilometrage_constate,
       coalesce(b.nb_bc_vises, 0) AS nb_bc_vises, coalesce(b.montant_bc_vises, 0) AS montant_bc_vises,
       d.litres, d.km, d.consommation_100km, d.nb_reparations, d.plus_grosse_reparation, d.jours_immobilisation,
       d.cout_carburant, d.cout_huile, d.cout_pneumatiques, d.cout_entretien, d.cout_reparations, d.depense_totale
FROM annees an
JOIN traitement_siigpe.tsi_entite_vehicule ev ON ev.vehicule_id = an.vehicule_id
LEFT JOIN recens r ON r.vehicule_id = an.vehicule_id AND r.annee = an.annee
LEFT JOIN constat c ON c.vehicule_id = an.vehicule_id AND c.annee = an.annee
LEFT JOIN bc b ON b.vehicule_id = an.vehicule_id AND b.annee = an.annee
LEFT JOIN ia.v_depense_vehicule_annuelle d ON d.vehicule_id = an.vehicule_id AND d.annee = an.annee;

/* Dossiers clos du workflow et leur délai de traitement (dépôt → dernière tâche terminée, ou date de sortie).
   Clos = aucune tâche ouverte. Dates aberrantes exclues (hors 2015 → aujourd'hui, fin avant dépôt). */
CREATE VIEW ia.v_delai_dossier AS
WITH t AS (
    SELECT reference_acte,
           count(*) AS nb_taches,
           count(*) FILTER (WHERE date_fin IS NULL) AS nb_taches_ouvertes,
           max(date_fin) AS derniere_fin,
           count(DISTINCT activite_code) AS nb_activites
    FROM workflow.wf_processus_activite_tache
    GROUP BY reference_acte
)
SELECT d.reference_acte, d.processus_code, d.type_acte, d.ministere_code, d.region_creation, d.type_guichet,
       d.dossier_date_depot AS date_depot,
       extract(year FROM d.dossier_date_depot)::integer AS annee_depot,
       extract(month FROM d.dossier_date_depot)::integer AS mois_depot,
       extract(isodow FROM d.dossier_date_depot)::integer AS jour_semaine_depot,
       d.nombre_agent, d.nombre_projet,
       t.nb_taches, t.nb_activites,
       (d.motif_rejet IS NOT NULL AND d.motif_rejet <> '') AS rejet_ou_retour,
       coalesce(d.date_sortie, t.derniere_fin) AS date_fin,
       coalesce(d.date_sortie, t.derniere_fin) - d.dossier_date_depot AS delai_jours
FROM workflow.wf_dossier d
JOIN t ON t.reference_acte = d.reference_acte
WHERE t.nb_taches_ouvertes = 0
  AND d.dossier_date_depot BETWEEN DATE '2015-01-01' AND CURRENT_DATE
  AND coalesce(d.date_sortie, t.derniere_fin) BETWEEN d.dossier_date_depot AND CURRENT_DATE;


/* ---------------------------------------------------------------------
   18.22. Brique IA — traçabilité des jeux de données construits (phase 2).
   Aucune donnée réelle du BSCVA n'étant disponible, le jeu d'entraînement
   véhicules 2025-2026 est CONSTRUIT par ia-siigpe/donnees/generer_jeu.py.
   Chaque ligne créée est enregistrée dans ia.lot_objet (suppression propre
   et complète par supprimer_jeu.py) ; les anomalies de carburant injectées
   sont consignées (vérité terrain pour évaluer le détecteur).
   --------------------------------------------------------------------- */
CREATE TABLE IF NOT EXISTS ia.lot_donnees (
    lot_code       varchar(40) NOT NULL,
    description    text NULL,
    origine        varchar(20) NOT NULL DEFAULT 'CONSTRUIT',   -- CONSTRUIT | REEL
    graine         integer NULL,
    parametres     jsonb NULL,
    date_creation  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT lot_donnees_pk PRIMARY KEY (lot_code),
    CONSTRAINT lot_donnees_origine_chk CHECK (origine IN ('CONSTRUIT','REEL'))
);

CREATE TABLE IF NOT EXISTS ia.lot_objet (
    id          bigserial NOT NULL,
    lot_code    varchar(40) NOT NULL REFERENCES ia.lot_donnees(lot_code),
    nom_table   varchar(120) NOT NULL,     -- schéma.table
    nom_cle     varchar(60) NOT NULL,      -- colonne clé
    valeur_cle  varchar(80) NOT NULL,
    ordre       integer NOT NULL,          -- ordre d'insertion (suppression dans l'ordre inverse)
    CONSTRAINT lot_objet_pk PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_lot_objet_lot ON ia.lot_objet(lot_code, ordre);

CREATE TABLE IF NOT EXISTS ia.lot_anomalie_injectee (
    id           bigserial NOT NULL,
    lot_code     varchar(40) NOT NULL REFERENCES ia.lot_donnees(lot_code),
    vehicule_id  uuid NOT NULL,
    mois         date NOT NULL,
    type_anomalie varchar(40) NOT NULL,     -- ex. SURCONSOMMATION
    facteur      numeric NULL,              -- litres déclarés / litres attendus
    CONSTRAINT lot_anomalie_injectee_pk PRIMARY KEY (id)
);

/* =====================================================================
   FIN BASE PRINCIPALE
   ===================================================================== */