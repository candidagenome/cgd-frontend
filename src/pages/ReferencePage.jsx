import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import useReferenceData from '../hooks/useReferenceData';
import { formatAuthors, formatCitationString } from '../utils/formatCitation.jsx';
import './ReferencePage.css';

const TABS = [
  { id: 'summary', label: 'Summary', component: 'summary' },
  { id: 'loci', label: 'Genes/Loci', component: 'loci', loader: 'loadLocusDetails' },
  { id: 'go', label: 'GO Annotations', component: 'go', loader: 'loadGoDetails' },
  { id: 'phenotype', label: 'Phenotypes', component: 'phenotype', loader: 'loadPhenotypeDetails' },
  { id: 'interactions', label: 'Interactions', component: 'interactions', loader: 'loadInteractionDetails' },
];

function ReferencePage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'summary');

  const { data, loading, errors, loaders } = useReferenceData(id);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== 'summary') {
      setSearchParams({ tab: activeTab });
    } else {
      setSearchParams({});
    }
  }, [activeTab, setSearchParams]);

  // Load data when tab is selected
  useEffect(() => {
    const tab = TABS.find(t => t.id === activeTab);
    if (tab && tab.loader && loaders[tab.loader]) {
      loaders[tab.loader]();
    }
  }, [activeTab, loaders]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const renderSummary = () => {
    if (loading.info) return <div className="loading">Loading reference information...</div>;
    if (errors.info) return <div className="error">Error: {errors.info}</div>;
    if (!data.info || !data.info.result) return <div className="no-data">No reference data available</div>;

    const ref = data.info.result;

    // Build formatted citation in standard format
    const formattedCitation = ref.citation
      ? formatCitationString(ref.citation, ref.journal_name)
      : (
        <>
          <strong>{formatAuthors(ref.authors)} ({ref.year})</strong>
          {ref.title && <> {ref.title}</>}
          {ref.journal_name && <> <em>{ref.journal_name}</em></>}
          {ref.volume && <> {ref.volume}</>}
          {ref.issue && <>({ref.issue})</>}
          {ref.page && <>:{ref.page}</>}
        </>
      );

    return (
      <div className="reference-summary">
        {/* Citation Card */}
        <div className="citation-card">
          <div className="citation-full">
            {formattedCitation}
          </div>

          {/* External Links */}
          <div className="external-links">
            {ref.pubmed && (
              <a
                href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pubmed}`}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link pubmed"
              >
                PubMed: {ref.pubmed}
              </a>
            )}
            {ref.urls && ref.urls.map((url, idx) => (
              <a
                key={idx}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="external-link"
              >
                Full Text
              </a>
            ))}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="ref-metadata">
          <div className="metadata-item">
            <span className="meta-label">CGD ID:</span>
            <span className="meta-value">{ref.dbxref_id}</span>
          </div>
          <div className="metadata-item">
            <span className="meta-label">Year:</span>
            <span className="meta-value">{ref.year}</span>
          </div>
          <div className="metadata-item">
            <span className="meta-label">Status:</span>
            <span className="meta-value">{ref.status}</span>
          </div>
          <div className="metadata-item">
            <span className="meta-label">Source:</span>
            <span className="meta-value">{ref.source}</span>
          </div>
        </div>

        {/* Abstract */}
        {ref.abstract && (
          <div className="abstract-section">
            <h3>Abstract</h3>
            <p className="abstract-text">{ref.abstract}</p>
          </div>
        )}

        {/* Authors List */}
        {ref.authors && ref.authors.length > 0 && (
          <div className="authors-section">
            <h3>Authors ({ref.authors.length})</h3>
            <div className="authors-list">
              {ref.authors.map((author, idx) => (
                <span key={idx} className="author-item">
                  {author.author_name}
                  {author.author_type !== 'Author' && (
                    <span className="author-type"> ({author.author_type})</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderLociTab = () => {
    if (loading.locusDetails) return <div className="loading">Loading genes/loci...</div>;
    if (errors.locusDetails) return <div className="error">Error: {errors.locusDetails}</div>;
    if (!data.locusDetails || !data.locusDetails.loci) return <div className="no-data">No genes/loci data available</div>;

    const loci = data.locusDetails.loci;

    if (loci.length === 0) {
      return <div className="no-data">No genes addressed in this paper</div>;
    }

    // Group by organism
    const byOrganism = loci.reduce((acc, locus) => {
      const org = locus.organism_name || 'Unknown';
      if (!acc[org]) acc[org] = [];
      acc[org].push(locus);
      return acc;
    }, {});

    return (
      <div className="loci-tab">
        <p className="tab-summary">
          This paper addresses <strong>{loci.length}</strong> gene(s)/loci.
        </p>

        {Object.entries(byOrganism).map(([orgName, orgLoci]) => (
          <div key={orgName} className="organism-loci-section">
            <h4 className="organism-header">
              <em>{orgName}</em>
              <span className="count-badge">{orgLoci.length}</span>
            </h4>
            <div className="loci-grid">
              {orgLoci.map((locus, idx) => (
                <div key={idx} className="locus-card">
                  <Link to={`/locus/${locus.feature_name}`} className="locus-link">
                    {locus.gene_name || locus.feature_name}
                  </Link>
                  {locus.gene_name && locus.gene_name !== locus.feature_name && (
                    <span className="feature-name-small">({locus.feature_name})</span>
                  )}
                  {locus.headline && (
                    <div className="locus-headline">{locus.headline}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderGoTab = () => {
    if (loading.goDetails) return <div className="loading">Loading GO annotations...</div>;
    if (errors.goDetails) return <div className="error">Error: {errors.goDetails}</div>;
    if (!data.goDetails || !data.goDetails.annotations) return <div className="no-data">No GO annotation data available</div>;

    const annotations = data.goDetails.annotations;

    if (annotations.length === 0) {
      return <div className="no-data">No GO annotations citing this paper</div>;
    }

    // Group by aspect
    const aspectNames = {
      P: 'Biological Process',
      F: 'Molecular Function',
      C: 'Cellular Component',
    };

    const byAspect = annotations.reduce((acc, ann) => {
      const aspect = ann.go_aspect || 'Unknown';
      if (!acc[aspect]) acc[aspect] = [];
      acc[aspect].push(ann);
      return acc;
    }, {});

    return (
      <div className="go-tab">
        <p className="tab-summary">
          <strong>{annotations.length}</strong> GO annotation(s) cite this paper.
        </p>

        {Object.entries(byAspect).map(([aspect, aspectAnns]) => (
          <div key={aspect} className="aspect-section">
            <h4 className="aspect-header">
              {aspectNames[aspect] || aspect}
              <span className="count-badge">{aspectAnns.length}</span>
            </h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Gene</th>
                  <th>GO Term</th>
                  <th>GO ID</th>
                  <th>Evidence</th>
                </tr>
              </thead>
              <tbody>
                {aspectAnns.map((ann, idx) => (
                  <tr key={idx}>
                    <td>
                      <Link to={`/locus/${ann.feature_name}`}>
                        {ann.gene_name || ann.feature_name}
                      </Link>
                    </td>
                    <td>{ann.go_term}</td>
                    <td>
                      <a
                        href={`http://amigo.geneontology.org/amigo/term/${ann.goid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="go-link"
                      >
                        {ann.goid}
                      </a>
                    </td>
                    <td>
                      <span className="evidence-code">{ann.evidence}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const renderPhenotypeTab = () => {
    if (loading.phenotypeDetails) return <div className="loading">Loading phenotype annotations...</div>;
    if (errors.phenotypeDetails) return <div className="error">Error: {errors.phenotypeDetails}</div>;
    if (!data.phenotypeDetails || !data.phenotypeDetails.annotations) return <div className="no-data">No phenotype annotation data available</div>;

    const annotations = data.phenotypeDetails.annotations;

    if (annotations.length === 0) {
      return <div className="no-data">No phenotype annotations citing this paper</div>;
    }

    // Group by experiment type
    const byExpType = annotations.reduce((acc, ann) => {
      const expType = ann.experiment_type || 'Other';
      if (!acc[expType]) acc[expType] = [];
      acc[expType].push(ann);
      return acc;
    }, {});

    return (
      <div className="phenotype-tab">
        <p className="tab-summary">
          <strong>{annotations.length}</strong> phenotype annotation(s) cite this paper.
        </p>

        {Object.entries(byExpType).map(([expType, expAnns]) => (
          <div key={expType} className="exp-type-section">
            <h4 className="exp-type-header">
              {expType}
              <span className="count-badge">{expAnns.length}</span>
            </h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Gene</th>
                  <th>Observable</th>
                  <th>Qualifier</th>
                  <th>Mutant Type</th>
                </tr>
              </thead>
              <tbody>
                {expAnns.map((ann, idx) => (
                  <tr key={idx}>
                    <td>
                      <Link to={`/locus/${ann.feature_name}`}>
                        {ann.gene_name || ann.feature_name}
                      </Link>
                    </td>
                    <td>{ann.observable}</td>
                    <td>{ann.qualifier || '-'}</td>
                    <td>{ann.mutant_type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    );
  };

  const renderInteractionsTab = () => {
    if (loading.interactionDetails) return <div className="loading">Loading interactions...</div>;
    if (errors.interactionDetails) return <div className="error">Error: {errors.interactionDetails}</div>;
    if (!data.interactionDetails || !data.interactionDetails.interactions) return <div className="no-data">No interaction data available</div>;

    const interactions = data.interactionDetails.interactions;

    if (interactions.length === 0) {
      return <div className="no-data">No interactions citing this paper</div>;
    }

    // Group by experiment type
    const byExpType = interactions.reduce((acc, interaction) => {
      const expType = interaction.experiment_type || 'Other';
      if (!acc[expType]) acc[expType] = [];
      acc[expType].push(interaction);
      return acc;
    }, {});

    return (
      <div className="interactions-tab">
        <p className="tab-summary">
          <strong>{interactions.length}</strong> interaction(s) cite this paper.
        </p>

        {Object.entries(byExpType).map(([expType, expInteractions]) => (
          <div key={expType} className="exp-type-section">
            <h4 className="exp-type-header">
              {expType}
              <span className="count-badge">{expInteractions.length}</span>
            </h4>
            <div className="interaction-cards">
              {expInteractions.map((interaction, idx) => (
                <div key={idx} className="interaction-card">
                  <div className="interactors">
                    {interaction.interactors?.map((interactor, iIdx) => (
                      <span key={iIdx} className="interactor-item">
                        <Link to={`/locus/${interactor.feature_name}`}>
                          {interactor.gene_name || interactor.feature_name}
                        </Link>
                        {interactor.action && (
                          <span className="action-label">({interactor.action})</span>
                        )}
                        {iIdx < interaction.interactors.length - 1 && (
                          <span className="separator"> - </span>
                        )}
                      </span>
                    ))}
                  </div>
                  {interaction.description && (
                    <div className="interaction-description">{interaction.description}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'summary':
        return renderSummary();
      case 'loci':
        return renderLociTab();
      case 'go':
        return renderGoTab();
      case 'phenotype':
        return renderPhenotypeTab();
      case 'interactions':
        return renderInteractionsTab();
      default:
        return <div>Select a tab</div>;
    }
  };

  // Get display title for the page
  const getDisplayTitle = () => {
    if (data.info && data.info.result) {
      const ref = data.info.result;
      // Show first author + year as title
      const firstAuthor = ref.authors?.[0]?.author_name?.split(' ')[0] || '';
      const etAl = ref.authors?.length > 1 ? ' et al.' : '';
      return `${firstAuthor}${etAl} (${ref.year})`;
    }
    return `Reference: ${id}`;
  };

  return (
    <div className="reference-page">
      <header className="reference-header">
        <h1>{getDisplayTitle()}</h1>
        {data.info?.result?.pubmed && (
          <p className="subtitle">PubMed ID: {data.info.result.pubmed}</p>
        )}
      </header>

      <nav className="tab-navigation">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="tab-content">
        {renderTabContent()}
      </main>
    </div>
  );
}

export default ReferencePage;
