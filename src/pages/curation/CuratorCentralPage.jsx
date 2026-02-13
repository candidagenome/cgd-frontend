/**
 * Curator Central Page
 *
 * Main hub for curator activities after login.
 * Provides links to all curation tools organized by category.
 */
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function CuratorCentralPage() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="curator-central" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Curator Central</h1>
        <div style={styles.userInfo}>
          <span>Welcome, {user?.first_name} {user?.last_name}</span>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      <div style={styles.columns}>
        {/* Left Column */}
        <div style={styles.column}>
          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>Colleagues and Gene Registries</h3>
            <ul style={styles.linkList}>
              <li>
                <Link to="/curation/colleague/list">Manage Colleagues</Link>
                {' | '}
                <a href="https://wiki.candidagenome.org/index.php/Help:colleague" target="_blank" rel="noopener noreferrer">Help</a>
              </li>
              <li>
                <Link to="/colleague">Find the colleague_no for a colleague</Link>
              </li>
              <li>
                <Link to="/curation/gene-registry/list">Process gene registry forms</Link>
                {' | '}
                <a href="https://wiki.candidagenome.org/index.php/Help:generegistry" target="_blank" rel="noopener noreferrer">Help</a>
              </li>
            </ul>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>Biological annotation</h3>
            <ul style={styles.linkList}>
              <li>
                <Link to="/curation/locus-guide">Locus Curation Guide Page</Link>
                {' | '}
                <a href="https://wiki.candidagenome.org/index.php/Help:CurateLocusFeat" target="_blank" rel="noopener noreferrer">Help</a>
              </li>
              <li>
                <Link to="/curation/go">Curate GO</Link>
                {' | '}
                <Link to="/curation/go/todo">GO ToDo List</Link>
              </li>
              <li>
                <Link to="/curation/phenotype">Curate Phenotype</Link>
                {' | '}
                <a href="https://wiki.candidagenome.org/index.php/Help:Phenotype_Curation_Help" target="_blank" rel="noopener noreferrer">Help</a>
              </li>
              <li style={styles.disabledItem}>
                <Link to="/curation/feature/new" style={styles.disabledLink}>Add a New Feature</Link>
                {' | '}
                <a href="https://wiki.candidagenome.org/index.php/Help:CurateLocusFeat" target="_blank" rel="noopener noreferrer" style={styles.disabledLink}>Help</a>
              </li>
              <li style={styles.disabledItem}>
                <Link to="/curation/links" style={styles.disabledLink}>Add Links and Pull-downs to Locus Page</Link>
              </li>
              <li style={styles.disabledItem}>
                <Link to="/curation/paragraph" style={styles.disabledLink}>Paragraphs</Link>
                {' | '}
                <a href="https://wiki.candidagenome.org/index.php/Help:paragraph" target="_blank" rel="noopener noreferrer" style={styles.disabledLink}>Help</a>
              </li>
              <li style={styles.disabledItem}>
                <Link to="/curation/location/new" style={styles.disabledLink}>Add New Location for existing Feature</Link>
              </li>
              <li style={styles.disabledItem}>
                <Link to="/curation/sequence" style={styles.disabledLink}>Update Chromosome Sequence</Link>
              </li>
              <li style={styles.disabledItem}>
                <Link to="/curation/coordinates" style={styles.disabledLink}>Update Feature Coordinates and Relationships</Link>
              </li>
            </ul>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>Useful links</h3>
            <ul style={styles.linkList}>
              <li style={styles.disabledItem}>
                <a href="https://wiki.candidagenome.org/" target="_blank" rel="noopener noreferrer" style={styles.disabledLink}>General staff page</a>
              </li>
              <li style={styles.disabledItem}>
                <a href="https://wiki.candidagenome.org/index.php/CGD:help" target="_blank" rel="noopener noreferrer" style={styles.disabledLink}>CGD Curator Help</a>
              </li>
            </ul>
          </section>
        </div>

        {/* Divider */}
        <div style={styles.divider}></div>

        {/* Right Column */}
        <div style={styles.column}>
          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>References/Literature</h3>
            <ul style={styles.linkList}>
              <li>
                <Link to="/curation/litguide">Curate Literature Guide</Link>
                {' | '}
                <Link to="/curation/litguide/todo">LitGuide ToDo List</Link>
                {' | '}
                <a href="https://wiki.candidagenome.org/index.php/Help:geneinfo" target="_blank" rel="noopener noreferrer">Help</a>
              </li>
              <li>
                <Link to="/curation/reference/create">Create and/or Link PubMed Reference</Link>
              </li>
              <li>
                <Link to="/curation/reference/search">Edit or delete an existing reference</Link>
              </li>
              <li style={styles.disabledItem}>
                <Link to="/curation/literature/review" style={styles.disabledLink}>PubMed New Literature Review</Link>
              </li>
              <li style={styles.disabledItem}>
                <Link to="/curation/reference/annotation" style={styles.disabledLink}>Edit Reference Annotations</Link>
              </li>
              <li style={styles.disabledItem}>
                <Link to="/curation/reference/search" target="_blank" style={styles.disabledLink}>Reference Search</Link>
              </li>
            </ul>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>Misc. curator tools</h3>
            <ul style={styles.linkList}>
              <li style={styles.disabledItem}>
                <Link to="/curation/note/new" style={styles.disabledLink}>Enter a new curator note</Link>
              </li>
              <li style={styles.disabledItem}>
                <Link to="/curation/note/edit" style={styles.disabledLink}>Edit an existing curator note</Link>
              </li>
              <li style={styles.disabledItem}>
                <Link to="/curation/db-search" style={styles.disabledLink}>Database Search (Phenotypes)</Link>
              </li>
              <li style={styles.disabledItem}>
                <Link to="/curation/seq-alignment" style={styles.disabledLink}>Sequence Alignment Tool</Link>
              </li>
            </ul>
          </section>

          <section style={styles.section}>
            <h3 style={styles.sectionHeader}>Database resources/tools</h3>
            <ul style={styles.linkList}>
              <li style={styles.disabledItem}>
                <a href="https://wiki.candidagenome.org/index.php/Main_Page#CGD" target="_blank" rel="noopener noreferrer" style={styles.disabledLink}>CGD business rules</a>
              </li>
              <li style={styles.disabledItem}>
                <a href="https://wiki.candidagenome.org/index.php/Main_Page#CGD" target="_blank" rel="noopener noreferrer" style={styles.disabledLink}>CGD table specifications</a>
              </li>
              <li style={styles.disabledItem}>
                <a href="https://wiki.candidagenome.org/index.php/Main_Page#Database" target="_blank" rel="noopener noreferrer" style={styles.disabledLink}>Oracle resources</a>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '1rem auto',
    padding: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '0.5rem',
    borderBottom: '2px solid #333',
  },
  title: {
    margin: 0,
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.95rem',
  },
  logoutButton: {
    padding: '0.25rem 0.75rem',
    fontSize: '0.9rem',
    backgroundColor: '#666',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  columns: {
    display: 'flex',
    gap: '0',
  },
  column: {
    flex: 1,
    padding: '0 1rem',
  },
  divider: {
    width: '1px',
    backgroundColor: '#999',
  },
  section: {
    marginBottom: '1.5rem',
  },
  sectionHeader: {
    backgroundColor: '#CCCCFF',
    padding: '0.25rem 0.5rem',
    margin: '0 0 0.5rem 0',
    fontSize: '1rem',
  },
  linkList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  disabledItem: {
    color: '#999',
  },
  disabledLink: {
    color: '#999',
  },
};

// Add margin to list items via CSS-in-JS
Object.assign(styles.linkList, {
  '& li': {
    marginBottom: '0.25rem',
  },
});

export default CuratorCentralPage;
