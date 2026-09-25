/* =====================================================================
   Script_donnees_test.sql — Jeu de données de test BSCVA (phase test)
   =====================================================================
   À exécuter APRÈS Script.sql (schéma + référentiels + comptes de test déjà en place)
   sur la base augure_local. Idempotent (INSERT ... WHERE NOT EXISTS partout, comme
   Script.sql) : rejouable sans créer de doublons.

   Conçu le 2026-09-18. Périmètre : ~15 véhicules, référentiels géo minimaux
   (région Analamanga uniquement), 5 fournisseurs, 3 dossiers par
   processus (33 au total, répartis sur différentes étapes du workflow), historique/
   détenteurs véhicule, entretiens/réparations, expertise/condamnation, chauffeurs.

   Convention UUID : littéraux choisis à la main pour les entités référencées depuis
   plusieurs endroits du script (véhicules, fournisseurs, têtes de dossier avec table(s)
   de détail) ; gen_random_uuid() partout ailleurs (rien d'autre ne les référence).
   Toute FK vers une ligne déjà seedée par Script.sql (les 5 marques véhicule, dont
   l'UUID est gen_random_uuid() à l'exécution) passe par une sous-requête, jamais un
   UUID littéral.
   ===================================================================== */

/* =====================================================================
   1) RÉFÉRENTIELS MANQUANTS (géographie Analamanga, ministères, fournisseurs)
   ===================================================================== */

-- Région Analamanga (seule région seedée — périmètre SRB Analamanga du projet)
INSERT INTO referentiel_national.rn_region (id_region, reg_code, province_code, region_libelle, district_code)
SELECT 'b0000000-0000-0000-0000-000000000001', 'AN', 'ANT', 'Analamanga', 'A01'
WHERE NOT EXISTS (SELECT 1 FROM referentiel_national.rn_region WHERE reg_code = 'AN');

-- 7 districts réels d'Analamanga
INSERT INTO referentiel_national.rn_district (district_code, reg_code, district_libelle)
SELECT v.code, 'AN', v.libelle
FROM (VALUES
  ('A01', 'Antananarivo Renivohitra'),
  ('A02', 'Avaradrano'),
  ('A03', 'Atsimondrano'),
  ('A04', 'Ambohidratrimo'),
  ('A05', 'Andramasina'),
  ('A06', 'Anjozorobe'),
  ('A07', 'Manjakandriana')
) AS v(code, libelle)
WHERE NOT EXISTS (SELECT 1 FROM referentiel_national.rn_district d WHERE d.district_code = v.code);

-- 10 communes réelles réparties sur ces districts
INSERT INTO referentiel_national.rn_commune (commune_code, district_code, commune_libelle)
SELECT v.code, v.district, v.libelle
FROM (VALUES
  ('A0101', 'A01', 'Antananarivo I (Renivohitra)'),
  ('A0201', 'A02', 'Sabotsy Namehana'),
  ('A0202', 'A02', 'Ambohimanga Rova'),
  ('A0301', 'A03', 'Alasora'),
  ('A0302', 'A03', 'Andoharanofotsy'),
  ('A0401', 'A04', 'Ambohidratrimo'),
  ('A0402', 'A04', 'Ivato'),
  ('A0501', 'A05', 'Andramasina'),
  ('A0601', 'A06', 'Anjozorobe'),
  ('A0701', 'A07', 'Manjakandriana')
) AS v(code, district, libelle)
WHERE NOT EXISTS (SELECT 1 FROM referentiel_national.rn_commune c WHERE c.commune_code = v.code);


-- 5 fournisseurs/garages réalistes (Antananarivo)
INSERT INTO referentiel_siigpe.rsi_fournisseur (fournisseur_id, raison_sociale, nif, stat, adresse, telephone, email)
SELECT v.id::uuid, v.nom, v.nif, v.stat, v.adresse, v.tel, v.email
FROM (VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Sodiama Motors', '3000123456', '12345112015000123', 'Route des Hydrocarbures, Andraharo, Antananarivo', '020 22 123 45', 'contact@sodiama-motors.mg'),
  ('e0000000-0000-0000-0000-000000000002', 'CFAO Motors Madagascar', '2000456789', '12345212016000456', 'Route Circulaire, Ankorondrano, Antananarivo', '020 22 234 56', 'info@cfaomotors.mg'),
  ('e0000000-0000-0000-0000-000000000003', 'Garage STAR Automobile', '3000789012', '12345312017000789', 'Antanimena, Antananarivo', '020 22 345 67', 'star.auto@moov.mg'),
  ('e0000000-0000-0000-0000-000000000004', 'SOMACOA Pièces Auto', '3000345678', '12345412018000345', 'Ankadimbahoaka, Antananarivo', '020 22 456 78', 'somacoa@gmail.com'),
  ('e0000000-0000-0000-0000-000000000005', 'Établissement RAKOTO Auto Pièces', '3000901234', '12345512019000901', 'Soarano, Antananarivo', '032 04 567 89', 'rakoto.autopieces@yahoo.fr')
) AS v(id, nom, nif, stat, adresse, tel, email)
WHERE NOT EXISTS (SELECT 1 FROM referentiel_siigpe.rsi_fournisseur f WHERE f.fournisseur_id::text = v.id);

/* =====================================================================
   2) PARC VÉHICULES — traitement_siigpe.tsi_entite_vehicule (15 lignes)
   ===================================================================== */

-- Une ligne par véhicule (une seule instruction par ligne, plus facile à relire/déboguer
-- qu'un unique VALUES multi-lignes — pas d'accès psql direct pour tester ce script en amont).
-- Colonnes (23) : vehicule_id, vehicule_immatriculation, min_code, soa_depositaire,
-- vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur,
-- vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt,
-- vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles,
-- detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie,
-- valeur_estimative.

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-000000000001', '1234 TBA', '21', 'DRPE/SRB Analamanga', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Toyota'), 'Land Cruiser', 'VP', '4X4', 'MT1234567', 'JTMHV05J904012345', 'GASOIL', 7, 2100, 900, 3000, '2019-03-15', '4X4', 'BON', '1', '1', 'DRPE/SRB Analamanga', 'b0000000-0000-0000-0000-000000000001', 'A01', 'A0101', 'ACTIF', '900002', '2026-06-02', 95000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '1234 TBA');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-000000000002', '5678 TBB', '14', 'DRI-ANA', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Nissan'), 'Patrol', 'VP', '4X4', 'MT2345678', 'JN1TENY61Z0123456', 'GASOIL', 7, 2200, 800, 3000, '2017-06-10', '4X4', 'MOYEN', '1', '1', 'Direction Régionale Intérieur', 'b0000000-0000-0000-0000-000000000001', 'A02', 'A0201', 'ACTIF', '900002', '2026-06-02', 62000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '5678 TBB');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-000000000003', '9012 TBC', '71', 'DRS-ANA', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Mitsubishi'), 'Pajero', 'VP', '4X4', 'MT3456789', 'JMBLYV96W8J012345', 'GASOIL', 7, 1900, 700, 2600, '2020-01-20', '4X4', 'BON', '1', '1', 'Direction Régionale Santé', 'b0000000-0000-0000-0000-000000000001', 'A01', 'A0101', 'ACTIF', '900002', '2026-06-02', 88000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '9012 TBC');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-000000000004', '3456 TBD', '65', 'DRTP-ANA', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Toyota'), 'Hilux', 'VU', 'PLATEAU', 'MT4567890', 'AHTFR22G708012345', 'GASOIL', 5, 1800, 1000, 2800, '2021-05-05', 'PICKUP', 'BON', '1', '1', 'Direction Régionale Travaux Publics', 'b0000000-0000-0000-0000-000000000001', 'A04', 'A0401', 'ACTIF', '900002', '2026-06-02', 78000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '3456 TBD');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-000000000005', '7890 TBE', '81', 'DREN-ANA', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Hyundai'), 'H1', 'TCP', 'BUS', 'MT5678901', 'KMHWH81XPFU012345', 'GASOIL', 12, 2000, 1200, 3200, '2016-09-12', 'BUS', 'MOYEN', '1', '1', 'Direction Régionale Éducation', 'b0000000-0000-0000-0000-000000000001', 'A02', 'A0202', 'ACTIF', '900002', '2026-06-02', 45000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '7890 TBE');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-000000000006', '1111 TBF', '32', 'DRFP-ANA', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Mercedes-Benz'), 'Sprinter', 'TCP', 'BUS', 'MT6789012', 'WDB9066331R012345', 'GASOIL', 16, 2400, 1400, 3800, '2022-02-18', 'BUS', 'BON', '1', '1', 'Direction Régionale Fonction Publique', 'b0000000-0000-0000-0000-000000000001', 'A01', 'A0101', 'ACTIF', '900002', '2026-06-02', 120000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '1111 TBF');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-000000000007', '2222 TBG', '21', 'DRPE/SRB Analamanga', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Nissan'), 'Almera', 'VP', 'BERLINE', 'MT7890123', 'SJNFAAN17U0123456', 'ESSENCE', 5, 1100, 400, 1500, '2020-11-30', 'BERLINE', 'BON', '1', '1', 'DRPE/SRB Analamanga', 'b0000000-0000-0000-0000-000000000001', 'A03', 'A0301', 'ACTIF', '900002', '2026-06-02', 35000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '2222 TBG');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-000000000008', '3333 TBH', '14', 'DRI-ANA', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Toyota'), 'Corolla', 'VP', 'BERLINE', 'MT8901234', 'JTDBR32E720012345', 'ESSENCE', 5, 1150, 400, 1550, '2015-04-22', 'BERLINE', 'MOYEN', '1', '1', 'Direction Régionale Intérieur', 'b0000000-0000-0000-0000-000000000001', 'A03', 'A0302', 'ACTIF', '900002', '2026-06-02', 22000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '3333 TBH');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-000000000009', '4444 TBI', '65', 'DRTP-ANA', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Mitsubishi'), 'Canter', 'VU', 'PLATEAU', 'MT9012345', 'FE73EE5100012345', 'GASOIL', 3, 3200, 3000, 6200, '2012-08-14', 'CAMION', 'MAUVAIS', '1', '1', 'Direction Régionale Travaux Publics', 'b0000000-0000-0000-0000-000000000001', 'A04', 'A0402', 'ACTIF', '900002', '2026-06-02', 30000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '4444 TBI');

-- Véhicule déjà "Hors service" — candidat naturel pour le dossier de condamnation §6
INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-00000000000a', '5555 TBJ', '65', 'DRTP-ANA', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Toyota'), 'Dyna', 'VU', 'PLATEAU', 'MT0123456', 'XZU423R0000012345', 'GASOIL', 3, 3000, 2800, 5800, '2008-01-10', 'CAMION', 'HS', '1', '1', 'Direction Régionale Travaux Publics', 'b0000000-0000-0000-0000-000000000001', 'A05', 'A0501', 'ACTIF', '900002', '2026-06-02', 8000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '5555 TBJ');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-00000000000b', '6666 TBK', '71', 'DRS-ANA', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Hyundai'), 'Accent', 'VP', 'BERLINE', 'MT1122334', 'KMHCT41BABU012345', 'ESSENCE', 5, 1100, 400, 1500, '2021-07-19', 'BERLINE', 'BON', '1', '1', 'Direction Régionale Santé', 'b0000000-0000-0000-0000-000000000001', 'A02', 'A0201', 'ACTIF', '900002', '2026-06-02', 28000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '6666 TBK');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-00000000000c', '7777 TBL', '21', 'DRPE/SRB Analamanga', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Mercedes-Benz'), 'Classe C', 'VP', 'BERLINE', 'MT2233445', 'WDD2050441F012345', 'HYBRIDE', 5, 1550, 450, 2000, '2023-03-01', 'BERLINE', 'BON', '1', '1', 'DRPE/SRB Analamanga', 'b0000000-0000-0000-0000-000000000001', 'A01', 'A0101', 'ACTIF', '900002', '2026-06-02', 150000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '7777 TBL');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-00000000000d', '8888 TBM', '81', 'DREN-ANA', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Nissan'), 'Note', 'VP', 'BERLINE', 'MT3344556', 'SJNFAAE12U0123456', 'ELECTRIQUE', 5, 1300, 350, 1650, '2023-09-15', 'BERLINE', 'BON', '1', '1', 'Direction Régionale Éducation', 'b0000000-0000-0000-0000-000000000001', 'A06', 'A0601', 'ACTIF', '900002', '2026-06-02', 65000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '8888 TBM');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-00000000000e', '9999 TBN', '14', 'DRI-ANA', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Toyota'), 'Fortuner', 'VP', '4X4', 'MT4455667', 'MHFYX8JD5G4012345', 'GASOIL', 7, 2000, 750, 2750, '2022-10-05', '4X4', 'BON', '1', '1', 'Direction Régionale Intérieur', 'b0000000-0000-0000-0000-000000000001', 'A07', 'A0701', 'ACTIF', '900002', '2026-06-02', 105000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '9999 TBN');

