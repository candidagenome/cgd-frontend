import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import useLocusData from '../hooks/useLocusData';
import LocusSummary from '../components/locus/LocusSummary';
import GoDetails from '../components/locus/GoDetails';
import PhenotypeDetails from '../components/locus/PhenotypeDetails';
import ProteinDetails from '../components/locus/ProteinDetails';
import HomologyDetails from '../components/locus/HomologyDetails';
import SequenceDetails from '../components/locus/SequenceDetails';
import References from '../components/locus/References';
import History from '../components/locus/History';
import ExpressionDetails from '../components/locus/ExpressionDetails';
import SimilarGenesDetails from '../components/locus/SimilarGenesDetails';
import OrganismSelector, { getDefaultOrganism } from '../components/locus/OrganismSelector';
import './LocusPage.css';

// Sub-tabs for the Expression tab (extensible for future additions)
const EXPRESSION_SUBTABS = [
  { id: 'data', label: 'Expression Data' },
  { id: 'coexpression', label: 'Expression Profiles' },
];

const TABS = [
  { id: 'summary', label: 'Summary', component: 'summary', loader: 'loadSummaryData' },
  { id: 'go', label: 'Gene Ontology', component: 'go', loader: 'loadGoDetails' },
  { id: 'phenotype', label: 'Phenotype', component: 'phenotype', loader: 'loadPhenotypeDetails' },
  { id: 'expression', label: 'Expression', component: 'expression', loader: 'loadExpressionDetails' },
  { id: 'protein', label: 'Protein', component: 'protein', loader: 'loadProteinDetails' },
  { id: 'homology', label: 'Homologs', component: 'homology', loader: 'loadHomologyDetails' },
  { id: 'sequence', label: 'Sequence', component: 'sequence', loader: 'loadSequenceDetails' },
  { id: 'literature', label: 'Literature', component: 'literature', loader: 'loadReferences' },
  { id: 'history', label: 'History', component: 'history', loader: 'loadHistory' },
];

