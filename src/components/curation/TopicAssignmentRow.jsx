/**
 * TopicAssignmentRow - A single row for assigning topics to features.
 *
 * Contains a features textarea, literature topics button+list,
 * and optionally a curation status button+list.
 */
import { useState } from 'react';
import PropTypes from 'prop-types';
import CVTreeModal from './CVTreeModal';

function TopicAssignmentRow({
  features,
  literatureTopics,
  curationStatuses = [],
  onFeaturesChange,
  onLiteratureTopicsChange,
  onCurationStatusesChange = () => {},
  onRemove,
  showRemoveButton = true,
  hideCurationStatus = false,
}) {
  const [litTopicModalOpen, setLitTopicModalOpen] = useState(false);
  const [curationStatusModalOpen, setCurationStatusModalOpen] = useState(false);

  return (
    <div style={styles.row}>
      <div style={styles.rowContent}>
        {/* Features textarea */}
        <div style={styles.featuresSection}>
          <label style={styles.label}>Features:</label>
          <textarea
            value={features}
            onChange={(e) => onFeaturesChange(e.target.value)}
            placeholder="Enter feature names separated by space or |"
            style={styles.textarea}
            rows={2}
          />
        </div>

        {/* Literature Topics */}
        <div style={styles.topicSection}>
          <button
            type="button"
            onClick={() => setLitTopicModalOpen(true)}
            style={styles.topicButton}
          >
            Literature Topics
          </button>
          <div style={styles.selectedList}>
            {literatureTopics.length > 0 ? (
              literatureTopics.map((topic, idx) => (
                <div key={idx} style={styles.selectedItem}>
                  {topic}
                  <button
                    type="button"
                    onClick={() => {
                      const newTopics = literatureTopics.filter((_, i) => i !== idx);
                      onLiteratureTopicsChange(newTopics);
                    }}
                    style={styles.removeItemBtn}
                  >
                    &times;
                  </button>
                </div>
              ))
            ) : (
              <span style={styles.noSelection}>None selected</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onLiteratureTopicsChange([])}
            style={styles.clearBtn}
            disabled={literatureTopics.length === 0}
          >
            Clear
          </button>
        </div>

        {/* Curation Status (optional, can be hidden when status is set at reference level) */}
        {!hideCurationStatus && (
          <div style={styles.topicSection}>
            <button
              type="button"
              onClick={() => setCurationStatusModalOpen(true)}
              style={styles.topicButton}
            >
              Curation Status
            </button>
            <div style={styles.selectedList}>
              {curationStatuses.length > 0 ? (
                curationStatuses.map((status, idx) => (
                  <div key={idx} style={styles.selectedItem}>
                    {status}
                    <button
                      type="button"
                      onClick={() => {
                        const newStatuses = curationStatuses.filter((_, i) => i !== idx);
                        onCurationStatusesChange(newStatuses);
                      }}
                      style={styles.removeItemBtn}
                    >
                      &times;
                    </button>
                  </div>
                ))
              ) : (
                <span style={styles.noSelection}>None selected</span>
              )}
            </div>
            <button
              type="button"
              onClick={() => onCurationStatusesChange([])}
              style={styles.clearBtn}
              disabled={curationStatuses.length === 0}
            >
              Clear
            </button>
          </div>
        )}

        {/* Remove row button */}
        {showRemoveButton && (
          <button
            type="button"
            onClick={onRemove}
            style={styles.removeRowBtn}
            title="Remove this row"
          >
            &times;
          </button>
        )}
      </div>

      {/* Modals */}
      <CVTreeModal
        isOpen={litTopicModalOpen}
        onClose={() => setLitTopicModalOpen(false)}
        onSelect={onLiteratureTopicsChange}
        cvName="literature_topic"
        title="Select Literature Topics"
        selectedTerms={literatureTopics}
      />
      {!hideCurationStatus && (
        <CVTreeModal
          isOpen={curationStatusModalOpen}
          onClose={() => setCurationStatusModalOpen(false)}
          onSelect={onCurationStatusesChange}
          cvName="curation_status"
          title="Select Curation Status"
          selectedTerms={curationStatuses}
        />
      )}
    </div>
  );
}

const styles = {
  row: {
    padding: '1rem',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginBottom: '0.5rem',
  },
  rowContent: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  featuresSection: {
    flex: '1 1 200px',
    minWidth: '200px',
  },
  label: {
    display: 'block',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
    fontSize: '0.9rem',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '0.9rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  topicSection: {
    flex: '1 1 180px',
    minWidth: '180px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  topicButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.85rem',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  selectedList: {
    minHeight: '60px',
    maxHeight: '100px',
    overflow: 'auto',
    border: '1px solid #ddd',
    borderRadius: '4px',
    padding: '0.25rem',
    backgroundColor: '#fafafa',
  },
  selectedItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.15rem 0.4rem',
    margin: '0.1rem',
    backgroundColor: '#e0e0e0',
    borderRadius: '3px',
    fontSize: '0.8rem',
  },
  removeItemBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#666',
    padding: '0 0.1rem',
    lineHeight: 1,
  },
  noSelection: {
    color: '#999',
    fontSize: '0.8rem',
    fontStyle: 'italic',
    padding: '0.25rem',
  },
  clearBtn: {
    padding: '0.25rem 0.5rem',
    fontSize: '0.8rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '4px',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  removeRowBtn: {
    padding: '0.25rem 0.5rem',
    fontSize: '1.2rem',
    backgroundColor: '#fff',
    border: '1px solid #dc3545',
    borderRadius: '4px',
    color: '#dc3545',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
};

TopicAssignmentRow.propTypes = {
  features: PropTypes.string.isRequired,
  literatureTopics: PropTypes.arrayOf(PropTypes.string).isRequired,
  curationStatuses: PropTypes.arrayOf(PropTypes.string),
  onFeaturesChange: PropTypes.func.isRequired,
  onLiteratureTopicsChange: PropTypes.func.isRequired,
  onCurationStatusesChange: PropTypes.func,
  onRemove: PropTypes.func.isRequired,
  showRemoveButton: PropTypes.bool,
  hideCurationStatus: PropTypes.bool,
};

export default TopicAssignmentRow;