INSERT INTO traitement_siigpe.tsi_entite_vehicule (vehicule_id, vehicule_immatriculation, min_code, soa_depositaire, vehicule_marque_id, vehicule_type, vehicule_genre, vehicule_carroserie, vehicule_numero_moteur, vehicule_vin, vehicule_source_energie, vehicule_pls, vehicule_pv, vehicule_cu, vehicule_pt, vehicule_date_premier_mise, categorie_vehicule, etat_vehicule, carte_grise, livrets_disponibles, detenteur_effectif, region_id, district_id, commune_id, statut, utilisateur_saisie, date_saisie, valeur_estimative)
SELECT 'a0000000-0000-0000-0000-00000000000f', '1000 TBO', '32', 'DRFP-ANA', (SELECT vehicule_marque_id FROM traitement_siigpe.tsi_vehicule_marque WHERE vehicule_marque_nom = 'Mitsubishi'), 'Outlander', 'VP', '4X4', 'MT5566778', 'JA4AZ3AXXKZ012345', 'GASOIL', 7, 1750, 650, 2400, '2018-12-25', '4X4', 'MOYEN', '1', '1', 'Direction Régionale Fonction Publique', 'b0000000-0000-0000-0000-000000000001', 'A02', 'A0202', 'ACTIF', '900002', '2026-06-02', 58000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entite_vehicule WHERE vehicule_immatriculation = '1000 TBO');

/* =====================================================================
   3) HISTORIQUE ET DÉTENTEURS — GET /api/vehicules/{id}/mouvements
   ===================================================================== */
-- tsi_vehicule_detenteur (8 col) : detenteur_id, vehicule_id, detenteur_nom_prenom, detenteur_cin,
-- reference_acte, date_debut, date_fin, actif.

-- Véhicule V01 (1234 TBA) : 2 détenteurs successifs -> CHANGEMENT_DETENTEUR sur /mouvements
INSERT INTO traitement_siigpe.tsi_vehicule_detenteur (detenteur_id, vehicule_id, detenteur_nom_prenom, detenteur_cin, reference_acte, date_debut, date_fin, actif)
SELECT 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'RAKOTOMALALA Jean', '101198012345', NULL, '2019-04-01', '2023-06-30', 0
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_vehicule_detenteur WHERE detenteur_id = 'c0000000-0000-0000-0000-000000000001');

INSERT INTO traitement_siigpe.tsi_vehicule_detenteur (detenteur_id, vehicule_id, detenteur_nom_prenom, detenteur_cin, reference_acte, date_debut, date_fin, actif)
SELECT 'c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'RAVELOSON Marie', '102199523456', NULL, '2023-07-01', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_vehicule_detenteur WHERE detenteur_id = 'c0000000-0000-0000-0000-000000000002');

-- Véhicules V02-V05 : un seul détenteur actif chacun -> AFFECTATION sur /mouvements
INSERT INTO traitement_siigpe.tsi_vehicule_detenteur (detenteur_id, vehicule_id, detenteur_nom_prenom, detenteur_cin, reference_acte, date_debut, date_fin, actif)
SELECT 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'RAZAFINDRAKOTO Paul', '103197834567', NULL, '2017-07-01', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_vehicule_detenteur WHERE detenteur_id = 'c0000000-0000-0000-0000-000000000003');

INSERT INTO traitement_siigpe.tsi_vehicule_detenteur (detenteur_id, vehicule_id, detenteur_nom_prenom, detenteur_cin, reference_acte, date_debut, date_fin, actif)
SELECT 'c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003', 'ANDRIAMBOLOLONA Hery', '104198845678', NULL, '2020-02-01', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_vehicule_detenteur WHERE detenteur_id = 'c0000000-0000-0000-0000-000000000004');

INSERT INTO traitement_siigpe.tsi_vehicule_detenteur (detenteur_id, vehicule_id, detenteur_nom_prenom, detenteur_cin, reference_acte, date_debut, date_fin, actif)
SELECT 'c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', 'RASOLOFOSON Tiana', '105199056789', NULL, '2021-06-01', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_vehicule_detenteur WHERE detenteur_id = 'c0000000-0000-0000-0000-000000000005');

INSERT INTO traitement_siigpe.tsi_vehicule_detenteur (detenteur_id, vehicule_id, detenteur_nom_prenom, detenteur_cin, reference_acte, date_debut, date_fin, actif)
SELECT 'c0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000005', 'RAKOTOARISOA Nirina', '106198567890', NULL, '2016-10-01', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_vehicule_detenteur WHERE detenteur_id = 'c0000000-0000-0000-0000-000000000006');

-- tsi_historique_vehicule (8 col) : historique_vehicule_id, vehicule_id, historique_type,
-- historique_date, historique_utilisateur, ancienne_valeur_json, nouvelle_valeur_json, reference_acte.
-- ancienne_valeur_json en camelCase (miroir de hub.query), nouvelle_valeur_json en snake_case (miroir
-- du body brut client) — exactement le format que VehiculeService.listMouvements() sait diffuser.

-- V05 (7890 TBE) : état BON -> MOYEN => CHANGEMENT_ETAT sur /mouvements
INSERT INTO traitement_siigpe.tsi_historique_vehicule (historique_vehicule_id, vehicule_id, historique_type, historique_date, historique_utilisateur, ancienne_valeur_json, nouvelle_valeur_json, reference_acte)
SELECT 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000005', 'MODIFICATION', '2026-08-10 09:15:00', '900003', '{"etatVehicule":"BON"}'::jsonb, '{"etat_vehicule":"MOYEN"}'::jsonb, NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_historique_vehicule WHERE historique_vehicule_id = 'd0000000-0000-0000-0000-000000000001');

-- V02 (5678 TBB) : transfert du ministère EF vers ID => TRANSFERT sur /mouvements
INSERT INTO traitement_siigpe.tsi_historique_vehicule (historique_vehicule_id, vehicule_id, historique_type, historique_date, historique_utilisateur, ancienne_valeur_json, nouvelle_valeur_json, reference_acte)
SELECT 'd0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'MODIFICATION', '2026-07-05 14:30:00', '900002', '{"minCode":"21"}'::jsonb, '{"min_code":"14"}'::jsonb, NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_historique_vehicule WHERE historique_vehicule_id = 'd0000000-0000-0000-0000-000000000002');

/* =====================================================================
   4) ENTRETIENS / RÉPARATIONS — traitement_siigpe.tsi_entretien_reparation_vehicule
   (avant les dossiers Visa BC §5 : l'un d'eux référence ETR0720260001 par FK)
   ===================================================================== */
-- 19 col : entretien_reparation_vehicule_id, vehicule_id, reference_acte, numero_bc, numero_bc_scan,
-- date_numero_bc, numero_tef, numero_tef_scan, date_numero_tef, fournisseur, numero_convention,
-- numero_convention_scan, date_convention, date_saisie, utilisateur_saisie, entretien_reparation_rang,
-- repartition_effectue, montant_repartition, depense_total.
-- Réparti sur 4 mois (mai à août 2026) pour peupler /api/reporting/couts-mois.

INSERT INTO traitement_siigpe.tsi_entretien_reparation_vehicule (entretien_reparation_vehicule_id, vehicule_id, reference_acte, numero_bc, numero_bc_scan, date_numero_bc, numero_tef, numero_tef_scan, date_numero_tef, fournisseur, numero_convention, numero_convention_scan, date_convention, date_saisie, utilisateur_saisie, entretien_reparation_rang, repartition_effectue, montant_repartition, depense_total)
SELECT 'ETR0520260001', 'a0000000-0000-0000-0000-000000000004', NULL, 'BC-2026-0012', NULL, '2026-05-10', NULL, NULL, NULL, 'e0000000-0000-0000-0000-000000000003', NULL, NULL, NULL, '2026-05-12', '900002', 1, 'Budget entretien courant', 650000, 650000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entretien_reparation_vehicule WHERE entretien_reparation_vehicule_id = 'ETR0520260001');

INSERT INTO traitement_siigpe.tsi_entretien_reparation_vehicule (entretien_reparation_vehicule_id, vehicule_id, reference_acte, numero_bc, numero_bc_scan, date_numero_bc, numero_tef, numero_tef_scan, date_numero_tef, fournisseur, numero_convention, numero_convention_scan, date_convention, date_saisie, utilisateur_saisie, entretien_reparation_rang, repartition_effectue, montant_repartition, depense_total)
SELECT 'ETR0620260001', 'a0000000-0000-0000-0000-000000000009', NULL, 'BC-2026-0028', NULL, '2026-06-18', NULL, NULL, NULL, 'e0000000-0000-0000-0000-000000000004', NULL, NULL, NULL, '2026-06-20', '900002', 1, 'Budget entretien courant', 1200000, 1200000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entretien_reparation_vehicule WHERE entretien_reparation_vehicule_id = 'ETR0620260001');

-- Lié au dossier Visa BC VBC0720260003 (storyline V01) — même numero_bc, même montant.
INSERT INTO traitement_siigpe.tsi_entretien_reparation_vehicule (entretien_reparation_vehicule_id, vehicule_id, reference_acte, numero_bc, numero_bc_scan, date_numero_bc, numero_tef, numero_tef_scan, date_numero_tef, fournisseur, numero_convention, numero_convention_scan, date_convention, date_saisie, utilisateur_saisie, entretien_reparation_rang, repartition_effectue, montant_repartition, depense_total)
SELECT 'ETR0720260001', 'a0000000-0000-0000-0000-000000000001', NULL, 'BC-2026-0045', NULL, '2026-07-05', NULL, NULL, NULL, 'e0000000-0000-0000-0000-000000000001', NULL, NULL, NULL, '2026-07-05', '900002', 1, 'Budget entretien courant', 1850000, 1850000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entretien_reparation_vehicule WHERE entretien_reparation_vehicule_id = 'ETR0720260001');

INSERT INTO traitement_siigpe.tsi_entretien_reparation_vehicule (entretien_reparation_vehicule_id, vehicule_id, reference_acte, numero_bc, numero_bc_scan, date_numero_bc, numero_tef, numero_tef_scan, date_numero_tef, fournisseur, numero_convention, numero_convention_scan, date_convention, date_saisie, utilisateur_saisie, entretien_reparation_rang, repartition_effectue, montant_repartition, depense_total)
SELECT 'ETR0820260001', 'a0000000-0000-0000-0000-00000000000f', NULL, 'BC-2026-0061', NULL, '2026-08-08', NULL, NULL, NULL, 'e0000000-0000-0000-0000-000000000002', NULL, NULL, NULL, '2026-08-08', '900002', 1, 'Budget entretien courant', 2450000, 2450000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_entretien_reparation_vehicule WHERE entretien_reparation_vehicule_id = 'ETR0820260001');

-- traitement_siigpe.tsi_reparation_effectue_vehicule (3 col) : reparation_effectue_id,
-- entretien_reparation_vehicule_id, reparation_effectue_detail.
INSERT INTO traitement_siigpe.tsi_reparation_effectue_vehicule (reparation_effectue_id, entretien_reparation_vehicule_id, reparation_effectue_detail)
SELECT 'f0000000-0000-0000-0000-000000000001', 'ETR0720260001', 'Remplacement plaquettes de frein avant'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reparation_effectue_vehicule WHERE reparation_effectue_id = 'f0000000-0000-0000-0000-000000000001');

INSERT INTO traitement_siigpe.tsi_reparation_effectue_vehicule (reparation_effectue_id, entretien_reparation_vehicule_id, reparation_effectue_detail)
SELECT 'f0000000-0000-0000-0000-000000000002', 'ETR0720260001', 'Réparation fuite radiateur'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reparation_effectue_vehicule WHERE reparation_effectue_id = 'f0000000-0000-0000-0000-000000000002');

INSERT INTO traitement_siigpe.tsi_reparation_effectue_vehicule (reparation_effectue_id, entretien_reparation_vehicule_id, reparation_effectue_detail)
SELECT 'f0000000-0000-0000-0000-000000000003', 'ETR0620260001', 'Réfection moteur partielle'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reparation_effectue_vehicule WHERE reparation_effectue_id = 'f0000000-0000-0000-0000-000000000003');

INSERT INTO traitement_siigpe.tsi_reparation_effectue_vehicule (reparation_effectue_id, entretien_reparation_vehicule_id, reparation_effectue_detail)
SELECT 'f0000000-0000-0000-0000-000000000004', 'ETR0620260001', 'Remplacement pneus arrière'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reparation_effectue_vehicule WHERE reparation_effectue_id = 'f0000000-0000-0000-0000-000000000004');

