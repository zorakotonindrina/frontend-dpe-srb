'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/common/PageHeader';
import { ReferentielCrudCard } from '@/components/administration/ReferentielCrudCard';
import { useSectionsConstatation, useSectionsEvaluation, useSectionsMisePrix } from '@/hooks/useReferentiels';
import { referentielsApi } from '@/lib/api/referentiels';

/** type_code (referentiel_siigpe.rsi_piece_dossier) → clé de libellé `nav` (mêmes 11 processus que
 *  `PROCESSUS_CODE_NAV_LABEL_KEYS`, mais celui-ci est indexé par processus_code, pas type_code). */
const TYPE_CODE_NAV_KEY: Record<string, string> = {
  REC: 'recensement', CST: 'constatationTechnique', VBC: 'visaBonCommande', RCT: 'receptionTechnique',
  RNE: 'receptionVaNeuf', ARL: 'arretageLivret', LOC: 'aptitudeLocation', CAR: 'attestationCaracteristiques',
  EXP: 'expertise', CDN: 'condamnation', TCH: 'testChauffeur',
};

export default function AdministrationReferentielsPage() {
  const t = useTranslations('administration.referentiels');
  const tNav = useTranslations('nav');

  const { data: sections = [] } = useSectionsConstatation();
  const { data: sectionsEvaluation = [] } = useSectionsEvaluation();
  const { data: sectionsMisePrix = [] } = useSectionsMisePrix();

  const [sectionSelectionnee, setSectionSelectionnee] = useState('');
  const [typeCodeSelectionne, setTypeCodeSelectionne] = useState('');

  const typeCodeOptions = Object.entries(TYPE_CODE_NAV_KEY).map(([code, navKey]) => ({
    value: code, label: tNav(navKey as Parameters<typeof tNav>[0]),
  }));

  return (
    <div data-testid="administration-referentiels-page" className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReferentielCrudCard
          title={t('genres')}
          slug="genre-vehicule"
          idField="genreId"
          listFn={referentielsApi.genres}
          queryKey={['referentiels', 'genres']}
          columns={[
            { key: 'genreCode', label: 'Code', required: true },
            { key: 'libelle', label: 'Libellé', required: true },
          ]}
        />
        <ReferentielCrudCard
          title={t('carrosseries')}
          slug="carrosserie-vehicule"
          idField="carrosserieId"
          listFn={referentielsApi.carrosseries}
          queryKey={['referentiels', 'carrosseries']}
          columns={[
            { key: 'carrosserieCode', label: 'Code', required: true },
            { key: 'libelle', label: 'Libellé', required: true },
          ]}
        />
        <ReferentielCrudCard
          title={t('categoriesVehicule')}
          slug="categorie-vehicule"
          idField="categorieCode"
          listFn={referentielsApi.categoriesVehicule}
          queryKey={['referentiels', 'categories-vehicule']}
          columns={[
            { key: 'categorieCode', label: 'Code', required: true, editable: false },
            { key: 'categorieLibelle', label: 'Libellé', required: true },
          ]}
        />
        <ReferentielCrudCard
          title={t('energies')}
          slug="energie-vehicule"
          idField="energieCode"
          listFn={referentielsApi.energies}
          queryKey={['referentiels', 'energies']}
          columns={[
            { key: 'energieCode', label: 'Code', required: true, editable: false },
            { key: 'libelle', label: 'Libellé', required: true },
          ]}
        />
        <ReferentielCrudCard
          title={t('etatsVehicule')}
          slug="etat-vehicule"
          idField="etatVehicule"
          listFn={referentielsApi.etatsVehicule}
          queryKey={['referentiels', 'etats-vehicule']}
          columns={[
            { key: 'etatVehicule', label: 'Code', required: true, editable: false },
            { key: 'libelle', label: 'Libellé', required: true },
          ]}
        />
        <ReferentielCrudCard
          title={t('marques')}
          slug="marque-vehicule"
          idField="marqueId"
          listFn={referentielsApi.marques}
          queryKey={['referentiels', 'marques']}
          columns={[
            { key: 'libelle', label: 'Nom', required: true },
          ]}
        />
        <ReferentielCrudCard
          title="Catégories d'utilisation"
          slug="categorie-utilisation-vehicule"
          idField="categorieUtilisationCode"
          listFn={referentielsApi.categoriesUtilisationVehicule}
          queryKey={['referentiels', 'categories-utilisation-vehicule']}
          columns={[
            { key: 'categorieUtilisationCode', label: 'Code', required: true, editable: false },
            { key: 'libelle', label: 'Libellé', required: true },
          ]}
        />
        <ReferentielCrudCard
          title="Types de livret"
          slug="type-livret"
          idField="typeLivretCode"
          listFn={referentielsApi.typesLivret}
          queryKey={['referentiels', 'types-livret']}
          columns={[
            { key: 'typeLivretCode', label: 'Code', required: true, editable: false },
            { key: 'libelle', label: 'Libellé', required: true },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReferentielCrudCard
          title="Sections de constatation"
          slug="section-constatation"
          idField="sectionId"
          listFn={referentielsApi.sectionsConstatation}
          queryKey={['referentiels', 'sections-constatation']}
          columns={[
            { key: 'sectionCode', label: 'Code', required: true },
            { key: 'sectionLibelle', label: 'Libellé', required: true },
            { key: 'rang', label: 'Rang', type: 'number' },
          ]}
        />
        <ReferentielCrudCard
          title="Éléments de constatation"
          slug="element-constatation"
          idField="elementId"
          listFn={() => referentielsApi.elementsConstatation(sectionSelectionnee)}
          queryKey={['referentiels', 'elements-constatation', sectionSelectionnee]}
          columns={[
            { key: 'sectionId', label: 'Section', type: 'select', required: true, editable: false, options: sections.map((s) => ({ value: s.sectionId, label: s.sectionLibelle })) },
            { key: 'elementLibelle', label: 'Libellé', required: true },
            { key: 'rang', label: 'Rang', type: 'number' },
          ]}
          parentFilter={{
            label: 'Section',
            columnKey: 'sectionId',
            value: sectionSelectionnee,
            onChange: setSectionSelectionnee,
            options: sections.map((s) => ({ value: s.sectionId, label: s.sectionLibelle })),
          }}
        />
      </div>

      <ReferentielCrudCard
        title="Pièces de dossier"
        slug="piece-dossier"
        idField="pieceId"
        listFn={() => referentielsApi.piecesDossierAdmin(typeCodeSelectionne || undefined)}
        queryKey={['referentiels', 'pieces-dossier-admin', typeCodeSelectionne]}
        columns={[
          { key: 'typeCode', label: 'Processus', type: 'select', required: true, options: typeCodeOptions },
          { key: 'pieceLibelle', label: 'Libellé', required: true },
          { key: 'obligatoire', label: 'Obligatoire', type: 'boolean' },
          { key: 'rang', label: 'Rang', type: 'number' },
        ]}
        parentFilter={{
          label: 'Processus',
          columnKey: 'typeCode',
          value: typeCodeSelectionne,
          onChange: setTypeCodeSelectionne,
          options: typeCodeOptions,
        }}
      />

      <ReferentielCrudCard
        title="Signataires"
        slug="signataire"
        idField="signataireId"
        listFn={referentielsApi.signataires}
        queryKey={['referentiels', 'signataires']}
        columns={[
          { key: 'signataireCode', label: 'Code', required: true, editable: false },
          { key: 'signataireTitre', label: 'Titre / Nom', required: true },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReferentielCrudCard
          title="Sections d'évaluation (fiche véhicule)"
          slug="section-evaluation"
          idField="sectionEvaluationId"
          listFn={referentielsApi.sectionsEvaluation}
          queryKey={['referentiels', 'sections-evaluation']}
          columns={[
            { key: 'sectionCode', label: 'Code', required: true },
            { key: 'sectionLibelle', label: 'Libellé (organe)', required: true },
            { key: 'rang', label: 'Rang', type: 'number' },
          ]}
        />
        <ReferentielCrudCard
          title="Éléments d'évaluation (fiche véhicule)"
          slug="element-evaluation"
          idField="elementEvaluationId"
          listFn={() => referentielsApi.elementsEvaluation()}
          queryKey={['referentiels', 'elements-evaluation']}
          columns={[
            { key: 'sectionEvaluationId', label: 'Organe', type: 'select', required: true, editable: false, options: sectionsEvaluation.map((s) => ({ value: s.sectionEvaluationId, label: s.sectionLibelle })) },
            { key: 'elementLibelle', label: 'Élément', required: true },
            { key: 'libelleValeur1', label: 'Étiquette valeur 1 (ex. AV)' },
            { key: 'libelleValeur2', label: 'Étiquette valeur 2 (vide = une seule valeur)' },
            { key: 'rang', label: 'Rang', type: 'number' },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReferentielCrudCard
          title="Sections de mise à prix (véhicule / motocyclette)"
          slug="section-mise-prix"
          idField="sectionId"
          listFn={() => referentielsApi.sectionsMisePrix()}
          queryKey={['referentiels', 'sections-mise-prix']}
          columns={[
            { key: 'categorie', label: 'Catégorie', type: 'select', required: true, editable: false, options: [{ value: 'VEHICULE', label: 'Véhicule' }, { value: 'MOTOCYCLE', label: 'Motocyclette' }] },
            { key: 'sectionCode', label: 'Code', required: true },
            { key: 'sectionLibelle', label: 'Titre de la section', required: true },
            { key: 'ligne', label: "Rangée d'impression (les sections d'une même rangée sont côte à côte)", type: 'number', required: true },
            { key: 'rang', label: 'Rang', type: 'number' },
          ]}
        />
        <ReferentielCrudCard
          title="Éléments de mise à prix (véhicule / motocyclette)"
          slug="element-mise-prix"
          idField="elementId"
          listFn={() => referentielsApi.elementsMisePrix()}
          queryKey={['referentiels', 'elements-mise-prix']}
          columns={[
            { key: 'sectionId', label: 'Section', type: 'select', required: true, editable: false, options: sectionsMisePrix.map((s) => ({ value: s.sectionId, label: `${s.categorie === 'MOTOCYCLE' ? 'Moto' : 'Véhicule'} — ${s.sectionLibelle}` })) },
            { key: 'elementLibelle', label: 'Composant', required: true },
            { key: 'rang', label: 'Rang', type: 'number' },
          ]}
        />
      </div>

      <ReferentielCrudCard
        title="Tarifs de dépense (carburant, huile, entretien) — prévisions IA"
        slug="tarif-depense"
        idField="tarifId"
        listFn={() => referentielsApi.tarifsDepense()}
        queryKey={['referentiels', 'tarifs-depense']}
        columns={[
          { key: 'annee', label: 'Année', type: 'number', required: true },
          { key: 'code', label: 'Poste', type: 'select', required: true, editable: false, options: [
            { value: 'CARBURANT_ESSENCE', label: 'Carburant — essence' },
            { value: 'CARBURANT_GASOIL', label: 'Carburant — gasoil' },
            { value: 'HUILE', label: 'Huile moteur' },
            { value: 'LAVAGE', label: 'Lavage' },
            { value: 'VIDANGE', label: 'Vidange' },
            { value: 'GRAISSAGE', label: 'Graissage' },
          ] },
          { key: 'libelle', label: 'Libellé', required: true },
          { key: 'unite', label: 'Unité', type: 'select', required: true, options: [
            { value: 'LITRE', label: 'Litre' },
            { value: 'OPERATION', label: 'Opération' },
          ] },
          { key: 'prix', label: 'Prix unitaire (Ar)', type: 'number', required: true },
        ]}
      />

      <ReferentielCrudCard
        title="Experts"
        slug="expert"
        idField="expertId"
        listFn={referentielsApi.experts}
        queryKey={['referentiels', 'experts']}
        columns={[
          { key: 'expertNom', label: 'Nom', required: true },
        ]}
      />
    </div>
  );
}
