import React from 'react';
import { Link } from 'react-router-dom';
import './NewsArchivePage.css';

// News data organized by year (most recent first)
const NEWS_BY_YEAR = {
  2022: [
    {
      title: (
        <>
          New Assembly for <em>Candida glabrata</em> Genome
        </>
      ),
      content: (
        <>
          We are pleased to announce the incorporation of a new assembly for the{' '}
          <em>C. glabrata</em> CBS138 genome, which leveraged long-read sequencing to correct
          previous assembly errors in repetitive regions (
          <Link to="/reference/CAL0000228800">Xu et al., 2020</Link>). The sub-telomeric regions of
          all chromosomes were substantially lengthened, resulting in changes of chromosomal
          coordinates for all genomic features. 31 new protein-coding genes were added. The rDNA
          region on Chr L was expanded significantly, and a second rDNA region was added to Chr M.
          62 genes from the previous assembly were removed, and sequences were corrected for an
          additional 32 features, ranging from single-base changes to major structural
          rearrangements. The update adds or corrects the sequences of 45 genes encoding
          GPI-anchored cell wall proteins (GPI-CWPs), which contain many long tandem repeats.
          <br />
          See{' '}
          <Link to="/help/glabrata-changes-2022">this page</Link>{' '}
          for a list of added, modified, or removed features.
        </>
      ),
      date: 'August 30, 2022',
    },
    {
      title: 'CGD Service Interruption',
      content: (
        <>
          Over the 2021 Holiday Break, Stanford blocked CGD's servers from the internet citing
          security concerns. We are currently in the process of moving CGD to AWS. In the mean
          time, you may notice that some features are missing and some tools are not fully
          functional. We are working to restore full functionality as soon as possible. We
          apologize for the disruptions this has caused.
        </>
      ),
      date: 'January 3, 2022',
    },
  ],
  2021: [
    {
      title: '2022 FEBS Advanced Lecture Course',
      content: (
        <>
          2022 FEBS Advanced Lecture Course on Molecular Mechanisms of Host-pathogen Interactions
          and Virulence in Human Fungal Pathogens is now scheduled for an in person meeting next
          May in La Colle sur Loup (France).
          <br />
          Registration is now open at the{' '}
          <a href="https://hfp2022.febsevents.org" target="_blank" rel="noopener noreferrer">
            Meeting website
          </a>
          . The registration deadline is February 1st, 2022.
        </>
      ),
      date: 'November 1, 2021',
    },
    {
      title: 'CANDIDA AND CANDIDIASIS 2021',
      content: (
        <>
          The Candida and Candidiasis 2021 meeting will take place online on March 21 - 27.
          Previously accepted presenters have been offered the opportunity to present their work at
          this meeting. New abstracts can also be submitted at this{' '}
          <a
            href="https://microbiologysociety.org/event/full-events-listing/candida-and-candidiasis-2021.html#tab-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            website
          </a>
          . The deadline for new abstract submissions is now extended to{' '}
          <u>Friday, 17 January 2021, 5 pm GMT</u>.
        </>
      ),
      date: 'January 5, 2021',
    },
  ],
  2020: [
    {
      title: 'Frank Odds Obituary',
      content: (
        <>
          Read Frank Odds obituary written by Neil Gow, available{' '}
          <a
            href="https://www.theguardian.com/science/2020/aug/25/frank-odds-obituary"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </>
      ),
      date: 'August 26, 2020',
    },
    {
      title: 'Candida and Candidiasis 2020 Conference postponed',
      content: (
        <>
          From the Microbiology Society:
          <p>
            "Due to the continued spread of SARS-CoV-2, the cause of COVID-19, the Council of the
            Microbiology Society, as Trustees of the Society, have taken the difficult decision to
            postpone this year's Candida and Candidiasis Focused Meeting, due to take place from
            19-23 April in Montreal, Canada. We are currently unable to say when this event will
            take place; however, we have spoken this morning to the Chair of the organising
            committee and will keep you all updated as we know more."
          </p>
          <p>
            The entire message is available{' '}
            <a
              href="https://comms.microbiologysociety.org/5AF8-67RV-672X3MWOCD/cr.aspx"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
            .
          </p>
        </>
      ),
      date: 'March 9, 2020',
    },
    {
      title: 'Candida and Candidiasis 2020 Conference - abstracts due soon',
      content: (
        <>
          The conference, organized by the Microbiology Society and taking place on April 19-23,
          2020, in Montreal, Canada, is a successor to the highly valued ASM conference series that
          finished in 2018. <strong>The abstract submission deadline is on this Thursday, January 9</strong>.
          Visit the{' '}
          <a
            href="https://microbiologysociety.org/event/society-events-and-meetings/candida-and-candidiasis-2020.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            conference website
          </a>{' '}
          to register, submit your abstract and for more information.
        </>
      ),
      date: 'January 6, 2020',
    },
  ],
  2019: [
    {
      title: (
        <>
          <em>Candida auris</em> Data in CGD
        </>
      ),
      content: (
        <>
          We are pleased to announce the addition of <em>Candida auris</em> B8441 information into
          CGD. <em>C. auris</em> B8441 was sequenced by the Centers for Disease Control and
          Prevention (
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/27988485/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Lockhart et al. 2017
          </a>
          ). Sequence and annotation were obtained by CGD from{' '}
          <a
            href="https://www.ncbi.nlm.nih.gov/assembly/GCA_002759435.2"
            target="_blank"
            rel="noopener noreferrer"
          >
            GenBank
          </a>
          . <em>C. auris</em> is the fifth <em>Candida</em> species for which manually curated data
          are available in our database, joining <em>C. albicans</em>, <em>C. glabrata</em>,{' '}
          <em>C. parapsilosis</em>, and <em>C. dubliniensis</em>.
          <p>The data loading is complete, and:</p>
          <ul>
            <li>
              <em>C. auris</em> B8441 sequence is now available in all of the CGD tools, including{' '}
              <Link to="/blast">BLAST</Link>
            </li>
            <li>
              Each <em>C. auris</em> gene now has a{' '}
              <Link to="/locus/B9J08_002834">Locus Summary page</Link> in the database
            </li>
            <li>
              Multiple sequence alignments and phylogenetic trees for{' '}
              <Link to="/locus/B9J08_002834">orthologous groups</Link> have been updated to
              include <em>C. auris</em> orthologs
            </li>
            <li>
              <em>C. auris</em> genome and annotation is available in the{' '}
              <a
                href="https://www.candidagenome.org/jbrowse/index.html?data=cgd_data%2FC_auris_B8441&loc=PEKT02000010_C_auris_B8441%3A118601..133000&tracks=DNA%2CTranscribed%20Features"
                target="_blank"
                rel="noopener noreferrer"
              >
                JBrowse
              </a>{' '}
              Genome Browser. In the coming months, we hope to add large-scale datasets to JBrowse,
              as they become available
            </li>
            <li>
              <em>C. auris</em> genes have been assigned predicted function, process, and
              localization annotations (Gene Ontology terms) based on orthology to other{' '}
              <em>Candida</em> species, and also <em>S. cerevisiae</em>, <em>S. pombe</em>, and{' '}
              <em>A. nidulans</em>
            </li>
            <li>
              Protein-coding genes have been assigned predicted annotations based on protein motifs
              and domains (InterPro), and solved structures of homologous proteins from PDB have
              been identified
            </li>
            <li>
              Manual curation of the published scientific literature about <em>C. auris</em> genes
              is ongoing, and experimental data collected from the literature will continue to be
              added
            </li>
          </ul>
          We look forward to <Link to="/contact">your feedback</Link> on the new <em>C. auris</em>{' '}
          species data in CGD.
        </>
      ),
      date: 'August 27, 2019',
    },
    {
      title: 'CGD Grant Renewal - letters of support',
      content: (
        <>
          As you know, the CGD grant is up for renewal this year and we are going to submit an
          application to the NIH this summer. We have previously asked members of the community to
          complete a User Survey to help us formulate future directions for CGD and we greatly
          appreciate the massive response we have received, with all the invaluable suggestions. We
          are now asking our users for letters of support to accompany the application. It is very
          important to demonstrate unequivocally how crucial the continued existence of CGD is to{' '}
          <em>Candida</em> research and to the community. We will greatly appreciate if you can
          email your letter of support to{' '}
          <a href="mailto:candida-curator@lists.stanford.edu">candida-curator@lists.stanford.edu</a>{' '}
          by <strong style={{ color: 'red' }}>June 25</strong> and if you also encourage your
          colleagues and students to do the same. We are counting on your support.
        </>
      ),
      date: 'May 22, 2019',
    },
    {
      title: 'Issue with contacting CGD',
      content: (
        <>
          It was brought to our attention that our CGD Suggestions and Questions form, the one with
          the reCAPTCHA box, was not working properly. There may have been messages that were
          inadvertently lost. If you recently tried to contact CGD and never received a response, it
          is most likely because we have not seen your message. We sincerely apologize for this. The
          problem is now fixed and we also implemented measures to alert us to this kind of issues
          in the future.
        </>
      ),
      date: 'February 4, 2019',
    },
  ],
  2018: [
    {
      title: (
        <>
          <em>Candida glabrata</em> MLST database accepting submissions
        </>
      ),
      content: (
        <>
          <em>Candida glabrata</em> Multi Locus Sequence Typing (MLST) database at{' '}
          <a href="http://pubmlst.org/" target="_blank" rel="noopener noreferrer">
            PubMLST.org
          </a>{' '}
          is accepting submissions again. As of August 2018, the <em>C. glabrata</em> MLST database
          hosted at{' '}
          <a href="http://pubmlst.org/" target="_blank" rel="noopener noreferrer">
            pubmlst.org
          </a>{' '}
          has re-opened its submission pipeline. They welcome submissions of new alleles and
          sequence types as well as isolate data from ongoing or published studies. Please visit{' '}
          <a href="http://pubmlst.org/cglabrata/" target="_blank" rel="noopener noreferrer">
            pubmlst.org/cglabrata
          </a>{' '}
          for more information.
        </>
      ),
      date: 'August 27, 2018',
    },
    {
      title: (
        <>
          <em>C. lusitaniae</em> strain CBS 6936 sequence and BLAST datasets now available at CGD
        </>
      ),
      content: (
        <>
          The sequence and annotation of <em>C. lusitaniae</em> strain CBS 6936, described in{' '}
          <a
            href="https://www.ncbi.nlm.nih.gov/pubmed/28774979"
            target="_blank"
            rel="noopener noreferrer"
          >
            Durrens <em>et al.</em> (2017)
          </a>
          , has been made available at CGD. We provide downloads for{' '}
          <a
            href="http://www.candidagenome.org/download/sequence/C_lusitaniae_CBS6936/current/"
            target="_blank"
            rel="noopener noreferrer"
          >
            sequences
          </a>
          ,{' '}
          <a
            href="http://www.candidagenome.org/download/chromosomal_feature_files/C_lusitaniae_CBS6936/"
            target="_blank"
            rel="noopener noreferrer"
          >
            chromosomal features
          </a>
          ,{' '}
          <a
            href="http://www.candidagenome.org/download/gff/C_lusitaniae_CBS6936/"
            target="_blank"
            rel="noopener noreferrer"
          >
            gff files
          </a>{' '}
          and{' '}
          <a
            href="http://www.candidagenome.org/download/domains/C_lusitaniae_CBS6936/"
            target="_blank"
            rel="noopener noreferrer"
          >
            protein domain predictions
          </a>
          . In addition, <em>C. lusitaniae</em> CBS 6936 is included among the datasets searchable
          by our <Link to="/blast">multi-species BLAST tool</Link>.
        </>
      ),
      date: 'February 27, 2018',
    },
  ],
  2017: [
    {
      title: 'JBrowse Conservation Tracks',
      content: (
        <>
          CGD has added tracks in JBrowse showing the evolutionary conservation of genomic features
          for{' '}
          <a
            href="https://www.candidagenome.org/jbrowse/index.html?data=cgd_data%2FC_albicans_SC5314&loc=Ca22chr1A_C_albicans_SC5314%3A120521..134790&tracks=DNA%2CTranscribed%20Features"
            target="_blank"
            rel="noopener noreferrer"
          >
            <em>C. albicans</em> SC5314
          </a>
          ,{' '}
          <a
            href="https://www.candidagenome.org/jbrowse/index.html?data=cgd_data%2FC_glabrata_CBS138&loc=ChrL_C_glabrata_CBS138%3A1176131..1190400&tracks=DNA%2CTranscribed%20Features"
            target="_blank"
            rel="noopener noreferrer"
          >
            <em>C. glabrata</em> CBS138
          </a>
          ,{' '}
          <a
            href="https://www.candidagenome.org/jbrowse/index.html?data=cgd_data%2FC_dubliniensis_CD36&loc=Chr1_C_dubliniensis_CD36%3A131101..145480&tracks=DNA%2CTranscribed%20Features"
            target="_blank"
            rel="noopener noreferrer"
          >
            <em>C. dubliniensis</em> CD36
          </a>
          , and{' '}
          <a
            href="https://www.candidagenome.org/jbrowse/index.html?data=cgd_data%2FC_parapsilosis_CDC317&loc=Contig005569_C_parapsilosis_CDC317%3A2164961..2179340&tracks=DNA%2CTranscribed%20Features"
            target="_blank"
            rel="noopener noreferrer"
          >
            <em>C. parapsilosis</em> CDC317
          </a>
          . Conservation is shown in four optional quantitative tracks, representing increasing
          levels of evolutionary diversity. Conservation scores and their underlying alignments are
          available for download in the{' '}
          <a
            href="http://www.candidagenome.org/download/genome_alignments/"
            target="_blank"
            rel="noopener noreferrer"
          >
            CGD downloads directory
          </a>
          . Please see our <Link to="/help/jbrowse">JBrowse Help Page</Link> for more information
          about JBrowse at CGD.
        </>
      ),
      date: 'December 20, 2017',
    },
  ],
  2016: [
    {
      title: 'Introducing JBrowse for CGD',
      content: (
        <>
          CGD has implemented JBrowse, the fast, intuitive, and customizable genome browser
          developed by the Generic Model Organism Database project (
          <a href="http://gmod.org/wiki/Main_Page" target="_blank" rel="noopener noreferrer">
            GMOD
          </a>
          ). JBrowse allows users to quickly view large-scale sequence data in a genomic context,
          at multiple zoom-levels of resolution. Please see our{' '}
          <Link to="/help/jbrowse">JBrowse Help Page</Link> for more details.
        </>
      ),
      date: 'September 29, 2016',
    },
    {
      title: (
        <>
          Correction of chromosome 3 haplotype information for <em>C. albicans</em> SC5314 Assembly
          22
        </>
      ),
      content: (
        <>
          We have corrected the haplotype assignments on chromosome 3 of <em>C. albicans</em>{' '}
          SC5314, based on comparisons of haplotype data with sequence data for both the wild-type
          diploid strain and the strain RBY10-10. This analysis supported the exchange of
          approximately 845 kbp between chromosome 3A and chromosome 3B of Assembly 22.
        </>
      ),
      date: 'June 22, 2016',
    },
    {
      title: (
        <>
          EnsemblFungi gene annotations for <em>Candida</em> strains not curated by CGD
        </>
      ),
      content: (
        <>
          We now provide links on CGD Homology Pages and <Link to="/blast">CGD Multi-Genome BLAST</Link>{' '}
          results pages to gene annotations from{' '}
          <a href="http://fungi.ensembl.org/index.html" target="_blank" rel="noopener noreferrer">
            EnsemblFungi
          </a>{' '}
          for the seven <em>Candida</em>-related strains for which we provide{' '}
          <a
            href="http://www.candidagenome.org/download/sequence/"
            target="_blank"
            rel="noopener noreferrer"
          >
            sequence
          </a>{' '}
          and{' '}
          <a
            href="http://www.candidagenome.org/download/gff/"
            target="_blank"
            rel="noopener noreferrer"
          >
            gene model
          </a>{' '}
          downloads, but do not actively curate.
        </>
      ),
      date: 'June 6, 2016',
    },
    {
      title: (
        <>
          Major update of the <em>C. albicans</em> genome sequence at CGD
        </>
      ),
      content: (
        <>
          We have released a major sequence update for <em>C. albicans</em> SC5314 (Assembly 22,
          version s06-m01-r01). Based on reanalysis by CGD of all available sequence data, the
          update affects more than 300 features, correcting many ORF translation errors and
          resolving many sequence ambiguities. The specific sequence changes can be viewed on our{' '}
          <Link to="/genome-version-history">Chromosome History pages</Link>.
        </>
      ),
      date: 'February 2, 2016',
    },
  ],
  2015: [
    {
      title: (
        <>
          Updates to <em>C. glabrata</em> genome annotation
        </>
      ),
      content: (
        <>
          Multiple <em>C. glabrata</em> gene models were updated based on gene expression analysis
          conducted by Linde et al. (2015). 4,994 features were affected: 107 new features were
          added, including 49 protein-coding genes and 58 non-coding RNAs; 4 ORFs were deleted; the
          sequences for 132 features were extended and 10 shortened. For a list of updates, see the{' '}
          <a
            href="http://www.candidagenome.org/download/systematic_results/Linde_2015/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Supplementary Table
          </a>
          .
        </>
      ),
      date: 'April 15, 2015',
    },
  ],
  2014: [
    {
      title: 'CGD Grant Renewal and Survey',
      content: (
        <>
          Our renewal of CGD's R01 grant was unsuccessful, so we are currently working on a
          resubmission, which is due at the NIH on March 5th. In order to convincingly demonstrate
          the importance of CGD to the community, we ask that our users provide us with letters of
          support to accompany the application - please highlight how you use CGD, and how its
          discontinued availability would impact your research. We also ask you to take a few
          minutes and fill out a{' '}
          <a
            href="https://www.surveymonkey.com/s/D35TKVC"
            target="_blank"
            rel="noopener noreferrer"
          >
            survey
          </a>{' '}
          that will help us to identify specific needs of the community. We will greatly appreciate
          if you can email{' '}
          <a href="mailto:candida-curator@lists.stanford.edu">candida-curator@lists.stanford.edu</a>{' '}
          letters of support and complete the survey by February 15.
        </>
      ),
      date: 'January 22, 2014',
    },
    {
      title: (
        <>
          Assembly 22 of the <em>C. albicans</em> genome sequence
        </>
      ),
      content: (
        <>
          We are pleased to announce that Assembly 22 of the <em>C. albicans</em> SC5314 genome
          sequence has now become available at CGD, fully integrated into the CGD environment.
          Taking advantage of next-generation sequencing and achieving nearly 700-fold coverage,
          this phased, diploid assembly permits more sensitive, allele-specific analysis of the
          genome structure and function. Assembly 22 supersedes the previous Assembly 21 as the
          default genome sequence for <em>C. albicans</em> SC5314.
        </>
      ),
      date: 'June 27, 2014',
    },
    {
      title: 'Introducing GeneXplorer for CGD',
      content: (
        <>
          We have implemented GeneXplorer, a web tool for browsing and analysis of expression
          datasets and, so far, we have added microarray datasets from over 30 publications already
          archived at CGD.
        </>
      ),
      date: 'March 11, 2014',
    },
  ],
  2013: [
    {
      title: 'Peptide Atlas Links',
      content: (
        <>
          The Protein Information tab for each <em>Candida albicans</em> gene now links to
          experimental mass spectrometry data at the{' '}
          <a
            href="http://www.peptideatlas.org/overview.php"
            target="_blank"
            rel="noopener noreferrer"
          >
            Peptide Atlas
          </a>{' '}
          web site.
        </>
      ),
      date: 'December 4, 2013',
    },
    {
      title: 'Sequence trace files available',
      content: (
        <>
          We have added archival <em>Candida</em> sequence data from the{' '}
          <a
            href="http://www.ncbi.nlm.nih.gov/Traces/trace.cgi?view=list_arrivals"
            target="_blank"
            rel="noopener noreferrer"
          >
            NCBI TraceDB
          </a>{' '}
          site, and these data are now available from our{' '}
          <a
            href="http://www.candidagenome.org/download/sequence/NCBI/TraceDB/"
            target="_blank"
            rel="noopener noreferrer"
          >
            download site
          </a>
          .
        </>
      ),
      date: 'November 12, 2013',
    },
    {
      title: (
        <>
          <em>Aspergillus nidulans</em> and <em>Neurospora crassa</em> Orthologs
        </>
      ),
      content: (
        <>
          CGD Locus Summary pages now feature links to <em>Aspergillus nidulans</em> and{' '}
          <em>Neurospora crassa</em> orthologs alongside the links to{' '}
          <em>Schizosaccharomyces pombe</em> and <em>Saccharomyces cerevisiae</em> orthologs (see{' '}
          <Link to="/locus/ACT1">example</Link>). The new <em>A. nidulans</em> links lead to the
          ortholog's Locus Summary page at the{' '}
          <a href="http://www.aspgd.org" target="_blank" rel="noopener noreferrer">
            Aspergillus Genome Database
          </a>
          .
        </>
      ),
      date: 'August 13, 2013',
    },
    {
      title: (
        <>
          <em>C. dubliniensis</em> Data in CGD
        </>
      ),
      content: (
        <>
          We are pleased to announce that CGD is now hosting the <em>C. dubliniensis</em> CD36
          genome sequence and reference annotation. These data were formerly collected and
          maintained by the Sanger Institute's GeneDB resource. We provide Locus Summary pages for
          each <em>C. dubliniensis</em> gene (for example,{' '}
          <Link to="/locus/Cd36_01180">Cd36_01180</Link>), <Link to="/blast">BLAST</Link>, and the
          full suite of{' '}
          <a
            href="http://www.candidagenome.org/download/"
            target="_blank"
            rel="noopener noreferrer"
          >
            downloadable files
          </a>
          .
        </>
      ),
      date: 'April 30, 2013',
    },
    {
      title: 'Additions and Improvements to Datasets Available for Download at CGD',
      content: (
        <>
          CGD has added protein domain predictions for eight additional <em>Candida</em> strains
          including <em>C. albicans</em> WO-1, <em>C. dubliniensis</em> CD36,{' '}
          <em>C. guilliermondii</em> ATCC 6260, <em>C. lusitaniae</em> ATCC 42720, and more.
        </>
      ),
      date: 'January 24, 2013',
    },
  ],
  2012: [
    {
      title: 'CGD Infrastructure Improvements',
      content: (
        <>
          We are pleased to announce that the main CGD servers are back online, now housed in a new
          data facility that provides a faster network and more stable environment than the
          previous location.
        </>
      ),
      date: 'December 4, 2012',
    },
    {
      title: (
        <>
          Non-redundant library containing a total of 2,357 different <em>Candida albicans</em>{' '}
          mutants available
        </>
      ),
      content: (
        <>
          The National Research Council of Canada starts distributing a <em>Candida albicans</em>{' '}
          GRACE (gene replacement and conditional expression) library.
        </>
      ),
      date: 'November 6, 2012',
    },
    {
      title: 'Auto-suggest Feature in the CGD Quick Search',
      content: (
        <>
          We have added a new real-time suggestion feature to our Quick Search. As you type a query
          into the box, likely search terms from the database are now displayed in a pull-down menu
          below.
        </>
      ),
      date: 'August 1, 2012',
    },
    {
      title: 'CGD Orthologs Now Derived from CGOB',
      content: (
        <>
          We are pleased to announce that we are now using the curated synteny information provided
          by the <em>Candida</em> Gene Order Browser (
          <a href="http://cgob3.ucd.ie/" target="_blank" rel="noopener noreferrer">
            CGOB
          </a>
          ) for CGD's ortholog mappings among <em>Candida</em> species, and between{' '}
          <em>Candida</em> species and <em>S. cerevisiae</em>. The ortholog mappings between each
          pair of species are also available in our{' '}
          <a
            href="http://www.candidagenome.org/download/homology/"
            target="_blank"
            rel="noopener noreferrer"
          >
            download pages
          </a>
          .
        </>
      ),
      date: 'July 12, 2012',
    },
    {
      title: (
        <>
          <em>C. parapsilosis</em> Data in CGD
        </>
      ),
      content: (
        <>
          We are pleased to announce that we have now added <em>C. parapsilosis</em> information
          into CGD. <em>C. parapsilosis</em> is the third <em>Candida</em> species for which
          manually curated data are available in our database.
        </>
      ),
      date: 'March 15, 2012',
    },
  ],
  2011: [
    {
      title: 'Updated tRNA Annotation',
      content: (
        <>
          We have updated the annotation of <em>C. albicans</em> and <em>C. glabrata</em> tRNA
          genes, based on predictions using tRNAscan-SE and comparisons with{' '}
          <em>S. cerevisiae</em> homologs. In addition, tRNA names and aliases have been updated,
          as outlined in the <Link to="/nomenclature">CGD Nomenclature Guide</Link>.
        </>
      ),
      date: 'July 25, 2011',
    },
    {
      title: (
        <>
          11th ASM Conference on <em>Candida</em> and Candidiasis
        </>
      ),
      content: (
        <>
          The 11th ASM Conference on <em>Candida</em> and Candidiasis will take place from March 29
          to April 2, 2012 at the San Francisco Hyatt.
        </>
      ),
      date: 'July 25, 2011',
    },
    {
      title: (
        <>
          Introducing Multispecies CGD, with <em>C. glabrata</em> and <em>C. albicans</em> Curation
        </>
      ),
      content: (
        <>
          We are pleased to announce that we have now fully integrated <em>C. glabrata</em>{' '}
          information into CGD. We have curated the entire published experimental literature that
          describes <em>C. glabrata</em> genes, as well as the <em>C. albicans</em> literature.
          Each <em>C. glabrata</em> CBS138 gene has its own Locus Summary page in CGD (see, for
          example, the <Link to="/locus/CAGL0M01760g"><em>C. glabrata</em> CDR1/CAGL0M01760g</Link>{' '}
          Locus Summary page). We have also implemented a{' '}
          <Link to="/blast">multispecies BLAST tool</Link>. Genome Snapshots are provided for both{' '}
          <Link to="/genome-snapshot/C_albicans_SC5314"><em>C. albicans</em></Link> and{' '}
          <Link to="/genome-snapshot/C_glabrata_CBS138"><em>C. glabrata</em></Link>.
        </>
      ),
      date: 'June, 2011',
    },
    {
      title: 'CGD is on Facebook',
      content: (
        <>
          CGD now has its own{' '}
          <a
            href="https://www.facebook.com/pages/Candida-Genome-Database/173482099381649"
            target="_blank"
            rel="noopener noreferrer"
          >
            page on Facebook
          </a>
          , where we will post occasional updates and announcements.
        </>
      ),
      date: 'July 8, 2011',
    },
    {
      title: 'Links to PhylomeDB phylogenetic gene trees',
      content: (
        <>
          We have added links from CGD to phylogenetic gene tree pages in{' '}
          <a href="http://phylomedb.org/" target="_blank" rel="noopener noreferrer">
            PhylomeDB
          </a>
          . PhylomeDB is a public database of gene phylogenies for exploration of the evolutionary
          history of genes.
        </>
      ),
      date: 'April 5, 2011',
    },
  ],
  2010: [
    {
      title: (
        <>
          Description lines for uncharacterized gene products, based on <em>S. cerevisiae</em>{' '}
          orthologs
        </>
      ),
      content: (
        <>
          For genes that lack experimental characterization, but which have characterized orthologs
          in <em>S. cerevisiae</em>, we have now added Description lines to the CGD Locus Summary
          pages.
        </>
      ),
      date: 'November 19, 2010',
    },
    {
      title: 'Sellam et al. (2010) data added to CGD',
      content: (
        <>
          A set of new data from a genome-wide experimental annotation study by Sellam et al.
          (2010) has been added to CGD. Displayed as a GBrowse track are 2,172 previously unknown
          transcribed regions. All datafiles are available at the{' '}
          <a
            href="http://www.candidagenome.org/download/systematic_results/Sellam_2010/"
            target="_blank"
            rel="noopener noreferrer"
          >
            download directory
          </a>
          .
        </>
      ),
      date: 'October 12, 2010',
    },
    {
      title: (
        <>
          New <em>Candida albicans</em> Strains page at CGD
        </>
      ),
      content: (
        <>
          We have added a <Link to="/strains">"<em>Candida albicans</em> Strains" page</Link> to
          CGD, with brief descriptions and references for some of the more commonly used laboratory
          strains, as well as a lineage diagram. If you would like to suggest additions,
          corrections, or updates to this list, please{' '}
          <Link to="/contact">send a message to CGD curators</Link> with details.
        </>
      ),
      date: 'July 21, 2010',
    },
    {
      title: (
        <>
          Highlights in <em>Candida</em> Biology
        </>
      ),
      content: (
        <>
          A <Link to="/topic-biblios">new bibliography resource</Link> is now available at CGD.
          Curators have compiled a set of references on a variety of topics relevant to{' '}
          <em>Candida</em> biology. The reference lists are intended to provide a brief overview of
          each subject area, including many key reviews.
        </>
      ),
      date: 'July 15, 2010',
    },
    {
      title: (
        <>
          Sequences for Additional <em>Candida</em>-related Species and Strains Now Available
        </>
      ),
      content: (
        <>
          CGD now provides for download sequences from several <em>Candida</em> and{' '}
          <em>Candida</em>-related species and strains in addition to <em>C. albicans</em> SC5314.
          All sequences are available on the{' '}
          <a
            href="http://candidagenome.org/download/sequence/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sequence Downloads Page
          </a>
          . See the <Link to="/help/sequence">Sequence Help Page</Link> for additional information.
        </>
      ),
      date: 'July 8, 2010',
    },
    {
      title: (
        <>
          CGD now contains comprehensive Gene Ontology annotations for <em>C. albicans</em> gene
          products
        </>
      ),
      content: (
        <>
          CGD curators have reviewed all of the gene-specific literature for{' '}
          <em>C. albicans</em> and are curating the new literature on an ongoing basis. CGD is now
          "GO complete", meaning that each gene product has a GO annotation in each of the three GO
          aspects.
        </>
      ),
      date: 'March 11, 2010',
    },
    {
      title: 'Expanded phenotype data and new curation system in CGD',
      content: (
        <>
          CGD is now releasing our improved and expanded mutant phenotype pages. We have
          implemented a controlled-vocabulary system for phenotype curation that is already in use
          by{' '}
          <a href="http://www.aspgd.org" target="_blank" rel="noopener noreferrer">
            AspGD
          </a>{' '}
          and{' '}
          <a href="http://www.yeastgenome.org" target="_blank" rel="noopener noreferrer">
            SGD
          </a>
          .
        </>
      ),
      date: 'February 24, 2010',
    },
    {
      title: 'CGD Protein Information Pages now available',
      content: (
        <>
          CGD has expanded to include protein information for all verified and predicted ORFs.
          Using software and database tools developed at the{' '}
          <a href="http://www.yeastgenome.org" target="_blank" rel="noopener noreferrer">
            Saccharomyces Genome Database (SGD)
          </a>
          , the Protein Information Pages display basic property, domain organization, structural
          and homology information.
        </>
      ),
      date: 'February 5, 2010',
    },
  ],
  2009: [
    {
      title: (
        <>
          Registration now open for the 10th ASM Conference on <em>Candida</em> and Candidiasis
        </>
      ),
      content: (
        <>
          The 10th ASM Conference on <em>Candida</em> and Candidiasis will take place from March
          22-26, 2010, at the Hyatt Regency in Miami, Florida.
        </>
      ),
      date: 'December 17, 2009',
    },
    {
      title: 'CGD paper in Nucleic Acids Research Database Issue',
      content: (
        <>
          A paper entitled{' '}
          <a
            href="http://nar.oxfordjournals.org/cgi/content/full/gkp836v1"
            target="_blank"
            rel="noopener noreferrer"
          >
            "New tools at the <em>Candida</em> Genome Database: biochemical pathways and full-text
            literature search"
          </a>{' '}
          will appear in the 2010 Database Issue of Nucleic Acids Research.
        </>
      ),
      date: 'October 7, 2009',
    },
    {
      title: (
        <>
          Three new resources for the <em>Candida</em> community
        </>
      ),
      content: (
        <>
          Carol Munro, University of Aberdeen, and Christophe d'Enfert, Institut Pasteur, have
          recently received funding from the Wellcome Trust, UK to create three new resources for
          the <em>Candida</em> community.
        </>
      ),
      date: 'September 29, 2009',
    },
    {
      title: (
        <>
          Search full text of <em>Candida</em> journal articles with Textpresso
        </>
      ),
      content: (
        <>
          A full-text literature search capability has now been added to CGD. The literature search
          tool is powered by{' '}
          <a href="http://www.textpresso.org/" target="_blank" rel="noopener noreferrer">
            Textpresso
          </a>
          , a text-mining tool developed at Wormbase.
        </>
      ),
      date: 'April 14, 2009',
    },
    {
      title: 'CGD grant renewal',
      content: (
        <>
          We are very pleased to announce that the National Institute of Dental & Craniofacial
          Research at the US National Institutes of Health has renewed the grant that funds CGD.
        </>
      ),
      date: 'April 2, 2009',
    },
  ],
  2008: [
    {
      title: 'New Genome Snapshot resource',
      content: (
        <>
          We have created a resource,{' '}
          <Link to="/genome-snapshot/C_albicans_SC5314">Genome Snapshot</Link>, that provides a
          daily count of <em>C. albicans</em> genomic features and a summary of Gene Ontology (GO)
          annotations.
        </>
      ),
      date: 'December 3, 2008',
    },
    {
      title: 'CGD usage: Two million hits',
      content: (
        <>
          The CGD web site has been accessed over 2,000,000 times, and as we celebrate this
          milestone, CGD would like to thank the <em>Candida</em> research community for your
          continued support.
        </>
      ),
      date: 'November 11, 2008',
    },
    {
      title: 'Multiple updates to Assembly 21 sequence and annotation',
      content: (
        <>
          In collaboration with Mike Lin, Christina Cuomo, Manolis Kellis, and their colleagues at
          the Broad Institute, we have employed 100 Mb of new sequence data for{' '}
          <em>C. albicans</em> strain SC5314 and a comparative genomic analysis of 8 closely
          related species to make hundreds of updates to the Assembly 21 reference sequence.
        </>
      ),
      date: 'November 7, 2008',
    },
    {
      title: (
        <>
          <em>Candida</em> Biochemical Pathways are now available at CGD
        </>
      ),
      content: (
        <>
          Graphical, interactive displays of <em>Candida</em> biochemical pathways are now
          available at CGD. The pathways were created using the{' '}
          <a
            href="http://bioinformatics.ai.sri.com/ptools/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pathway Tools
          </a>{' '}
          software developed at SRI International.
        </>
      ),
      date: 'March 13, 2008',
    },
  ],
  2007: [
    {
      title: 'New Features at CGD',
      content: (
        <>
          We are very pleased to announce significant enhancements to our web site, which have been
          implemented in collaboration with the{' '}
          <a href="http://www.yeastgenome.org" target="_blank" rel="noopener noreferrer">
            <em>Saccharomyces</em> Genome Database
          </a>
          . Highlights include Tabbed Browsing of Locus Information,{' '}
          <Link to="/feature-search">Advanced Search</Link>,{' '}
          <Link to="/batch-download">Batch Download</Link>,{' '}
          <Link to="/seq-tools">Gene/Sequence Resources</Link>,{' '}
          <Link to="/patmatch">Pattern Matching</Link>, and{' '}
          <Link to="/webprimer">Primer Design Tool</Link>.
        </>
      ),
      date: 'December 4, 2007',
    },
    {
      title: (
        <>
          Assembly 21 of the <em>C. albicans</em> genome sequence
        </>
      ),
      content: (
        <>
          We are pleased to announce that Assembly 21 of the <em>C. albicans</em> genome sequence
          is now fully integrated and available at CGD. This assembly resolves the issues in
          Assembly 20 due to the incorporation of WO-1 genome sequence.
        </>
      ),
      date: 'September 21, 2007',
    },
    {
      title: 'CGD paper published in Nucleic Acids Research Database Issue',
      content: (
        <>
          A paper entitled "Sequence resources at the <em>Candida</em> Genome Database" has been
          published in the open-access online 2007 Database Issue of Nucleic Acids Research.
        </>
      ),
      date: 'January 9, 2007',
    },
  ],
  2006: [
    {
      title: (
        <>
          Assembly 20 of the <em>C. albicans</em> genome sequence
        </>
      ),
      content: (
        <>
          We are pleased to announce that Assembly 20 of the <em>C. albicans</em> genome sequence
          is now available at CGD. This new assembly was a collaborative effort of groups at the
          Biotechnology Research Institute of the National Research Council of Canada, the
          University of Minnesota, and Chiba University of Japan.
        </>
      ),
      date: 'September 14, 2006',
    },
    {
      title: 'CGD usage: Half a million hits',
      content: (
        <>
          The number of CGD database accesses has now passed 500,000 in total. As we celebrate this
          milestone, CGD would like to thank the <em>Candida</em> research community for your
          support.
        </>
      ),
      date: 'November 3, 2006',
    },
  ],
  2005: [
    {
      title: 'Large-scale datasets archived at CGD',
      content: (
        <>
          We have added an archive of large-scale datasets to our{' '}
          <a
            href="http://www.candidagenome.org/download/"
            target="_blank"
            rel="noopener noreferrer"
          >
            ftp site
          </a>
          . The data are obtained from published and publicly accessible supplements.
        </>
      ),
      date: 'December 22, 2005',
    },
    {
      title: (
        <>
          Links to <em>S. cerevisiae</em> orthologs added to CGD
        </>
      ),
      content: (
        <>
          CGD now includes links to <em>S. cerevisiae</em> orthologs of <em>C. albicans</em> genes.
          Ortholog gene names appear on the Locus Pages and are hyperlinked to the corresponding
          Locus Pages at the{' '}
          <a href="http://www.yeastgenome.org" target="_blank" rel="noopener noreferrer">
            <em>Saccharomyces</em> Genome Database (SGD)
          </a>
          .
        </>
      ),
      date: 'August 15, 2005',
    },
    {
      title: (
        <>
          <em>C. albicans</em> genome annotation paper is published
        </>
      ),
      content: (
        <>
          The manual annotation of the <em>Candida albicans</em> genome by the Annotation Working
          Group is described in a new paper by B. R. Braun et al., entitled{' '}
          <a
            href="https://journals.plos.org/plosgenetics/article?id=10.1371/journal.pgen.0010001"
            target="_blank"
            rel="noopener noreferrer"
          >
            "A Human-Curated Annotation of the <em>Candida albicans</em> Genome."
          </a>{' '}
          The paper is published in the inaugural issue of PLoS-Genetics.
        </>
      ),
      date: 'August 2, 2005',
    },
    {
      title: 'DNA and Protein Sequence in CGD',
      content: (
        <>
          We are pleased to announce that <em>C. albicans</em> sequence information is now
          available in CGD. DNA and protein sequence for any ORF may be viewed using the new
          "Retrieve Sequences" menu on the right-hand sidebar of any Locus Page.
        </>
      ),
      date: 'April 25, 2005',
    },
    {
      title: 'CGD paper is published in Nucleic Acids Research',
      content: (
        <>
          A paper describing the <em>Candida</em> Genome Database has been published in the{' '}
          <a
            href="https://academic.oup.com/nar/article/33/suppl_1/D532/2505237"
            target="_blank"
            rel="noopener noreferrer"
          >
            Nucleic Acids Research 2005 Database Issue
          </a>
          . The paper is entitled "The <em>Candida</em> Genome Database (CGD), a community resource
          for <em>Candida albicans</em> gene and protein information."
        </>
      ),
      date: 'January 3, 2005',
    },
  ],
  2004: [
    {
      title: 'CGD GO Annotations File is now available',
      content: (
        <>
          We are pleased to announce that all of the CGD Gene Ontology (GO) curation is now
          available for{' '}
          <a
            href="http://www.candidagenome.org/download/go/"
            target="_blank"
            rel="noopener noreferrer"
          >
            download
          </a>
          . This CGD GO Annotations File is updated daily to reflect the very latest curation in
          CGD.
        </>
      ),
      date: 'November 17, 2004',
    },
    {
      title: 'CGD Gene Registry is now available',
      content: (
        <>
          CGD is ready to provide a <Link to="/gene-registry">gene name registry</Link> for the{' '}
          <em>Candida</em> research community. As agreed by the community at the ASM Conference on
          Candida and Candidiasis in March 2004, all new genetic names for <em>C. albicans</em>{' '}
          genes should be reserved through the gene registry before publication.
        </>
      ),
      date: 'November 12, 2004',
    },
    {
      title: 'CGD Colleague Registry is now available',
      content: (
        <>
          CGD is ready to serve as a directory for the <em>Candida</em> research community. You may
          submit information about your research interests, and contact information, to CGD using
          the <Link to="/colleague-update">Colleague Submission/Update form</Link>.
        </>
      ),
      date: 'September 7, 2004',
    },
    {
      title: (
        <>
          Announcing the <em>Candida</em> Genome Database
        </>
      ),
      content: (
        <>
          CGD is now available online. At this time, CGD contains more than 900 gene product
          description lines, and approximately 1,500 mutant phenotype descriptions and 1,500 Gene
          Ontology (GO) term assignments, all based on literature curation.
        </>
      ),
      date: 'August 13, 2004',
    },
    {
      title: (
        <>
          <em>C. albicans</em> genome sequence publication now available
        </>
      ),
      content: (
        <>
          A publication describing the <em>C. albicans</em> genomic sequence, from the{' '}
          <em>Candida</em> sequencing project group at the Stanford Genome Technology Center, has
          just appeared in PNAS.
        </>
      ),
      date: 'May 12, 2004',
    },
    {
      title: 'CGD project to start April 1, 2004',
      content: (
        <>
          A project to create a freely accessible community database for genomic, gene, and protein
          information for <em>Candida albicans</em> will begin on April 1, 2004. We hope to be
          online by the end of July 2004.
        </>
      ),
      date: 'March 12, 2004',
    },
  ],
};

// Get all years sorted in descending order
const YEARS = Object.keys(NEWS_BY_YEAR)
  .map(Number)
  .sort((a, b) => b - a);

function NewsArchivePage() {
  return (
    <div className="news-archive-page">
      <div className="news-archive-header">
        <h1>CGD News Archive</h1>
        <p className="back-link">
          <Link to="/">Return to Home</Link>
        </p>
      </div>

      <div className="news-archive-content">
        {YEARS.map((year) => (
          <section key={year} className="year-section">
            <h2 className="year-title">{year} CGD News Archive</h2>
            <hr />
            {NEWS_BY_YEAR[year].map((item, index) => (
              <article key={index} className="archive-news-item">
                <h3>{item.title}</h3>
                <div className="archive-news-content">{item.content}</div>
                {item.date && <p className="archive-news-date">(Posted {item.date})</p>}
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

export default NewsArchivePage;