/* =====================================================================
   5) DOSSIERS PAR PROCESSUS — workflow.wf_dossier / wf_processus_activite_tache
   + table(s) tsi_<processus> + referentiel_siigpe.rsi_<processus> (dossier archivé
   uniquement) + document.document_genere (dossier archivé uniquement)
   =====================================================================
   3 dossiers par processus (33 au total) : #1 CONTROLE_PIECES (juste déposé),
   #2 étape intermédiaire variable (couverture de TRAITEMENT_TECHNIQUE/VISA_VALIDATION/
   EDITION_LIVRABLE selon le processus), #3 ARCHIVAGE (circuit clôturé, validé, avec
   toutes les tables de détail + document Jasper). tsi_sequence_dossier mis à jour en
   conséquence pour ne pas collisionner avec une future création réelle. */

-- --- I. RECENSEMENT (VA_RECENS / REC, juin 2026) ---
INSERT INTO traitement_siigpe.tsi_sequence_dossier (type_acte, annee, mois, dernier_numero) VALUES ('REC', 2026, 6, 3)
ON CONFLICT (type_acte, annee, mois) DO UPDATE SET dernier_numero = GREATEST(traitement_siigpe.tsi_sequence_dossier.dernier_numero, 3);

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'REC0620260001', 'Recensement annuel du parc - Direction EF', 'REC', 'BSCVA', '21', '2026-06-03', '2026-06-03', 'VA_RECENS_ACTIVITE', 'VA_RECENS'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'REC0620260001');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECENS','VA_RECENS_ACTIVITE','DEPOT_DOSSIER','2026-06-03','2026-06-03','REC0620260001','900002',1
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='REC0620260001' AND tache_a_faire='DEPOT_DOSSIER');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECENS','VA_RECENS_ACTIVITE','CONTROLE_PIECES','2026-06-03',NULL,'REC0620260001',NULL,2
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='REC0620260001' AND tache_a_faire='CONTROLE_PIECES');
INSERT INTO traitement_siigpe.tsi_recensement (recensement_id, reference_acte, min_code, soa_code, niveau, point_focal_nom, point_focal_fonction, point_focal_tel, point_focal_email, date_saisie, utilisateur_saisie, statut, rang)
SELECT '1e000000-0000-0000-0000-000000000001', 'REC0620260001', '21', 'SRB-ANA', 'Régional', 'RAKOTOARIMANANA Solo', 'Chef SOA', '034 12 345 67', 'srb.analamanga@gov.mg', '2026-06-03', '900002', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_recensement WHERE recensement_id = '1e000000-0000-0000-0000-000000000001');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'REC0620260002', 'Recensement annuel du parc - Direction Intérieur', 'REC', 'BSCVA', '14', '2026-06-08', '2026-06-08', 'VA_RECENS_ACTIVITE', 'VA_RECENS'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'REC0620260002');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECENS','VA_RECENS_ACTIVITE','DEPOT_DOSSIER','2026-06-08','2026-06-08','REC0620260002','900002',1
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='REC0620260002' AND tache_a_faire='DEPOT_DOSSIER');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECENS','VA_RECENS_ACTIVITE','CONTROLE_PIECES','2026-06-08','2026-06-09','REC0620260002','900003',2
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='REC0620260002' AND tache_a_faire='CONTROLE_PIECES');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECENS','VA_RECENS_ACTIVITE','TRAITEMENT_TECHNIQUE','2026-06-09','2026-06-11','REC0620260002','900004',3
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='REC0620260002' AND tache_a_faire='TRAITEMENT_TECHNIQUE');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECENS','VA_RECENS_ACTIVITE','VISA_VALIDATION','2026-06-11',NULL,'REC0620260002',NULL,4
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='REC0620260002' AND tache_a_faire='VISA_VALIDATION');
INSERT INTO traitement_siigpe.tsi_recensement (recensement_id, reference_acte, min_code, soa_code, niveau, point_focal_nom, point_focal_fonction, point_focal_tel, point_focal_email, date_saisie, utilisateur_saisie, statut, rang)
SELECT '1e000000-0000-0000-0000-000000000002', 'REC0620260002', '14', 'DRI-ANA', 'Régional', 'RAZANADRAKOTO Fara', 'Chef SOA', '033 45 678 90', 'interieur.analamanga@gov.mg', '2026-06-08', '900002', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_recensement WHERE recensement_id = '1e000000-0000-0000-0000-000000000002');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'REC0620260003', 'Recensement annuel du parc - Direction EF (véhicule 1234 TBA)', 'REC', 'BSCVA', '21', '2026-06-15', '2026-06-15', 'VA_RECENS_ACTIVITE', 'VA_RECENS'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'REC0620260003');
-- Dossier archivé : les 6 étapes, toutes closes (circuit clôturé). Un INSERT...SELECT par ligne de
-- la table VALUES ci-dessous, chacune filtrée indépendamment par la sous-requête corrélée
-- (WHERE NOT EXISTS référence d.tache_a_faire de la ligne courante) — patron réutilisé pour tous les
-- dossiers "archivés" du reste du script, plus court qu'une instruction par étape.
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECENS', 'VA_RECENS_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'REC0620260003', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-06-15','2026-06-15','900002',1),('CONTROLE_PIECES','2026-06-15','2026-06-16','900003',2),('TRAITEMENT_TECHNIQUE','2026-06-16','2026-06-18','900004',3),('VISA_VALIDATION','2026-06-18','2026-06-19','900007',4),('EDITION_LIVRABLE','2026-06-19','2026-06-20','900001',5),('ARCHIVAGE','2026-06-20','2026-06-20','900001',6))
     AS d(tache_a_faire, date_debut, date_fin, detenteur, rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte = 'REC0620260003' AND t.tache_a_faire = d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_recensement (recensement_id, reference_acte, min_code, soa_code, niveau, point_focal_nom, point_focal_fonction, point_focal_tel, point_focal_email, date_saisie, utilisateur_saisie, statut, rang)
SELECT '1e000000-0000-0000-0000-000000000003', 'REC0620260003', '21', 'SRB-ANA', 'Régional', 'RAKOTOARIMANANA Solo', 'Chef SOA', '034 12 345 67', 'srb.analamanga@gov.mg', '2026-06-15', '900002', 'V', 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_recensement WHERE recensement_id = '1e000000-0000-0000-0000-000000000003');
INSERT INTO traitement_siigpe.tsi_recensement_ligne (recensement_ligne_id, recensement_id, vehicule_id, detenteur_effectif, carte_grise_dispo, livrets_dispo, etat_general, categorie_utilisation, rang)
SELECT '1f000000-0000-0000-0000-000000000001', '1e000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'RAVELOSON Marie', '1', '1', '1', '2', 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_recensement_ligne WHERE recensement_ligne_id = '1f000000-0000-0000-0000-000000000001');
INSERT INTO referentiel_siigpe.rsi_recensement (reference_acte, min_code, soa_code, niveau, valide_par, statut)
SELECT 'REC0620260003', '21', 'SRB-ANA', 'Régional', '900007', 'V'
WHERE NOT EXISTS (SELECT 1 FROM referentiel_siigpe.rsi_recensement WHERE reference_acte = 'REC0620260003');
INSERT INTO document.document_genere (document_id, reference_acte, modele_id, numero_document, version, statut, genere_par, genere_le)
SELECT gen_random_uuid(), 'REC0620260003', (SELECT modele_id FROM document.modele_document WHERE code = 'QUITUS_RECENSEMENT'), 'QUITUS_RECENSEMENT-2026-0001', 1, 'VALIDE', '900001', '2026-06-20 11:00:00'
WHERE NOT EXISTS (SELECT 1 FROM document.document_genere WHERE reference_acte = 'REC0620260003' AND modele_id = (SELECT modele_id FROM document.modele_document WHERE code = 'QUITUS_RECENSEMENT'));

-- --- II. CONSTATATION TECHNIQUE (VA_CONSTAT / CST, juin 2026) ---
INSERT INTO traitement_siigpe.tsi_sequence_dossier (type_acte, annee, mois, dernier_numero) VALUES ('CST', 2026, 6, 3)
ON CONFLICT (type_acte, annee, mois) DO UPDATE SET dernier_numero = GREATEST(traitement_siigpe.tsi_sequence_dossier.dernier_numero, 3);

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'CST0620260001', 'Constatation technique - contrôle courant', 'CST', 'BSCVA', '14', '2026-06-05', '2026-06-05', 'VA_CONSTAT_ACTIVITE', 'VA_CONSTAT'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'CST0620260001');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_CONSTAT','VA_CONSTAT_ACTIVITE','DEPOT_DOSSIER','2026-06-05','2026-06-05','CST0620260001','900002',1
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='CST0620260001' AND tache_a_faire='DEPOT_DOSSIER');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_CONSTAT','VA_CONSTAT_ACTIVITE','CONTROLE_PIECES','2026-06-05',NULL,'CST0620260001',NULL,2
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='CST0620260001' AND tache_a_faire='CONTROLE_PIECES');
INSERT INTO traitement_siigpe.tsi_constatation_technique (constatation_id, reference_acte, vehicule_id, numero_constat, date_constat, heure_constat, lieu, expert_nom, equipement_verif, kilometrage, nom_chauffeur, etat_general, constats, date_saisie, utilisateur_saisie, statut, rang)
SELECT '1a000000-0000-0000-0000-000000000001', 'CST0620260001', 'a0000000-0000-0000-0000-000000000008', 'CST-2026-001', '2026-06-05', '08:00', 'Atelier SRB Analamanga', 'RABENJA Fidy', 'Valise diagnostic OBD', 42000, 'RAZAFINDRAKOTO Paul', '1', 'Contrôle de routine, rien à signaler.', '2026-06-05', '900004', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_constatation_technique WHERE constatation_id = '1a000000-0000-0000-0000-000000000001');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'CST0620260002', 'Constatation technique - anomalie signalée', 'CST', 'BSCVA', '71', '2026-06-10', '2026-06-10', 'VA_CONSTAT_ACTIVITE', 'VA_CONSTAT'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'CST0620260002');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_CONSTAT', 'VA_CONSTAT_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'CST0620260002', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-06-10','2026-06-10','900002',1),('CONTROLE_PIECES','2026-06-10','2026-06-11','900003',2),('TRAITEMENT_TECHNIQUE','2026-06-11',NULL,'900004',3)) AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='CST0620260002' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_constatation_technique (constatation_id, reference_acte, vehicule_id, numero_constat, date_constat, heure_constat, lieu, expert_nom, equipement_verif, kilometrage, nom_chauffeur, etat_general, constats, date_saisie, utilisateur_saisie, statut, rang)
SELECT '1a000000-0000-0000-0000-000000000002', 'CST0620260002', 'a0000000-0000-0000-0000-000000000009', 'CST-2026-002', '2026-06-10', '10:15', 'Atelier SRB Analamanga', 'RABENJA Fidy', 'Valise diagnostic OBD', 210000, 'Chauffeur non identifié', '2', 'Fumée noire à l''échappement, perte de puissance signalée par l''utilisateur.', '2026-06-10', '900004', NULL, 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_constatation_technique WHERE constatation_id = '1a000000-0000-0000-0000-000000000002');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'CST0620260003', 'Constatation technique avant réparation (véhicule 1234 TBA)', 'CST', 'BSCVA', '21', '2026-06-25', '2026-06-25', 'VA_CONSTAT_ACTIVITE', 'VA_CONSTAT'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'CST0620260003');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_CONSTAT', 'VA_CONSTAT_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'CST0620260003', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-06-25','2026-06-25','900002',1),('CONTROLE_PIECES','2026-06-25','2026-06-25','900003',2),('TRAITEMENT_TECHNIQUE','2026-06-25','2026-06-26','900004',3),('VISA_VALIDATION','2026-06-26','2026-06-26','900007',4),('EDITION_LIVRABLE','2026-06-26','2026-06-27','900001',5),('ARCHIVAGE','2026-06-27','2026-06-27','900001',6))
     AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='CST0620260003' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_constatation_technique (constatation_id, reference_acte, vehicule_id, numero_constat, date_constat, heure_constat, lieu, expert_nom, equipement_verif, kilometrage, nom_chauffeur, etat_general, constats, date_saisie, utilisateur_saisie, statut, rang)
