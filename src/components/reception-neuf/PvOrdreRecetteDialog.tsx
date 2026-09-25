'use client';

import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SIGLE_HIERARCHIQUE } from '@/lib/constants/document';
import {
  useCarrosseries, useEnergies, useGenres, useMarques, useSignataireBudget, useSoas,
} from '@/hooks/useReferentiels';
import {
  arreteTransfert, conclusionTransfert, formaterValeurAr, fournisseursLignes, introTransfert,
  libelleFinancement, membresLignes, membresPuces, titreTransfert,
} from '@/lib/utils/reception-neuf-texte';
import type { ReceptionVaNeuf, ReceptionNeufLigne } from '@/lib/api/receptionNeuf';

export interface PvOrdreRecetteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reception: ReceptionVaNeuf;
  lignes: ReceptionNeufLigne[];
}

function Lignes({ lignes }: { lignes: string[] }) {
  return <>{lignes.map((l, i) => <span key={i} className="block">{l}</span>)}</>;
}

/**
 * Aperçu du PV de réception de véhicule neuf — miroir de `ReceptionNeufReports` (PDF Jasper
 * `PV_ORDRE_RECETTE`, dont la variante est choisie par `typeAcquisition`) :
 * ACHAT = imprimé « Modèle n° 14 » (3 pages), TRANSFERT / DOTATION = PV de réception technique et
 * d'évaluation de matériel roulant (page 1 : bloc ministère, titre, liste des membres à tirets
 * décalés — mêmes textes que `ReceptionNeufTexte` côté backend).
 */
