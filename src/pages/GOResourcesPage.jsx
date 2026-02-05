import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const GOResourcesPage = () => {
  const resources = [
    {
      title: 'What is GO?',
      url: 'http://www.yeastgenome.org/help/GO.html',
      external: true,
      description: (
        <>
          Help page that explains the philosophy of GO, provided by <em>Saccharomyces</em> Genome Database (SGD)
        </>
      )
    },
    {
      title: 'GO Slim Mapper',
      url: '/go-slim-mapper',
      external: false,
      description: (
        <>
          This tool determines to which GO-slim terms a set of <em>Candida</em> genes is annotated.
        </>
      )
    },
    {
      title: 'GO Term Finder',
      url: '/go-term-finder',
      external: false,
      description: (
        <>
          This tool determines the significant GO terms that a set of <em>Candida</em> genes shares in common
        </>
      )
    },
    {
      title: 'GO Consortium',
      url: 'http://www.geneontology.org/',
      external: true,
      description: (
        <>
          The home page of the Gene Ontology Consortium, with information on other consortium members.
          For a list of additional Gene Ontology Tools please visit the{' '}
          <a href="http://www.geneontology.org/GO.tools.shtml" target="_blank" rel="noopener noreferrer">
            GO Tools page
          </a>.
        </>
      )
    },
    {
      title: 'CGD GO File Downloads',
      url: '/download/go/',
      external: false,
      description: 'Files containing GO curation and other GO-related information are available for download from CGD.'
    },
    {
      title: 'GO Tutorial',
      url: 'http://www.yeastgenome.org/help/gotutorial.html',
      external: true,
      description: 'SGD tutorial that highlights pages and tools that use GO annotations to familiarize users with the Gene Ontology (GO)'
    }
  ];

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>GO Resources</h1>
        <hr />

        <div className="info-section">
          {resources.map((resource, index) => (
            <div key={index} className="help-item">
              <h3>
                {resource.external ? (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer">
                    {resource.title}
                  </a>
                ) : (
                  <Link to={resource.url}>{resource.title}</Link>
                )}
              </h3>
              <p>{resource.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GOResourcesPage;
