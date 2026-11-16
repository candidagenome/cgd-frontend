import React from 'react';
import { Link } from 'react-router-dom';
import { SECTIONS } from '../pangenome/sections';

const shortCitation = (citation) => (citation || '').replace(/\) .*$/, ')');

/**
 * "Pangenome" and "Strain variation" rows of the locus Summary table, one per section with studies
 * covering the gene: for each study, whether the gene is core or accessory, how many isolates carry it,
 * its copy number and premature stop codons, and accessory paralogs / fusions derived from it.
 */
function PangenomeSummaryRow({ data, featureName }) {
  const studies = data?.studies || [];
  if (studies.length === 0) return null;

  return Object.entries(SECTIONS).map(([section, config]) => {
    const inSection = studies.filter(({ study }) => (study.section || 'pangenome') === section);
    if (inSection.length === 0) return null;
    return (
      <tr key={section} className="pangenome-section-header section-with-divider section-grey-bg">
        <th>{config.row}</th>
        <td>{inSection.map((record) => studyLine(record, featureName, config))}</td>
      </tr>
    );
  });
}

/** One study's line in a row */
function studyLine({ study, isolate_count: total, genes }, featureName, config) {
  const own = genes.find((g) => g.id === featureName) || genes.find((g) => g.reference_gene === g.id);
  const derived = genes.filter((g) => g !== own);
  const browse = `${config.path}/${study.study_id}?q=${encodeURIComponent(featureName)}`;
  return (
    <div key={study.study_id} className="summary-inline-row pangenome-summary-row">
      <span className="summary-stat-line">
        {own && config === SECTIONS.strain_variation ? (
          // Strain variation follows reference genes: say where the gene is found, not core / accessory
          own.presence < total ? (
            <>
              Absent from <strong>{(total - own.presence).toLocaleString()}</strong> of {total.toLocaleString()}{' '}
              isolates
            </>
          ) : (
            <>Detected in all {total.toLocaleString()} isolates</>
          )
        ) : own ? (
          own.category === 'core' && own.type?.startsWith('Core (gap: ') ? (
            // Core genes the study annotates in fewer isolates, the gap put down to an artefact
            <>
              <strong>Core</strong> gene (annotated in {own.presence} of {total} isolates; the study attributes
              the gap to {own.type.slice('Core (gap: '.length, -1)})
            </>
          ) : own.category === 'core' ? (
            <>
              <strong>Core</strong> gene ({study.core_definition || 'present in nearly all isolates'})
            </>
          ) : (
            <>
              <strong>Accessory</strong> gene: present in <strong>{own.presence.toLocaleString()}</strong> of{' '}
              {total.toLocaleString()} isolates
            </>
          )
        ) : (
          <>Related accessory genes only</>
        )}
        {own && own.copy_number_max !== null && own.copy_number_max !== undefined && (
          <>
            ; estimated copy number <strong>{own.copy_number_min.toFixed(1)}</strong>&ndash;
            <strong>{own.copy_number_max.toFixed(1)}</strong> across isolates
          </>
        )}
        {own && own.stop_codon_isolates > 0 && (
          <>
            ; premature stop codon in <strong>{own.stop_codon_isolates}</strong>{' '}
            {own.stop_codon_isolates === 1 ? 'isolate' : 'isolates'}
          </>
        )}
        {derived.length > 0 && (
          <>
            ; <strong>{derived.length}</strong>{' '}
            {derived.every((g) => g.category === 'accessory') ? 'accessory ' : 'related study '}
            {derived.every((g) => g.category === 'accessory')
              ? derived.length === 1 ? 'variant' : 'variants'
              : derived.length === 1 ? 'gene' : 'genes'}{' '}
            (
            {derived.map((g) => `${g.id} ${g.presence}/${total}`).join(', ')})
          </>
        )}
        <span className="pangenome-source">
          {' '}
          &mdash; {study.title.replace(/ \(.*\)$/, '')}, {total.toLocaleString()} isolates,{' '}
          {study.reference_dbxref_id ? (
            <Link to={`/reference/${study.reference_dbxref_id}`}>{shortCitation(study.citation)}</Link>
          ) : (
            shortCitation(study.citation)
          )}
        </span>
      </span>
      <Link className="summary-tab-link" to={browse}>
        {config.link}
      </Link>
    </div>
  );
}

export default PangenomeSummaryRow;
