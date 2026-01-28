import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import useLocusData from '../hooks/useLocusData';
import LocusSummary from '../components/locus/LocusSummary';
import GoDetails from '../components/locus/GoDetails';
import PhenotypeDetails from '../components/locus/PhenotypeDetails';
import ProteinDetails from '../components/locus/ProteinDetails';
import HomologyDetails from '../components/locus/HomologyDetails';
import SequenceDetails from '../components/locus/SequenceDetails';
import References from '../components/locus/References';
import SummaryNotes from '../components/locus/SummaryNotes';
import History from '../components/locus/History';
import { getDefaultOrganism } from '../components/locus/OrganismSelector';
import './LocusPage.css';

const TABS = [
  { id: 'summary', label: 'Summary', component: 'summary', loader: 'loadSummaryData' },
  { id: 'go', label: 'Gene Ontology', component: 'go', loader: 'loadGoDetails' },
  { id: 'phenotype', label: 'Phenotype', component: 'phenotype', loader: 'loadPhenotypeDetails' },
  { id: 'protein', label: 'Protein', component: 'protein', loader: 'loadProteinDetails' },
  { id: 'homology', label: 'Homologs', component: 'homology', loader: 'loadHomologyDetails' },
  { id: 'sequence', label: 'Sequence', component: 'sequence', loader: 'loadSequenceDetails' },
  { id: 'references', label: 'References', component: 'references', loader: 'loadReferences' },
  { id: 'notes', label: 'Summary Notes', component: 'notes', loader: 'loadSummaryNotes' },
  { id: 'history', label: 'History', component: 'history', loader: 'loadHistory' },
];

function LocusPage() {
  const { name } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'summary');
  const [selectedOrganism, setSelectedOrganism] = useState(null);

  const { data, loading, errors, loaders } = useLocusData(name);

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

  // Set default organism when data loads - prefer "Candida albicans SC5314" if available
  useEffect(() => {
    if (data.info && !selectedOrganism) {
      const organisms = Object.keys(data.info.results || {});
      const defaultOrg = getDefaultOrganism(organisms);
      if (defaultOrg) {
        setSelectedOrganism(defaultOrg);
      }
    }
  }, [data.info, selectedOrganism]);

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
          <div className="summary-tab">
            {organisms.length > 1 && (
              <div className="organism-selector">
                <label>Select Organism: </label>
                <select
                  value={selectedOrganism || ''}
                  onChange={(e) => setSelectedOrganism(e.target.value)}
                >
                  {organisms.map(org => (
                    <option key={org} value={org}>{org}</option>
                  ))}
                </select>
              </div>
            )}
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
          />
        );

      case 'protein':
        return (
          <ProteinDetails
            data={data.proteinDetails}
            loading={loading.proteinDetails}
            error={errors.proteinDetails}
            selectedOrganism={selectedOrganism}
            onOrganismChange={setSelectedOrganism}
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
          />
        );

      case 'references':
        return (
          <References
            data={data.references}
            loading={loading.references}
            error={errors.references}
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

  // Get display name for the page title
  const getDisplayName = () => {
    if (data.info && selectedOrganism && data.info.results[selectedOrganism]) {
      const feature = data.info.results[selectedOrganism];
      return feature.gene_name || feature.feature_name;
    }
    return name;
  };

  return (
    <div className="locus-page">
      <header className="locus-header">
        <h1>{getDisplayName()}</h1>
        {data.info && selectedOrganism && data.info.results[selectedOrganism] && (
          <p className="subtitle">
            {data.info.results[selectedOrganism].feature_name}
            {data.info.results[selectedOrganism].gene_name &&
              data.info.results[selectedOrganism].gene_name !== data.info.results[selectedOrganism].feature_name &&
              ` / ${data.info.results[selectedOrganism].gene_name}`
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