SELECT '1a000000-0000-0000-0000-000000000003', 'CST0620260003', 'a0000000-0000-0000-0000-000000000001', 'CST-2026-003', '2026-06-25', '09:30', 'Atelier SRB Analamanga', 'RABENJA Fidy', 'Valise diagnostic OBD', 85000, 'RAVELOSON Marie', '2', 'Usure importante des plaquettes de frein, fuite au niveau du radiateur, pneus avant à changer.', '2026-06-25', '900004', 'V', 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_constatation_technique WHERE constatation_id = '1a000000-0000-0000-0000-000000000003');
INSERT INTO traitement_siigpe.tsi_constatation_element (constatation_element_id, constatation_id, element_id, conforme, observation, ordre_priorite)
SELECT '1b000000-0000-0000-0000-000000000001', '1a000000-0000-0000-0000-000000000003', (SELECT element_id FROM referentiel_siigpe.rsi_element_constatation ORDER BY element_id LIMIT 1), 'N', 'Non conforme, à remplacer', 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_constatation_element WHERE constatation_element_id = '1b000000-0000-0000-0000-000000000001');
INSERT INTO traitement_siigpe.tsi_constatation_piece_remplacer (id, constatation_id, libelle, rang)
SELECT '1c000000-0000-0000-0000-000000000001', '1a000000-0000-0000-0000-000000000003', 'Plaquettes de frein avant', 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_constatation_piece_remplacer WHERE id = '1c000000-0000-0000-0000-000000000001');
INSERT INTO traitement_siigpe.tsi_constatation_piece_remplacer (id, constatation_id, libelle, rang)
SELECT '1c000000-0000-0000-0000-000000000002', '1a000000-0000-0000-0000-000000000003', 'Radiateur', 2
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_constatation_piece_remplacer WHERE id = '1c000000-0000-0000-0000-000000000002');
INSERT INTO traitement_siigpe.tsi_constatation_reparation (id, constatation_id, libelle, rang)
SELECT '1d000000-0000-0000-0000-000000000001', '1a000000-0000-0000-0000-000000000003', 'Remplacement plaquettes de frein avant', 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_constatation_reparation WHERE id = '1d000000-0000-0000-0000-000000000001');
INSERT INTO traitement_siigpe.tsi_constatation_reparation (id, constatation_id, libelle, rang)
SELECT '1d000000-0000-0000-0000-000000000002', '1a000000-0000-0000-0000-000000000003', 'Réparation fuite radiateur', 2
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_constatation_reparation WHERE id = '1d000000-0000-0000-0000-000000000002');
INSERT INTO referentiel_siigpe.rsi_constatation_technique (reference_acte, vehicule_id, numero_constat, date_constat, etat_general, valide_par, statut)
SELECT 'CST0620260003', 'a0000000-0000-0000-0000-000000000001', 'CST-2026-003', '2026-06-25', '2', '900007', 'V'
WHERE NOT EXISTS (SELECT 1 FROM referentiel_siigpe.rsi_constatation_technique WHERE reference_acte = 'CST0620260003');
INSERT INTO document.document_genere (document_id, reference_acte, modele_id, numero_document, version, statut, genere_par, genere_le)
SELECT gen_random_uuid(), 'CST0620260003', (SELECT modele_id FROM document.modele_document WHERE code = 'PV_CONSTATATION'), 'PV_CONSTATATION-2026-0001', 1, 'VALIDE', '900001', '2026-06-27 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM document.document_genere WHERE reference_acte = 'CST0620260003' AND modele_id = (SELECT modele_id FROM document.modele_document WHERE code = 'PV_CONSTATATION'));

-- --- III. VISA BON DE COMMANDE (VA_VISA_BC / VBC, juillet 2026) ---
INSERT INTO traitement_siigpe.tsi_sequence_dossier (type_acte, annee, mois, dernier_numero) VALUES ('VBC', 2026, 7, 3)
ON CONFLICT (type_acte, annee, mois) DO UPDATE SET dernier_numero = GREATEST(traitement_siigpe.tsi_sequence_dossier.dernier_numero, 3);

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'VBC0720260001', 'Visa bon de commande - entretien courant', 'VBC', 'BSCVA', '71', '2026-07-02', '2026-07-02', 'VA_VISA_BC_ACTIVITE', 'VA_VISA_BC'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'VBC0720260001');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_VISA_BC','VA_VISA_BC_ACTIVITE','DEPOT_DOSSIER','2026-07-02','2026-07-02','VBC0720260001','900002',1
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='VBC0720260001' AND tache_a_faire='DEPOT_DOSSIER');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_VISA_BC','VA_VISA_BC_ACTIVITE','CONTROLE_PIECES','2026-07-02',NULL,'VBC0720260001',NULL,2
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='VBC0720260001' AND tache_a_faire='CONTROLE_PIECES');
INSERT INTO traitement_siigpe.tsi_visa_bon_commande (visa_bc_id, reference_acte, vehicule_id, numero_bc, date_bc, fournisseur, nif_stat, montant, grands_travaux, date_saisie, utilisateur_saisie, statut)
SELECT '16000000-0000-0000-0000-000000000001', 'VBC0720260001', 'a0000000-0000-0000-0000-000000000003', 'BC-2026-0038', '2026-07-02', 'Garage STAR Automobile', '3000789012', 480000, 0, '2026-07-02', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_visa_bon_commande WHERE visa_bc_id = '16000000-0000-0000-0000-000000000001');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'VBC0720260002', 'Visa bon de commande - grands travaux', 'VBC', 'BSCVA', '81', '2026-07-06', '2026-07-06', 'VA_VISA_BC_ACTIVITE', 'VA_VISA_BC'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'VBC0720260002');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_VISA_BC', 'VA_VISA_BC_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'VBC0720260002', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-07-06','2026-07-06','900002',1),('CONTROLE_PIECES','2026-07-06','2026-07-07','900003',2),('TRAITEMENT_TECHNIQUE','2026-07-07','2026-07-08','900004',3),('VISA_VALIDATION','2026-07-08',NULL,NULL,4)) AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='VBC0720260002' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_visa_bon_commande (visa_bc_id, reference_acte, vehicule_id, numero_bc, date_bc, fournisseur, nif_stat, montant, grands_travaux, date_saisie, utilisateur_saisie, statut)
SELECT '16000000-0000-0000-0000-000000000002', 'VBC0720260002', 'a0000000-0000-0000-0000-000000000005', 'BC-2026-0041', '2026-07-06', 'CFAO Motors Madagascar', '2000456789', 3100000, 1, '2026-07-06', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_visa_bon_commande WHERE visa_bc_id = '16000000-0000-0000-0000-000000000002');

-- Storyline V01 : réparations issues de CST0620260003, réglées via ETR0720260001
INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'VBC0720260003', 'Visa bon de commande - réparation freins/radiateur (véhicule 1234 TBA)', 'VBC', 'BSCVA', '21', '2026-07-05', '2026-07-05', 'VA_VISA_BC_ACTIVITE', 'VA_VISA_BC'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'VBC0720260003');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_VISA_BC', 'VA_VISA_BC_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'VBC0720260003', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-07-05','2026-07-05','900002',1),('CONTROLE_PIECES','2026-07-05','2026-07-06','900003',2),('TRAITEMENT_TECHNIQUE','2026-07-06','2026-07-08','900004',3),('VISA_VALIDATION','2026-07-08','2026-07-10','900007',4),('EDITION_LIVRABLE','2026-07-10','2026-07-11','900001',5),('ARCHIVAGE','2026-07-11','2026-07-11','900001',6))
     AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='VBC0720260003' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_visa_bon_commande (visa_bc_id, reference_acte, vehicule_id, numero_bc, date_bc, fournisseur, nif_stat, montant, reference_pv_constat, grands_travaux, numero_visa, date_visa, sens_visa, decision, entretien_reparation_vehicule_id, date_saisie, utilisateur_saisie, statut)
SELECT '16000000-0000-0000-0000-000000000003', 'VBC0720260003', 'a0000000-0000-0000-0000-000000000001', 'BC-2026-0045', '2026-07-05', 'Sodiama Motors', '3000123456', 1850000, 'CST0620260003', 1, 'VISA-2026-0012', '2026-07-10', 'V', 'VISA', 'ETR0720260001', '2026-07-05', '900002', 'V'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_visa_bon_commande WHERE visa_bc_id = '16000000-0000-0000-0000-000000000003');
INSERT INTO traitement_siigpe.tsi_visa_bc_piece (id, visa_bc_id, designation, quantite, prix_unitaire)
SELECT '17000000-0000-0000-0000-000000000001', '16000000-0000-0000-0000-000000000003', 'Plaquettes de frein avant (jeu)', 1, 350000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_visa_bc_piece WHERE id = '17000000-0000-0000-0000-000000000001');
INSERT INTO traitement_siigpe.tsi_visa_bc_piece (id, visa_bc_id, designation, quantite, prix_unitaire)
SELECT '17000000-0000-0000-0000-000000000002', '16000000-0000-0000-0000-000000000003', 'Radiateur complet', 1, 1500000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_visa_bc_piece WHERE id = '17000000-0000-0000-0000-000000000002');
INSERT INTO referentiel_siigpe.rsi_visa_bon_commande (reference_acte, vehicule_id, numero_bc, date_bc, montant, numero_visa, date_visa, sens_visa, decision, valide_par, statut)
SELECT 'VBC0720260003', 'a0000000-0000-0000-0000-000000000001', 'BC-2026-0045', '2026-07-05', 1850000, 'VISA-2026-0012', '2026-07-10', 'V', 'VISA', '900007', 'V'
WHERE NOT EXISTS (SELECT 1 FROM referentiel_siigpe.rsi_visa_bon_commande WHERE reference_acte = 'VBC0720260003');
INSERT INTO document.document_genere (document_id, reference_acte, modele_id, numero_document, version, statut, genere_par, genere_le)
SELECT gen_random_uuid(), 'VBC0720260003', (SELECT modele_id FROM document.modele_document WHERE code = 'BC_VISE'), 'BC_VISE-2026-0001', 1, 'VALIDE', '900001', '2026-07-11 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM document.document_genere WHERE reference_acte = 'VBC0720260003' AND modele_id = (SELECT modele_id FROM document.modele_document WHERE code = 'BC_VISE'));

-- --- IV. RÉCEPTION TECHNIQUE (VA_RECEPT / RCT, juillet 2026) ---
INSERT INTO traitement_siigpe.tsi_sequence_dossier (type_acte, annee, mois, dernier_numero) VALUES ('RCT', 2026, 7, 3)
ON CONFLICT (type_acte, annee, mois) DO UPDATE SET dernier_numero = GREATEST(traitement_siigpe.tsi_sequence_dossier.dernier_numero, 3);

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'RCT0720260001', 'Réception technique - contrôle standard', 'RCT', 'BSCVA', '65', '2026-07-14', '2026-07-14', 'VA_RECEPT_ACTIVITE', 'VA_RECEPT'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'RCT0720260001');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECEPT','VA_RECEPT_ACTIVITE','DEPOT_DOSSIER','2026-07-14','2026-07-14','RCT0720260001','900002',1
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='RCT0720260001' AND tache_a_faire='DEPOT_DOSSIER');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECEPT','VA_RECEPT_ACTIVITE','CONTROLE_PIECES','2026-07-14',NULL,'RCT0720260001',NULL,2
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='RCT0720260001' AND tache_a_faire='CONTROLE_PIECES');
INSERT INTO traitement_siigpe.tsi_reception_technique (reception_id, reference_acte, vehicule_id, date_reception, heure_reception, min_soa, expert_nom, responsable_nom, date_saisie, utilisateur_saisie, statut)
SELECT '18000000-0000-0000-0000-000000000001', 'RCT0720260001', 'a0000000-0000-0000-0000-000000000004', '2026-07-14', '08:30', 'TP/SRB Analamanga', 'RABENJA Fidy', 'RAKOTOARIMANANA Solo', '2026-07-14', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reception_technique WHERE reception_id = '18000000-0000-0000-0000-000000000001');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'RCT0720260002', 'Réception technique - après réparation moteur', 'RCT', 'BSCVA', '32', '2026-07-16', '2026-07-16', 'VA_RECEPT_ACTIVITE', 'VA_RECEPT'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'RCT0720260002');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECEPT', 'VA_RECEPT_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'RCT0720260002', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-07-16','2026-07-16','900002',1),('CONTROLE_PIECES','2026-07-16','2026-07-17','900003',2),('TRAITEMENT_TECHNIQUE','2026-07-17',NULL,NULL,3)) AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='RCT0720260002' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_reception_technique (reception_id, reference_acte, vehicule_id, date_reception, heure_reception, min_soa, expert_nom, responsable_nom, date_saisie, utilisateur_saisie, statut)
SELECT '18000000-0000-0000-0000-000000000002', 'RCT0720260002', 'a0000000-0000-0000-0000-000000000006', '2026-07-16', '13:00', 'FP/SRB Analamanga', 'RABENJA Fidy', 'RAKOTOARIMANANA Solo', '2026-07-16', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reception_technique WHERE reception_id = '18000000-0000-0000-0000-000000000002');

-- Storyline V01 : réception après réparation, conditionnée par VBC0720260003 (grands_travaux=1, VISA)
INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'RCT0720260003', 'Réception technique après réparation freins/radiateur (véhicule 1234 TBA)', 'RCT', 'BSCVA', '21', '2026-07-20', '2026-07-20', 'VA_RECEPT_ACTIVITE', 'VA_RECEPT'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'RCT0720260003');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECEPT', 'VA_RECEPT_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'RCT0720260003', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-07-20','2026-07-20','900002',1),('CONTROLE_PIECES','2026-07-20','2026-07-20','900003',2),('TRAITEMENT_TECHNIQUE','2026-07-20','2026-07-21','900004',3),('VISA_VALIDATION','2026-07-21','2026-07-21','900007',4),('EDITION_LIVRABLE','2026-07-21','2026-07-22','900001',5),('ARCHIVAGE','2026-07-22','2026-07-22','900001',6))
     AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='RCT0720260003' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_reception_technique (reception_id, reference_acte, vehicule_id, visa_bc_id, date_reception, heure_reception, min_soa, service_fait_gac, expert_nom, responsable_nom, avis, date_saisie, utilisateur_saisie, statut)
