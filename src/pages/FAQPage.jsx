import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const FAQPage = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>CGD Frequently Asked Questions (FAQ)</h1>
        <hr />

        <p style={{ textAlign: 'center' }}>
          This page provides answers to some common questions.
        </p>

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li>
              <strong><a href="#CGD">FAQs about CGD</a></strong>
              <ul>
                <li><a href="#why">Why hasn't CGD cited my paper?</a></li>
                <li><a href="#registry">How do I propose a gene name?</a></li>
                <li><a href="#sequence">How can I find more information about the CGD sequences?</a></li>
                <li><a href="#cite">How should I cite CGD?</a></li>
                <li><a href="#help">How can I get more help?</a></li>
              </ul>
            </li>
            <li>
              <strong><a href="#GO">FAQs about Gene Ontology at CGD</a></strong>
              <ul>
                <li><a href="#what">What is Gene Ontology (GO)?</a></li>
                <li><a href="#term">How do I find which genes or proteins are annotated to a GO term?</a></li>
                <li><a href="#set">How can I analyze the GO terms assigned to a set of genes?</a></li>
                <li><a href="#refs">How does CGD assign references for GO terms?</a></li>
              </ul>
            </li>
            <li>
              <strong><a href="#albicans">FAQs about <em>C. albicans</em></a></strong>
            </li>
          </ul>
        </div>

        <hr style={{ width: '75%', margin: '30px auto' }} />

        <div className="info-section" id="CGD">
          <h2>FAQs about CGD</h2>

          <div className="faq-item" id="why">
            <h3 className="faq-question">Why hasn't CGD cited my paper?</h3>
            <div className="faq-answer">
              <p><strong>My paper isn't in the literature lists for the relevant gene(s); why not?</strong></p>
              <p>
                We aim to collect all the available literature for each gene or protein in CGD, so if your paper
                is not listed, it was not intentionally excluded. CGD curation is in progress, and we have not
                yet read every paper on our list. The possibility also exists that your paper was accidentally
                omitted from our list. To ensure that your paper is linked to the correct gene by CGD (and other
                databases), it's always a good idea to include the gene name, systematic name, and species name
                (e.g., "<em>Candida albicans</em>" or "<em>C. albicans</em>") in the abstract. If you think we
                might have missed your paper, please drop us an{' '}
                <Link to="/contact">email</Link> and we will be happy to add it.
              </p>
            </div>
          </div>

          <div className="faq-item" id="registry">
            <h3 className="faq-question">How do I propose a gene name?</h3>
            <div className="faq-answer">
              <p><strong>How do I name a new gene?</strong></p>
              <p>
                Researchers who want to reserve a new <em>Candida albicans</em> gene name prior to publication
                do so through CGD. After publication the name becomes the standard gene name. CGD maintains a
                detailed list of <Link to="/nomenclature">guidelines</Link> for choosing and reserving
                new gene names, and for the resolution of conflicts over gene names. Please submit a reservation
                using our <Link to="/gene-registry">registry form</Link> or send CGD an{' '}
                <Link to="/contact">email</Link> if you would like to reserve a gene name.
              </p>
              <p><strong>I'd like to change the name of a gene that already has a standard genetic name; is this possible?</strong></p>
              <p>
                Occasionally, existing gene names are changed to more accurately reflect the function or role
                of the gene product. Such changes are only made if there is consensus among all researchers
                who have studied the gene. CGD <Link to="/contact">curators</Link> can coordinate
                the process of proposing and discussing gene name changes.
              </p>
            </div>
          </div>

          <div className="faq-item" id="sequence">
            <h3 className="faq-question">How can I find more information about sequences in CGD?</h3>
            <div className="faq-answer">
              <p>
                Please see the CGD <Link to="/help/sequence">Sequence Documentation</Link> web page
                for information about the genomic sequence.
              </p>
              <p>
                For help using the GBrowse Genome Browser, please see our{' '}
                <a href="http://www.candidagenome.org/cgi-bin/gbrowse/candida?help=general" target="_blank" rel="noopener noreferrer">GBrowse Help Documentation</a> page.
              </p>
              <p>
                Sequence issues pertaining to individual genes are described in the Locus History, which may
                be accessed using the link under "Additional Information" near the bottom of the gene's Locus Page.
              </p>
            </div>
          </div>

          <div className="faq-item" id="cite">
            <h3 className="faq-question">How should I cite CGD?</h3>
            <div className="faq-answer">
              <p><strong>What reference should I use to refer to the CGD database?</strong></p>
              <p>
                CGD maintains a <Link to="/how-to-cite">list</Link> of publications describing CGD,
                written by CGD staff, that can be used as references to CGD as a database.
              </p>
              <p><strong>How should I cite data I found in CGD?</strong></p>
              <p>
                For references to the data contained within CGD, original references should be cited wherever
                possible. For unpublished information, you should get permission directly from the investigator
                who submitted the data to CGD if there is a contact listed for that information. Further
                instructions on how to cite CGD and other electronic resources may be found on the{' '}
                <Link to="/how-to-cite">How to Cite CGD</Link> page.
              </p>
            </div>
          </div>

          <div className="faq-item" id="help">
            <h3 className="faq-question">How can I get more help?</h3>
            <div className="faq-answer">
              <p>
                CGD help resources are listed on the <Link to="/help">Help Resources</Link> page.
                The 'Help' button in the upper right corner of each tool and Locus page is linked directly to
                help documentation for that particular page.
              </p>
              <p>
                <Link to="/help/getting-started">Getting Started with CGD</Link> provides an introductory
                overview of CGD and how to use it.
              </p>
              <p>
                The{' '}
                <a href="http://www.yeastgenome.org/help/glossary.html" target="_blank" rel="noopener noreferrer">
                  Glossary
                </a>{' '}
                page, provided by the <em>Saccharomyces</em> Genome Database (SGD), lists definitions of genetic,
                bioinformatic, and other terms used in CGD and SGD.
              </p>
              <p>
                CGD curators may be contacted <em>via</em>{' '}
                <Link to="/contact">our suggestion form</Link>. We welcome your comments and questions!
              </p>
            </div>
          </div>
        </div>

        <hr style={{ width: '75%', margin: '30px auto' }} />

        <div className="info-section" id="GO">
          <h2>FAQs about Gene Ontology at CGD</h2>

          <div className="faq-item" id="what">
            <h3 className="faq-question">What is Gene Ontology (GO)?</h3>
            <div className="faq-answer">
              <p>
                GO is a collaborative project, involving CGD and other model organism databases, to provide
                controlled vocabularies that are used to describe the molecular function and cellular location
                of gene products and the biological process in which they are involved. The three ontologies
                that comprise GO (Molecular Function, Cellular Component, and Biological Process) are used by
                multiple databases to annotate gene products, so that this common vocabulary can be used to
                compare gene products across species. The development of the ontologies is ongoing in order
                to incorporate new information.
              </p>
              <p><strong>Where can I learn more about the GO project?</strong></p>
              <p>
                The{' '}
                <a href="http://www.geneontology.org/" target="_blank" rel="noopener noreferrer">
                  GO Consortium
                </a>{' '}
                website is the central repository for GO information and documentation, and for the ontologies
                themselves. SGD's{' '}
                <a href="http://www.yeastgenome.org/help/GO.html" target="_blank" rel="noopener noreferrer">
                  GO Help
                </a>{' '}
                page provides a brief introduction to GO, and the SGD{' '}
                <a href="http://www.yeastgenome.org/help/gotutorial.html" target="_blank" rel="noopener noreferrer">
                  GO tutorial
                </a>{' '}
                is a guided tour of GO annotations and of the GO tools that are used at SGD and at CGD.
              </p>
            </div>
          </div>

          <div className="faq-item" id="term">
            <h3 className="faq-question">How do I find which genes or proteins are annotated to a GO term?</h3>
            <div className="faq-answer">
              <p>
                Whenever a GO term is displayed on a CGD Locus page, that term is hyperlinked to a list of all
                gene products annotated to that term in CGD. You can search for a particular GO term by typing
                all or part of the term into the Quick Search box at the top of most CGD pages. This will return
                a list of all terms matching the search criterion, along with lists of gene products annotated
                to each term. CGD GO annotations may be downloaded in bulk from the{' '}
                <Link to="/download">Download directories</Link>.
              </p>
            </div>
          </div>

          <div className="faq-item" id="set">
            <h3 className="faq-question">How can I analyze the GO terms assigned to a set of genes?</h3>
            <div className="faq-answer">
              <p>
                CGD has two tools for analysis of GO classifications of groups of genes. The{' '}
                <Link to="/go-slim-mapper">GO Term Mapper</Link> tool takes a set of genes specified
                by the user and maps each to higher-level GO-Slim terms. The{' '}
                <Link to="/go-term-finder">GO Term Finder</Link> tool takes the user's set of genes
                of interest and finds GO terms that are shared within the set. Detailed documentation is
                available on the{' '}
                <a href="http://www.yeastgenome.org/help/goslimhelp.html" target="_blank" rel="noopener noreferrer">
                  GO Term Mapper help page
                </a>{' '}
                and the{' '}
                <a href="http://www.yeastgenome.org/help/goTermFinder.html" target="_blank" rel="noopener noreferrer">
                  GO Term Finder help page
                </a>, provided by SGD.
              </p>
            </div>
          </div>

          <div className="faq-item" id="refs">
            <h3 className="faq-question">How does CGD assign references for GO terms?</h3>
            <div className="faq-answer">
              <p>
                In assigning Gene Ontology (GO) terms, our aim is to annotate each function, process, and
                location of the gene product with the full set of references that establish the classification.
                If your paper has not been cited, feel free to send us an{' '}
                <Link to="/contact">email</Link>, and we will add the information as quickly as possible.
              </p>
            </div>
          </div>
        </div>

        <hr style={{ width: '75%', margin: '30px auto' }} />

        <div className="info-section" id="albicans">
          <h2>FAQs about <em>Candida albicans</em></h2>

          <div className="faq-item" id="misc">
            <h3 className="faq-question">I think I may have a yeast infection. What should I do?</h3>
            <div className="faq-answer">
              <p>
                Unfortunately, we cannot directly help you because CGD is a scientific database that provides
                information about the molecular biology and genetics of <em>Candida albicans</em>, and related
                yeasts, to researchers. To find out more information about Candidiasis, you can go to a medical
                library at a local university, search the{' '}
                <a href="http://www.ncbi.nlm.nih.gov/entrez/query.fcgi" target="_blank" rel="noopener noreferrer">
                  PubMed database
                </a>{' '}
                for relevant literature, or browse the{' '}
                <a href="http://www.nlm.nih.gov/medlineplus/candidiasis.html" target="_blank" rel="noopener noreferrer">
                  <strong>Candidiasis information at MEDLINE plus</strong>
                </a>. We are not medical doctors and cannot give medical advice. You should speak to a qualified
                physician about any medical concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
