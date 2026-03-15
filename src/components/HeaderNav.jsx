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
      href: '/jbrowse/index.html',
      external: true,
      submenu: [
        { label: 'C. albicans', href: '/jbrowse/index.html?data=cgd_data%2FC_albicans_SC5314', external: true },
        { label: 'C. auris', href: '/jbrowse/index.html?data=cgd_data%2FC_auris_B8441', external: true },
        { label: 'C. dubliniensis', href: '/jbrowse/index.html?data=cgd_data%2FC_dubliniensis_CD36', external: true },
        { label: 'C. glabrata', href: '/jbrowse/index.html?data=cgd_data%2FC_glabrata_CBS138', external: true },
        { label: 'C. parapsilosis', href: '/jbrowse/index.html?data=cgd_data%2FC_parapsilosis_CDC317', external: true }
      ]
    },
    {
      label: 'JBrowse2',
      href: '/jbrowse2/',
      external: true,
      submenu: [
        { label: 'C. albicans', href: '/jbrowse2/?assembly=C_albicans_SC5314&loc=Ca22chr1A_C_albicans_SC5314:115518..129521&tracks=DNA,TranscribedFeatures,segal_hapA_transposon_hits,segal_hapA_transposon_reads,hapA_alb_dub_phyloP_scores,hapA_CanLod_phyloP_scores,hapA_CTG_phyloP_scores,hapA_Sacc_phyloP_scores,bruno_nOxi_hapA_coverage', external: true },
        { label: 'C. auris', href: '/jbrowse2/?assembly=C_auris_B8441&loc=Chr4_C_auris_B8441:120307..131992&tracks=C_auris_B8441_features.sorted.gff,auris_phyloP_scores,AurLus_phyloP_scores,CTG_C_auris_phyloP_scores,Sacc_C_auris_phyloP_scores', external: true },
        { label: 'C. dubliniensis', href: '/jbrowse2/?assembly=C_dubliniensis_CD36&loc=Chr1_C_dubliniensis_CD36:131096..145475&tracks=C_dubliniensis_CD36_features.sorted.gff,alb_dub_C_dub_phyloP_scores,CanLod_C_dub_phyloP_scores,CTG_C_dub_phyloP_scores,Sacc_C_dub_phyloP_scores', external: true },
        { label: 'C. glabrata', href: '/jbrowse2/?assembly=C_glabrata_CBS138&loc=ChrA_C_glabrata_CBS138:1..100000&tracks=C_glabrata_CBS138_features.sorted.gff,glab_phyloP_scores,CanNak_C_glab_phyloP_scores,WGD_C_glab_phyloP_scores,Sacc_C_glab_phyloP_scores', external: true },
        { label: 'C. parapsilosis', href: '/jbrowse2/?assembly=C_parapsilosis_CDC317&loc=Contig005504_C_parapsilosis_CDC317:1..100000&tracks=C_parapsilosis_CDC317_features.sorted.gff,para_phyloP_scores,CanLod_C_para_phyloP_scores,CTG_C_para_phyloP_scores,Sacc_C_para_phyloP_scores', external: true }
      ]
    },
    {
      label: 'JBrowse Latest',
      href: '/jbrowse_latest/',
      external: true,
      submenu: [
        { label: 'C. albicans', href: '/jbrowse_latest/?assembly=C_albicans_SC5314&loc=Ca22chr1A_C_albicans_SC5314:115518..129521&tracks=DNA,TranscribedFeatures,segal_hapA_transposon_hits,segal_hapA_transposon_reads,hapA_alb_dub_phyloP_scores,hapA_CanLod_phyloP_scores,hapA_CTG_phyloP_scores,hapA_Sacc_phyloP_scores,bruno_nOxi_hapA_coverage', external: true },
        { label: 'C. auris', href: '/jbrowse_latest/?assembly=C_auris_B8441&loc=Chr4_C_auris_B8441:120307..131992&tracks=C_auris_B8441_features.sorted.gff,auris_phyloP_scores,AurLus_phyloP_scores,CTG_C_auris_phyloP_scores,Sacc_C_auris_phyloP_scores', external: true },
        { label: 'C. dubliniensis', href: '/jbrowse_latest/?assembly=C_dubliniensis_CD36&loc=Chr1_C_dubliniensis_CD36:131096..145475&tracks=C_dubliniensis_CD36_features.sorted.gff,alb_dub_C_dub_phyloP_scores,CanLod_C_dub_phyloP_scores,CTG_C_dub_phyloP_scores,Sacc_C_dub_phyloP_scores', external: true },
        { label: 'C. glabrata', href: '/jbrowse_latest/?assembly=C_glabrata_CBS138&loc=ChrA_C_glabrata_CBS138:1..100000&tracks=C_glabrata_CBS138_features.sorted.gff,glab_phyloP_scores,CanNak_C_glab_phyloP_scores,WGD_C_glab_phyloP_scores,Sacc_C_glab_phyloP_scores', external: true },
        { label: 'C. parapsilosis', href: '/jbrowse_latest/?assembly=C_parapsilosis_CDC317&loc=Contig005504_C_parapsilosis_CDC317:1..100000&tracks=C_parapsilosis_CDC317_features.sorted.gff,para_phyloP_scores,CanLod_C_para_phyloP_scores,CTG_C_para_phyloP_scores,Sacc_C_para_phyloP_scores', external: true }
      ]
    },
    {
      label: 'JBrowse Latest (Classic)',
      href: '/jbrowse_latest_v1_style/',
      external: true,
      submenu: [
        { label: 'C. albicans', href: '/jbrowse_latest_v1_style/?assembly=C_albicans_SC5314&loc=Ca22chr1A_C_albicans_SC5314:115518..129521&tracks=DNA,TranscribedFeatures,segal_hapA_transposon_hits,segal_hapA_transposon_reads,hapA_alb_dub_phyloP_scores,hapA_CanLod_phyloP_scores,hapA_CTG_phyloP_scores,hapA_Sacc_phyloP_scores,bruno_nOxi_hapA_coverage', external: true },
        { label: 'C. auris', href: '/jbrowse_latest_v1_style/?assembly=C_auris_B8441&loc=Chr4_C_auris_B8441:120307..131992&tracks=C_auris_B8441_features.sorted.gff,auris_phyloP_scores,AurLus_phyloP_scores,CTG_C_auris_phyloP_scores,Sacc_C_auris_phyloP_scores', external: true },
        { label: 'C. dubliniensis', href: '/jbrowse_latest_v1_style/?assembly=C_dubliniensis_CD36&loc=Chr1_C_dubliniensis_CD36:131096..145475&tracks=C_dubliniensis_CD36_features.sorted.gff,alb_dub_C_dub_phyloP_scores,CanLod_C_dub_phyloP_scores,CTG_C_dub_phyloP_scores,Sacc_C_dub_phyloP_scores', external: true },
        { label: 'C. glabrata', href: '/jbrowse_latest_v1_style/?assembly=C_glabrata_CBS138&loc=ChrA_C_glabrata_CBS138:1..100000&tracks=C_glabrata_CBS138_features.sorted.gff,glab_phyloP_scores,CanNak_C_glab_phyloP_scores,WGD_C_glab_phyloP_scores,Sacc_C_glab_phyloP_scores', external: true },
        { label: 'C. parapsilosis', href: '/jbrowse_latest_v1_style/?assembly=C_parapsilosis_CDC317&loc=Contig005504_C_parapsilosis_CDC317:1..100000&tracks=C_parapsilosis_CDC317_features.sorted.gff,para_phyloP_scores,CanLod_C_para_phyloP_scores,CTG_C_para_phyloP_scores,Sacc_C_para_phyloP_scores', external: true }
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
        { label: 'What is GO?', to: '/help/what-is-go' },
        { label: 'Guide to Evidence Codes', href: 'https://geneontology.org/docs/guide-go-evidence-codes/', external: true },
        { label: 'GO Slim Mapper', to: '/go-slim-mapper' },
        { label: 'GO Term Finder', to: '/go-term-finder' },
        { label: 'GO Consortium', href: 'http://www.geneontology.org/', external: true },
        { label: 'GO File Downloads', href: 'http://www.candidagenome.org/download/go/', external: true }
      ]
    },
    {
      label: 'Tools',
      to: '/tools',
      submenu: [
        { label: 'PatMatch', to: '/patmatch' },
        { label: 'Primers', to: '/webprimer' },
        { label: 'Phenotype Search', to: '/phenotype/search' },
        { label: 'Restriction Mapper', to: '/restriction-mapper' }
      ]
    },
    {
      label: 'Literature',
      to: '/literature',
      submenu: [
        { label: 'Literature Search', to: '/literature-topic-search' },
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
        { label: 'Sequence Downloads', href: 'http://www.candidagenome.org/download/sequence/', external: true },
        { label: 'Datasets', to: '/datasets' },
        { label: 'Chromosomal Features', href: 'http://www.candidagenome.org/download/chromosomal_feature_files/', external: true },
        { label: 'GO Annotations', href: 'http://www.candidagenome.org/download/go/', external: true }
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
