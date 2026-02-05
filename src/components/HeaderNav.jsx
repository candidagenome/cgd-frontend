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
        { label: 'BLAST', to: '/blast' },
        { label: 'GO Term Finder', to: '/go-term-finder' },
        { label: 'GO Slim Mapper', to: '/go-slim-mapper' },
        { label: 'Text Search', to: '/search' },
        { label: 'Primers', to: '/webprimer' },
        { label: 'PatMatch', to: '/patmatch' },
        { label: 'Advanced Search', to: '/feature-search' }
      ]
    },
    {
      label: 'JBrowse',
      href: 'http://www.candidagenome.org/jbrowse/index.html',
      submenu: [
        { label: 'C. albicans', href: 'http://www.candidagenome.org/jbrowse/index.html?data=cgd_data%2FC_albicans_SC5314' },
        { label: 'C. auris', href: 'http://www.candidagenome.org/jbrowse/index.html?data=cgd_data%2FC_auris_B8441' },
        { label: 'C. dubliniensis', href: 'http://www.candidagenome.org/jbrowse/index.html?data=cgd_data%2FC_dubliniensis_CD36' },
        { label: 'C. glabrata', href: 'http://www.candidagenome.org/jbrowse/index.html?data=cgd_data%2FC_glabrata_CBS138' },
        { label: 'C. parapsilosis', href: 'http://www.candidagenome.org/jbrowse/index.html?data=cgd_data%2FC_parapsilosis_CDC317' }
      ]
    },
    {
      label: 'Sequence',
      to: '/seq-tools',
      submenu: [
        { label: 'Gene/Seq Resources', to: '/seq-tools' },
        { label: 'PatMatch', to: '/patmatch' },
        { label: 'Primers', to: '/webprimer' },
        { label: 'Genome Versions', to: '/genome-version-history' },
        { label: 'Download Sequence', to: '/download' },
        { label: 'Restriction Mapper', to: '/restriction-mapper' }
      ]
    },
    {
      label: 'GO',
      to: '/go-resources',
      submenu: [
        { label: 'What is GO?', href: 'https://geneontology.org/docs/ontology-documentation/', external: true },
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
        { label: 'Batch Download', to: '/batch-download' },
        { label: 'Phenotype Search', to: '/phenotype/search' },
        { label: 'BLAST', to: '/blast' },
        { label: 'C. albicans Genome Snapshot', to: '/genome-snapshot/C_albicans_SC5314' },
        { label: 'C. auris Genome Snapshot', to: '/genome-snapshot/C_auris_B8441' },
        { label: 'C. dubliniensis Genome Snapshot', to: '/genome-snapshot/C_dubliniensis_CD36' },
        { label: 'C. glabrata Genome Snapshot', to: '/genome-snapshot/C_glabrata_CBS138' },
        { label: 'C. parapsilosis Genome Snapshot', to: '/genome-snapshot/C_parapsilosis_CDC317' }
      ]
    },
    {
      label: 'Literature',
      to: '/literature',
      submenu: [
        { label: 'Highlighted Topics', to: '/topic-biblios' },
        { label: 'Laboratory Strains', to: '/strains' }
      ]
    },
    {
      label: 'Download',
      to: '/download',
      submenu: [
        { label: 'Batch Download', to: '/batch-download' },
        { label: 'GO Annotations', to: '/download' },
        { label: 'Chromosomal Features', href: 'http://www.candidagenome.org/download/chromosomal_feature_files/', external: true },
        { label: 'Sequence', href: 'http://www.candidagenome.org/download/sequence/', external: true },
        { label: 'Browse Downloads', href: 'http://www.candidagenome.org/download/', external: true }
      ]
    },
    {
      label: 'Community',
      to: '/community',
      submenu: [
        { label: 'Search CGD Colleagues', to: '/colleague' },
        { label: 'Find Candida Labs', to: '/labs' },
        { label: 'Colleague Update', to: '/colleague-update' },
        { label: 'CGD Public Wiki', href: 'http://publicwiki.candidagenome.org', external: true },
        { label: 'Community News', to: '/community-news' },
        { label: 'Job Opportunities', to: '/job-postings' },
        { label: 'Meetings & Courses', to: '/meetings' },
        { label: 'Nomenclature Guide', to: '/nomenclature' },
        { label: 'External Resources', to: '/external-resources' },
        { label: 'Gene Registry', to: '/gene-registry' }
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
