import React from 'react';
import { Link } from 'react-router-dom';
import './HeaderNav.css';

const HeaderNav = () => {
  const menuItems = [
    {
      label: 'Home',
      to: '/',
      submenu: null
    },
    {
      label: 'Search',
      to: '/search',
      submenu: [
        { label: 'Advanced Feature Search', to: '/feature-search' },
        { label: 'Literature Search', to: '/literature/search' },
        { label: 'Text Search', to: '/search' },
        { label: 'Phenotype Search', to: '/phenotype/search' },
        { label: 'Colleague Search', to: '/colleague' },
        { label: 'External Resources', to: '/external-resources' }
      ]
    },
    {
      label: 'JBrowse',
      href: '/jbrowse/index.html',
      submenu: [
        { label: 'C. albicans', href: '/jbrowse/index.html?data=cgd_data%2FC_albicans_SC5314' },
        { label: 'C. auris', href: '/jbrowse/index.html?data=cgd_data%2FC_auris_B8441' },
        { label: 'C. dubliniensis', href: '/jbrowse/index.html?data=cgd_data%2FC_dubliniensis_CD36' },
        { label: 'C. glabrata', href: '/jbrowse/index.html?data=cgd_data%2FC_glabrata_CBS138' },
        { label: 'C. parapsilosis', href: '/jbrowse/index.html?data=cgd_data%2FC_parapsilosis_CDC317' }
      ]
    },
    {
      label: 'Sequence',
      to: '/seq-tools',
      submenu: [
        { label: 'BLAST', to: '/blast' },
        { label: 'Gene/Seq Resources', to: '/seq-tools' },
        { label: 'PatMatch', to: '/patmatch' },
        { label: 'C. albicans Genome Snapshot', to: '/genome-snapshot/C_albicans_SC5314' },
        { label: 'C. auris Genome Snapshot', to: '/genome-snapshot/C_auris_B8441' },
        { label: 'C. dubliniensis Genome Snapshot', to: '/genome-snapshot/C_dubliniensis_CD36' },
        { label: 'C. glabrata Genome Snapshot', to: '/genome-snapshot/C_glabrata_CBS138' },
        { label: 'C. parapsilosis Genome Snapshot', to: '/genome-snapshot/C_parapsilosis_CDC317' },
        { label: 'Genome Versions', to: '/genome-version-history' }
      ]
    },
    {
      label: 'GO',
      to: '/go-resources',
      submenu: [
        { label: 'What is GO?', href: 'https://geneontology.org/docs/ontology-documentation/', external: true },
        { label: 'Guide to Evidence Codes', href: 'https://geneontology.org/docs/guide-go-evidence-codes/', external: true },
        { label: 'GO Slim Mapper', to: '/go-slim-mapper' },
        { label: 'GO Term Finder', to: '/go-term-finder' },
        { label: 'GO Consortium', href: 'http://www.geneontology.org/', external: true },
        { label: 'GO File Downloads', to: '/download' }
      ]
    },
    {
      label: 'Tools',
      to: '/tools',
      submenu: [
        { label: 'PatMatch', to: '/patmatch' },
        { label: 'Primers', to: '/webprimer' },
        { label: 'Phenotype Search', to: '/phenotype/search' },
        { label: 'Restriction Mapper', to: '/restriction-mapper' },
        { label: 'Synteny Viewer', to: '/synteny-viewer' }
      ]
    },
    {
      label: 'Literature',
      to: '/literature',
      submenu: [
        { label: 'Literature Search', to: '/literature/search' },
        { label: 'Seminal Papers', to: '/seminal-papers' },
        { label: 'CGD Public Wiki', href: 'http://publicwiki.candidagenome.org', external: true },
        { label: 'Genome-Wide Analysis Papers', to: '/genome-wide-analysis-papers' },
        { label: 'Disease-Related Papers', to: '/disease-related-papers' }
      ]
    },
    {
      label: 'Download',
      to: '/download',
      submenu: [
        { label: 'Batch Download', to: '/batch-download' },
        { label: 'Sequence Downloads', to: '/download' },
        { label: 'Datasets', to: '/download' },
        { label: 'Chromosomal Features', to: '/download' },
        { label: 'GO Annotations', to: '/download' }
      ]
    },
    {
      label: 'Community',
      to: '/community',
      submenu: [
        { label: 'Update Colleague Listing', to: '/colleague-update' },
        { label: 'Search CGD Colleagues', to: '/colleague' },
        { label: 'Find Candida Labs', to: '/labs' },
        { label: 'Nomenclature Guide', to: '/nomenclature' },
        { label: 'Gene Registry', to: '/gene-registry' },
        { label: 'CGD Public Wiki', href: 'http://publicwiki.candidagenome.org', external: true }
      ]
    }
  ];

  const renderLink = (item, isSubmenu = false) => {
    if (item.href) {
      return (
        <a
          href={item.href}
          target={item.external ? '_blank' : undefined}
          rel={item.external ? 'noopener noreferrer' : undefined}
        >
          {isSubmenu && item.label.startsWith('C.') ? <em>{item.label}</em> : item.label}
        </a>
      );
    }
    return <Link to={item.to}>{item.label}</Link>;
  };

  return (
    <nav className="header-nav" aria-label="Main">
      {menuItems.map((item, index) => (
        <div key={index} className="nav-item">
          {renderLink(item)}
          {item.submenu && (
            <div className="nav-dropdown">
              {item.submenu.map((subItem, subIndex) => (
                <div key={subIndex} className="nav-dropdown-item">
                  {renderLink(subItem, true)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
};

export default HeaderNav;
