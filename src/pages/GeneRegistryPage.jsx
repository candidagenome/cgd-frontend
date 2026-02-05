import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import geneRegistryApi from '../api/geneRegistryApi';
import './GeneRegistryPage.css';

function GeneRegistryPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Config
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [lastName, setLastName] = useState(searchParams.get('last_name') || '');
  const [geneName, setGeneName] = useState(searchParams.get('gene_name') || '');
  const [orfName, setOrfName] = useState(searchParams.get('orf_name') || '');
  const [organism, setOrganism] = useState(searchParams.get('organism') || '');

  // Search state
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);

  // Submission state
  const [step, setStep] = useState(1); // 1: form, 2: results, 3: submit form, 4: success
  const [selectedColleague, setSelectedColleague] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // New colleague form
  const [newColleague, setNewColleague] = useState({
    first_name: '',
    last_name: '',
    email: '',
    institution: '',
  });

  // Submission form
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [comments, setComments] = useState('');

  // Load config
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await geneRegistryApi.getConfig();
        setConfig(data);
        if (!organism && data.default_species) {
          setOrganism(data.default_species);
        }
      } catch (err) {
        console.error('Config error:', err);
        setError('Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      const result = await geneRegistryApi.search(lastName, geneName, orfName, organism);
      setSearchResult(result);
      setStep(2);

      // Update URL params
      const params = { last_name: lastName, gene_name: geneName, organism };
      if (orfName) params.orf_name = orfName;
      setSearchParams(params);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.response?.data?.detail || 'Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectColleague = (colleague) => {
    setSelectedColleague(colleague);
    setStep(3);
  };

  const handleNewColleague = () => {
    setSelectedColleague(null);
    setNewColleague(prev => ({ ...prev, last_name: lastName }));
    setStep(3);
  };

  const handleNewColleagueChange = (e) => {
    const { name, value } = e.target;
    setNewColleague(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data = {
        gene_name: geneName,
        orf_name: orfName || null,
        organism,
        description: description || null,
        reference: reference || null,
        comments: comments || null,
      };

      if (selectedColleague) {
        data.colleague_no = selectedColleague.colleague_no;
      } else {
        data.last_name = newColleague.last_name;
        data.first_name = newColleague.first_name;
        data.email = newColleague.email;
        data.institution = newColleague.institution;
      }

      const result = await geneRegistryApi.submit(data);
      if (result.success) {
        setSubmitSuccess(result.message);
        setStep(4);
      } else {
        setError(result.errors?.join(', ') || 'Submission failed');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.detail || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 3) setStep(2);
    else if (step === 2) setStep(1);
  };

  const handleReset = () => {
    setStep(1);
    setSearchResult(null);
    setSelectedColleague(null);
    setDescription('');
    setReference('');
    setComments('');
  };

  if (loading) {
    return (
      <div className="gene-registry-page">
        <div className="gene-registry-content">
          <h1>CGD Gene Registry Submission</h1>
          <hr />
          <div className="loading-state">Loading...</div>
        </div>
      </div>
    );
  }

  // Success page
  if (step === 4) {
    return (
      <div className="gene-registry-page">
        <div className="gene-registry-content">
          <h1>CGD Gene Registry Submission</h1>
          <hr />
          <div className="success-message">
            <h2>Thank You!</h2>
            <p>{submitSuccess}</p>
          </div>
          <div className="nav-links">
            <Link to="/gene-registry" onClick={handleReset}>Submit Another Gene Name</Link>
          </div>
        </div>
      </div>
    );
  }

  // Submission form (step 3)
  if (step === 3) {
    return (
      <div className="gene-registry-page">
        <div className="gene-registry-content">
          <h1>CGD Gene Registry Submission</h1>
          <hr />

          <div className="step-indicator">Step 3: Complete Registration</div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <fieldset>
              <legend>Gene Information</legend>
              <div className="form-row-inline">
                <div className="form-row">
                  <label>Gene Name</label>
                  <input type="text" value={geneName} disabled />
                </div>
                <div className="form-row">
                  <label>ORF Name</label>
                  <input type="text" value={orfName || 'Not specified'} disabled />
                </div>
                <div className="form-row">
                  <label>Species</label>
                  <input type="text" value={searchResult?.organism_name || organism} disabled />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend>Colleague Information</legend>
              {selectedColleague ? (
                <div className="selected-colleague">
                  <p><strong>{selectedColleague.full_name}</strong></p>
                  <p>{selectedColleague.institution}</p>
                  <p>{selectedColleague.email}</p>
                </div>
              ) : (
                <>
                  <div className="form-row-inline">
                    <div className="form-row">
                      <label htmlFor="last_name">Last Name *</label>
                      <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={newColleague.last_name}
                        onChange={handleNewColleagueChange}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="first_name">First Name *</label>
                      <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={newColleague.first_name}
                        onChange={handleNewColleagueChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row-inline">
                    <div className="form-row">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={newColleague.email}
                        onChange={handleNewColleagueChange}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <label htmlFor="institution">Organization *</label>
                      <input
                        type="text"
                        id="institution"
                        name="institution"
                        value={newColleague.institution}
                        onChange={handleNewColleagueChange}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
            </fieldset>

            <fieldset>
              <legend>Additional Information (Optional)</legend>
              <div className="form-row">
                <label htmlFor="description">Gene Description</label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Brief description of the gene function"
                />
              </div>
              <div className="form-row">
                <label htmlFor="reference">Publication Reference</label>
                <input
                  type="text"
                  id="reference"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g., PMID or citation"
                />
              </div>
              <div className="form-row">
                <label htmlFor="comments">Comments</label>
                <textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={2}
                  placeholder="Any additional comments for curators"
                />
              </div>
            </fieldset>

            <div className="form-buttons">
              <button type="button" className="back-btn" onClick={handleBack}>
                Back
              </button>
              <button type="submit" className="submit-btn" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Results page (step 2)
  if (step === 2 && searchResult) {
    const { validation, colleagues, can_proceed, wildcard_appended, search_term, organism_name } = searchResult;

    return (
      <div className="gene-registry-page">
        <div className="gene-registry-content">
          <h1>CGD Gene Registry Submission</h1>
          <hr />

          <div className="step-indicator">Step 2: Validation Results</div>

          {/* Validation messages */}
          {validation.errors.length > 0 && (
            <div className="validation-errors">
              <strong>Errors:</strong>
              <ul>
                {validation.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="validation-warnings">
              <strong>Warnings:</strong>
              <ul>
                {validation.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {!can_proceed && validation.errors.length > 0 && (
            <div className="cannot-proceed">
              <p>
                Cannot proceed with this gene name. Please correct the errors above or{' '}
                <Link to="/contact">contact CGD curators</Link> if you believe this is an error.
              </p>
              <button type="button" className="back-btn" onClick={handleBack}>
                Go Back
              </button>
            </div>
          )}

          {/* Colleague search results */}
          {can_proceed && (
            <>
              {wildcard_appended && (
                <p className="wildcard-note">
                  Search expanded from "<strong>{lastName}</strong>" to "<strong>{search_term}</strong>"
                </p>
              )}

              <div className="gene-summary">
                <p>
                  Registering gene name <strong>{geneName}</strong>
                  {orfName && <> for ORF <strong>{orfName}</strong></>}
                  {' '}in <em>{organism_name}</em>
                </p>
              </div>

              {colleagues.length === 0 ? (
                <div className="no-colleagues">
                  <p>
                    No colleagues found matching "{search_term}".
                    Click below to register as a new colleague.
                  </p>
                  <button type="button" className="primary-btn" onClick={handleNewColleague}>
                    Gene Registry and Add New Colleague
                  </button>
                </div>
              ) : (
                <>
                  <p className="select-instruction">
                    Please verify your name in the table below and click <strong>Select</strong> to proceed.
                  </p>

                  <table className="colleague-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Organization</th>
                        <th>Contact</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colleagues.map((coll) => (
                        <tr key={coll.colleague_no}>
                          <td>{coll.full_name}</td>
                          <td>{coll.institution || '-'}</td>
                          <td>
                            {coll.email && <div>{coll.email}</div>}
                            {coll.work_phone && <div>{coll.work_phone}</div>}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="select-btn"
                              onClick={() => handleSelectColleague(coll)}
                            >
                              Select
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <p className="new-colleague-note">
                    If your name is not in the table,{' '}
                    <button type="button" className="link-btn" onClick={handleNewColleague}>
                      click here to add new colleague
                    </button>
                  </p>
                </>
              )}

              <div className="form-buttons">
                <button type="button" className="back-btn" onClick={handleBack}>
                  Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Initial form (step 1)
  return (
    <div className="gene-registry-page">
      <div className="gene-registry-content">
        <h1>CGD Gene Registry Submission</h1>
        <hr />

        <div className="intro-section">
          <h2>To reserve a new, unpublished gene name:</h2>
          <ol>
            <li>
              If you have questions about whether your gene name is appropriate, please refer to the{' '}
              <a href="/Nomenclature.shtml" target="_blank" rel="noopener noreferrer">
                Gene Naming Guidelines
              </a>
            </li>
            <li>Enter the information below to get a Gene Registry Form</li>
          </ol>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSearch} className="search-form">
          <div className="form-row-inline">
            <div className="form-row">
              <label htmlFor="lastName">
                Your Last Name <span className="required">(required)</span>
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g., Smith"
                required
              />
            </div>
            <div className="form-row">
              <label htmlFor="geneName">
                Proposed Gene Name <span className="required">(required)</span>
              </label>
              <input
                type="text"
                id="geneName"
                value={geneName}
                onChange={(e) => setGeneName(e.target.value)}
                placeholder="e.g., ABC1"
                required
              />
            </div>
          </div>

          <div className="form-row-inline">
            <div className="form-row">
              <label htmlFor="orfName">
                ORF Name <span className="optional">(optional)</span>
              </label>
              <input
                type="text"
                id="orfName"
                value={orfName}
                onChange={(e) => setOrfName(e.target.value)}
                placeholder="e.g., orf19.1234"
              />
            </div>
            <div className="form-row">
              <label htmlFor="organism">
                Species <span className="required">(required)</span>
              </label>
              <select
                id="organism"
                value={organism}
                onChange={(e) => setOrganism(e.target.value)}
                required
              >
                <option value="">-- Select --</option>
                {config?.species?.map((sp) => (
                  <option key={sp.abbrev} value={sp.abbrev}>
                    {sp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="search-note">
            <strong>Note:</strong> The last name search is case insensitive and you may use the
            wildcard character (*) at any position.
          </p>

          <div className="form-buttons">
            <button type="submit" className="search-btn" disabled={searching}>
              {searching ? 'Searching...' : 'Search'}
            </button>
            <button type="reset" className="reset-btn" onClick={() => {
              setLastName('');
              setGeneName('');
              setOrfName('');
            }}>
              Reset
            </button>
          </div>
        </form>

        <div className="update-section">
          <h2>To update information about named genes or about names not in CGD:</h2>
          <p>
            To let us know about publication of a gene name not in CGD, or to update information
            about a named gene, please{' '}
            <Link to="/contact">send an email to CGD curators</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default GeneRegistryPage;