SELECT '18000000-0000-0000-0000-000000000003', 'RCT0720260003', 'a0000000-0000-0000-0000-000000000001', '16000000-0000-0000-0000-000000000003', '2026-07-20', '10:00', 'EF/SRB Analamanga', 1, 'RABENJA Fidy', 'RAKOTOARIMANANA Solo', 'FAVORABLE', '2026-07-20', '900002', 'V'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reception_technique WHERE reception_id = '18000000-0000-0000-0000-000000000003');
INSERT INTO traitement_siigpe.tsi_reception_constat (id, reception_id, libelle, rang)
SELECT '19000000-0000-0000-0000-000000000001', '18000000-0000-0000-0000-000000000003', 'Plaquettes de frein remplacées conformément au BC', 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reception_constat WHERE id = '19000000-0000-0000-0000-000000000001');
INSERT INTO traitement_siigpe.tsi_reception_constat (id, reception_id, libelle, rang)
SELECT '19000000-0000-0000-0000-000000000002', '18000000-0000-0000-0000-000000000003', 'Fuite radiateur colmatée, essai routier concluant', 2
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reception_constat WHERE id = '19000000-0000-0000-0000-000000000002');
INSERT INTO referentiel_siigpe.rsi_reception_technique (reference_acte, vehicule_id, date_reception, service_fait_gac, avis, valide_par, statut)
SELECT 'RCT0720260003', 'a0000000-0000-0000-0000-000000000001', '2026-07-20', 1, 'FAVORABLE', '900007', 'V'
WHERE NOT EXISTS (SELECT 1 FROM referentiel_siigpe.rsi_reception_technique WHERE reference_acte = 'RCT0720260003');
INSERT INTO document.document_genere (document_id, reference_acte, modele_id, numero_document, version, statut, genere_par, genere_le)
SELECT gen_random_uuid(), 'RCT0720260003', (SELECT modele_id FROM document.modele_document WHERE code = 'PV_RECEPTION'), 'PV_RECEPTION-2026-0001', 1, 'VALIDE', '900001', '2026-07-22 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM document.document_genere WHERE reference_acte = 'RCT0720260003' AND modele_id = (SELECT modele_id FROM document.modele_document WHERE code = 'PV_RECEPTION'));

-- --- V. RÉCEPTION VA NEUF (VA_RECEPT_NEUF / RNE, mai 2026) ---
INSERT INTO traitement_siigpe.tsi_sequence_dossier (type_acte, annee, mois, dernier_numero) VALUES ('RNE', 2026, 5, 3)
ON CONFLICT (type_acte, annee, mois) DO UPDATE SET dernier_numero = GREATEST(traitement_siigpe.tsi_sequence_dossier.dernier_numero, 3);

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'RNE0520260001', 'Réception véhicule neuf - don partenaire technique', 'RNE', 'BSCVA', '71', '2026-05-03', '2026-05-03', 'VA_RECEPT_NEUF_ACTIVITE', 'VA_RECEPT_NEUF'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'RNE0520260001');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECEPT_NEUF','VA_RECEPT_NEUF_ACTIVITE','DEPOT_DOSSIER','2026-05-03','2026-05-03','RNE0520260001','900002',1
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='RNE0520260001' AND tache_a_faire='DEPOT_DOSSIER');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECEPT_NEUF','VA_RECEPT_NEUF_ACTIVITE','CONTROLE_PIECES','2026-05-03',NULL,'RNE0520260001',NULL,2
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='RNE0520260001' AND tache_a_faire='CONTROLE_PIECES');
INSERT INTO traitement_siigpe.tsi_reception_va_neuf (reception_neuf_id, reference_acte, budget_code, type_acquisition, fournisseur_nom, date_saisie, utilisateur_saisie, statut)
SELECT '21000000-0000-0000-0000-000000000001', 'RNE0520260001', 'BUD-2026-SP-02', 'DONATION', 'Coopération sanitaire régionale', '2026-05-03', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reception_va_neuf WHERE reception_neuf_id = '21000000-0000-0000-0000-000000000001');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'RNE0520260002', 'Réception véhicule neuf - marché public', 'RNE', 'BSCVA', '14', '2026-05-06', '2026-05-06', 'VA_RECEPT_NEUF_ACTIVITE', 'VA_RECEPT_NEUF'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'RNE0520260002');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECEPT_NEUF', 'VA_RECEPT_NEUF_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'RNE0520260002', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-05-06','2026-05-06','900002',1),('CONTROLE_PIECES','2026-05-06','2026-05-07','900003',2),('TRAITEMENT_TECHNIQUE','2026-05-07','2026-05-09','900004',3),('VISA_VALIDATION','2026-05-09','2026-05-10','900007',4),('EDITION_LIVRABLE','2026-05-10',NULL,NULL,5)) AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='RNE0520260002' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_reception_va_neuf (reception_neuf_id, reference_acte, budget_code, type_acquisition, reference_marche, fournisseur_nom, date_saisie, utilisateur_saisie, statut)
SELECT '21000000-0000-0000-0000-000000000002', 'RNE0520260002', 'BUD-2026-ID-05', 'MARCHE', 'MARCHE-2026-0021', 'CFAO Motors Madagascar', '2026-05-06', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reception_va_neuf WHERE reception_neuf_id = '21000000-0000-0000-0000-000000000002');

-- Storyline V12 : acquisition neuve par marché public
INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'RNE0520260003', 'Réception véhicule neuf - marché public (véhicule 7777 TBL)', 'RNE', 'BSCVA', '21', '2026-05-10', '2026-05-10', 'VA_RECEPT_NEUF_ACTIVITE', 'VA_RECEPT_NEUF'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'RNE0520260003');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_RECEPT_NEUF', 'VA_RECEPT_NEUF_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'RNE0520260003', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-05-10','2026-05-10','900002',1),('CONTROLE_PIECES','2026-05-10','2026-05-11','900003',2),('TRAITEMENT_TECHNIQUE','2026-05-11','2026-05-12','900004',3),('VISA_VALIDATION','2026-05-12','2026-05-13','900007',4),('EDITION_LIVRABLE','2026-05-13','2026-05-14','900001',5),('ARCHIVAGE','2026-05-15','2026-05-15','900001',6))
     AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='RNE0520260003' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_reception_va_neuf (reception_neuf_id, reference_acte, budget_code, chapitre, article, compte, financement, commune, type_acquisition, reference_marche, date_consultation, fournisseur_nom, fournisseur_adresse, fournisseur_stat, fournisseur_nif, depositaire_nom, decision_commission, date_pv, date_saisie, utilisateur_saisie, statut)
SELECT '21000000-0000-0000-0000-000000000003', 'RNE0520260003', 'BUD-2026-EF-01', '21', '2182', '218200', 'Budget Général', 'Antananarivo I', 'MARCHE', 'MARCHE-2026-0034', '2026-02-15', 'CFAO Motors Madagascar', 'Route Circulaire, Ankorondrano, Antananarivo', '12345212016000456', '2000456789', 'RAKOTOARIMANANA Solo', 'Réception sans réserve', '2026-05-15', '2026-05-10', '900002', 'V'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reception_va_neuf WHERE reception_neuf_id = '21000000-0000-0000-0000-000000000003');
INSERT INTO traitement_siigpe.tsi_reception_neuf_ligne (id, reception_neuf_id, vehicule_id, designation, immatriculation, genre, type_veh, marque, numero_serie, carrosserie, numero_moteur, puissance, source_energie, nombre_place, date_premiere_mise, quantite_facturee, quantite_reconnue, decision, rang)
SELECT '22000000-0000-0000-0000-000000000001', '21000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-00000000000c', 'Véhicule de fonction - Berline', '7777 TBL', 'VP', 'Berline', 'Mercedes-Benz', 'WDD2050441F012345', 'BERLINE', 'MT2233445', '5', 'HYBRIDE', 5, '2023-03-01', 1, 1, 'Sans changement', 1
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_reception_neuf_ligne WHERE id = '22000000-0000-0000-0000-000000000001');
INSERT INTO referentiel_siigpe.rsi_reception_va_neuf (reference_acte, budget_code, type_acquisition, reference_marche, fournisseur_nom, date_pv, valide_par, statut)
SELECT 'RNE0520260003', 'BUD-2026-EF-01', 'MARCHE', 'MARCHE-2026-0034', 'CFAO Motors Madagascar', '2026-05-15', '900007', 'V'
WHERE NOT EXISTS (SELECT 1 FROM referentiel_siigpe.rsi_reception_va_neuf WHERE reference_acte = 'RNE0520260003');
INSERT INTO document.document_genere (document_id, reference_acte, modele_id, numero_document, version, statut, genere_par, genere_le)
SELECT gen_random_uuid(), 'RNE0520260003', (SELECT modele_id FROM document.modele_document WHERE code = 'PV_ORDRE_RECETTE'), 'PV_ORDRE_RECETTE-2026-0001', 1, 'VALIDE', '900001', '2026-05-15 14:00:00'
WHERE NOT EXISTS (SELECT 1 FROM document.document_genere WHERE reference_acte = 'RNE0520260003' AND modele_id = (SELECT modele_id FROM document.modele_document WHERE code = 'PV_ORDRE_RECETTE'));

-- --- VI. ARRÊTAGE LIVRET (VA_ARRET_LIV / ARL, mai 2026) ---
INSERT INTO traitement_siigpe.tsi_sequence_dossier (type_acte, annee, mois, dernier_numero) VALUES ('ARL', 2026, 5, 3)
ON CONFLICT (type_acte, annee, mois) DO UPDATE SET dernier_numero = GREATEST(traitement_siigpe.tsi_sequence_dossier.dernier_numero, 3);

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'ARL0520260001', 'Arrêtage livret annuel - SA', 'ARL', 'BSCVA', '81', '2026-05-04', '2026-05-04', 'VA_ARRET_LIV_ACTIVITE', 'VA_ARRET_LIV'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'ARL0520260001');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_ARRET_LIV','VA_ARRET_LIV_ACTIVITE','DEPOT_DOSSIER','2026-05-04','2026-05-04','ARL0520260001','900002',1
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='ARL0520260001' AND tache_a_faire='DEPOT_DOSSIER');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_ARRET_LIV','VA_ARRET_LIV_ACTIVITE','CONTROLE_PIECES','2026-05-04',NULL,'ARL0520260001',NULL,2
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='ARL0520260001' AND tache_a_faire='CONTROLE_PIECES');
INSERT INTO traitement_siigpe.tsi_arretage_livret (arretage_id, reference_acte, vehicule_id, date_arretage, dernier_bc, vehicule_fonction, date_saisie, utilisateur_saisie, statut)
SELECT '23000000-0000-0000-0000-000000000001', 'ARL0520260001', 'a0000000-0000-0000-0000-000000000005', '2025-12-31', 'BC-2025-0142', 0, '2026-05-04', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_arretage_livret WHERE arretage_id = '23000000-0000-0000-0000-000000000001');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'ARL0520260002', 'Arrêtage livret annuel - Garage-Station', 'ARL', 'BSCVA', '71', '2026-05-07', '2026-05-07', 'VA_ARRET_LIV_ACTIVITE', 'VA_ARRET_LIV'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'ARL0520260002');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_ARRET_LIV', 'VA_ARRET_LIV_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'ARL0520260002', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-05-07','2026-05-07','900002',1),('CONTROLE_PIECES','2026-05-07','2026-05-08','900003',2),('TRAITEMENT_TECHNIQUE','2026-05-08','2026-05-09','900004',3),('VISA_VALIDATION','2026-05-09',NULL,NULL,4)) AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='ARL0520260002' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_arretage_livret (arretage_id, reference_acte, vehicule_id, date_arretage, dernier_bc, vehicule_fonction, date_saisie, utilisateur_saisie, statut)
SELECT '23000000-0000-0000-0000-000000000002', 'ARL0520260002', 'a0000000-0000-0000-0000-000000000003', '2025-12-31', 'BC-2025-0156', 0, '2026-05-07', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_arretage_livret WHERE arretage_id = '23000000-0000-0000-0000-000000000002');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'ARL0520260003', 'Arrêtage livret annuel - véhicule de fonction bus', 'ARL', 'BSCVA', '32', '2026-05-05', '2026-05-05', 'VA_ARRET_LIV_ACTIVITE', 'VA_ARRET_LIV'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'ARL0520260003');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_ARRET_LIV', 'VA_ARRET_LIV_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'ARL0520260003', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-05-05','2026-05-05','900002',1),('CONTROLE_PIECES','2026-05-05','2026-05-05','900003',2),('TRAITEMENT_TECHNIQUE','2026-05-05','2026-05-05','900004',3),('VISA_VALIDATION','2026-05-05','2026-05-05','900007',4),('EDITION_LIVRABLE','2026-05-05','2026-05-05','900001',5),('ARCHIVAGE','2026-05-05','2026-05-05','900001',6))
     AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='ARL0520260003' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_arretage_livret (arretage_id, reference_acte, vehicule_id, date_arretage, dernier_bc, vehicule_fonction, date_saisie, utilisateur_saisie, statut)
