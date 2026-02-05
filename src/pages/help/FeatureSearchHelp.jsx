import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

const FeatureSearchHelp = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Help: Advanced Search</h1>
        <hr />

        <div className="info-section">
          <h2>Contents:</h2>
          <ul>
            <li><a href="#overview">Overview</a></li>
            <li>
              <a href="#using">Using the Advanced Search query form (building your search)</a>
              <ul>
                <li><a href="#feature">Choosing the chromosomal features (required Step 1)</a></li>
                <li><a href="#criteria">Refining your search (optional Step 2)</a></li>
              </ul>
            </li>
            <li>
              <a href="#results">Results page</a>
              <ul>
                <li><a href="#manage">Manage gene lists</a></li>
              </ul>
            </li>
            <li><a href="#other">Other searches available at CGD</a></li>
          </ul>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />

        <div className="info-section" id="overview">
          <h2>Overview</h2>
          <p>
            The Advanced Search allows you to retrieve the chromosomal features (ORFs, tRNAs, etc) of your
            choice from the database through a web interface. In addition, you may refine your results by
            choosing several different criteria.
          </p>
          <p>
            This help page gives you an overview of the Advanced Search available at CGD as well as detailed
            descriptions of the search criteria that can be used to limit your results.
          </p>
        </div>

        <div className="info-section" id="using">
          <h2>Using the Advanced Search query form (building your search)</h2>
          <p>
            In the 1st step of the search, you choose the strain (genome) to search. Then, in the 2nd step,
            you choose the types of chromosomal features that you want to retrieve. Finally, you can use the
            3rd step of the search to narrow your results. If, for example, you want to retrieve all the tRNAs
            in the genome, check the tRNA box in Step 1 and click on the Search button. If you want all the
            tRNAs found on <em>Candida albicans</em> chromosome X, choose <em>Candida albicans</em> in Step 1,
            check the tRNA box in Step 2, then in Step 3, select "X" from the Chromosome pulldown in the{' '}
            <strong>Annotation/sequence properties</strong> section. The sections below describe the required
            and optional criteria in more detail.
          </p>

          <h3 id="feature">Choosing the strain and chromosomal features</h3>
          <p>
            In Step 1, you must select at least one chromosomal feature type by clicking on the relevant
            checkbox (required). You can select more than one feature type. A chromosomal feature is a{' '}
            <a href="http://www.yeastgenome.org/help/glossary.html#sequence-features" target="_blank" rel="noopener noreferrer">
              sequence feature
            </a>{' '}
            on the chromosome, such as an ORF, a tRNA, a snRNA, CEN, or ARS. Each chromosomal feature at CGD
            is assigned a "Feature Type". This information is located on the locus page, immediately below
            the systematic name. The "not physically mapped" feature type is specially defined as features
            that are not mapped to a specific chromosomal location in CGD (e.g., genes that have been defined
            genetically but not cloned, or genes for which sequence information is not published).
          </p>
          <p>
            If you only select "ORF" and then submit the query, you will get a list of all chromosomal
            features that have the feature type of "ORF" at CGD. You can also narrow your results by choosing
            one or more <a href="#criteria">search criteria</a> in <strong>Step 3</strong>.
          </p>

          <h3 id="criteria">Refining your search</h3>
          <p>
            In Step 3, choose search criteria if you want to restrict the results (optional). Search criteria
            are selected by clicking on a checkbox, filling in numbers in a dialog box, or selecting a menu
            option. Select or unselect multiple options for Chromosomes and GO terms by pressing the Control
            (PC) or Command (Mac) key while clicking. The results will be those chromosomal features that meet{' '}
            <strong>ALL</strong> the criteria selected or entered in this section (i.e., this part of the
            search uses AND across the different search criteria, not OR).
          </p>
          <p>
            <strong>Note on defaults (i.e. when none of the optional criteria are selected):</strong> Leaving
            any search criteria blank generally means that they will not be used in restricting the results,
            so for example, the default for the chromosomal location option is that selected features on all
            chromosomes will be included and the default for the GO-Slim term option is that all selected
            features will be included, regardless of its mapping to a GO-Slim term. There is one exception:
            for the feature qualifiers, by default, your results do not include Deleted features.
          </p>

          <h4>Annotation/sequence properties:</h4>

          <p><u>Feature Qualifiers</u></p>
          <p>
            Selecting a checkbox narrows the results to feature types that have been assigned the qualifier.
            ORFs that are present in the current sequence assembly (not deleted ORFs) are assigned the
            additional qualifiers, Verified or Uncharacterized; selection of one or more of these qualifiers
            may be used to limit an ORF search. ORFs are labeled as Verified if there is experimental
            characterization that indicates that a functional gene product is produced (as defined by the ORF
            having curated Gene Ontology terms with experimental evidence codes, i.e., evidence codes other
            than IEA, ISS, RCA, ISA, ISM, ISO, NAS). Uncharacterized ORFs do not currently have curated
            experimental characterization. Upon publication that provides experimental evidence that an
            Uncharacterized ORF produces a product, the ORF will be reclassified as Verified. An additional
            qualifier, "Dubious," is in use for <em>C. albicans</em> ORFs. Dubious ORFs are unlikely to encode
            a protein product, as they appear indistinguishable from random non-coding sequence based on
            comparative analysis conducted by Lin et al. (2008), they show no significant homology to an{' '}
            <em>S. cerevisiae</em> gene (by the same criteria used to determine Best Hits and Orthologs at
            CGD), and they have no experimental characterization.
          </p>

          <p><u>Introns and UTRs</u></p>
          <p>
            Selecting "Yes" narrows the results to features that contain an intron, have annotated UTR(s), or
            have UTR intron(s). Selecting "No" narrows the results to those that do not contain intronic or
            UTR sequence, as selected.
          </p>

          <p><u>Chromosomal location</u></p>
          <p>
            Selecting a chromosome number limits the results to the selected features types that are located
            on the specified chromosome. You may select more than one chromosome or deselect a chromosome by
            pressing the Control (PC) or Command (Mac) key while clicking. The default option includes
            selected features on all chromosomes.
          </p>

          <h4>Gene Ontology (GO) annotation:</h4>

          <p><u>GO-Slim</u></p>
          <p>
            Selecting a{' '}
            <a href="http://www.yeastgenome.org/help/glossary.html#goslim" target="_blank" rel="noopener noreferrer">
              GO-Slim
            </a>{' '}
            term limits the results to the feature types with GO annotations that map to that GO-Slim term
            (i.e., you will retrieve features annotated directly to the GO terms you select as well as any
            children of those GO terms). If you select multiple GO terms, resulting features must be annotated
            to all terms you select (the search uses a logical Boolean "AND," not "OR"). You can select or
            deselect multiple GO terms by pressing Control [PC] or Command [Mac] while clicking. Note that in
            addition to the GO Slim terms provided in the Biological Process, Molecular Function, and Cellular
            Component boxes, you can enter your own GO terms of interest by entering them in the empty text
            box. The behavior of the search will be the same: features will be retrieved whether they are
            directly or indirectly annotated to the GO terms that you enter. You may also limit your query by{' '}
            <a href="http://www.geneontology.org/GO.evidence.shtml" target="_blank" rel="noopener noreferrer">
              GO evidence code
            </a>{' '}
            or by annotation method (Computational, High-throughput, or Manually Curated GO Annotations; see
            the{' '}
            <a href="http://www.yeastgenome.org/help/glossary.html" target="_blank" rel="noopener noreferrer">
              SGD glossary
            </a>{' '}
            for more detailed definitions). Please note that the search places a logical "OR" between the
            selected annotation methods and between the selected evidence code options, whereas the search
            places a logical "AND" between selected GO terms.
          </p>
        </div>

        <div className="info-section" id="results">
          <h2>Results page</h2>
          <p>
            The results page will give you a summary of your search results. At the top, it will state the
            number of chromosomal features that match the search criteria. Immediately below, the chromosomal
            feature type(s) selected for the search along with the search criteria selected to narrow the
            search will be listed. The number listed in parentheses indicates the numbers of hits available
            when that criterion is applied. This can be used to determine which criterion was the most
            restrictive when no hits are returned.
          </p>
          <p>
            A table will be displayed with the chromosomal features that match your search criteria. The table
            will have the following information:
          </p>
          <table className="sitemap-table">
            <thead>
              <tr>
                <th>Systematic Name</th>
                <th>Feature Type</th>
                <th>Gene Name</th>
                <th>Description</th>
                <th>Position info<br />(if searched)</th>
                <th>Relevant GO terms<br />(if searched)</th>
              </tr>
            </thead>
          </table>
          <p>
            Only 30 hits will be shown per page. If there are more than 30 hits, the subsequent pages will be
            hyperlinked.
          </p>

          <h3 id="manage">Manage gene lists</h3>
          <p>
            You will also be given a table of options to <strong>"Manage your gene list"</strong>. This allows
            you to directly import the results into the{' '}
            <a href="/go-term-finder" target="_blank" rel="noopener noreferrer">GO Term Finder</a> or
            the{' '}
            <a href="/go-slim-mapper" target="_blank" rel="noopener noreferrer">GO Slim Mapper</a> to
            do further analysis, or to view a Summary of GO annotations. You will also be able to sort the
            list alphabetically by systematic name or by gene name. In addition, you will be able to download
            your results directly as a text file.
          </p>
        </div>

        <div className="info-section" id="other">
          <h2>Other searches available at CGD</h2>
          <p>
            Keyword searches can be performed using the <strong>Quick Search</strong> box or the{' '}
            <strong>Category Search</strong>. These and other search tools are available on the{' '}
            <Link to="/search">Search Options</Link> Contents page. The Quick Search box is also located at
            the top of most CGD pages.
          </p>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />
      </div>
    </div>
  );
};

export default FeatureSearchHelp;
