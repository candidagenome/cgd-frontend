import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import genomeSnapshotApi from '../api/genomeSnapshotApi';
import './InfoPages.css';

/**
 * Horizontal Bar Chart component for GO Slim distribution visualization.
 * Shows percentage of genes annotated to each GO Slim term (like original Perl).
 */
function GoSlimBarChart({ data, title, organismName, color = '#4169E1' }) {
  if (!data || !data.categories || data.categories.length === 0) {
    return (
      <div className="go-slim-bar-chart">
        <p style={{ color: '#666', fontStyle: 'italic' }}>No data available</p>
      </div>
    );
  }

  const maxPercentage = Math.max(...data.categories.map(c => c.percentage || 0));
  const chartWidth = 750;
  const barHeight = 20;
  const labelWidth = 250;
  const percentWidth = 50;
  const barAreaWidth = chartWidth - labelWidth - percentWidth - 30;
  const padding = 3;

  // Calculate chart height based on number of categories
  const chartHeight = data.categories.length * (barHeight + padding) + 50;

  // Calculate max value for Y-axis (round up to nice number like original Perl)
  let yMax = Math.ceil(maxPercentage / 5) * 5;
  if (yMax < 5) yMax = 5;

  return (
    <div className="go-slim-bar-chart">
      <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>
        <em>{organismName}</em> {title}
      </h4>
      <svg width={chartWidth} height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Y-axis label */}
        <text
          x={chartWidth - 10}
          y={20}
          textAnchor="end"
          fontSize="11"
          fill="#666"
        >
          % genes annotated
        </text>
        {data.categories.map((category, index) => {
          const y = index * (barHeight + padding) + 35;
          const percentage = category.percentage || 0;
          const barWidth = yMax > 0 ? (percentage / yMax) * barAreaWidth : 0;

          return (
            <g key={category.goid}>
              {/* Category label */}
              <text
                x={labelWidth - 10}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                fontSize="11"
                fill="#333"
              >
                {category.go_term.length > 35
                  ? category.go_term.substring(0, 32) + '...'
                  : category.go_term}
              </text>
              {/* Bar */}
              <rect
                x={labelWidth}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx="2"
              />
              {/* Percentage label */}
              <text
                x={labelWidth + barWidth + 8}
                y={y + barHeight / 2 + 4}
                fontSize="11"
                fill="#333"
              >
                {percentage.toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * SVG Pie Chart component for ORF distribution visualization.
 */
function OrfPieChart({ verified, uncharacterized, dubious, organismName }) {
  const total = verified + uncharacterized + dubious;
  if (total === 0) return null;

  const size = 300;
  const radius = 120;
  const centerX = size / 2;
  const centerY = size / 2;

  // Calculate percentages
  const verifiedPct = (verified / total) * 100;
  const uncharPct = (uncharacterized / total) * 100;
  const dubiousPct = (dubious / total) * 100;

  // Colors matching the legend
  const colors = {
    verified: '#4169E1',      // Royal Blue
    uncharacterized: '#228B22', // Forest Green
    dubious: '#DC143C',       // Crimson
  };

  // Calculate pie slice paths
  const slices = [
    { label: 'Verified', value: verified, color: colors.verified, pct: verifiedPct },
    { label: 'Uncharacterized', value: uncharacterized, color: colors.uncharacterized, pct: uncharPct },
    { label: 'Dubious', value: dubious, color: colors.dubious, pct: dubiousPct },
  ].filter(s => s.value > 0);

  // Generate SVG path for each slice
  let currentAngle = -90; // Start at top (12 o'clock)
  const paths = slices.map((slice, index) => {
    const angle = (slice.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // Convert angles to radians
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    // Calculate arc points
    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    // Large arc flag (1 if angle > 180)
    const largeArc = angle > 180 ? 1 : 0;

    // SVG path
    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    // Calculate label position (middle of the slice, at 70% radius for better positioning)
    const midAngle = startAngle + angle / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const labelRadius = radius * 0.65;
    const labelX = centerX + labelRadius * Math.cos(midRad);
    const labelY = centerY + labelRadius * Math.sin(midRad);

    currentAngle = endAngle;

    return {
      ...slice,
      path,
      labelX,
      labelY,
      key: index,
    };
  });

  return (
    <div className="orf-pie-chart">
      <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>
        <em>{organismName}</em> ORF Distribution
      </h4>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Pie slices */}
        {paths.map((slice) => (
          <path
            key={slice.key}
            d={slice.path}
            fill={slice.color}
            stroke="#fff"
            strokeWidth="2"
          />
        ))}
        {/* Labels inside slices */}
        {paths.map((slice) => (
          slice.pct >= 5 && (
            <text
              key={`label-${slice.key}`}
              x={slice.labelX}
              y={slice.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize="12"
              fontWeight="bold"
            >
              {slice.pct.toFixed(1)}%
            </text>
          )
        ))}
      </svg>
    </div>
  );
}

function GenomeSnapshotPage() {
  const { organism } = useParams();

  // State for data fetching
  const [data, setData] = useState(null);
  const [organisms, setOrganisms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [goSlimData, setGoSlimData] = useState(null);
  const [goSlimLoading, setGoSlimLoading] = useState(false);

  // Handle hash link scrolling (React Router doesn't handle these well)
  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch available organisms on mount
  useEffect(() => {
    const fetchOrganisms = async () => {
      try {
        const response = await genomeSnapshotApi.getOrganisms();
        if (response.success) {
          setOrganisms(response.organisms);
        }
      } catch (err) {
        console.error('Failed to fetch organisms:', err);
      }
    };
    fetchOrganisms();
  }, []);

  // Fetch genome snapshot data when organism changes
  useEffect(() => {
    if (!organism) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await genomeSnapshotApi.getSnapshot(organism);
        if (response.success) {
          setData(response);
        } else {
          setError(response.error || 'Failed to load genome snapshot');
        }
      } catch (err) {
        console.error('Failed to fetch genome snapshot:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load genome snapshot');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [organism]);

  // Fetch GO Slim distribution data when organism changes
  useEffect(() => {
    if (!organism) {
      return;
    }

    const fetchGoSlimData = async () => {
      setGoSlimLoading(true);
      try {
        const response = await genomeSnapshotApi.getGoSlimDistribution(organism);
        if (response.success) {
          setGoSlimData(response);
        }
      } catch (err) {
        console.error('Failed to fetch GO Slim distribution:', err);
      } finally {
        setGoSlimLoading(false);
      }
    };
    fetchGoSlimData();
  }, [organism]);

  // Show organism selection if no organism specified
  if (!organism) {
    return (
      <div className="info-page">
        <div className="info-page-content">
          <h1>Genome Snapshot</h1>
          <hr />
          <p>Select a genome to view its snapshot:</p>
          <ul>
            {organisms.map((org) => (
              <li key={org.organism_abbrev}>
                <Link to={`/genome-snapshot/${org.organism_abbrev}`}>
                  <em>{org.organism_name}</em>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="info-page">
        <div className="info-page-content">
          <h1>Genome Snapshot</h1>
          <hr />
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Loading genome snapshot...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="info-page">
        <div className="info-page-content">
          <h1>Genome Snapshot</h1>
          <hr />
          <div className="error-state">
            <p>{error || 'Failed to load genome snapshot'}</p>
          </div>
          <p>
            <Link to="/genome-snapshot">View available genomes</Link>
          </p>
        </div>
      </div>
    );
  }

  // Calculate percentages
  const verifiedPercent = data.haploid_orfs > 0
    ? ((data.verified_orfs / data.haploid_orfs) * 100).toFixed(2)
    : '0.00';
  const uncharPercent = data.haploid_orfs > 0
    ? ((data.uncharacterized_orfs / data.haploid_orfs) * 100).toFixed(2)
    : '0.00';
  const dubiousPercent = data.haploid_orfs > 0
    ? ((data.dubious_orfs / data.haploid_orfs) * 100).toFixed(2)
    : '0.00';

  // Determine if diploid for haploid column calculations
  const isDiploid = organism.toLowerCase().includes('albicans');
  const divisor = isDiploid ? 2 : 1;

  return (
    <div className="info-page genome-snapshot-page">
      <div className="info-page-content">
        <div className="snapshot-header">
          <h1>
            <em>{data.organism_name} {data.strain}</em> Genome Snapshot/Overview
          </h1>
          <Link to="/help/genome-snapshot" className="help-button">
            <img src="/images/help-button.png" alt="Help" width="30" height="30" />
          </Link>
        </div>
        <hr />

        <p style={{ textAlign: 'right', color: '#666', fontSize: '0.9em', marginBottom: '15px' }}>
          <strong>Last updated:</strong> {data.last_updated}
        </p>

        <p>
          This page provides information on the status of the <em>{data.organism_name} {data.strain}</em> genome.
          Data on this page are updated in real-time from the database. All the data displayed on this page are available in one
          or more files (Chromosomal Feature File; GO Annotations File; Candida Go Slim Annotations File) on the
          CGD <Link to="/download">Download Data</Link> page. The{' '}
          <a href="/feature-search">Advanced Search</a> tool can also be used to retrieve
          chromosomal features that match specific criteria.
        </p>

        {/* Table of Contents */}
        <section className="info-section">
          <h2>Contents</h2>
          <ol className="toc-list">
            <li><a href="#pieChart" onClick={(e) => scrollToSection(e, 'pieChart')}>Graphical View of Protein Coding Genes</a></li>
            <li><a href="#genomeInventory" onClick={(e) => scrollToSection(e, 'genomeInventory')}>Genome Inventory</a></li>
            <li><a href="#goAnnotations" onClick={(e) => scrollToSection(e, 'goAnnotations')}>Summary of GO annotations</a></li>
            <li><a href="#barCharts" onClick={(e) => scrollToSection(e, 'barCharts')}>Distribution of Gene Products by Process, Function, and Component</a></li>
          </ol>
        </section>

        {/* Pie Chart Section */}
        <section className="info-section" id="pieChart">
          <h3>Graphical View of Protein Coding Genes</h3>
          <div className="chart-container">
            <OrfPieChart
              verified={data.verified_orfs}
              uncharacterized={data.uncharacterized_orfs}
              dubious={data.dubious_orfs}
              organismName={`${data.organism_name} ${data.strain}`}
            />
          </div>
          <div className="legend-container">
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#4169E1' }}></span>
              {data.verified_orfs.toLocaleString()} ORFs, {verifiedPercent}% Verified
            </span>
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#228B22' }}></span>
              {data.uncharacterized_orfs.toLocaleString()} ORFs, {uncharPercent}% Uncharacterized
            </span>
            <span className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#DC143C' }}></span>
              {data.dubious_orfs.toLocaleString()} ORFs, {dubiousPercent}% Dubious
            </span>
          </div>
        </section>

        {/* Genome Inventory Section */}
        <section className="info-section" id="genomeInventory">
          <h3>Genome Inventory</h3>
          <p>
            This table reports the number and types of features annotated in CGD. To get a list of all
            features of a certain type (e.g., Verified ORF, tRNA, etc.), select that feature type.
          </p>

          <table className="snapshot-table">
            <thead>
              <tr>
                <th>Feature Type</th>
                <th>Total</th>
                <th>Haploid Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total ORFs</td>
                <td>{data.total_orfs.toLocaleString()}</td>
                <td>{data.haploid_orfs.toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  {/* Link temporarily disabled while feature-search counts are being fixed */}
                  {/* <Link to={`/feature-search/results?organism=${organism}&qualifier=Verified&featuretype=ORF`}> */}
                    Verified ORFs
                  {/* </Link> */}
                </td>
                <td>{data.verified_orfs.toLocaleString()}</td>
                <td>{Math.round(data.verified_orfs / divisor).toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  {/* Link temporarily disabled while feature-search counts are being fixed */}
                  {/* <Link to={`/feature-search/results?organism=${organism}&qualifier=Uncharacterized&featuretype=ORF`}> */}
                    Uncharacterized ORFs
                  {/* </Link> */}
                </td>
                <td>{data.uncharacterized_orfs.toLocaleString()}</td>
                <td>{Math.round(data.uncharacterized_orfs / divisor).toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  {/* Link temporarily disabled while feature-search counts are being fixed */}
                  {/* <Link to={`/feature-search/results?organism=${organism}&qualifier=Dubious&featuretype=ORF`}> */}
                    Dubious ORFs
                  {/* </Link> */}
                </td>
                <td>{data.dubious_orfs.toLocaleString()}</td>
                <td>{Math.round(data.dubious_orfs / divisor).toLocaleString()}</td>
              </tr>
              <tr>
                <td>
                  {/* Link temporarily disabled while feature-search counts are being fixed */}
                  {/* <Link to={`/feature-search/results?organism=${organism}&featuretype=tRNA`}> */}
                    tRNA
                  {/* </Link> */}
                </td>
                <td>{data.trna_count.toLocaleString()}</td>
                <td>{Math.round(data.trna_count / divisor).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* GO Annotations Section */}
        <section className="info-section" id="goAnnotations">
          <h3>Summary of Gene Ontology (GO) annotations</h3>
          <p>
            This table displays the current total number of <em>{data.organism_name} {data.strain}</em> gene
            products that have been annotated to one or more terms in each GO aspect (Process, Function,
            Component). These counts include GO annotations made for ORFs classified as either "Verified"
            or "Uncharacterized", transposable element genes, and all RNA gene products.
          </p>

          <table className="snapshot-table go-table">
            <thead>
              <tr>
                <th>Ontology</th>
                <th>Total Number of Annotations</th>
                <th>Graphical View</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Molecular Function</td>
                <td>{data.go_annotations.molecular_function.toLocaleString()}</td>
                <td><a href="#function" onClick={(e) => scrollToSection(e, 'function')}>Go to Molecular Function Graph</a></td>
              </tr>
              <tr>
                <td>Cellular Component</td>
                <td>{data.go_annotations.cellular_component.toLocaleString()}</td>
                <td><a href="#component" onClick={(e) => scrollToSection(e, 'component')}>Go to Cellular Component Graph</a></td>
              </tr>
              <tr>
                <td>Biological Process</td>
                <td>{data.go_annotations.biological_process.toLocaleString()}</td>
                <td><a href="#process" onClick={(e) => scrollToSection(e, 'process')}>Go to Biological Process Graph</a></td>
              </tr>
              <tr className="total-row">
                <th>All Ontologies</th>
                <td>{data.go_annotations.total.toLocaleString()}</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Bar Charts Section */}
        <section className="info-section" id="barCharts">
          <h3>Distribution of Gene Products by Process, Function, and Component</h3>
          <p>
            These graphical views representing the GO annotation state of the entire genome are provided
            using a GO Slim (a high-level subset of Gene Ontology terms that allows grouping of genes
            into broad categories such as "DNA replication", "protein kinase activity", or "nucleus")
            tailored to <em>Candida</em> biology.
          </p>
          <p>
            More information on GO and GO Slim can be found at SGD's{' '}
            <a href="https://sites.google.com/view/yeastgenome-help/function-help/gene-ontology-go" target="_blank" rel="noopener noreferrer">
              GO help page
            </a>{' '}
            or in the Gene Ontology{' '}
            <a href="http://www.geneontology.org/GO.doc.shtml" target="_blank" rel="noopener noreferrer">
              documentation
            </a>.
            To obtain the GO data summarized in these graphs, you may use the{' '}
            <a href="/go-slim-mapper">GO Slim Mapper</a>.
          </p>

          <div id="function" className="chart-section">
            <h4>Distribution of Gene Products among Molecular Function Categories</h4>
            <div className="chart-container">
              {goSlimLoading ? (
                <p>Loading chart...</p>
              ) : goSlimData?.molecular_function ? (
                <GoSlimBarChart
                  data={goSlimData.molecular_function}
                  title="Molecular Function Distribution"
                  organismName={`${data.organism_name} ${data.strain}`}
                  color="#4169E1"
                />
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No data available</p>
              )}
            </div>
          </div>

          <div id="component" className="chart-section">
            <h4>Distribution of Gene Products among Cellular Component Categories</h4>
            <div className="chart-container">
              {goSlimLoading ? (
                <p>Loading chart...</p>
              ) : goSlimData?.cellular_component ? (
                <GoSlimBarChart
                  data={goSlimData.cellular_component}
                  title="Cellular Component Distribution"
                  organismName={`${data.organism_name} ${data.strain}`}
                  color="#228B22"
                />
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No data available</p>
              )}
            </div>
          </div>

          <div id="process" className="chart-section">
            <h4>Distribution of Gene Products among Biological Process Categories</h4>
            <div className="chart-container">
              {goSlimLoading ? (
                <p>Loading chart...</p>
              ) : goSlimData?.biological_process ? (
                <GoSlimBarChart
                  data={goSlimData.biological_process}
                  title="Biological Process Distribution"
                  organismName={`${data.organism_name} ${data.strain}`}
                  color="#DC143C"
                />
              ) : (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No data available</p>
              )}
            </div>
          </div>
        </section>

        <hr />

        {/* Other Genome Snapshots */}
        <section className="info-section">
          <h3>Other Genome Snapshots</h3>
          <ul>
            {organisms
              .filter((org) => org.organism_abbrev !== organism)
              .map((org) => (
                <li key={org.organism_abbrev}>
                  <Link to={`/genome-snapshot/${org.organism_abbrev}`}>
                    <em>{org.organism_name}</em>
                  </Link>
                </li>
              ))}
          </ul>
        </section>

        {/* Related Resources */}
        <section className="info-section">
          <h3>Related Resources</h3>
          <ul>
            <li>
              <a href="/feature-search">Advanced Search Tool</a> - Search for chromosomal features
            </li>
            <li>
              <Link to="/download">Download Data</Link> - Download feature files, GO annotations, and sequences
            </li>
            <li>
              <Link to="/help/genome-snapshot">Genome Snapshot Help</Link> - Documentation about this resource
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

export default GenomeSnapshotPage;
