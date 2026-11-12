import React from 'react';
import { Link } from 'react-router-dom';

const shortCitation = (citation) => (citation || '').replace(/\) .*$/, ')');

/**
 * "Pangenome" row of the locus Summary table: for each loaded pangenome study
 * covering the gene, whether it is core or accessory, how many isolates carry
 * it, premature stop codons, and accessory paralogs / fusions derived from it.
 */
function PangenomeSummaryRow({ data, featureName }) {
  const studies = data?.studies || [];
  if (studies.length === 0) return null;

  return (
    <tr className="pangenome-section-header section-with-divider section-grey-bg">
      <th>Pangenome</th>
      <td>
        {studies.map(({ study, isolate_count: total, genes }) => {
          const own = genes.find((g) => g.id === featureName) || genes.find((g) => g.reference_gene === g.id);
          const derived = genes.filter((g) => g !== own);
          const browse = `/pangenome/${study.study_id}?q=${encodeURIComponent(featureName)}`;
          return (
            <div key={study.study_id} className="summary-inline-row pangenome-summary-row">
              <span className="summary-stat-line">
                {own ? (
                  own.category === 'core' ? (
                    <>
                      <strong>Core</strong> gene ({study.core_definition || 'present in nearly all isolates'})
                    </>
                  ) : (
                    <>
                      <strong>Accessory</strong> gene: present in <strong>{own.presence}</strong> of {total} isolates
                    </>
                  )
                ) : (
                  <>Related accessory genes only</>
                )}
                {own && own.stop_codon_isolates > 0 && (
                  <>
                    ; premature stop codon in <strong>{own.stop_codon_isolates}</strong>{' '}
                    {own.stop_codon_isolates === 1 ? 'isolate' : 'isolates'}
                  </>
                )}
                {derived.length > 0 && (
                  <>
                    ; <strong>{derived.length}</strong> accessory{' '}
                    {derived.length === 1 ? 'variant' : 'variants'} (
                    {derived.map((g) => `${g.id} ${g.presence}/${total}`).join(', ')})
                  </>
                )}
                <span className="pangenome-source">
                  {' '}
                  &mdash; {study.species} pangenome of {total} isolates,{' '}
                  {study.reference_dbxref_id ? (
                    <Link to={`/reference/${study.reference_dbxref_id}`}>{shortCitation(study.citation)}</Link>
                  ) : (
                    shortCitation(study.citation)
                  )}
                </span>
              </span>
              <Link className="summary-tab-link" to={browse}>
                View in pangenome browser
              </Link>
            </div>
          );
        })}
      </td>
    </tr>
  );
}

export default PangenomeSummaryRow;
