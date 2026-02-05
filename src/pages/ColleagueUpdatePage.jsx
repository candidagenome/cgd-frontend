import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import colleagueApi from '../api/colleagueApi';
import './ColleagueUpdatePage.css';

function ColleagueUpdatePage() {
  const { colleagueNo } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const isUpdate = !!colleagueNo;

  // Form config
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form step
  const [step, setStep] = useState(1); // 1: form, 2: confirm

  // Form data
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    other_last_name: '',
    suffix: '',
    email: '',
    profession: '',
    job_title: '',
    institution: '',
    address1: '',
    address2: '',
    address3: '',
    city: '',
    state: '',
    region: '',
    country: '',
    postal_code: '',
    work_phone: '',
    other_phone: '',
    fax: '',
    urls: [{ url: '', url_type: '' }],
    research_interests: '',
    keywords: '',
    associated_genes: '',
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState([]);

  // Load form config and existing data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Load form config
        const configData = await colleagueApi.getFormConfig();
        setConfig(configData);

        // If updating, load existing colleague data
        if (isUpdate) {
          const detailData = await colleagueApi.getDetail(colleagueNo);
          if (detailData.success && detailData.colleague) {
            const coll = detailData.colleague;
            setFormData({
              last_name: coll.last_name || '',
              first_name: coll.first_name || '',
              other_last_name: coll.other_last_name || '',
              suffix: coll.suffix || '',
              email: coll.email || '',
              profession: coll.profession || '',
              job_title: coll.job_title || '',
              institution: coll.institution || '',
              address1: coll.address?.split('\n')[0] || '',
              address2: coll.address?.split('\n')[1] || '',
              address3: coll.address?.split('\n')[2] || '',
              city: coll.city || '',
              state: coll.state || '',
              region: '',
              country: coll.country || '',
              postal_code: coll.postal_code || '',
              work_phone: coll.work_phone || '',
              other_phone: coll.other_phone || '',
              fax: coll.fax || '',
              urls: coll.urls?.length > 0
                ? coll.urls.map(u => ({ url: u.url, url_type: u.url_type || '' }))
                : [{ url: '', url_type: '' }],
              research_interests: coll.research_interests || '',
              keywords: coll.keywords || '',
              associated_genes: coll.associated_genes?.map(g => g.gene_name || g.feature_name).join(', ') || '',
            });
          } else {
            setError(detailData.error || 'Failed to load colleague data');
          }
        }
      } catch (err) {
        console.error('Load error:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [colleagueNo, isUpdate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUrlChange = (index, field, value) => {
    setFormData(prev => {
      const urls = [...prev.urls];
      urls[index] = { ...urls[index], [field]: value };
      return { ...prev, urls };
    });
  };

  const addUrl = () => {
    setFormData(prev => ({
      ...prev,
      urls: [...prev.urls, { url: '', url_type: '' }],
    }));
  };

  const removeUrl = (index) => {
    setFormData(prev => ({
      ...prev,
      urls: prev.urls.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const errors = [];

    if (!formData.last_name.trim()) {
      errors.push('Last name is required');
    }
    if (!formData.first_name.trim()) {
      errors.push('First name is required');
    }
    if (!formData.email.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push('Invalid email format');
    }
    if (!formData.institution.trim()) {
      errors.push('Organization is required');
    }

    // Country/State validation
    if (formData.country === 'USA' && !formData.state) {
      errors.push('Please select a US state');
    }
    if (formData.country === 'Canada' && !formData.state) {
      errors.push('Please select a Canadian province');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleEdit = () => {
    setStep(1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Prepare data
      const submitData = {
        ...formData,
        urls: formData.urls.filter(u => u.url.trim()),
        associated_genes: formData.associated_genes
          ? formData.associated_genes.split(',').map(g => g.trim()).filter(g => g)
          : [],
      };

      const result = await colleagueApi.submit(
        isUpdate ? parseInt(colleagueNo) : null,
        submitData
      );

      if (result.success) {
        setSuccess(result.message);
        setStep(3);
      } else {
        setValidationErrors(result.errors || ['Submission failed']);
        setStep(1);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.detail || err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="colleague-update-page">
        <div className="colleague-update-content">
          <h1>CGD Colleague {isUpdate ? 'Update' : 'Registration'}</h1>
          <hr />
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="colleague-update-page">
        <div className="colleague-update-content">
          <h1>CGD Colleague {isUpdate ? 'Update' : 'Registration'}</h1>
          <hr />
          <div className="error-state">
            <strong>Error:</strong> {error}
          </div>
          <Link to="/colleague">&larr; Back to Search</Link>
        </div>
      </div>
    );
  }

  // Success page
  if (step === 3) {
    return (
      <div className="colleague-update-page">
        <div className="colleague-update-content">
          <h1>CGD Colleague {isUpdate ? 'Update' : 'Registration'}</h1>
          <hr />
          <div className="success-message">
            <h2>Thank You!</h2>
            <p>{success}</p>
          </div>
          <div className="nav-links">
            <Link to="/colleague">Return to Colleague Search</Link>
          </div>
        </div>
      </div>
    );
  }

  // Confirmation page
  if (step === 2) {
    return (
      <div className="colleague-update-page">
        <div className="colleague-update-content">
          <h1>Confirm Your Information</h1>
          <hr />

          <p className="confirm-instructions">
            Please review your information below. Click <strong>Edit</strong> to make changes,
            or <strong>Submit</strong> to send your information.
          </p>

          <div className="confirm-section">
            <h3>Personal Information</h3>
            <table className="confirm-table">
              <tbody>
                <tr><th>Name:</th><td>{formData.first_name} {formData.last_name}{formData.suffix && ` ${formData.suffix}`}</td></tr>
                {formData.other_last_name && <tr><th>Other Last Name:</th><td>{formData.other_last_name}</td></tr>}
                <tr><th>Email:</th><td>{formData.email}</td></tr>
                {formData.profession && <tr><th>Profession:</th><td>{formData.profession}</td></tr>}
                {formData.job_title && <tr><th>Position:</th><td>{formData.job_title}</td></tr>}
              </tbody>
            </table>
          </div>

          <div className="confirm-section">
            <h3>Organization & Address</h3>
            <table className="confirm-table">
              <tbody>
                <tr><th>Organization:</th><td>{formData.institution}</td></tr>
                {(formData.address1 || formData.city || formData.country) && (
                  <tr>
                    <th>Address:</th>
                    <td>
                      {formData.address1 && <div>{formData.address1}</div>}
                      {formData.address2 && <div>{formData.address2}</div>}
                      {formData.address3 && <div>{formData.address3}</div>}
                      {formData.city && <div>{formData.city}{formData.state && `, ${formData.state}`} {formData.postal_code}</div>}
                      {formData.country && <div>{formData.country}</div>}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="confirm-section">
            <h3>Contact Information</h3>
            <table className="confirm-table">
              <tbody>
                {formData.work_phone && <tr><th>Work Phone:</th><td>{formData.work_phone}</td></tr>}
                {formData.other_phone && <tr><th>Other Phone:</th><td>{formData.other_phone}</td></tr>}
                {formData.fax && <tr><th>Fax:</th><td>{formData.fax}</td></tr>}
                {formData.urls.filter(u => u.url).map((url, idx) => (
                  <tr key={idx}><th>URL:</th><td><a href={url.url} target="_blank" rel="noopener noreferrer">{url.url_type || url.url}</a></td></tr>
                ))}
              </tbody>
            </table>
          </div>

          {(formData.research_interests || formData.keywords || formData.associated_genes) && (
            <div className="confirm-section">
              <h3>Research Information</h3>
              <table className="confirm-table">
                <tbody>
                  {formData.research_interests && <tr><th>Research Interests:</th><td>{formData.research_interests}</td></tr>}
                  {formData.keywords && <tr><th>Keywords:</th><td>{formData.keywords}</td></tr>}
                  {formData.associated_genes && <tr><th>Associated Genes:</th><td>{formData.associated_genes}</td></tr>}
                </tbody>
              </table>
            </div>
          )}

          <div className="confirm-buttons">
            <button type="button" className="edit-btn" onClick={handleEdit}>
              Edit
            </button>
            <button
              type="button"
              className="submit-btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Entry form
  return (
    <div className="colleague-update-page">
      <div className="colleague-update-content">
        <h1>CGD Colleague {isUpdate ? 'Update' : 'Registration'}</h1>
        <hr />

        <p className="form-instructions">
          {isUpdate
            ? 'Update your colleague information below. Fields marked with * are required.'
            : 'Enter your information below to register as a CGD colleague. Fields marked with * are required.'}
        </p>

        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <strong>Please correct the following errors:</strong>
            <ul>
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleContinue}>
          {/* Personal Information */}
          <fieldset>
            <legend>Personal Information</legend>

            <div className="form-row">
              <label htmlFor="last_name">Last Name *</label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                maxLength={40}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="first_name">First Name *</label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                maxLength={40}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="other_last_name">Other Last Name</label>
              <input
                type="text"
                id="other_last_name"
                name="other_last_name"
                value={formData.other_last_name}
                onChange={handleInputChange}
                maxLength={40}
                placeholder="e.g., maiden name"
              />
            </div>

            <div className="form-row">
              <label htmlFor="suffix">Suffix</label>
              <select
                id="suffix"
                name="suffix"
                value={formData.suffix}
                onChange={handleInputChange}
              >
                <option value="">-- Select --</option>
                <option value="Jr.">Jr.</option>
                <option value="Sr.">Sr.</option>
                <option value="II">II</option>
                <option value="III">III</option>
                <option value="IV">IV</option>
                <option value="Ph.D.">Ph.D.</option>
                <option value="M.D.">M.D.</option>
              </select>
            </div>

            <div className="form-row">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                maxLength={100}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="profession">Profession</label>
              <input
                type="text"
                id="profession"
                name="profession"
                value={formData.profession}
                onChange={handleInputChange}
                maxLength={100}
                placeholder="e.g., yeast molecular biologist"
              />
            </div>

            <div className="form-row">
              <label htmlFor="job_title">Position</label>
              <input
                type="text"
                id="job_title"
                name="job_title"
                value={formData.job_title}
                onChange={handleInputChange}
                maxLength={100}
                placeholder="e.g., Principal Investigator, Post-doc"
              />
            </div>
          </fieldset>

          {/* Organization & Address */}
          <fieldset>
            <legend>Organization & Address</legend>

            <div className="form-row">
              <label htmlFor="institution">Organization *</label>
              <input
                type="text"
                id="institution"
                name="institution"
                value={formData.institution}
                onChange={handleInputChange}
                maxLength={100}
                required
              />
            </div>

            <div className="form-row">
              <label htmlFor="address1">Address Line 1</label>
              <input
                type="text"
                id="address1"
                name="address1"
                value={formData.address1}
                onChange={handleInputChange}
                maxLength={60}
              />
            </div>

            <div className="form-row">
              <label htmlFor="address2">Address Line 2</label>
              <input
                type="text"
                id="address2"
                name="address2"
                value={formData.address2}
                onChange={handleInputChange}
                maxLength={60}
              />
            </div>

            <div className="form-row">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                maxLength={100}
              />
            </div>

            <div className="form-row">
              <label htmlFor="country">Country</label>
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
              >
                <option value="">-- Select --</option>
                {config?.countries?.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {formData.country === 'USA' && (
              <div className="form-row">
                <label htmlFor="state">State *</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select --</option>
                  {config?.us_states?.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.country === 'Canada' && (
              <div className="form-row">
                <label htmlFor="state">Province *</label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select --</option>
                  {config?.canadian_provinces?.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            )}

            {formData.country && formData.country !== 'USA' && formData.country !== 'Canada' && (
              <div className="form-row">
                <label htmlFor="region">Region/Province</label>
                <input
                  type="text"
                  id="region"
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  maxLength={40}
                />
              </div>
            )}

            <div className="form-row">
              <label htmlFor="postal_code">Postal Code</label>
              <input
                type="text"
                id="postal_code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleInputChange}
                maxLength={40}
              />
            </div>
          </fieldset>

          {/* Contact Information */}
          <fieldset>
            <legend>Contact Information</legend>

            <div className="form-row">
              <label htmlFor="work_phone">Work Phone</label>
              <input
                type="text"
                id="work_phone"
                name="work_phone"
                value={formData.work_phone}
                onChange={handleInputChange}
                maxLength={40}
              />
            </div>

            <div className="form-row">
              <label htmlFor="other_phone">Other Phone</label>
              <input
                type="text"
                id="other_phone"
                name="other_phone"
                value={formData.other_phone}
                onChange={handleInputChange}
                maxLength={40}
              />
            </div>

            <div className="form-row">
              <label htmlFor="fax">Fax</label>
              <input
                type="text"
                id="fax"
                name="fax"
                value={formData.fax}
                onChange={handleInputChange}
                maxLength={40}
              />
            </div>

            <div className="url-section">
              <label>Web Pages</label>
              {formData.urls.map((url, idx) => (
                <div key={idx} className="url-row">
                  <input
                    type="url"
                    placeholder="URL"
                    value={url.url}
                    onChange={(e) => handleUrlChange(idx, 'url', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={url.url_type}
                    onChange={(e) => handleUrlChange(idx, 'url_type', e.target.value)}
                  />
                  {formData.urls.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => removeUrl(idx)}>
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="add-btn" onClick={addUrl}>
                + Add URL
              </button>
            </div>
          </fieldset>

          {/* Research Information */}
          <fieldset>
            <legend>Research Information</legend>

            <div className="form-row">
              <label htmlFor="research_interests">Research Interests</label>
              <textarea
                id="research_interests"
                name="research_interests"
                value={formData.research_interests}
                onChange={handleInputChange}
                rows={4}
                maxLength={1500}
              />
            </div>

            <div className="form-row">
              <label htmlFor="keywords">Keywords</label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="comma-separated keywords"
              />
            </div>

            <div className="form-row">
              <label htmlFor="associated_genes">Associated Genes</label>
              <input
                type="text"
                id="associated_genes"
                name="associated_genes"
                value={formData.associated_genes}
                onChange={handleInputChange}
                placeholder="comma-separated gene names"
              />
            </div>
          </fieldset>

          <div className="form-buttons">
            <button type="submit" className="continue-btn">
              Continue
            </button>
            <button
              type="button"
              className="reset-btn"
              onClick={() => window.location.reload()}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="nav-links">
          <Link to="/colleague">&larr; Back to Colleague Search</Link>
        </div>
      </div>
    </div>
  );
}

export default ColleagueUpdatePage;
