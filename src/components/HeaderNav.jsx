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
        { label: 'Literature Search', to: '/literature-topic-search' },
        { label: 'Text Search', to: '/search/text' },
        { label: 'Phenotype Search', to: '/phenotype/search' },
        { label: 'Colleague Search', to: '/colleague' },
        { label: 'External Resources', to: '/external-resources' }
      ]
    },
    {
      label: 'JBrowse',
      href: '/jbrowse2/',
      external: true,
      submenu: [
        { label: 'C. albicans', href: '/jbrowse2/?assembly=C_albicans_SC5314&loc=Ca22chr1A_C_albicans_SC5314:115518..129521&tracks=DNA,TranscribedFeatures', external: true },
        { label: 'C. auris', href: '/jbrowse2/?assembly=C_auris_B8441&loc=Chr4_C_auris_B8441:120307..131992&tracks=C_auris_B8441-ReferenceSequenceTrack,C_auris_B8441_features.sorted.gff', external: true },
        { label: 'C. auris (mitochondrion)', href: '/jbrowse2/?assembly=C_auris_B8441_mito&loc=MT849287.1_C_auris_B8441_mito:1..28212&tracks=C_auris_B8441_mito-ReferenceSequenceTrack,C_auris_B8441_mito_features', external: true },
        { label: 'C. dubliniensis', href: '/jbrowse2/?assembly=C_dubliniensis_CD36&loc=Chr1_C_dubliniensis_CD36:131096..145475&tracks=C_dubliniensis_CD36-ReferenceSequenceTrack,C_dubliniensis_CD36_features.sorted.gff', external: true },
        { label: 'C. glabrata', href: '/jbrowse2/?assembly=C_glabrata_CBS138&loc=ChrA_C_glabrata_CBS138:1..100000&tracks=C_glabrata_CBS138-ReferenceSequenceTrack,C_glabrata_CBS138_features.sorted.gff', external: true },
        { label: 'C. parapsilosis', href: '/jbrowse2/?assembly=C_parapsilosis_CDC317&loc=Contig005504_C_parapsilosis_CDC317:1..100000&tracks=C_parapsilosis_CDC317-ReferenceSequenceTrack,C_parapsilosis_CDC317_features.sorted.gff', external: true },
        { label: 'C. tropicalis', href: '/jbrowse2/?assembly=C_tropicalis_MYA3404&loc=CP047869.1:1..100000&tracks=C_tropicalis_MYA3404-ReferenceSequenceTrack,C_tropicalis_features.sorted.gff', external: true }
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
        { label: 'C. tropicalis Genome Snapshot', to: '/genome-snapshot/C_tropicalis' },
        { label: 'Genome Versions', to: '/genome-version-history' }
      ]
    },
    {
      label: 'GO',
      to: '/go-resources',
      submenu: [
        { label: 'What is GO?', to: '/help/what-is-go' },
        { label: 'Guide to Evidence Codes', href: 'https://geneontology.org/docs/guide-go-evidence-codes/', external: true },
        { label: 'GO Slim Mapper', to: '/go-slim-mapper' },
        { label: 'GO Term Finder', to: '/go-term-finder' },
        { label: 'GO Consortium', href: 'http://www.geneontology.org/', external: true },
        { label: 'GO File Downloads', href: '/download/go/', external: true }
      ]
    },
    {
      label: 'Tools',
      to: '/tools',
      submenu: [
        { label: 'CRISPR Guide Designer (Preview)', to: '/crispr' },
        { label: 'Ortholog Converter', to: '/ortholog-converter' },
        { label: 'PatMatch', to: '/patmatch' },
        { label: 'Primers', to: '/webprimer' },
        { label: 'Phenotype Search', to: '/phenotype/search' },
        { label: 'Restriction Mapper', to: '/restriction-mapper' },
        { label: 'Synteny Browser', to: '/synteny-browser' },
        { label: 'Virulence Factor Browser (Preview)', to: '/virulence-factor-browser' }
      ]
    },
    {
      label: 'Literature',
      to: '/literature',
      submenu: [
        { label: 'Literature Search', to: '/literature-topic-search' },
        { label: 'CGD Public Wiki', href: 'http://publicwiki.candidagenome.org', external: true },
        { label: 'Genome-Wide Analysis Papers', to: '/genome-wide-analysis-papers' },
        { label: 'Disease-Related Papers', to: '/disease-related-papers' },
        { label: 'CGD Publications', to: '/cgd-publications' }
      ]
    },
    {
      label: 'Download',
      to: '/download',
      submenu: [
        { label: 'Batch Download', to: '/batch-download' },
        { label: 'Sequence Downloads', href: '/download/sequence/', external: true },
        { label: 'Datasets', to: '/download-datasets' },
        { label: 'Chromosomal Features', href: '/download/chromosomal_feature_files/', external: true },
        { label: 'GO Annotations', href: '/download/go/', external: true }
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
        { label: 'CGD Public Wiki', href: 'http://publicwiki.candidagenome.org', external: true },
        { label: 'Developer API', to: '/developer/api' }
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