SELECT '23000000-0000-0000-0000-000000000003', 'ARL0520260003', 'a0000000-0000-0000-0000-000000000006', '2025-12-31', 'BC-2025-0198', 0, '2026-05-05', '900002', 'V'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_arretage_livret WHERE arretage_id = '23000000-0000-0000-0000-000000000003');
INSERT INTO traitement_siigpe.tsi_arretage_livret_detail (id, arretage_id, type_livret_code, rubrique, valeur_arretee, observation)
SELECT '24000000-0000-0000-0000-000000000001', '23000000-0000-0000-0000-000000000003', 'SA', 'Consommation carburant annuelle', 4500000, 'Conforme au relevé SA'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_arretage_livret_detail WHERE id = '24000000-0000-0000-0000-000000000001');
INSERT INTO traitement_siigpe.tsi_arretage_livret_detail (id, arretage_id, type_livret_code, rubrique, valeur_arretee, observation)
SELECT '24000000-0000-0000-0000-000000000002', '23000000-0000-0000-0000-000000000003', 'PARCOURS', 'Kilométrage parcouru', 28500, 'Compteur vérifié'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_arretage_livret_detail WHERE id = '24000000-0000-0000-0000-000000000002');
INSERT INTO referentiel_siigpe.rsi_arretage_livret (reference_acte, vehicule_id, date_arretage, dernier_bc, valide_par, statut)
SELECT 'ARL0520260003', 'a0000000-0000-0000-0000-000000000006', '2025-12-31', 'BC-2025-0198', '900007', 'V'
WHERE NOT EXISTS (SELECT 1 FROM referentiel_siigpe.rsi_arretage_livret WHERE reference_acte = 'ARL0520260003');
INSERT INTO document.document_genere (document_id, reference_acte, modele_id, numero_document, version, statut, genere_par, genere_le)
SELECT gen_random_uuid(), 'ARL0520260003', (SELECT modele_id FROM document.modele_document WHERE code = 'VISA_ARRETAGE_LIVRET'), 'VISA_ARRETAGE_LIVRET-2026-0001', 1, 'VALIDE', '900001', '2026-05-05 16:00:00'
WHERE NOT EXISTS (SELECT 1 FROM document.document_genere WHERE reference_acte = 'ARL0520260003' AND modele_id = (SELECT modele_id FROM document.modele_document WHERE code = 'VISA_ARRETAGE_LIVRET'));

-- --- VII. CONTRÔLE D'APTITUDE / LOCATION (VA_LOCATION / LOC, août 2026) ---
INSERT INTO traitement_siigpe.tsi_sequence_dossier (type_acte, annee, mois, dernier_numero) VALUES ('LOC', 2026, 8, 3)
ON CONFLICT (type_acte, annee, mois) DO UPDATE SET dernier_numero = GREATEST(traitement_siigpe.tsi_sequence_dossier.dernier_numero, 3);

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'LOC0820260001', 'Contrôle aptitude - véhicule loué pour mission ponctuelle', 'LOC', 'BSCVA', '71', '2026-08-02', '2026-08-02', 'VA_LOCATION_ACTIVITE', 'VA_LOCATION'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'LOC0820260001');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_LOCATION','VA_LOCATION_ACTIVITE','DEPOT_DOSSIER','2026-08-02','2026-08-02','LOC0820260001','900002',1
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='LOC0820260001' AND tache_a_faire='DEPOT_DOSSIER');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_LOCATION','VA_LOCATION_ACTIVITE','CONTROLE_PIECES','2026-08-02',NULL,'LOC0820260001',NULL,2
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='LOC0820260001' AND tache_a_faire='CONTROLE_PIECES');
INSERT INTO traitement_siigpe.tsi_controle_aptitude (aptitude_id, reference_acte, vehicule_id, objet_mission, itineraire, date_debut, date_fin, contrat_location, fournisseur_nif_stat, date_saisie, utilisateur_saisie, statut)
SELECT '25000000-0000-0000-0000-000000000001', 'LOC0820260001', 'a0000000-0000-0000-0000-000000000009', 'Transport de fournitures médicales', 'Antananarivo - Andramasina', '2026-08-10', '2026-08-11', 'CTR-LOC-2026-0008', '3000345678', '2026-08-02', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_controle_aptitude WHERE aptitude_id = '25000000-0000-0000-0000-000000000001');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'LOC0820260002', 'Contrôle aptitude - véhicule loué mission régionale', 'LOC', 'BSCVA', '81', '2026-08-04', '2026-08-04', 'VA_LOCATION_ACTIVITE', 'VA_LOCATION'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'LOC0820260002');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_LOCATION', 'VA_LOCATION_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'LOC0820260002', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-08-04','2026-08-04','900002',1),('CONTROLE_PIECES','2026-08-04','2026-08-05','900003',2),('TRAITEMENT_TECHNIQUE','2026-08-05',NULL,NULL,3)) AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='LOC0820260002' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_controle_aptitude (aptitude_id, reference_acte, vehicule_id, objet_mission, itineraire, date_debut, date_fin, contrat_location, fournisseur_nif_stat, date_saisie, utilisateur_saisie, statut)
SELECT '25000000-0000-0000-0000-000000000002', 'LOC0820260002', 'a0000000-0000-0000-0000-00000000000e', 'Supervision rentrée scolaire régionale', 'Antananarivo - Manjakandriana', '2026-08-20', '2026-08-22', 'CTR-LOC-2026-0009', '3000901234', '2026-08-04', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_controle_aptitude WHERE aptitude_id = '25000000-0000-0000-0000-000000000002');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'LOC0820260003', 'Contrôle aptitude - transport matériel technique', 'LOC', 'BSCVA', '65', '2026-08-01', '2026-08-01', 'VA_LOCATION_ACTIVITE', 'VA_LOCATION'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'LOC0820260003');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_LOCATION', 'VA_LOCATION_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'LOC0820260003', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-08-01','2026-08-01','900002',1),('CONTROLE_PIECES','2026-08-01','2026-08-01','900003',2),('TRAITEMENT_TECHNIQUE','2026-08-01','2026-08-02','900004',3),('VISA_VALIDATION','2026-08-02','2026-08-03','900007',4),('EDITION_LIVRABLE','2026-08-03','2026-08-04','900001',5),('ARCHIVAGE','2026-08-04','2026-08-04','900001',6))
     AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='LOC0820260003' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_controle_aptitude (aptitude_id, reference_acte, vehicule_id, objet_mission, itineraire, date_debut, date_fin, contrat_location, fournisseur_nif_stat, apte, avis_aptitude, date_saisie, utilisateur_saisie, statut)
SELECT '25000000-0000-0000-0000-000000000003', 'LOC0820260003', 'a0000000-0000-0000-0000-000000000009', 'Transport de matériel technique pour mission régionale', 'Antananarivo - Anjozorobe', '2026-08-05', '2026-08-07', 'CTR-LOC-2026-0011', '3000789012', 1, 'APTE', '2026-08-01', '900002', 'V'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_controle_aptitude WHERE aptitude_id = '25000000-0000-0000-0000-000000000003');
INSERT INTO referentiel_siigpe.rsi_controle_aptitude (reference_acte, vehicule_id, date_debut, date_fin, apte, avis_aptitude, valide_par, statut)
SELECT 'LOC0820260003', 'a0000000-0000-0000-0000-000000000009', '2026-08-05', '2026-08-07', 1, 'APTE', '900007', 'V'
WHERE NOT EXISTS (SELECT 1 FROM referentiel_siigpe.rsi_controle_aptitude WHERE reference_acte = 'LOC0820260003');
INSERT INTO document.document_genere (document_id, reference_acte, modele_id, numero_document, version, statut, genere_par, genere_le)
SELECT gen_random_uuid(), 'LOC0820260003', (SELECT modele_id FROM document.modele_document WHERE code = 'AUTORISATION_LOCATION'), 'AUTORISATION_LOCATION-2026-0001', 1, 'VALIDE', '900001', '2026-08-04 11:00:00'
WHERE NOT EXISTS (SELECT 1 FROM document.document_genere WHERE reference_acte = 'LOC0820260003' AND modele_id = (SELECT modele_id FROM document.modele_document WHERE code = 'AUTORISATION_LOCATION'));

-- --- VIII. ATTESTATION DE CARACTÉRISTIQUES (VA_ATT_CARAC / CAR, août 2026) ---
INSERT INTO traitement_siigpe.tsi_sequence_dossier (type_acte, annee, mois, dernier_numero) VALUES ('CAR', 2026, 8, 3)
ON CONFLICT (type_acte, annee, mois) DO UPDATE SET dernier_numero = GREATEST(traitement_siigpe.tsi_sequence_dossier.dernier_numero, 3);

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'CAR0820260001', 'Attestation de caractéristiques - carte grise détériorée', 'CAR', 'BSCVA', '81', '2026-08-06', '2026-08-06', 'VA_ATT_CARAC_ACTIVITE', 'VA_ATT_CARAC'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'CAR0820260001');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_ATT_CARAC','VA_ATT_CARAC_ACTIVITE','DEPOT_DOSSIER','2026-08-06','2026-08-06','CAR0820260001','900002',1
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='CAR0820260001' AND tache_a_faire='DEPOT_DOSSIER');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_ATT_CARAC','VA_ATT_CARAC_ACTIVITE','CONTROLE_PIECES','2026-08-06',NULL,'CAR0820260001',NULL,2
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='CAR0820260001' AND tache_a_faire='CONTROLE_PIECES');
INSERT INTO traitement_siigpe.tsi_attestation_caracteristique (attestation_id, reference_acte, vehicule_id, min_code, immatriculation, marque, genre, motif_perte, date_saisie, utilisateur_saisie, statut)
SELECT '26000000-0000-0000-0000-000000000001', 'CAR0820260001', 'a0000000-0000-0000-0000-00000000000d', '81', '8888 TBM', 'Nissan', 'VP', 'Détérioration suite à inondation des locaux', '2026-08-06', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_attestation_caracteristique WHERE attestation_id = '26000000-0000-0000-0000-000000000001');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'CAR0820260002', 'Attestation de caractéristiques - perte carte grise', 'CAR', 'BSCVA', '71', '2026-08-09', '2026-08-09', 'VA_ATT_CARAC_ACTIVITE', 'VA_ATT_CARAC'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'CAR0820260002');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_ATT_CARAC', 'VA_ATT_CARAC_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'CAR0820260002', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-08-09','2026-08-09','900002',1),('CONTROLE_PIECES','2026-08-09','2026-08-09','900003',2),('TRAITEMENT_TECHNIQUE','2026-08-09','2026-08-10','900004',3),('VISA_VALIDATION','2026-08-10',NULL,NULL,4)) AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='CAR0820260002' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_attestation_caracteristique (attestation_id, reference_acte, vehicule_id, min_code, immatriculation, marque, genre, motif_perte, date_saisie, utilisateur_saisie, statut)
SELECT '26000000-0000-0000-0000-000000000002', 'CAR0820260002', 'a0000000-0000-0000-0000-00000000000b', '71', '6666 TBK', 'Hyundai', 'VP', 'Perte lors d''un déplacement de service', '2026-08-09', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_attestation_caracteristique WHERE attestation_id = '26000000-0000-0000-0000-000000000002');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'CAR0820260003', 'Attestation de caractéristiques - perte carte grise (véhicule 3333 TBH)', 'CAR', 'BSCVA', '14', '2026-08-10', '2026-08-10', 'VA_ATT_CARAC_ACTIVITE', 'VA_ATT_CARAC'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'CAR0820260003');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_ATT_CARAC', 'VA_ATT_CARAC_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'CAR0820260003', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-08-10','2026-08-10','900002',1),('CONTROLE_PIECES','2026-08-10','2026-08-10','900003',2),('TRAITEMENT_TECHNIQUE','2026-08-10','2026-08-11','900004',3),('VISA_VALIDATION','2026-08-11','2026-08-11','900007',4),('EDITION_LIVRABLE','2026-08-11','2026-08-12','900001',5),('ARCHIVAGE','2026-08-12','2026-08-12','900001',6))
     AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='CAR0820260003' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_attestation_caracteristique (attestation_id, reference_acte, vehicule_id, min_code, soa_libelle, immatriculation, marque, genre, carrosserie, type_veh, numero_serie_type, numero_moteur, nombre_place, source_energie, puissance_admin, poids_vide, charge_utile, ptac, annee_premiere_mise, motif_perte, date_saisie, utilisateur_saisie, statut)
