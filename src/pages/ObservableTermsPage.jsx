import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import phenotypeApi from '../api/phenotypeApi';
import './ObservableTermsPage.css';

function ObservableTermsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await phenotypeApi.getObservableTree();
        setData(result);
        // Expand root level by default
        const initialExpanded = {};
        if (result.tree) {
          result.tree.forEach((node, idx) => {
            initialExpanded[`root-${idx}`] = true;
          });
        }
        setExpandedNodes(initialExpanded);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load observable terms');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleNode = (nodeKey) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    const addAllNodes = (nodes, parentKey = 'root') => {
      nodes.forEach((node, idx) => {
        const nodeKey = `${parentKey}-${idx}`;
        if (node.children && node.children.length > 0) {
          allExpanded[nodeKey] = true;
          addAllNodes(node.children, nodeKey);
        }
      });
    };
    if (data?.tree) {
      addAllNodes(data.tree);
    }
    setExpandedNodes(allExpanded);
  };

  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Build search URL for an observable term
  const getSearchUrl = (term) => {
    return `/phenotype/search?observable=${encodeURIComponent(term)}`;
  };

  // Render a tree node and its children recursively
  const renderTreeNode = (node, nodeKey, depth = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes[nodeKey];

    return (
      <div key={nodeKey} className="tree-node" style={{ marginLeft: `${depth * 20}px` }}>
        <div className="node-content">
          {hasChildren ? (
            <button
              className="expand-btn"
              onClick={() => toggleNode(nodeKey)}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="leaf-spacer">•</span>
          )}

          <Link to={getSearchUrl(node.term)} className="term-link">
            {node.term}
          </Link>

          {node.count > 0 && (
            <span className="annotation-count">({node.count})</span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="children">
            {node.children.map((child, idx) =>
              renderTreeNode(child, `${nodeKey}-${idx}`, depth + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="observable-terms-page">
        <div className="loading-page">
          <div className="loading-spinner"></div>
          <p>Loading observable terms...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="observable-terms-page">
        <div className="error-page">
          <div className="error-icon">&#9888;</div>
          <h1>Failed to Load Observable Terms</h1>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <Link to="/" className="btn-home">Return to Home</Link>
            <Link to="/phenotype/search" className="btn-search">Phenotype Search</Link>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || !data.tree || data.tree.length === 0) {
    return (
      <div className="observable-terms-page">
        <div className="no-data-page">
          <p>No observable terms found.</p>
          <Link to="/phenotype/search">Go to Phenotype Search</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="observable-terms-page">
      <header className="page-header">
        <h1>Observable Terms</h1>
        <p className="subtitle">
          Hierarchical browser for phenotype observable terms
        </p>
      </header>

      <nav className="page-nav">
        <Link to="/phenotype/search">Phenotype Search</Link>
        {' | '}
        <Link to="/help/phenotype">Help</Link>
      </nav>

      <div className="divider" />

      <div className="section">
        <h2 className="section-header">Observable Terms Tree</h2>
        <div className="section-content">
          <div className="tree-intro">
            <p>
              Browse the hierarchical tree of observable terms used to describe phenotypes.
              Click on a term to search for all phenotype annotations with that observable.
              The number in parentheses indicates the count of annotations for each term.
            </p>
          </div>

          <div className="tree-controls">
            <button onClick={expandAll} className="control-btn">Expand All</button>
            <button onClick={collapseAll} className="control-btn">Collapse All</button>
          </div>

          <div className="tree-container">
            {data.tree.map((node, idx) =>
              renderTreeNode(node, `root-${idx}`, 0)
            )}
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="page-footer">
        <p>
          <strong>Note:</strong> Observable terms are organized in a hierarchical controlled
          vocabulary. Parent terms represent broader categories, while child terms represent
          more specific phenotypes.
        </p>
        <p>
          To search phenotypes with specific criteria, use the{' '}
          <Link to="/phenotype/search">Phenotype Search</Link> page.
        </p>
      </div>
    </div>
  );
}

export default ObservableTermsPage;
