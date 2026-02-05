import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import colleagueApi from '../api/colleagueApi';
import './ColleagueDetailPage.css';

function ColleagueDetailPage() {
  const { colleagueNo } = useParams();

  const [colleague, setColleague] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchColleague = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await colleagueApi.getDetail(colleagueNo);
        if (data.success) {
          setColleague(data.colleague);
        } else {
          setError(data.error || 'Failed to load colleague details');
        }
      } catch (err) {
        console.error('Detail error:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load details');
      } finally {
        setLoading(false);
      }
    };

    if (colleagueNo) {
      fetchColleague();
    }
  }, [colleagueNo]);

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="colleague-detail-page">
        <div className="colleague-detail-content">
          <h1>CGD Colleagues</h1>
          <hr />
          <div className="loading-state">
            <span className="loading-spinner"></span>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="colleague-detail-page">
        <div className="colleague-detail-content">
          <h1>CGD Colleagues</h1>
          <hr />
          <div className="error-state">
            <strong>Error:</strong> {error}
          </div>
          <div className="back-link">
            <Link to="/colleague">&larr; Back to Search</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!colleague) {
    return null;
  }

  return (
    <div className="colleague-detail-page">
      <div className="colleague-detail-content">
        <h1>CGD Colleagues</h1>
        <hr />

        {/* Name Header */}
        <div className="colleague-name">
          <h2>{colleague.full_name}</h2>
        </div>

        {/* Action Links */}
        <div className="action-bar">
          {colleague.email && (
            <a href={`mailto:${colleague.email}`} className="action-link">
              Send E-mail
            </a>
          )}
          <a
            href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(colleague.last_name + ' ' + colleague.first_name.charAt(0))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="action-link"
          >
            Search PubMed
          </a>
        </div>

        <div className="detail-layout">
          {/* Main Info */}
          <div className="main-info">
            <table className="info-table">
              <tbody>
                {colleague.other_last_name && (
                  <tr>
                    <th>Other Last Name</th>
                    <td>{colleague.other_last_name}</td>
                  </tr>
                )}
                {colleague.email && (
                  <tr>
                    <th>E-mail Address</th>
                    <td>
                      <a href={`mailto:${colleague.email}`}>{colleague.email}</a>
                    </td>
                  </tr>
                )}
                {colleague.job_title && (
                  <tr>
                    <th>Position</th>
                    <td>{colleague.job_title}</td>
                  </tr>
                )}
                {colleague.profession && (
                  <tr>
                    <th>Profession</th>
                    <td>{colleague.profession}</td>
                  </tr>
                )}
                {colleague.institution && (
                  <tr>
                    <th>Organization</th>
                    <td>{colleague.institution}</td>
                  </tr>
                )}
                {colleague.address && (
                  <tr>
                    <th>Address</th>
                    <td className="address-cell">
                      {colleague.address.split('\n').map((line, idx) => (
                        <div key={idx}>{line}</div>
                      ))}
                    </td>
                  </tr>
                )}
                {colleague.work_phone && (
                  <tr>
                    <th>Work phone</th>
                    <td>{colleague.work_phone}</td>
                  </tr>
                )}
                {colleague.other_phone && (
                  <tr>
                    <th>Other phone</th>
                    <td>{colleague.other_phone}</td>
                  </tr>
                )}
                {colleague.fax && (
                  <tr>
                    <th>Fax</th>
                    <td>{colleague.fax}</td>
                  </tr>
                )}
                {colleague.urls?.length > 0 && (
                  <tr>
                    <th>Web Page(s)</th>
                    <td>
                      {colleague.urls.map((url, idx) => (
                        <div key={idx}>
                          <a href={url.url} target="_blank" rel="noopener noreferrer">
                            {url.url_type || url.url}
                          </a>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
                {colleague.lab_heads?.length > 0 && (
                  <tr>
                    <th>Head of Lab</th>
                    <td>
                      {colleague.lab_heads.map((pi, idx) => (
                        <div key={idx}>
                          <Link to={`/colleague/${pi.colleague_no}`}>
                            {pi.full_name}
                          </Link>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
                {colleague.lab_members?.length > 0 && (
                  <tr>
                    <th>Members of my Lab</th>
                    <td>
                      {colleague.lab_members.map((member, idx) => (
                        <div key={idx}>
                          <Link to={`/colleague/${member.colleague_no}`}>
                            {member.full_name}
                          </Link>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
                {colleague.associates?.length > 0 && (
                  <tr>
                    <th>Associates/Collaborators</th>
                    <td>
                      {colleague.associates.map((assoc, idx) => (
                        <div key={idx}>
                          <Link to={`/colleague/${assoc.colleague_no}`}>
                            {assoc.full_name}
                          </Link>
                        </div>
                      ))}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Side Info */}
          {(colleague.associated_genes?.length > 0 ||
            colleague.public_comments ||
            colleague.keywords) && (
            <div className="side-info">
              {colleague.associated_genes?.length > 0 && (
                <div className="side-section">
                  <h4>Associated Gene Names</h4>
                  <div className="side-content">
                    {colleague.associated_genes.map((gene, idx) => (
                      <div key={idx}>
                        <Link to={`/locus/${gene.feature_name}`}>
                          {gene.gene_name || gene.feature_name}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {colleague.public_comments && (
                <div className="side-section">
                  <h4>Public Comments</h4>
                  <div className="side-content">{colleague.public_comments}</div>
                </div>
              )}
              {colleague.keywords && (
                <div className="side-section">
                  <h4>Keywords</h4>
                  <div className="side-content">{colleague.keywords}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Research Topics */}
        {colleague.research_topics && (
          <div className="research-section">
            <h4>Research Topics</h4>
            <p>{colleague.research_topics}</p>
          </div>
        )}

        {/* Research Interests */}
        {colleague.research_interests && (
          <div className="research-section">
            <h4>Research Interests</h4>
            <p>{colleague.research_interests}</p>
          </div>
        )}

        {/* Last Update */}
        {colleague.date_modified && (
          <div className="last-update">
            <strong>Last update:</strong> {formatDate(colleague.date_modified)}
          </div>
        )}

        {/* Navigation */}
        <div className="nav-links">
          <Link to="/colleague">&larr; New Colleague Search</Link>
        </div>
      </div>
    </div>
  );
}

export default ColleagueDetailPage;