function LocusPage() {
  const { name } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'summary');
  const [selectedOrganism, setSelectedOrganism] = useState(null);
  const [expressionSubTab, setExpressionSubTab] = useState('data');

  // Check if this is a B allele that needs redirect
  const isBAllele = name && (name.endsWith('_B') || name.endsWith('_b'));

  // Compute the effective locus name (convert B allele to A allele)
  const effectiveName = isBAllele ? name.slice(0, -1) + 'A' : name;

  // Redirect B alleles to A alleles (e.g., CR_08640C_B -> CR_08640C_A)
  useEffect(() => {
    if (isBAllele) {
      const tab = searchParams.get('tab');
      const newUrl = tab ? `/locus/${effectiveName}?tab=${tab}` : `/locus/${effectiveName}`;
      navigate(newUrl, { replace: true });
    }
  }, [isBAllele, effectiveName, searchParams, navigate]);

  // Always fetch data for the effective name (A allele) - don't wait for redirect
  const { data, loading, errors, loaders } = useLocusData(effectiveName);

  // Build a map of organism -> feature_name from the primary organism's ortholog data
  // This stays stable regardless of which organism is selected
  // Keys are stored in multiple formats to handle potential mismatches
  const orthologMap = React.useMemo(() => {
    if (!data.info?.results) return new Map();

    const map = new Map();

    // Add all organisms that have direct data
    Object.entries(data.info.results).forEach(([orgName, orgData]) => {
      if (orgData?.feature_name) {
        map.set(orgName, orgData.feature_name);
      }

      // Also add orthologs from this organism's candida_orthologs
      if (orgData?.candida_orthologs) {
        orgData.candida_orthologs.forEach(orth => {
          // Store with the original organism_name
          map.set(orth.organism_name, orth.feature_name);
        });
      }
    });

    console.log('[LocusPage] orthologMap built:', {
      keys: Array.from(map.keys()),
      entries: Array.from(map.entries()),
    });

    return map;
  }, [data.info?.results]);

  // Extract ortholog organisms for the OrganismSelector dropdown
  // Uses the primary organism (query_organism) to get stable ortholog list
  const orthologOrganisms = React.useMemo(() => {
    if (!data.info?.results) return [];

    // Get ortholog data from the primary/query organism
    const primaryOrganism = data.info.query_organism;
    const primaryOrgData = primaryOrganism ? data.info.results[primaryOrganism] : null;

    if (!primaryOrgData?.candida_orthologs) return [];

    // Convert candida_orthologs to the format expected by OrganismSelector
    return primaryOrgData.candida_orthologs.map(orth => ({
      organism: orth.organism_name,
      feature_name: orth.feature_name,
    }));
  }, [data.info?.results, data.info?.query_organism]);

  // Get the feature name for the currently selected organism
  // Works for both primary organisms and orthologs
  const currentFeatureName = React.useMemo(() => {
    if (!selectedOrganism) return null;
    return orthologMap.get(selectedOrganism) || null;
  }, [selectedOrganism, orthologMap]);

  // Reset selected organism when locus name changes
  useEffect(() => {
    setSelectedOrganism(null);
  }, [name]);

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab !== 'summary') {
      setSearchParams({ tab: activeTab });
    } else {
      setSearchParams({});
    }
  }, [activeTab, setSearchParams]);

  // Load data when tab is selected or locus name changes
  useEffect(() => {
    const tab = TABS.find(t => t.id === activeTab);
    if (tab && tab.loader && loaders[tab.loader]) {
      loaders[tab.loader]();
    }
  }, [activeTab, name, loaders]);

  // Set default organism when data loads - prefer query_organism (the gene's actual organism)
  useEffect(() => {
    if (data.info && !selectedOrganism) {
      const organisms = Object.keys(data.info.results || {});
      const defaultOrg = getDefaultOrganism(organisms, data.info.query_organism);
      if (defaultOrg) {
        setSelectedOrganism(defaultOrg);
      }
    }
  }, [data.info, selectedOrganism]);

  // Prefetch API data for Protein and Homology tabs in background
  useEffect(() => {
    if (data.info && loaders) {
      const timer = setTimeout(() => {
        loaders.loadProteinDetails?.();
        loaders.loadHomologyDetails?.();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [data.info, loaders]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  const renderTabContent = () => {
    const organisms = data.info?.results ? Object.keys(data.info.results) : [];

    switch (activeTab) {
      case 'summary':
        if (loading.info) return <div className="loading">Loading locus information...</div>;
        if (errors.info) return <div className="error">Error: {errors.info}</div>;
        if (!data.info) return <div className="no-data">No data available</div>;

        return (
          <div className="summary-details locus-summary">
            <OrganismSelector
              organisms={organisms}
              selectedOrganism={selectedOrganism}
              onOrganismChange={setSelectedOrganism}
              dataType="summary"
              orthologOrganisms={orthologOrganisms}
            />
            {selectedOrganism && data.info.results[selectedOrganism] && (
              <LocusSummary
                data={data.info.results[selectedOrganism]}
                organismName={selectedOrganism}
                goData={data.goDetails?.results?.[selectedOrganism]}
                goLoading={loading.goDetails}
                phenotypeData={data.phenotypeDetails?.results?.[selectedOrganism]}
                phenotypeLoading={loading.phenotypeDetails}
                sequenceData={data.sequenceDetails?.results?.[selectedOrganism]}
                sequenceLoading={loading.sequenceDetails}
              />
            )}
          </div>
        );

      case 'go':
        return (
          <GoDetails
            data={data.goDetails}
            loading={loading.goDetails}
            error={errors.goDetails}
            selectedOrganism={selectedOrganism}
            onOrganismChange={setSelectedOrganism}
            orthologOrganisms={orthologOrganisms}
          />
        );

      case 'phenotype':
        return (
          <PhenotypeDetails
            data={data.phenotypeDetails}
            loading={loading.phenotypeDetails}
            error={errors.phenotypeDetails}
            selectedOrganism={selectedOrganism}
            onOrganismChange={setSelectedOrganism}
            orthologOrganisms={orthologOrganisms}
          />
        );

      case 'expression':
        return (
          <div className="expression-tab-container">
            {/* Expression Sub-tabs */}
            <div className="expression-subtabs">
              {EXPRESSION_SUBTABS.map(subtab => (
                <button
                  key={subtab.id}
                  className={`subtab-button ${expressionSubTab === subtab.id ? 'active' : ''}`}
                  onClick={() => setExpressionSubTab(subtab.id)}
                >
                  {subtab.label}
                </button>
              ))}
              <Link to="/help/expression" className="subtab-help-link" title="Expression Help">
                <span className="help-icon">?</span> About this page
              </Link>
            </div>

            {/* Sub-tab Content */}
            {expressionSubTab === 'data' && (
              <ExpressionDetails
                data={data.expressionDetails}
                loading={loading.expressionDetails}
                error={errors.expressionDetails}
                selectedOrganism={selectedOrganism}
                onOrganismChange={setSelectedOrganism}
                orthologOrganisms={orthologOrganisms}
              />
            )}
            {expressionSubTab === 'coexpression' && (
              <SimilarGenesDetails
                locusName={name}
                selectedOrganism={selectedOrganism}
                onOrganismChange={setSelectedOrganism}
                currentFeatureName={currentFeatureName}
                orthologMap={orthologMap}
              />
            )}
          </div>
        );

      case 'protein':
        return (
          <ProteinDetails
            data={data.proteinDetails}
            loading={loading.proteinDetails}
            error={errors.proteinDetails}
            selectedOrganism={selectedOrganism}
            onOrganismChange={setSelectedOrganism}
            orthologOrganisms={orthologOrganisms}
          />
        );

      case 'homology':
        return (
          <HomologyDetails
            data={data.homologyDetails}
            loading={loading.homologyDetails}
            error={errors.homologyDetails}
            selectedOrganism={selectedOrganism}
            onOrganismChange={setSelectedOrganism}
            locusName={name}
          />
        );

      case 'sequence':
        return (
          <SequenceDetails
            data={data.sequenceDetails}
            loading={loading.sequenceDetails}
            error={errors.sequenceDetails}
            selectedOrganism={selectedOrganism}
            onOrganismChange={setSelectedOrganism}
            orthologOrganisms={orthologOrganisms}
          />
        );

      case 'literature':
        return (
          <References
            data={data.references}
            loading={loading.references}
            error={errors.references}
            selectedOrganism={selectedOrganism}
            onOrganismChange={setSelectedOrganism}
            locusName={name}
            orthologOrganisms={orthologOrganisms}
          />
        );

      case 'notes':
        return (
          <SummaryNotes
            data={data.summaryNotes}
            loading={loading.summaryNotes}
            error={errors.summaryNotes}
          />
        );

      case 'history':
        return (
          <History
            data={data.history}
            loading={loading.history}
            error={errors.history}
          />
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  // Get gene info for the selected organism (including orthologs)
  const currentGeneInfo = React.useMemo(() => {
    if (!selectedOrganism || !data.info?.results) return null;

    // Check if we have direct data for this organism
    if (data.info.results[selectedOrganism]) {
      const feature = data.info.results[selectedOrganism];
      return {
        feature_name: feature.feature_name,
        gene_name: feature.gene_name,
      };
    }

    // Otherwise, look for ortholog info in candida_orthologs
    for (const orgData of Object.values(data.info.results)) {
      const ortholog = orgData.candida_orthologs?.find(
        orth => orth.organism_name === selectedOrganism
      );
      if (ortholog) {
        return {
          feature_name: ortholog.feature_name,
          gene_name: ortholog.gene_name,
        };
      }
    }

    return null;
  }, [selectedOrganism, data.info?.results]);

  // Get display name for the page title
  const getDisplayName = () => {
    if (currentGeneInfo) {
      return currentGeneInfo.gene_name || currentGeneInfo.feature_name;
    }
    return name;
  };

  // Check if the identifier was not found
  const isNotFound = !loading.info && (
    errors.info ||
    !data.info ||
    !data.info.results ||
    Object.keys(data.info.results).length === 0
  );

  // Show loading state
  if (loading.info) {
    return (
      <div className="locus-page">
        <div className="loading-page">
          <div className="loading-spinner"></div>
          <p>Loading locus information for <strong>{name}</strong>...</p>
        </div>
      </div>
    );
  }

  // Show error page for unknown identifier
  if (isNotFound) {
    return (
      <div className="locus-page">
        <div className="error-page">
          <div className="error-icon">&#9888;</div>
          <h1>Locus Not Found</h1>
          <p className="error-message">
            The identifier <strong>"{name}"</strong> was not found in the Candida Genome Database.
          </p>
          <div className="error-suggestions">
            <h3>Suggestions:</h3>
            <ul>
              <li>Check the spelling of the gene name or identifier</li>
              <li>Try using a standard gene name (e.g., <em>ACT1</em>, <em>CDC42</em>)</li>
              <li>Try using a systematic name (e.g., <em>C1_01070C_A</em>)</li>
              <li>Use the <a href="/feature-search">Advanced Search</a> to find genes</li>
            </ul>
          </div>
          <div className="error-actions">
            <Link to="/" className="btn-home">Return to Home</Link>
            <Link to="/search" className="btn-search">Search CGD</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="locus-page">
      <header className="locus-header">
        <h1>{getDisplayName()}</h1>
        {currentGeneInfo && (
          <p className="subtitle">
            {currentGeneInfo.feature_name}
            {currentGeneInfo.gene_name &&
              currentGeneInfo.gene_name !== currentGeneInfo.feature_name &&
              ` / ${currentGeneInfo.gene_name}`
            }
          </p>
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

export default LocusPage;
