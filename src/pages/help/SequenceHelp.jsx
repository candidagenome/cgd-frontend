import React from 'react';
import { Link } from 'react-router-dom';
import '../InfoPages.css';

const SequenceHelp = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>The Candida Genome Database: Sequence Documentation</h1>
        <hr />

        <p style={{ textAlign: 'center' }}>
          This page provides information about the DNA and protein sequences in CGD, including their
          sources, how to access them, and further explanation of some sequence-related issues.
        </p>

        <div className="info-section">
          <h2>Contents</h2>
          <ul>
            <li><a href="#species">Information about <em>Candida</em>-related strains and species in CGD</a></li>
            <li><a href="#source">Sources of sequence-based information in CGD</a></li>
            <li><a href="#versions">Version Tracking for Chromosomal Sequence and Genome Annotation</a></li>
            <li>
              <a href="#header"><em>C. albicans</em> SC5314 Genome Sequence Assemblies</a>
              <ul>
                <li>
                  <a href="#Refinements">Refinements to Assembly 21 in CGD</a>
                  <ul>
                    <li><a href="#analysis">Sequence analysis</a></li>
                    <li><a href="#correction">Sequence correction</a></li>
                    <li><a href="#classification">ORF classification</a></li>
                  </ul>
                </li>
                <li>
                  <a href="#A21inCGD">Assembly 21 in CGD</a>
                  <ul>
                    <li><a href="#introns">Intron annotation</a></li>
                    <li><a href="#adjustments">Non-intron adjustments to ORF coordinates</a></li>
                    <li><a href="#TRNA">Translation and tRNAs</a></li>
                  </ul>
                </li>
                <li><a href="#A20inCGD">Assembly 20 in CGD</a></li>
                <li><a href="#A19inCGD">Assembly 19 in CGD</a></li>
                <li><a href="#SGTCseqinfo6">Assembly 6 in CGD</a></li>
              </ul>
            </li>
            <li><a href="#SNPs">Sources of SNP data</a></li>
            <li><a href="#access">Accessing Sequences in CGD</a></li>
          </ul>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />

        <div className="info-section" id="species">
          <h2>Information about <em>Candida</em>-related strains and species in CGD</h2>
          <p>
            CGD provides sequence for download from several <em>Candida</em>-related strains and species,{' '}
            <a href="#source">listed below</a>. Initially, CGD curation was focused on the{' '}
            <em>C. albicans</em> literature, because <em>C. albicans</em> serves as a genetic model for
            the other <em>Candida</em>-related species, and it is the most well-represented of these
            species in the published experimental literature. As of June, 2011, we have also added curated
            information about <em>C. glabrata</em>. We are now expanding the manual curation process to
            include information about other <em>Candida</em>-related species, and will be adding gene-based
            information for them, including Locus Summary pages.
          </p>
          <p>
            The <em>C. albicans</em> SC5314 sequence file names, as well as chromosome identifiers within
            the files, were updated on 25 August 2010 to include the name of the species and strain. This
            change was necessary to accommodate multiple <em>Candida</em> and <em>Candida</em>-related
            species and strains at CGD.
          </p>
          <p>
            Note: <em>Candida albicans</em> and some related species (often called the "CTG clade") use a
            non-standard genetic code, "Translation table 12: Alternative Yeast Nuclear Code," to translate
            nuclear genes. For more information about translation tables used in CGD, please see the{' '}
            <Link to="/help/code-tables">Non-standard Genetic Code Usage in <em>Candida</em></Link> help page.
          </p>
        </div>

        <div className="info-section" id="source">
          <h2>Sources of sequence-based information in CGD</h2>
          <ul>
            <li>
              <em>Candida albicans</em> SC5314 was sequenced by the Stanford Genome Technology Center
              (Jones et al., 2004, PNAS 101:7329-7334) and the Biotechnology Research Institute of the
              National Research Council of Canada (Hoog et al., 2007, Genome Biol 8:R52). Please see{' '}
              <a href="#header">the assembly information below</a> for more details.
            </li>
            <li>
              <em>Candida albicans</em> WO-1 was sequenced by the Broad Institute (Butler et al. 2009,
              Nature 459:657-662). Sequence and annotation obtained by CGD from{' '}
              <a href="http://www.broadinstitute.org/annotation/genome/candida_group/MultiDownloads.html" target="_blank" rel="noopener noreferrer">
                The Broad Institute
              </a>.
            </li>
            <li>
              <em>Candida auris</em> B8441 was sequenced by the Centers for Disease Control and Prevention
              (Lockhart et al. 2017, Clinical Infectious Diseases 2017:64:134-140). Sequence and annotation
              obtained by CGD from{' '}
              <a href="https://www.ncbi.nlm.nih.gov/assembly/GCA_002759435.2" target="_blank" rel="noopener noreferrer">
                GenBank
              </a>.
            </li>
            <li>
              <em>Candida dubliniensis</em> CD36 was sequenced by the Wellcome Trust Sanger Institute
              (Jackson et al., 2009, Genome Res. 19:2231-2244). Sequence and annotation obtained by CGD from{' '}
              <a href="http://www.ebi.ac.uk/ena/data/view/Project:34697" target="_blank" rel="noopener noreferrer">
                EBI
              </a>.
            </li>
            <li>
              <em>Candida glabrata</em> CBS138 was originally sequenced by Genolevures (Dujon et al., 2004,
              Nature 430:35-44; Koszul et al., 2003, FEBS Lett. 534(1-3):39-48). The genome was later
              re-assembled, leveraging long-read sequencing to correct errors in repetitive regions
              (Xu et al., 2020, Mol Microbiol 113:1209-1224). Please note that the alternate designations{' '}
              <a href="http://www.atcc.org/ATCCAdvancedCatalogSearch/ProductDetails/tabid/452/Default.aspx?ATCCNum=2001&Template=fungiYeast" target="_blank" rel="noopener noreferrer">
                ATCC 2001
              </a>{' '}
              and CBS138 refer to the same strain of <em>C. glabrata</em>.
            </li>
            <li>
              <em>Candida guilliermondii</em> ATCC 6260 was sequenced by the Broad Institute (Butler et al.
              2009, Nature 459:657-662). Sequence and annotation obtained by CGD from{' '}
              <a href="http://www.broadinstitute.org/annotation/genome/candida_group/MultiDownloads.html" target="_blank" rel="noopener noreferrer">
                The Broad Institute
              </a>.
            </li>
            <li>
              <em>Candida lusitaniae</em> ATCC 42720 was sequenced by the Broad Institute (Butler et al.
              2009, Nature 459:657-662). Sequence and annotation obtained by CGD from{' '}
              <a href="http://www.broadinstitute.org/annotation/genome/candida_group/MultiDownloads.html" target="_blank" rel="noopener noreferrer">
                The Broad Institute
              </a>.
            </li>
            <li>
              <em>Candida orthopsilosis</em> Co 90-125 was sequenced as described by Riccombeni et al., 2012
              (PLoS ONE 7(4): e35750). Sequence and annotation obtained by CGD on 5/15/2012 from{' '}
              <a href="http://www.ebi.ac.uk/ena/data/view/display=html&PRJEA83665" target="_blank" rel="noopener noreferrer">
                EBI
              </a>.
            </li>
            <li>
              <em>Candida parapsilosis</em> CDC 317 was sequenced by the Wellcome Trust Sanger Institute
              (Butler et al. 2009, Nature 459:657-662). Sequence and annotation obtained by CGD from{' '}
              <a href="http://www.ncbi.nlm.nih.gov/bioproject?Db=nuccore&DbFrom=bioproject&Cmd=Link&IdsFromResult=32889" target="_blank" rel="noopener noreferrer">
                GenBank
              </a>.
            </li>
            <li>
              <em>Candida tropicalis</em> MYA-3404 was sequenced by the Broad Institute (Butler et al. 2009,
              Nature 459:657-662). Sequence and annotation obtained by CGD from{' '}
              <a href="http://www.broadinstitute.org/annotation/genome/candida_group/MultiDownloads.html" target="_blank" rel="noopener noreferrer">
                The Broad Institute
              </a>.
            </li>
            <li>
              <em>Debaryomyces hansenii</em> CBS767 was sequenced by Genolevures (DuJon et al., 2004, Nature
              430:35-44). Sequence and annotation obtained by CGD from{' '}
              <a href="http://www.ebi.ac.uk/ena/data/view/Project:13832" target="_blank" rel="noopener noreferrer">
                EBI
              </a>.
            </li>
            <li>
              <em>Lodderomyces elongisporus</em> NRLL YB-4239 was sequenced by the Broad Institute (Butler
              et al. 2009, Nature 459:657-662). Sequence and annotation obtained by CGD from{' '}
              <a href="http://www.broadinstitute.org/annotation/genome/candida_group/MultiDownloads.html" target="_blank" rel="noopener noreferrer">
                The Broad Institute
              </a>.
            </li>
          </ul>
        </div>

        <div className="info-section" id="versions">
          <h2>Version Tracking for Chromosomal Sequence and Genome Annotation</h2>
          <p>
            The version designation appears in the name of each of the relevant sequence files that are
            available at CGD, so the exact source of the sequence data is always clear. This version system
            was implemented for <em>C. albicans</em> SC5314 and <em>C. glabrata</em> CBS138 in CGD as of
            June 2011, and it is based on the system designed for tracking of the <em>A. nidulans</em>{' '}
            sequence and annotation versions in{' '}
            <a href="http://www.aspergillusgenome.org" target="_blank" rel="noopener noreferrer">AspGD</a>.
            The same system of version designation will be used for version tracking for the chromosomal
            sequence and genome annotation of other species, as they are added into CGD.
          </p>
          <p>
            Version designations appear in the following format:<br />
            sXX-mYY-rZZ<br />
            as described in detail{' '}
            <a href="/cgi-bin/reference/reference.pl?dbid=CAL0000143461" target="_blank" rel="noopener noreferrer">
              here
            </a>.
          </p>
          <p>
            A list of all of each of the versions of the sequence and annotation for each species, with
            release notes, is listed on the{' '}
            <a href="http://candidagenome.org/cgi-bin/genomeVersionHistory.pl" target="_blank" rel="noopener noreferrer">
              Summary of Genome Versions page
            </a>.
          </p>
          <p>
            Information about every update to the chromosome sequence and/or chromosomal location of any
            gene (or other annotated feature) is displayed on the CGD Locus History page for each of the
            relevant genes, and also on the appropriate{' '}
            <a href="/cgi-bin/chromosomeHistory.pl" target="_blank" rel="noopener noreferrer">
              CGD Chromosome History
            </a>{' '}
            page.
          </p>
          <p>
            Please feel free to <Link to="/contact">contact us</Link> with any questions.
          </p>
        </div>

        <div className="info-section" id="header">
          <h2><em>C. albicans</em> SC5314 Genome Sequence Assemblies</h2>
        </div>

        <div className="info-section" id="Refinements">
          <h3>Refinements to Assembly 21 in CGD (November 2008)</h3>

          <h4>Update</h4>
          <p>
            The paper describing the comparative genomic analysis that was the basis for the refinements
            to Assembly 21 performed in 2008 has now been published (
            <a href="/cgi-bin/reference/reference.pl?pubmed=19465905" target="_blank" rel="noopener noreferrer">
              Butler, G., et al.
            </a>{' '}
            [2009] Nature).
          </p>

          <h4 id="analysis">Sequence analysis</h4>
          <p>
            In a collaboration between CGD and the Broad Institute, MIT, a targeted re-analysis of{' '}
            <em>Candida albicans</em> genome sequence and annotation has been performed using new
            comparative genome analysis data and newly generated sequence data. A comparative genome
            analysis was done by Mike Lin, Christina Cuomo, Manolis Kellis, and colleagues at the Broad
            Institute, who compared the genome sequences of <em>Candida albicans</em> SC5314,{' '}
            <em>Candida albicans</em> WO-1, <em>Candida dubliniensis</em>, <em>Candida tropicalis</em>,{' '}
            <em>Candida parapsilosis</em>, <em>Lodderomyces elongisporus</em>, <em>Debaryomyces hansenii</em>,{' '}
            <em>Candida guilliermondii</em>, and <em>Candida lusitaniae</em> (Butler et al., submitted).
            Their analysis identified many conserved genomic regions corresponding to potential new ORFs,
            as well as regions of no significant conservation that are annotated as ORFs, which were
            candidates for "Dubious" classification. It also revealed several ORFs with incorrectly
            annotated boundaries, as well as possible sequencing errors that had led to incorrect ORF
            assignments. The Annotation Working Group had also previously identified suspected sequencing
            errors, and many ORFs in CGD contained "adjustments" (artificial sequence changes), which were
            added to compensate for such presumed errors and to restore ORF integrity. CGD staff inspected
            each of the areas identified by the Broad Institute group and by the Annotation Working Group.
          </p>

          <h4 id="correction">Sequence correction</h4>
          <p>
            Each of the regions containing suspected sequence errors was re-evaluated using sequence trace
            data from two sources: (1) the trace archive from the Stanford Genome Technology Center, which
            was the starting point for Assembly 19, and (2) a set of new data that we generated using the
            454 Genome Sequencer 20 System starting with <em>C. albicans</em> SC5314 DNA supplied by Judith
            Berman. In each case, the Assembly 21 sequence was searched against all the traces and Assembly
            19 contigs using NCBI BLAST. The BLAST hits were aligned and manually curated, with the focus
            on correcting sequence errors that affect the open reading frame (insertions and deletions that
            cause frameshifts, and substitutions that affect in-frame stop codons). We did not address the
            sequence variations between different alleles of each ORF as part of this analysis. We reviewed
            the potential errors, removed the ORF "adjustments" in every case, and either corrected the
            sequence, where the sequence trace data supported making the change, or updated the ORF boundaries.
          </p>
          <p>
            As a result of this analysis, hundreds of sequence errors were corrected, which allowed us to
            update annotations for 530 ORFs, and 73 new ORFs identified in the comparative genome analysis
            were added to CGD. All artificial "adjustments" (arbitrary sequence changes made to correct
            presumed errors; see below) were removed from the sequence. The sequence and annotation changes
            made on each chromosome are listed on individual Chromosome History pages, which are linked from
            a{' '}
            <a href="/cgi-bin/chromosomeHistory.pl" target="_blank" rel="noopener noreferrer">Summary Table</a>.
            The detailed description of the methodology used in analysis and curation, as well as the summary
            of the results, is available in the{' '}
            <Link to="/help/refinements">Sequence Refinements, November 2008</Link> documentation.
          </p>
          <p>
            Note that sequence and annotation changes were made to Assembly 21 only, not to previous assemblies.
          </p>

          <h4 id="classification">ORF classification</h4>
          <p>
            As another result of this analysis, 181 non-conserved ORFs were identified whose sequence is
            indistinguishable from random non-coding sequence. These ORFs were classified in CGD as Dubious
            ORFs, unlikely to be biologically significant. The remaining ORFs in CGD were classified either
            as Verified, meaning that there is experimental evidence for the existence of a gene product (as
            defined by the ORF having curated Gene Ontology terms with experimental evidence codes, i.e.,
            evidence codes other than IEA, ISS, RCA, ISA, ISM, ISO, NAS), or as Uncharacterized, meaning that
            no experimental evidence currently exists but that the ORFs are likely to represent biologically
            significant genes. These classifications are displayed on the Locus Summary page of each ORF, and
            may be changed in the future as new experimental evidence becomes available.
          </p>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />

        <div className="info-section" id="A21inCGD">
          <h3>Assembly 21 in CGD (September 2007)</h3>
          <p>
            Assembly 21 (A21) is described in: van het Hoog M, et al. (2007) Assembly of the{' '}
            <em>Candida albicans</em> genome into sixteen supercontigs aligned on the eight chromosomes.
            Genome Biol 8(4):R52.{' '}
            <a href="http://genomebiology.com/2007/8/4/R52" target="_blank" rel="noopener noreferrer">
              URL: http://genomebiology.com/2007/8/4/R52
            </a>. In addition to making a chromosomal level assembly, by mapping the contigs of Assembly 19
            (A19) to chromosomes and filling many of the gaps between them, the authors also made numerous
            and widespread modifications to the genomic sequence based on alignments of the sequence traces
            generated by inputting the SGTC's sequence traces into Sequencher software. Many of these
            modifications introduced insertions, deletions, and substitutions relative to the Assembly 19
            sequence. In many cases A, C, T, or G was substituted with an ambiguous nucleotide; within ORFs,
            such ambiguous nucleotides consequently resulted in ambiguous amino acids in the predicted ORF
            translation, which is represented as an "X" within the A21 protein sequence.
          </p>
          <p>
            More information is available in{' '}
            <Link to="/help/assembly21">Assembly 21 Sequence Documentation</Link>.
          </p>

          <h4 id="introns">Intron annotation data</h4>
          <p>
            The intron data published in the paper<br />
            Mitrovich QM, Tuch BB, Guthrie C, Johnson AD.{' '}
            <a href="http://www.genome.org/cgi/content/full/17/4/492" target="_blank" rel="noopener noreferrer">
              Computational and experimental approaches double the number of known introns in the pathogenic
              yeast <em>Candida albicans</em>
            </a>. Genome Res. 2007 Apr;17(4):492-502<br />
            have been incorporated into Assembly 21 (and 20) in CGD. Assembly 19 coordinates have not been updated.
          </p>

          <h4 id="adjustments">Non-intron adjustments to ORF coordinates</h4>
          <p>
            In Assembly 21 (and 20), gaps that were introduced by the Annotation Working Group (AWG) to
            compensate for presumed sequencing errors that interrupt ORFs are labeled "Adjustments".
            "Adjustments" refer to gaps between regions of CDS that are NOT expected to be biologically
            significant introns. Adjustments with a length that is a negative number indicate an overlap
            between two regions of CDS, resulting in a duplication of the overlapping part of the sequence
            in the predicted ORF. In Assembly 19 all introns and adjustments are called Gaps.
          </p>
          <p>
            In November 2008, all the non-intron "adjustments" in Assembly 21 were removed, as explained in
            the <Link to="/help/refinements">Sequence Refinements, November 2008</Link> documentation.
          </p>
          <p>
            Summary files listing introns and non-intron adjustments are available from the{' '}
            <a href="/download/Assembly21notes/" target="_blank" rel="noopener noreferrer">CGD Downloads</a> site.
          </p>

          <h4 id="TRNA">Translation and tRNAs</h4>
          <p>
            The tRNA genes were predicted from the <em>C. albicans</em> genome sequence using the tRNAscan-SE
            algorithm developed by{' '}
            <a href="http://nar.oupjournals.org/cgi/content/full/25/5/955" target="_blank" rel="noopener noreferrer">
              T. M. Lowe and S. R. Eddy
            </a>. The process used is described here,{' '}
            <a href="/cgi-bin/reference/reference.pl?dbid=CAL0000142566" target="_blank" rel="noopener noreferrer">
              Annotation of tRNAs in the <em>Candida</em> Genome Database
            </a>.
          </p>
          <p>
            The <em>C. albicans</em> codon usage table may be accessed using the{' '}
            <a href="/download/sequence/misc/C_albicans_codon_usage.tab" target="_blank" rel="noopener noreferrer">
              link
            </a>{' '}
            in the left-hand menu bar of the CGD home page, under the heading "Download Data," or using the
            link on the Download Sequence page. This table displays the calculated frequency of use of each
            codon in the diploid complement of <em>C. albicans</em> protein-coding genes. The table was
            produced with the GCG program CodonFrequency using the diploid complement of all predicted coding
            sequences (13,117 open reading frames) from Assembly 19 of the <em>C. albicans</em> SC5314 genomic
            sequence, as found in the file 'orf_coding.fasta' dated 07-Jun-2005. Where the sequences of two
            alleles differ, both sequences were used to calculate codon usage. Where the sequences of two
            alleles were identical, two copies of the coding sequence were added to the pool of sequences used
            to calculate codon usage. Thus, codon usage was calculated from the entire diploid complement of
            protein-coding genes.
          </p>
          <p>
            Note that <em>C. albicans</em> uses an alternative genetic code for nuclear genes, different from
            that used by most other fungi. Details and links to translation tables for nuclear and mitochondrial
            genes can be found at{' '}
            <a href="http://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?mode=Info&id=237561&lvl=3&lin=f&keep=1&srchmode=1&unlock" target="_blank" rel="noopener noreferrer">
              NCBI's Taxonomy Browser
            </a>.
          </p>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />

        <div className="info-section" id="A20inCGD">
          <h3>Assembly 20 in CGD (September 2006)</h3>
          <p>
            Assembly 20 of the <em>C. albicans</em> sequence, released in May 2006, was a collaborative
            effort of groups at the Biotechnology Research Institute of the National Research Council,
            Canada; the University of Minnesota, USA; and Chiba University, Japan. After the release, it
            was discovered that the sequence traces that had been used to fill some of the gaps and
            determine overlaps between Assembly 19 contigs were derived from strain WO-1, rather than from
            the reference strain SC5314. The sequence of these regions is consequently expected to be
            inaccurate where WO-1 sequence was used, and small contigs may have been misassembled based on
            the WO-1 sequence data. The Biotechnology Research Institute of the National Research Council
            of Canada has since then released a new Assembly 21 that supersedes Assembly 20.
          </p>
          <p>
            More information is available in{' '}
            <Link to="/help/assembly20">Assembly 20 Sequence Documentation</Link>.
          </p>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />

        <div className="info-section" id="A19inCGD">
          <h3>Assembly 19 in CGD (March 2004)</h3>
          <p>
            The contig sequences in CGD are from Assembly 19 of the <em>C. albicans</em> genome sequence,
            from the supplementary material published in the <em>C. albicans</em> sequencing paper, Jones,
            T., Federspiel, N.A., Chibana, H., Dungan, J., Kalman, S., Magee, B.B., Newport, G., Thorstenson,
            Y.R., Agabian, N., Magee, P.T., Davis, R.W. and S. Scherer. (2004) The Diploid Genome of{' '}
            <em>Candida albicans</em>. PNAS 101:7329-7334. Supplementary data:{' '}
            <a href="http://genome-www.stanford.edu/candida-pnas2004-supplement/" target="_blank" rel="noopener noreferrer">
              http://genome-www.stanford.edu/candida-pnas2004-supplement/
            </a>. (Older sequence assemblies, including Assemblies 4, 5, and 6, have been archived at CGD.
            These data may be retrieved from the "archived_assemblies" folder on the{' '}
            <a href="/download/sequence/" target="_blank" rel="noopener noreferrer">CGD Sequence Download Page</a>.)
          </p>
          <p>
            More information is available in{' '}
            <Link to="/help/assembly19">Assembly 19 Sequence Documentation</Link>.
          </p>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />

        <div className="info-section" id="SGTCseqinfo6">
          <h3>Assembly 6 in CGD (January 2002)</h3>
          <p>
            This page contains documentation from the Stanford Genome Technology Center (SGTC), which was
            previously available on the SGTC's <em>Candida</em> information server, and has been archived{' '}
            <Link to="/help/assembly6">here</Link> (verbatim) for reference.
          </p>
          <p>
            Note: The original SC5314 sequence trace files and quality scores generated by the Stanford
            Genome Technology Center are available for{' '}
            <a href="/download/sequence/C_albicans_SC5314/Assembly19/SC3514_traces/" target="_blank" rel="noopener noreferrer">
              download
            </a>{' '}
            from CGD. The construction of the sequencing library and sequencing methods are described in{' '}
            <a href="http://www.pubmedcentral.nih.gov/articlerender.fcgi?tool=pubmed&pubmedid=11248064" target="_blank" rel="noopener noreferrer">
              Tzung et al. (2001)
            </a>.
          </p>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />

        <div className="info-section" id="SNPs">
          <h2>Sources of SNP data</h2>
          <p>
            Please note: This is not intended to be a comprehensive bibliography, rather, a list of a few
            helpful references:
          </p>
          <p>
            SNPs between allelic Assembly 19 contigs, <em>C. albicans</em> strain SC5314, are published in
            the Assembly 19 paper,{' '}
            <a href="http://www.pnas.org/content/101/19/7329.full" target="_blank" rel="noopener noreferrer">
              Jones et al. (2004)
            </a>, and these data are available for download as{' '}
            <a href="http://genome-www.stanford.edu/candida-pnas2004-supplement/" target="_blank" rel="noopener noreferrer">
              supplementary material
            </a>{' '}
            associated with the publication.
          </p>
          <p>
            SNP data for <em>C. albicans</em> from{' '}
            <a href="http://ec.asm.org/cgi/content/full/3/3/705" target="_blank" rel="noopener noreferrer">
              Forche et al. (2004)
            </a>{' '}
            are available in the{' '}
            <a href="http://ec.asm.org/cgi/content/full/3/3/705/DC1" target="_blank" rel="noopener noreferrer">
              supplementary material
            </a>{' '}
            associated with the paper and may be viewed using the SNP track in the CGD{' '}
            <a href="/cgi-bin/gbrowse2/gbrowse/candida_21/?ref=Ca21chrR_C_albicans_SC5314;start=1729234;stop=1794843;label=All-SNP-DNA-Translation;width=800;keystyle=between;grid=on" target="_blank" rel="noopener noreferrer">
              GBrowse genome browser
            </a>.
          </p>
          <p>
            SNP data are included among the data from{' '}
            <a href="/cgi-bin/reference/reference.pl?dbid=CAL0123622" target="_blank" rel="noopener noreferrer">
              Butler et al. (2009)
            </a>{' '}
            for eight <em>Candida</em> genomes, and are available for download as{' '}
            <a href="http://www.ncbi.nlm.nih.gov/pmc/articles/PMC2834264/?tool=pubmed" target="_blank" rel="noopener noreferrer">
              supplementary material
            </a>{' '}
            associated with the paper, and from the{' '}
            <a href="http://www.broadinstitute.org/annotation/genome/candida_group/MultiDownloads.html" target="_blank" rel="noopener noreferrer">
              Broad Institute website
            </a>.
          </p>
        </div>

        <hr style={{ width: '75%', margin: '20px auto' }} />

        <div className="info-section" id="access">
          <h2>Accessing Sequences in CGD</h2>

          <p><strong>From the Locus Summary Page:</strong></p>
          <p>
            The "Retrieve Sequences" pull-down menu, which is located on the Resources sidebar on the
            right-hand side of each Locus Summary Page, retrieves, for each gene in Assembly 21, or each
            allele in Assembly 19: the Genomic DNA (with introns included); the Coding Sequence (with
            introns removed); the Genomic DNA with 1 kb of flanking sequence upstream and downstream of
            the gene (also includes any introns); or the ORF translation (predicted protein sequence).
          </p>

          <p><strong>From the CGD Sequence Retrieval Tool:</strong></p>
          <p>
            To access the{' '}
            <a href="/cgi-bin/seqTools" target="_blank" rel="noopener noreferrer">Sequence Retrieval Tool</a>{' '}
            (also called Get Sequence, or Gene/Sequence Resources), use the link under Search Options on the
            left-hand sidebar of the <Link to="/">CGD Home Page</Link> or use the "Gene/ Sequence Resources"
            link under Specialized Gene and Sequence Searches on the{' '}
            <Link to="/search">Search Options page</Link>.
          </p>

          <p><strong>By Bulk Download</strong></p>
          <p>
            You may download gzip compressed sequence files in bulk from the{' '}
            <a href="/download/sequence/" target="_blank" rel="noopener noreferrer">CGD Sequence Download Page</a>;
            a variety of file options exist for retrieval of data from Assemblies 19, 20, and 21. There is a
            link to this page under Download Data on the left-hand sidebar of the{' '}
            <Link to="/">CGD Home Page</Link>. Archived copies of older sequence assemblies, including
            Assemblies 4, 5, and 6, may also be retrieved from the{' '}
            <a href="/download/sequence/" target="_blank" rel="noopener noreferrer">CGD Sequence Download Pages</a>.
          </p>
          <p>
            You may also retrieve sequence information for any set of genes (either specified by a list of
            gene names, or by selecting a region of a chromosome or contig) using the{' '}
            <Link to="/batch-download">Batch Download Tool</Link>.
          </p>

          <p><strong>From the GBrowse Genome Browser:</strong></p>
          <p>
            You may also view nucleotide or protein sequence using the GBrowse genome browser. GBrowse may
            be accessed using the "Chromosomal Location" or "Contig Location(s)" links, or the GBrowse map
            thumbnail views on each Locus page, or by using the "Genome Browser" links displayed on each{' '}
            <Link to="/help/blast-results">BLAST result</Link> page. Sequence download options are available
            from the Reports & Analysis pull-down menu in the interface. The{' '}
            <a href="/cgi-bin/gbrowse2/gbrowse/candida?help=general" target="_blank" rel="noopener noreferrer">
              GBrowse Help Documentation
            </a>{' '}
            page has additional instructions for use of the GBrowse interface.
          </p>

          <p><strong>Using BLAST (Basic Local Alignment Search Tool):</strong></p>
          <p>
            You may use the <Link to="/blast">CGD BLAST</Link> tool to conduct protein or DNA sequence
            searches against various sequence datasets in CGD, as described in detail on the{' '}
            <Link to="/help/blast">BLAST documentation page</Link>. Alignments of the query sequence with
            its sequence matches (also called "hits") are displayed along with hyperlinks to related
            sequence resources. The "CGD GBROWSE" hyperlink above each set of HSPs on the BLAST results
            page opens the GBrowse genome browser, with the HSP displayed in the browser window. GBrowse
            may be used to further explore the region containing the match: to view ORFs and other features
            in the neighborhood of the hit, to browse and download adjacent sequences, to view the 6-frame
            translation of the region, and to view restriction sites. (For a description of GBrowse
            features, please see our{' '}
            <a href="/cgi-bin/gbrowse2/gbrowse/candida?help=general" target="_blank" rel="noopener noreferrer">
              GBrowse documentation
            </a>). If applicable, links are provided to directly download/view the entire ORF or peptide
            sequence, or to navigate to the corresponding Locus page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SequenceHelp;
