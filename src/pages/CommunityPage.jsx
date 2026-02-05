import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const CommunityPage = () => {
  const communityResources = [
    {
      title: 'Search CGD Colleagues',
      url: '/colleague',
      description: 'Search CGD for colleague pages.'
    },
    {
      title: <><em>Candida</em> Laboratories</>,
      url: '/cache/Labs.html',
      description: (
        <>
          Links to PIs of laboratories that study <em>Candida</em>.
        </>
      )
    },
    {
      title: 'Colleague Submission/Update',
      url: '/colleague-update',
      description: 'Add or update your information in CGD.'
    },
    {
      title: 'Community News',
      url: '/community-news',
      description: (
        <>
          News and updates from the <em>Candida</em> Community.
        </>
      )
    },
    {
      title: 'Job Postings',
      url: '/job-postings',
      description: (
        <>
          Announcements of employment opportunities that are related to <em>Candida</em> biology.
        </>
      )
    },
    {
      title: 'Meetings and Courses',
      url: '/meetings',
      description: 'List of conferences, meetings, and courses.'
    },
    {
      title: 'Gene Nomenclature Guide',
      url: '/nomenclature',
      description: 'Guidelines to registering a gene name as agreed upon by the members of the research community.'
    },
    {
      title: 'External Resources',
      url: '/external-resources',
      description: 'External resources.'
    },
    {
      title: 'Gene Registry',
      url: '/gene-registry',
      description: 'Register a gene.'
    },
    {
      title: <>Highlighted Topics in <em>Candida</em> Biology</>,
      url: '/topic-biblios',
      description: (
        <>
          Curated reference lists covering a variety of topics relevant to <em>Candida</em> biology.
        </>
      )
    },
    {
      title: 'Laboratory Strains and Strain Lineage',
      url: '/strains',
      description: 'Brief reference to some of the more commonly used laboratory strains.'
    }
  ];

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Community Info</h1>
        <hr />

        <div className="info-section">
          {communityResources.map((resource, index) => (
            <div key={index} className="help-item">
              <h3>
                <Link to={resource.url}>{resource.title}</Link>
              </h3>
              <p>{resource.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