SELECT '26000000-0000-0000-0000-000000000003', 'CAR0820260003', 'a0000000-0000-0000-0000-000000000008', '14', 'Direction Régionale Intérieur', '3333 TBH', 'Toyota', 'VP', 'BERLINE', 'Corolla', 'JTDBR32E720012345', 'MT8901234', 5, 'ESSENCE', '5', 1150, 400, 1550, 2015, 'Perte de la carte grise (déclaration de perte jointe)', '2026-08-10', '900002', 'V'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_attestation_caracteristique WHERE attestation_id = '26000000-0000-0000-0000-000000000003');
INSERT INTO referentiel_siigpe.rsi_attestation_caracteristique (reference_acte, vehicule_id, immatriculation, marque, genre, valide_par, statut)
SELECT 'CAR0820260003', 'a0000000-0000-0000-0000-000000000008', '3333 TBH', 'Toyota', 'VP', '900007', 'V'
WHERE NOT EXISTS (SELECT 1 FROM referentiel_siigpe.rsi_attestation_caracteristique WHERE reference_acte = 'CAR0820260003');
INSERT INTO document.document_genere (document_id, reference_acte, modele_id, numero_document, version, statut, genere_par, genere_le)
SELECT gen_random_uuid(), 'CAR0820260003', (SELECT modele_id FROM document.modele_document WHERE code = 'ATTESTATION_CARACTERISTIQUE'), 'ATTESTATION_CARACTERISTIQUE-2026-0001', 1, 'VALIDE', '900001', '2026-08-12 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM document.document_genere WHERE reference_acte = 'CAR0820260003' AND modele_id = (SELECT modele_id FROM document.modele_document WHERE code = 'ATTESTATION_CARACTERISTIQUE'));

-- --- IX. EXPERTISE ACCIDENT (VA_EXPERTISE / EXP, juillet 2026) ---
-- Alimente GET /api/reporting/vehicules-accidentes (3 lignes tsi_expertise_accident, tous statuts).
INSERT INTO traitement_siigpe.tsi_sequence_dossier (type_acte, annee, mois, dernier_numero) VALUES ('EXP', 2026, 7, 3)
ON CONFLICT (type_acte, annee, mois) DO UPDATE SET dernier_numero = GREATEST(traitement_siigpe.tsi_sequence_dossier.dernier_numero, 3);

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'EXP0720260001', 'Expertise accident - collision légère', 'EXP', 'BSCVA', '65', '2026-07-08', '2026-07-08', 'VA_EXPERTISE_ACTIVITE', 'VA_EXPERTISE'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'EXP0720260001');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_EXPERTISE','VA_EXPERTISE_ACTIVITE','DEPOT_DOSSIER','2026-07-08','2026-07-08','EXP0720260001','900002',1
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='EXP0720260001' AND tache_a_faire='DEPOT_DOSSIER');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_EXPERTISE','VA_EXPERTISE_ACTIVITE','CONTROLE_PIECES','2026-07-08',NULL,'EXP0720260001',NULL,2
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='EXP0720260001' AND tache_a_faire='CONTROLE_PIECES');
INSERT INTO traitement_siigpe.tsi_expertise_accident (expertise_id, reference_acte, vehicule_id, type_expertise, date_accident, lieu_accident, rapport, montant_estime, date_saisie, utilisateur_saisie, statut)
SELECT '11000000-0000-0000-0000-000000000001', 'EXP0720260001', 'a0000000-0000-0000-0000-000000000004', 'EXP', '2026-07-06', 'Route Ambohidratrimo, PK 8', 'Rayures et enfoncement léger portière conducteur, pas de dommage mécanique.', 380000, '2026-07-08', '900004', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_expertise_accident WHERE expertise_id = '11000000-0000-0000-0000-000000000001');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'EXP0720260002', 'Expertise accident - contre-expertise véhicule privé', 'EXP', 'BSCVA', '32', '2026-07-09', '2026-07-09', 'VA_EXPERTISE_ACTIVITE', 'VA_EXPERTISE'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'EXP0720260002');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_EXPERTISE', 'VA_EXPERTISE_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'EXP0720260002', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-07-09','2026-07-09','900002',1),('CONTROLE_PIECES','2026-07-09','2026-07-10','900003',2),('TRAITEMENT_TECHNIQUE','2026-07-10','2026-07-11','900004',3),('VISA_VALIDATION','2026-07-11',NULL,NULL,4)) AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='EXP0720260002' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_expertise_accident (expertise_id, reference_acte, vehicule_id, type_expertise, date_accident, lieu_accident, vehicule_prive_immat, rapport, montant_estime, date_saisie, utilisateur_saisie, statut)
SELECT '11000000-0000-0000-0000-000000000002', 'EXP0720260002', 'a0000000-0000-0000-0000-000000000006', 'CONTRE_EXP', '2026-07-08', 'Carrefour Ankorondrano', '7412 WWZ', 'Contre-expertise suite déclaration du tiers ; dommages tiers évalués contradictoirement.', 950000, '2026-07-09', '900004', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_expertise_accident WHERE expertise_id = '11000000-0000-0000-0000-000000000002');

-- Storyline V02 : accident avec dommages détaillés (dommage total = montant_estime)
INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'EXP0720260003', 'Expertise accident - collision RN7 (véhicule 5678 TBB)', 'EXP', 'BSCVA', '14', '2026-07-13', '2026-07-13', 'VA_EXPERTISE_ACTIVITE', 'VA_EXPERTISE'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'EXP0720260003');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_EXPERTISE', 'VA_EXPERTISE_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'EXP0720260003', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-07-13','2026-07-13','900002',1),('CONTROLE_PIECES','2026-07-13','2026-07-13','900003',2),('TRAITEMENT_TECHNIQUE','2026-07-13','2026-07-14','900004',3),('VISA_VALIDATION','2026-07-14','2026-07-15','900007',4),('EDITION_LIVRABLE','2026-07-15','2026-07-16','900001',5),('ARCHIVAGE','2026-07-16','2026-07-16','900001',6))
     AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='EXP0720260003' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_expertise_accident (expertise_id, reference_acte, vehicule_id, type_expertise, date_accident, lieu_accident, rapport, montant_estime, date_saisie, utilisateur_saisie, statut)
SELECT '11000000-0000-0000-0000-000000000003', 'EXP0720260003', 'a0000000-0000-0000-0000-000000000002', 'EXP', '2026-07-12', 'RN7, PK 12, Ambohimanga', 'Collision avec un véhicule privé à un carrefour. Dommages à l''avant du véhicule.', 3200000, '2026-07-13', '900004', 'V'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_expertise_accident WHERE expertise_id = '11000000-0000-0000-0000-000000000003');
INSERT INTO traitement_siigpe.tsi_expertise_dommage (id, expertise_id, libelle, cout_estime)
SELECT '12000000-0000-0000-0000-000000000001', '11000000-0000-0000-0000-000000000003', 'Pare-choc avant', 800000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_expertise_dommage WHERE id = '12000000-0000-0000-0000-000000000001');
INSERT INTO traitement_siigpe.tsi_expertise_dommage (id, expertise_id, libelle, cout_estime)
SELECT '12000000-0000-0000-0000-000000000002', '11000000-0000-0000-0000-000000000003', 'Phare avant droit', 450000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_expertise_dommage WHERE id = '12000000-0000-0000-0000-000000000002');
INSERT INTO traitement_siigpe.tsi_expertise_dommage (id, expertise_id, libelle, cout_estime)
SELECT '12000000-0000-0000-0000-000000000003', '11000000-0000-0000-0000-000000000003', 'Aile avant droite', 950000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_expertise_dommage WHERE id = '12000000-0000-0000-0000-000000000003');
INSERT INTO traitement_siigpe.tsi_expertise_dommage (id, expertise_id, libelle, cout_estime)
SELECT '12000000-0000-0000-0000-000000000004', '11000000-0000-0000-0000-000000000003', 'Radiateur', 1000000
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_expertise_dommage WHERE id = '12000000-0000-0000-0000-000000000004');
INSERT INTO referentiel_siigpe.rsi_expertise_accident (reference_acte, vehicule_id, type_expertise, date_accident, montant_estime, valide_par, statut)
SELECT 'EXP0720260003', 'a0000000-0000-0000-0000-000000000002', 'EXP', '2026-07-12', 3200000, '900007', 'V'
WHERE NOT EXISTS (SELECT 1 FROM referentiel_siigpe.rsi_expertise_accident WHERE reference_acte = 'EXP0720260003');
INSERT INTO document.document_genere (document_id, reference_acte, modele_id, numero_document, version, statut, genere_par, genere_le)
SELECT gen_random_uuid(), 'EXP0720260003', (SELECT modele_id FROM document.modele_document WHERE code = 'RAPPORT_EXPERTISE'), 'RAPPORT_EXPERTISE-2026-0001', 1, 'VALIDE', '900001', '2026-07-16 10:00:00'
WHERE NOT EXISTS (SELECT 1 FROM document.document_genere WHERE reference_acte = 'EXP0720260003' AND modele_id = (SELECT modele_id FROM document.modele_document WHERE code = 'RAPPORT_EXPERTISE'));

-- --- X. ÉVALUATION / CONDAMNATION (VA_CONDAMN / CDN, juin 2026) ---
-- Alimente GET /api/reporting/vehicules-a-condamner (dossier #2, statut NULL = en attente).
INSERT INTO traitement_siigpe.tsi_sequence_dossier (type_acte, annee, mois, dernier_numero) VALUES ('CDN', 2026, 6, 3)
ON CONFLICT (type_acte, annee, mois) DO UPDATE SET dernier_numero = GREATEST(traitement_siigpe.tsi_sequence_dossier.dernier_numero, 3);

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'CDN0620260001', 'Évaluation en vue de condamnation - véhicule accidenté irréparable', 'CDN', 'BSCVA', '14', '2026-06-12', '2026-06-12', 'VA_CONDAMN_ACTIVITE', 'VA_CONDAMN'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'CDN0620260001');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_CONDAMN','VA_CONDAMN_ACTIVITE','DEPOT_DOSSIER','2026-06-12','2026-06-12','CDN0620260001','900002',1
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='CDN0620260001' AND tache_a_faire='DEPOT_DOSSIER');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_CONDAMN','VA_CONDAMN_ACTIVITE','CONTROLE_PIECES','2026-06-12',NULL,'CDN0620260001',NULL,2
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='CDN0620260001' AND tache_a_faire='CONTROLE_PIECES');
INSERT INTO traitement_siigpe.tsi_evaluation_condamnation (evaluation_id, reference_acte, vehicule_id, valeur_estimee, mise_a_prix, fiche_technique, motif_condamnation, date_saisie, utilisateur_saisie, statut)
SELECT '13000000-0000-0000-0000-000000000001', 'CDN0620260001', 'a0000000-0000-0000-0000-000000000002', 25000000, 10000000, 'Dossier en cours d''instruction suite accident.', 'Dommages accidentels importants à évaluer', '2026-06-12', '900004', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_evaluation_condamnation WHERE evaluation_id = '13000000-0000-0000-0000-000000000001');

-- Dossier #2, en cours (TRAITEMENT_TECHNIQUE), statut NULL => "à condamner" (en attente) sur le dashboard
INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'CDN0620260002', 'Évaluation en vue de condamnation - véhicule vétuste (véhicule 4444 TBI)', 'CDN', 'BSCVA', '65', '2026-06-16', '2026-06-16', 'VA_CONDAMN_ACTIVITE', 'VA_CONDAMN'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'CDN0620260002');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_CONDAMN', 'VA_CONDAMN_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'CDN0620260002', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-06-16','2026-06-16','900002',1),('CONTROLE_PIECES','2026-06-16','2026-06-17','900003',2),('TRAITEMENT_TECHNIQUE','2026-06-17',NULL,NULL,3)) AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='CDN0620260002' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_evaluation_condamnation (evaluation_id, reference_acte, vehicule_id, valeur_estimee, mise_a_prix, fiche_technique, motif_condamnation, date_saisie, utilisateur_saisie, statut)
SELECT '13000000-0000-0000-0000-000000000002', 'CDN0620260002', 'a0000000-0000-0000-0000-000000000009', 30000000, 12000000, 'Châssis corrodé, moteur défaillant, coût de remise en état supérieur à la valeur résiduelle.', 'Vétusté avancée, réparation non rentable', '2026-06-16', '900004', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_evaluation_condamnation WHERE evaluation_id = '13000000-0000-0000-0000-000000000002');

