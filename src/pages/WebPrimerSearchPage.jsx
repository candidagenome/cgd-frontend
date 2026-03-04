import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import webprimerApi from '../api/webprimerApi';
import './WebPrimerSearchPage.css';

function WebPrimerSearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(false);
  const [fetchingSequence, setFetchingSequence] = useState(false);
  const [error, setError] = useState(null);

  // Input mode
  const [inputMode, setInputMode] = useState('sequence'); // 'sequence' or 'locus'
  const [locus, setLocus] = useState('');
  const [sequence, setSequence] = useState('');
  const [sequenceForLocus, setSequenceForLocus] = useState(''); // Track which locus the sequence is for

  // Purpose
  const [purpose, setPurpose] = useState('PCR');

  // Parameters
  const [params, setParams] = useState({
    bp_from_start: 35,
    bp_from_stop: 35,
    specific_ends: false,
    parsed_length: 35,
    seq_strand_count: 'ONE',
    seq_strand: 'CODING',
    seq_spacing: 250,
    opt_tm: 55,
    min_tm: 50,
    max_tm: 65,
    opt_length: 20,
    min_length: 18,
    max_length: 21,
    opt_gc: 45,
    min_gc: 30,
    max_gc: 60,
    max_self_anneal: 24,
    max_self_end_anneal: 12,
    max_pair_anneal: 24,
    max_pair_end_anneal: 12,
  });

  // Load sequence from URL params
  useEffect(() => {
    const seqParam = searchParams.get('sequence');
    const locusParam = searchParams.get('locus') || searchParams.get('name');

    if (seqParam) {
      setSequence(seqParam);
      setInputMode('sequence');
    } else if (locusParam) {
      setLocus(locusParam);
      setInputMode('locus');
      fetchSequenceForLocus(locusParam);
    }
  }, [searchParams]);

  const fetchSequenceForLocus = async (locusName) => {
    setFetchingSequence(true);
    setError(null);

    try {
      const data = await webprimerApi.getSequence(locusName);
      if (data.success) {
        setSequence(data.sequence);
        setSequenceForLocus(locusName); // Track which locus this sequence is for
      } else {
        setError(data.error || 'Failed to fetch sequence');
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch sequence');
    } finally {
      setFetchingSequence(false);
    }
  };

  const handleParamChange = (name, value) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Fetch sequence if using locus mode and sequence is empty or for a different locus
      let seq = sequence;
      if (inputMode === 'locus' && locus && (!seq || sequenceForLocus !== locus)) {
        const data = await webprimerApi.getSequence(locus);
        if (data.success) {
          seq = data.sequence;
          setSequence(data.sequence);
          setSequenceForLocus(locus);
        } else {
          throw new Error(data.error || 'Failed to fetch sequence');
        }
      }

      if (!seq || seq.trim().length < 20) {
        throw new Error('Please enter a DNA sequence (minimum 20 bp)');
      }

      // Design primers
      const request = {
        sequence: seq,
        purpose: purpose,
        ...params,
      };

      const result = await webprimerApi.design(request);

      // Store results and navigate
      sessionStorage.setItem('webprimerResults', JSON.stringify(result));
      sessionStorage.setItem('webprimerParams', JSON.stringify({
        locus: locus,
        purpose: purpose,
        ...params,
      }));
      navigate('/webprimer/results');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Primer design failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="webprimer-search-page">
      <div className="webprimer-search-content">
        <h1>Web Primer: DNA Primer Design</h1>
        <hr />

        <p className="page-description">
          Design primers for PCR amplification or DNA sequencing.
          Enter a DNA sequence or fetch by gene name.
        </p>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Section 1: DNA Source */}
          <div className="form-section">
            <h3>
              <span className="section-number">1</span>
              DNA Source
            </h3>

            <div className="input-mode-tabs">
              <button
                type="button"
                className={`mode-tab ${inputMode === 'sequence' ? 'active' : ''}`}
                onClick={() => setInputMode('sequence')}
              >
                Paste Sequence
              </button>
              <button
                type="button"
                className={`mode-tab ${inputMode === 'locus' ? 'active' : ''}`}
                onClick={() => setInputMode('locus')}
              >
                Gene/ORF Name
              </button>
            </div>

            {inputMode === 'locus' && (
              <div className="locus-input">
                <label>Gene/ORF Name:</label>
                <div className="locus-row">
                  <input
                    type="text"
                    value={locus}
                    onChange={(e) => {
                      setLocus(e.target.value);
                      // Clear sequence if locus changes to prevent stale data
                      if (e.target.value !== sequenceForLocus) {
                        setSequence('');
                        setSequenceForLocus('');
                      }
                    }}
                    placeholder="e.g., ACT1, C1_01070W_A"
                  />
                  <button
                    type="button"
                    onClick={() => fetchSequenceForLocus(locus)}
                    disabled={!locus || fetchingSequence}
                  >
                    {fetchingSequence ? 'Fetching...' : 'Fetch Sequence'}
                  </button>
                </div>
              </div>
            )}

            <div className="sequence-input">
              <label>DNA Sequence:</label>
              <textarea
                value={sequence}
                onChange={(e) => setSequence(e.target.value)}
                placeholder="Enter DNA sequence (A, T, G, C only)..."
                rows={6}
              />
              <div className="sequence-info">
                {sequence && (
                  <span>Length: {sequence.replace(/[^ATGCatgc]/g, '').length} bp</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Purpose */}
          <div className="form-section">
            <h3>
              <span className="section-number">2</span>
              Purpose
            </h3>

            <div className="purpose-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="purpose"
                  value="PCR"
                  checked={purpose === 'PCR'}
                  onChange={(e) => setPurpose(e.target.value)}
                />
                <span>PCR</span>
                <span className="purpose-desc">Design forward and reverse primer pairs</span>
              </label>

              <label className="radio-label">
                <input
                  type="radio"
                  name="purpose"
                  value="SEQUENCING"
                  checked={purpose === 'SEQUENCING'}
                  onChange={(e) => setPurpose(e.target.value)}
                />
                <span>Sequencing</span>
                <span className="purpose-desc">Design primers for DNA sequencing</span>
              </label>
            </div>
          </div>

          {/* Section 3: Location Parameters */}
          <div className="form-section">
            <h3>
              <span className="section-number">3</span>
              Location Parameters
            </h3>

            <div className="param-row">
              <label>
                Search length (bp):
                <input
                  type="number"
                  value={params.parsed_length}
                  onChange={(e) => handleParamChange('parsed_length', parseInt(e.target.value))}
                  min={10}
                  max={100}
                />
              </label>
            </div>

            {purpose === 'PCR' && (
              <div className="param-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={params.specific_ends}
                    onChange={(e) => handleParamChange('specific_ends', e.target.checked)}
                  />
                  Use exact sequence endpoints
                </label>
              </div>
            )}

            {purpose === 'SEQUENCING' && (
              <>
                <div className="param-row">
                  <label>
                    Strand(s):
                    <select
                      value={params.seq_strand_count}
                      onChange={(e) => handleParamChange('seq_strand_count', e.target.value)}
                    >
                      <option value="ONE">One strand</option>
                      <option value="BOTH">Both strands</option>
                    </select>
                  </label>

                  {params.seq_strand_count === 'ONE' && (
                    <label>
                      Which strand:
                      <select
                        value={params.seq_strand}
                        onChange={(e) => handleParamChange('seq_strand', e.target.value)}
                      >
                        <option value="CODING">Coding</option>
                        <option value="NON-CODING">Non-coding</option>
                      </select>
                    </label>
                  )}
                </div>

                <div className="param-row">
                  <label>
                    Primer spacing (bp):
                    <input
                      type="number"
                      value={params.seq_spacing}
                      onChange={(e) => handleParamChange('seq_spacing', parseInt(e.target.value))}
                      min={50}
                      max={1000}
                    />
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Section 4: Melting Temperature */}
          {purpose === 'PCR' && (
            <div className="form-section">
              <h3>
                <span className="section-number">4</span>
                Melting Temperature (Tm)
              </h3>

              <div className="param-row triple">
                <label>
                  Optimum:
                  <input
                    type="number"
                    value={params.opt_tm}
                    onChange={(e) => handleParamChange('opt_tm', parseFloat(e.target.value))}
                    min={40}
                    max={80}
                  />
                </label>
                <label>
                  Minimum:
                  <input
                    type="number"
                    value={params.min_tm}
                    onChange={(e) => handleParamChange('min_tm', parseFloat(e.target.value))}
                    min={40}
                    max={80}
                  />
                </label>
                <label>
                  Maximum:
                  <input
                    type="number"
                    value={params.max_tm}
                    onChange={(e) => handleParamChange('max_tm', parseFloat(e.target.value))}
                    min={40}
                    max={80}
                  />
                </label>
              </div>
            </div>
          )}

          {/* Section 5: Primer Length */}
          <div className="form-section">
            <h3>
              <span className="section-number">{purpose === 'PCR' ? '5' : '4'}</span>
              Primer Length
            </h3>

            <div className="param-row triple">
              <label>
                Optimum:
                <input
                  type="number"
                  value={params.opt_length}
                  onChange={(e) => handleParamChange('opt_length', parseInt(e.target.value))}
                  min={15}
                  max={35}
                />
              </label>
              <label>
                Minimum:
                <input
                  type="number"
                  value={params.min_length}
                  onChange={(e) => handleParamChange('min_length', parseInt(e.target.value))}
                  min={10}
                  max={35}
                />
              </label>
              <label>
                Maximum:
                <input
                  type="number"
                  value={params.max_length}
                  onChange={(e) => handleParamChange('max_length', parseInt(e.target.value))}
                  min={15}
                  max={35}
                />
              </label>
            </div>
          </div>

          {/* Section 6: GC Content */}
          <div className="form-section">
            <h3>
              <span className="section-number">{purpose === 'PCR' ? '6' : '5'}</span>
              GC Content (%)
            </h3>

            <div className="param-row triple">
              <label>
                Optimum:
                <input
                  type="number"
                  value={params.opt_gc}
                  onChange={(e) => handleParamChange('opt_gc', parseFloat(e.target.value))}
                  min={20}
                  max={80}
                />
              </label>
              <label>
                Minimum:
                <input
                  type="number"
                  value={params.min_gc}
                  onChange={(e) => handleParamChange('min_gc', parseFloat(e.target.value))}
                  min={20}
                  max={80}
                />
              </label>
              <label>
                Maximum:
                <input
                  type="number"
                  value={params.max_gc}
                  onChange={(e) => handleParamChange('max_gc', parseFloat(e.target.value))}
                  min={20}
                  max={80}
                />
              </label>
            </div>
          </div>

          {/* Section 7: Annealing Parameters */}
          <div className="form-section">
            <h3>
              <span className="section-number">{purpose === 'PCR' ? '7' : '6'}</span>
              Primer Annealing
            </h3>

            <div className="param-row">
              <label>
                Max self-anneal:
                <input
                  type="number"
                  value={params.max_self_anneal}
                  onChange={(e) => handleParamChange('max_self_anneal', parseInt(e.target.value))}
                  min={0}
                  max={50}
                />
              </label>
              <label>
                Max self end-anneal:
                <input
                  type="number"
                  value={params.max_self_end_anneal}
                  onChange={(e) => handleParamChange('max_self_end_anneal', parseInt(e.target.value))}
                  min={0}
                  max={50}
                />
              </label>
            </div>

            {purpose === 'PCR' && (
              <div className="param-row">
                <label>
                  Max pair-anneal:
                  <input
                    type="number"
                    value={params.max_pair_anneal}
                    onChange={(e) => handleParamChange('max_pair_anneal', parseInt(e.target.value))}
                    min={0}
                    max={50}
                  />
                </label>
                <label>
                  Max pair end-anneal:
                  <input
                    type="number"
                    value={params.max_pair_end_anneal}
                    onChange={(e) => handleParamChange('max_pair_end_anneal', parseInt(e.target.value))}
                    min={0}
                    max={50}
                  />
                </label>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Designing Primers...' : 'Design Primers'}
            </button>
            <button type="reset" className="reset-btn">
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WebPrimerSearchPage;