export function PvOrdreRecetteDialog({ open, onOpenChange, reception, lignes }: PvOrdreRecetteDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.receptionVaNeuf');
  const { data: genres = [] } = useGenres();
  const { data: marques = [] } = useMarques();
  const { data: carrosseries = [] } = useCarrosseries();
  const { data: energies = [] } = useEnergies();
  const { data: soas = [] } = useSoas(reception.soaCode ?? '');
  const signataireBudget = useSignataireBudget();

  const achat = reception.typeAcquisition === 'ACHAT';
  const ordonnees = [...lignes].sort((a, b) => a.rang - b.rang);
  const membresEntite = membresLignes(reception.commissionMembresEntite);
  const membresDpe = membresLignes(reception.commissionMembresDpe);
  const structure = soas.find((s) => s.soaCode === reception.soaCode)?.libelle;
  const totalValeur = ordonnees.reduce((somme, l) => somme + (l.valeur ?? 0), 0);

  const libelleGenre = (l: ReceptionNeufLigne) => genres.find((g) => g.genreCode === l.genre)?.libelle ?? l.genre;
  const libelleMarque = (l: ReceptionNeufLigne) => marques.find((m) => m.marqueCode === l.marque)?.libelle ?? l.marque;
  const libelleCarrosserie = (l: ReceptionNeufLigne) => carrosseries.find((c) => c.carrosserieCode === l.carrosserie)?.libelle ?? l.carrosserie;
  const libelleEnergie = (l: ReceptionNeufLigne) => energies.find((e) => e.energieCode === l.sourceEnergie)?.libelle ?? l.sourceEnergie;
  const anneeMise = (l: ReceptionNeufLigne) => (l.datePremiereMise ? new Date(l.datePremiereMise).getFullYear() : '');
  const decisionTxt = (l: ReceptionNeufLigne) => (l.decision === 'REDUCTION' ? 'RECEPTION AVEC REDUCTION DE PRIX'
    : l.decision === 'REBUTEE' ? 'REBUTE' : 'RECEPTION SANS RESERVE');
  const dateFr = (iso: string) => (iso ? new Date(iso).toLocaleDateString('fr-FR') : '');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('pvTitle')}</DialogTitle>
        </DialogHeader>

        {achat ? (
          <div className="printable-pv max-h-[60vh] space-y-6 overflow-y-auto text-sm leading-relaxed">
            {/* Page 1 — en-tête budgétaire, commission, comptable, fournisseurs */}
            <section className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="font-semibold underline">REPOBLIKAN&apos;I MADAGASIKARA</span>
                <span className="text-right">Modèle n° 14<br />Instruction Générale du 22 juillet 1955</span>
              </div>
              <p>BUDGET : IMPUTATION BUDGETAIRE : <strong>{reception.budgetCode}</strong></p>
              <p>
                CHAPITRE (1) : FINANCEMENT : <strong>{reception.nomFinancement || libelleFinancement(reception.financement)}</strong>
                {'    '}ARTICLE : {reception.article}   COMPTE : {reception.compte}
              </p>
              <p>(2) <strong>{reception.chapitre}</strong></p>
              <p>(3) <strong>{reception.commune}</strong></p>
              <p>(4)</p>
              <p className="pt-2 text-center text-base font-semibold">PROCES-VERBAL<br />DE LA COMMISSION ORDINAIRE DES RECETTES</p>
              <div className="grid grid-cols-[30%_1fr] border border-border text-xs">
                <p className="border-b border-r border-border p-2 text-center">Nom et qualité des membres de la commission</p>
                <div className="border-b border-border">
                  <p className="min-h-12 border-b border-border p-2"><Lignes lignes={membresEntite} /></p>
                  <p className="min-h-12 p-2"><Lignes lignes={membresDpe} /></p>
                </div>
                <p className="border-b border-r border-border p-2 text-center">Nom et qualité du comptable</p>
                <p className="border-b border-border p-2">{reception.depositaireNom && `- ${reception.depositaireNom}, Dépositaire Comptable`}</p>
                <p className="border-r border-border p-2 text-center">Nom et qualité des fournisseurs ou de leurs représentants (1)</p>
                <p className="p-2">
                  <Lignes lignes={fournisseursLignes(reception.fournisseurNom, reception.fournisseurAdresse, reception.fournisseurNif,
                    reception.fournisseurStat, reception.fournisseurAnneeCarteFiscale)} />
                </p>
              </div>
            </section>

            {/* Page 2 — tableau des matières et objets reçus */}
            <section className="space-y-2">
              <table className="w-full border-collapse border border-border text-[10px]">
                <thead>
                  <tr>
                    <th className="border border-border p-1" rowSpan={2}>Date d&apos;introduction</th>
                    <th className="border border-border p-1" rowSpan={2}>Désignation des fournisseurs</th>
                    <th className="border border-border p-1" rowSpan={2}>Dates et numéros des marchés et des commandes</th>
                    <th className="border border-border p-1" rowSpan={2}>Désignation des matières et des objets</th>
                    <th className="border border-border p-1" rowSpan={2}>Espèces des unités</th>
                    <th className="border border-border p-1" rowSpan={2}>Quantités facturées</th>
                    <th className="border border-border p-1" colSpan={3}>Quantités reconnues par la commission</th>
                    <th className="border border-border p-1" rowSpan={2}>Décision de la commission (1)</th>
                  </tr>
                  <tr>
                    <th className="border border-border p-1 font-normal">Sans changement de classification</th>
                    <th className="border border-border p-1 font-normal">Avec réduction de prix en moins ou rebutées</th>
                    <th className="border border-border p-1 font-normal">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ordonnees.map((l) => {
                    const qr = String(l.quantiteReconnue).padStart(2, '0');
                    const sansChangement = l.decision === 'SANS_CHANGEMENT';
                    return (
                      <tr key={l.id} className="align-top">
                        <td className="border border-border p-1" />
                        <td className="border border-border p-1">{reception.fournisseurNom}</td>
                        <td className="border border-border p-1">
                          {libelleFinancement(reception.financement)}{reception.referenceMarche && ` N° ${reception.referenceMarche}`}
                        </td>
                        <td className="border border-border p-1">
                          <Lignes lignes={[
                            `-${(l.designation || 'VOITURE').toUpperCase()}-`,
                            l.immatriculation && `IMM: ${l.immatriculation}`,
                            libelleGenre(l) && `Genre: ${libelleGenre(l)}`,
                            l.typeVeh && `Type: ${l.typeVeh}`,
                            libelleMarque(l) && `Marque: ${libelleMarque(l)}`,
                            libelleCarrosserie(l) && `Carrosserie: ${libelleCarrosserie(l)}`,
                            l.numeroSerie && `N° série: ${l.numeroSerie}`,
                            l.numeroMoteur && `N° du moteur: ${l.numeroMoteur}`,
                            l.puissance && `Puissance: ${l.puissance}CV`,
                            libelleEnergie(l) && `Source d'énergie: ${libelleEnergie(l).toUpperCase()}`,
                            l.nombrePlace && `Nombre de place: ${String(l.nombrePlace).padStart(2, '0')}`,
                            l.datePremiereMise && `Date de première mise en circulation: ${dateFr(l.datePremiereMise)}`,
                          ].filter((x): x is string => Boolean(x))} />
                        </td>
                        <td className="border border-border p-1 text-center">Nombre</td>
                        <td className="border border-border p-1 text-center">{String(l.quantiteFacturee).padStart(2, '0')}</td>
                        <td className="border border-border p-1 text-center">{sansChangement ? qr : ''}</td>
                        <td className="border border-border p-1 text-center">{sansChangement ? '' : qr}</td>
                        <td className="border border-border p-1 text-center">{qr}</td>
                        <td className="border border-border p-1 font-semibold">{decisionTxt(l)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="text-xs">Les décisions de la commission seront toujours datées et signées par tous les membres et visées par le comptable ou son délégué.</p>
            </section>

            {/* Page 3 — désignation, arrêté, PROCES-VERBAL (5) */}
            <section className="space-y-3">
              <p>M ______________________________<br />a été désigné à l&apos;effet de constater les quantités sous la surveillance de M ______________</p>
              <p>Délégué de la commission(1) : ____________</p>
              <p><strong>ARRETE</strong> le présent procès-verbal à (2) : ____________</p>
              <p>Articles admis en recette (3) ____________</p>
              <p>A ANTANANARIVO &nbsp;&nbsp; Le ____________</p>
              <p><strong>Le (4) : DEPOSITAIRE COMPTABLE</strong><br />{reception.depositaireNom && `- ${reception.depositaireNom}, Dépositaire Comptable`}</p>
              <p className="text-center font-semibold">LES MEMBRES DE LA COMMISSION</p>
              <p><Lignes lignes={membresEntite} /><span className="block h-2" /><Lignes lignes={membresDpe} /></p>
              <p className="pt-2 text-center text-base font-semibold">PROCES-VERBAL (5)</p>
              <p className="text-center font-semibold">des opérations relatives à la constatation des quantités</p>
              <p>Les quantités de matières et objets dont la commission a prononcé la réception suivant Procès-verbal ci-dessus, sont conformes aux inscriptions portées dans la colonne QUANTITES RECONNUES</p>
              <div className="flex justify-between text-xs">
                <span>A ____________ &nbsp; Le ____________<br />Le (4) ____________________</span>
                <span className="text-center font-semibold">{signataireBudget}<br /><span className="font-normal">Vu :<br />Les membres de la commission<br />Chargés de la surveillance des opérations</span></span>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-6 text-center text-xs font-semibold">
                <p>L&apos;EXPERT ADMINISTRATIF</p>
                <p>Le Chef de Division Régionale du Patrimoine de l&apos;Etat Analamanga</p>
              </div>
            </section>
          </div>
        ) : (
          <div className="printable-pv max-h-[60vh] space-y-4 overflow-y-auto text-sm leading-relaxed">
            {/* Vide à dessein — numéro apposé à la main après signature, comme le PDF Jasper. */}
            {/* Page 1 — miroir de ReceptionNeufReports.transfertPage1() : police à empattement, texte justifié */}
            <div className="space-y-4 font-serif">
              <p className="w-[62%] text-center text-[10px] uppercase leading-snug">
                MINISTÈRE DE L&apos;ÉCONOMIE ET DES FINANCES<br />---------------<br />SECRÉTARIAT GÉNÉRAL<br />---------------<br />
                DIRECTION GÉNÉRALE DU BUDGET<br />ET DES FINANCES<br />----------------<br />DIRECTION DU BUDGET<br />---------------<br />
                SERVICE RÉGIONAL DU BUDGET<br />ANALAMANGA
              </p>
              <p className="text-xs">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>
              <p className="text-center font-bold underline">{titreTransfert(structure)}</p>
              <p className="indent-8 text-justify leading-relaxed">{introTransfert(reception.datePv, reception.heurePv)}</p>
              <ul className="space-y-2">
                {membresPuces(reception.commissionMembresEntite).concat(membresPuces(reception.commissionMembresDpe)).map((m, i) => (
                  <li key={i} className="grid grid-cols-[1.25rem_1fr] pl-7 text-justify leading-relaxed">
                    <span>-</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
              <p className="indent-8 text-justify">{conclusionTransfert(ordonnees.length, structure)}</p>
              <p className="font-bold">{structure}</p>
              <p>L&apos;évaluation est présentée comme suit :</p>
            </div>

            {ordonnees.map((l) => (
              <div key={l.id} className="space-y-2">
                <div className="grid grid-cols-[55%_1fr]">
                  <span>Marque</span><span>: {libelleMarque(l)}</span>
                  <span>Type</span><span>: {l.typeVeh}</span>
                  <span>Source d&apos;énergie</span><span>: {libelleEnergie(l)?.toUpperCase()}</span>
                  <span>Puissance Administrative</span><span>: {l.puissance && `${l.puissance} CV`}</span>
                  <span>Nombre de places</span><span>: {l.nombrePlace}</span>
                  <span>Année de première mise en circulation</span><span>: {anneeMise(l)}</span>
                  <span>Observation</span><span className="font-semibold">: {l.observation}</span>
                </div>
                <table className="w-full border-collapse border border-border text-center text-xs">
                  <thead>
                    <tr>
                      <th className="border border-border p-1">N°</th><th className="border border-border p-1">N° IMM</th>
                      <th className="border border-border p-1">N° DE SERIE</th><th className="border border-border p-1">N° MOTEUR</th>
                      <th className="border border-border p-1">Compteur kilométrique</th><th className="border border-border p-1">VALEUR EN AR</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-border p-1">{String(l.rang).padStart(2, '0')}</td>
                      <td className="border border-border p-1">{l.immatriculation}</td>
                      <td className="border border-border p-1">{l.numeroSerie}</td>
                      <td className="border border-border p-1">{l.numeroMoteur}</td>
                      <td className="border border-border p-1">{l.kilometrage ?? ''}</td>
                      <td className="border border-border p-1 font-semibold">{formaterValeurAr(l.valeur)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}

            <p className="font-semibold">{arreteTransfert(ordonnees.length, totalValeur)}</p>
            <p className="ml-[50%] text-center">Antananarivo, le</p>

            <div className="mt-6 grid grid-cols-4 gap-2 text-center text-[10px] font-semibold uppercase">
              <p>Le Président de la commission</p><p>Les membres de la commission</p><p /><p>Le Dépositaire comptable</p>
            </div>
            <div className="mt-10 grid grid-cols-4 gap-2 text-center text-[10px] font-semibold">
              <p>L&apos;EXPERT ADMINISTRATIF</p>
              <p>Le Chef de Bureau du Suivi et Contrôle des véhicules Administratifs</p>
              <p>Le Chef de Division Régionale du Patrimoine de l&apos;Etat Analamanga</p>
              <p className="uppercase">{signataireBudget}</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="pv-ordre-recette-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