-- Storyline V10 (déjà HS) : condamnation validée, etat_vehicule='HS' cohérent (comme le ferait
-- CondamnationService.validerCondamnation en conditions réelles)
INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'CDN0620260003', 'Évaluation en vue de condamnation - véhicule hors service (véhicule 5555 TBJ)', 'CDN', 'BSCVA', '65', '2026-06-15', '2026-06-15', 'VA_CONDAMN_ACTIVITE', 'VA_CONDAMN'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'CDN0620260003');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_CONDAMN', 'VA_CONDAMN_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'CDN0620260003', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-06-15','2026-06-15','900002',1),('CONTROLE_PIECES','2026-06-15','2026-06-15','900003',2),('TRAITEMENT_TECHNIQUE','2026-06-15','2026-06-15','900004',3),('VISA_VALIDATION','2026-06-15','2026-06-15','900007',4),('EDITION_LIVRABLE','2026-06-15','2026-06-15','900001',5),('ARCHIVAGE','2026-06-15','2026-06-15','900001',6))
     AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='CDN0620260003' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_evaluation_condamnation (evaluation_id, reference_acte, vehicule_id, valeur_estimee, mise_a_prix, fiche_technique, motif_condamnation, date_saisie, utilisateur_saisie, statut)
SELECT '13000000-0000-0000-0000-000000000003', 'CDN0620260003', 'a0000000-0000-0000-0000-00000000000a', 8000000, 3000000, 'Véhicule hors service, moteur HS, châssis corrodé. Irréparable économiquement.', 'Usure avancée et coût de réparation prohibitif', '2026-06-15', '900004', 'V'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_evaluation_condamnation WHERE evaluation_id = '13000000-0000-0000-0000-000000000003');
INSERT INTO referentiel_siigpe.rsi_evaluation_condamnation (reference_acte, vehicule_id, valeur_estimee, mise_a_prix, motif_condamnation, valide_par, statut)
SELECT 'CDN0620260003', 'a0000000-0000-0000-0000-00000000000a', 8000000, 3000000, 'Usure avancée et coût de réparation prohibitif', '900007', 'V'
WHERE NOT EXISTS (SELECT 1 FROM referentiel_siigpe.rsi_evaluation_condamnation WHERE reference_acte = 'CDN0620260003');
INSERT INTO document.document_genere (document_id, reference_acte, modele_id, numero_document, version, statut, genere_par, genere_le)
SELECT gen_random_uuid(), 'CDN0620260003', (SELECT modele_id FROM document.modele_document WHERE code = 'PV_CONDAMNATION'), 'PV_CONDAMNATION-2026-0001', 1, 'VALIDE', '900001', '2026-06-15 15:00:00'
WHERE NOT EXISTS (SELECT 1 FROM document.document_genere WHERE reference_acte = 'CDN0620260003' AND modele_id = (SELECT modele_id FROM document.modele_document WHERE code = 'PV_CONDAMNATION'));
-- V10 (5555 TBJ) était déjà seedé à l'état HS en §2 (cohérent avec cette condamnation validée) — pas
-- de mise à jour supplémentaire nécessaire.

-- --- XI. TEST CHAUFFEUR (VA_TEST_CHAUF / TCH, août 2026) ---
-- Chauffeurs d'abord (traitement_siigpe.tsi_chauffeur, 7 col, pas de reference_acte/workflow propre
-- — seul tsi_chauffeur_test porte le processus).
INSERT INTO traitement_siigpe.tsi_chauffeur (chauffeur_id, nom, matricule, cin, permis, min_code, soa_code)
SELECT '14000000-0000-0000-0000-000000000001', 'RAVALOMANDA Njaka', '100001', '107198712345', 'PC-2015-04521', '21', 'SRB-ANA'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_chauffeur WHERE chauffeur_id = '14000000-0000-0000-0000-000000000001');
INSERT INTO traitement_siigpe.tsi_chauffeur (chauffeur_id, nom, matricule, cin, permis, min_code, soa_code)
SELECT '14000000-0000-0000-0000-000000000002', 'ANDRIANARIVO Tojo', '100002', '108199023456', 'PC-2017-08832', '14', 'DRI-ANA'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_chauffeur WHERE chauffeur_id = '14000000-0000-0000-0000-000000000002');
INSERT INTO traitement_siigpe.tsi_chauffeur (chauffeur_id, nom, matricule, cin, permis, min_code, soa_code)
SELECT '14000000-0000-0000-0000-000000000003', 'RAKOTOZAFY Lala', '100003', '109198534567', 'PC-2012-01198', '32', 'DRFP-ANA'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_chauffeur WHERE chauffeur_id = '14000000-0000-0000-0000-000000000003');
INSERT INTO traitement_siigpe.tsi_chauffeur (chauffeur_id, nom, matricule, cin, permis, min_code, soa_code)
SELECT '14000000-0000-0000-0000-000000000004', 'RANDRIAMANANTENA Faly', '100004', '110199145678', 'PC-2019-06754', '65', 'DRTP-ANA'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_chauffeur WHERE chauffeur_id = '14000000-0000-0000-0000-000000000004');
INSERT INTO traitement_siigpe.tsi_chauffeur (chauffeur_id, nom, matricule, cin, permis, min_code, soa_code)
SELECT '14000000-0000-0000-0000-000000000005', 'RAZANAMAHEFA Voahangy', '100005', '111198756789', 'PC-2016-03321', '81', 'DREN-ANA'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_chauffeur WHERE chauffeur_id = '14000000-0000-0000-0000-000000000005');

INSERT INTO traitement_siigpe.tsi_sequence_dossier (type_acte, annee, mois, dernier_numero) VALUES ('TCH', 2026, 8, 3)
ON CONFLICT (type_acte, annee, mois) DO UPDATE SET dernier_numero = GREATEST(traitement_siigpe.tsi_sequence_dossier.dernier_numero, 3);

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'TCH0820260001', 'Test chauffeur - nouvelle affectation', 'TCH', 'BSCVA', '21', '2026-08-03', '2026-08-03', 'VA_TEST_CHAUF_ACTIVITE', 'VA_TEST_CHAUF'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'TCH0820260001');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_TEST_CHAUF','VA_TEST_CHAUF_ACTIVITE','DEPOT_DOSSIER','2026-08-03','2026-08-03','TCH0820260001','900002',1
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='TCH0820260001' AND tache_a_faire='DEPOT_DOSSIER');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_TEST_CHAUF','VA_TEST_CHAUF_ACTIVITE','CONTROLE_PIECES','2026-08-03',NULL,'TCH0820260001',NULL,2
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache WHERE reference_acte='TCH0820260001' AND tache_a_faire='CONTROLE_PIECES');
INSERT INTO traitement_siigpe.tsi_chauffeur_test (test_id, reference_acte, chauffeur_id, vehicule_id, date_saisie, utilisateur_saisie, statut)
SELECT '15000000-0000-0000-0000-000000000001', 'TCH0820260001', '14000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2026-08-03', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_chauffeur_test WHERE test_id = '15000000-0000-0000-0000-000000000001');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'TCH0820260002', 'Test chauffeur - renouvellement annuel', 'TCH', 'BSCVA', '14', '2026-08-10', '2026-08-10', 'VA_TEST_CHAUF_ACTIVITE', 'VA_TEST_CHAUF'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'TCH0820260002');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_TEST_CHAUF', 'VA_TEST_CHAUF_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'TCH0820260002', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-08-10','2026-08-10','900002',1),('CONTROLE_PIECES','2026-08-10','2026-08-11','900003',2),('TRAITEMENT_TECHNIQUE','2026-08-11','2026-08-12','900004',3),('VISA_VALIDATION','2026-08-12',NULL,NULL,4)) AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='TCH0820260002' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_chauffeur_test (test_id, reference_acte, chauffeur_id, vehicule_id, date_test, examinateur_nom, resultat, observations, date_saisie, utilisateur_saisie, statut)
SELECT '15000000-0000-0000-0000-000000000002', 'TCH0820260002', '14000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-00000000000e', '2026-08-12', 'RABE Solofo', 'APTE', 'Conduite en 4x4 maîtrisée, bonne connaissance des règles de sécurité.', '2026-08-10', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_chauffeur_test WHERE test_id = '15000000-0000-0000-0000-000000000002');

INSERT INTO workflow.wf_dossier (reference_acte, dossier_motif, type_acte, entite_code, ministere_code, dossier_date_depot, dossier_date_saisie, activite_code, processus_code)
SELECT 'TCH0820260003', 'Test chauffeur - habilitation conduite bus', 'TCH', 'BSCVA', '32', '2026-08-04', '2026-08-04', 'VA_TEST_CHAUF_ACTIVITE', 'VA_TEST_CHAUF'
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_dossier WHERE reference_acte = 'TCH0820260003');
INSERT INTO workflow.wf_processus_activite_tache (processus_code, activite_code, tache_a_faire, date_debut, date_fin, reference_acte, detenteur, rang)
SELECT 'VA_TEST_CHAUF', 'VA_TEST_CHAUF_ACTIVITE', d.tache_a_faire, d.date_debut::date, d.date_fin::date,'TCH0820260003', d.detenteur, d.rang
FROM (VALUES ('DEPOT_DOSSIER','2026-08-04','2026-08-04','900002',1),('CONTROLE_PIECES','2026-08-04','2026-08-04','900003',2),('TRAITEMENT_TECHNIQUE','2026-08-04','2026-08-05','900004',3),('VISA_VALIDATION','2026-08-05','2026-08-05','900007',4),('EDITION_LIVRABLE','2026-08-05','2026-08-06','900001',5),('ARCHIVAGE','2026-08-06','2026-08-06','900001',6))
     AS d(tache_a_faire,date_debut,date_fin,detenteur,rang)
WHERE NOT EXISTS (SELECT 1 FROM workflow.wf_processus_activite_tache t WHERE t.reference_acte='TCH0820260003' AND t.tache_a_faire=d.tache_a_faire);
INSERT INTO traitement_siigpe.tsi_chauffeur_test (test_id, reference_acte, chauffeur_id, vehicule_id, date_test, examinateur_nom, resultat, observations, date_saisie, utilisateur_saisie, statut)
SELECT '15000000-0000-0000-0000-000000000003', 'TCH0820260003', '14000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', '2026-08-05', 'RABE Solofo', 'APTE', 'Conduite maîtrisée, connaissance du véhicule confirmée.', '2026-08-04', '900002', 'V'
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_chauffeur_test WHERE test_id = '15000000-0000-0000-0000-000000000003');
INSERT INTO referentiel_siigpe.rsi_chauffeur_test (reference_acte, chauffeur_id, vehicule_id, date_test, resultat, valide_par, statut)
SELECT 'TCH0820260003', '14000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000006', '2026-08-05', 'APTE', '900007', 'V'
WHERE NOT EXISTS (SELECT 1 FROM referentiel_siigpe.rsi_chauffeur_test WHERE reference_acte = 'TCH0820260003');
INSERT INTO document.document_genere (document_id, reference_acte, modele_id, numero_document, version, statut, genere_par, genere_le)
SELECT gen_random_uuid(), 'TCH0820260003', (SELECT modele_id FROM document.modele_document WHERE code = 'RESULTAT_TEST_CHAUFFEUR'), 'RESULTAT_TEST_CHAUFFEUR-2026-0001', 1, 'VALIDE', '900001', '2026-08-06 09:00:00'
WHERE NOT EXISTS (SELECT 1 FROM document.document_genere WHERE reference_acte = 'TCH0820260003' AND modele_id = (SELECT modele_id FROM document.modele_document WHERE code = 'RESULTAT_TEST_CHAUFFEUR'));

-- 2 tests supplémentaires hors dossier (retest dans le temps) — enrichit l'écran "fiche chauffeur +
-- historique des tests" (déjà branché côté frontend sur GET /api-testchauffeur/.../tests-chauffeurs).
INSERT INTO traitement_siigpe.tsi_chauffeur_test (test_id, reference_acte, chauffeur_id, vehicule_id, date_test, examinateur_nom, resultat, observations, date_saisie, utilisateur_saisie, statut)
SELECT '15000000-0000-0000-0000-000000000004', NULL, '14000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', '2025-11-10', 'RABE Solofo', 'NON_APTE', 'Freinage jugé imprécis, à retester.', '2025-11-10', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_chauffeur_test WHERE test_id = '15000000-0000-0000-0000-000000000004');
INSERT INTO traitement_siigpe.tsi_chauffeur_test (test_id, reference_acte, chauffeur_id, vehicule_id, date_test, examinateur_nom, resultat, observations, date_saisie, utilisateur_saisie, statut)
SELECT '15000000-0000-0000-0000-000000000005', NULL, '14000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-00000000000d', '2026-08-14', 'RABE Solofo', 'APTE', 'Conduite d''un véhicule électrique, prise en main correcte.', '2026-08-14', '900002', NULL
WHERE NOT EXISTS (SELECT 1 FROM traitement_siigpe.tsi_chauffeur_test WHERE test_id = '15000000-0000-0000-0000-000000000005');
