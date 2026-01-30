import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const CommunityNewsPage = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1><em>Candida</em> Community News</h1>
        <hr />

        <div className="info-section">
          <h2>Public Distribution of the Merck-Frosst <em>Candida albicans</em> GRACE strain library (updated May 28, 2025)</h2>
          <p>
            The National Research Council of Canada has been mandated by Merck Sharp &amp; Dohme Corp. for the distribution of its <em>Candida albicans</em> GRACE (gene replacement and conditional expression) library.
          </p>
          <p>
            First reported by Roemer et al. in 2003 (Molecular Microbiology 50(1), 167-181), the GRACE method allows for the transcriptional repression of tetracycline promoter-regulated genes. This collection has been replicated by members of the Malcolm Whiteway laboratory from individual tubes of the original library of 4,348 strains. Since this library was produced while the <em>C. albicans</em> annotation was still incomplete, several genes were inactivated in multiple independently derived mutants. We thus produced a non-redundant library containing a total of 2,357 different mutants (one mutant of each gene).
          </p>
          <p>
            The mutants are supplied in 96 well plates of frozen culture stocks in YPD supplemented 200 ug/ml nourseothricin and 20% glycerol. In addition, we will provide you with the following information:
          </p>
          <ul>
            <li>the template for the 25 plate collection</li>
            <li>the master information file provided by Merck (with a sequencing-based update scheduled for early 2013)</li>
            <li>a list of non-growers on YPD, or empty wells</li>
          </ul>
          <p>
            <strong>Distribution of the library is now conducted by the Leah Cowen laboratory at the University of Toronto</strong>.
          </p>
          <p>
            The use of this library requires the execution of a fully executed MTA with Merck Sharp &amp; Dohme Corp. Consequently, interested laboratories should contact Lorraine Hernandez at lorraine_hernandez@merck.com and provide full contact information of the requesting PI, full contact information of the PI's institution that handles MTAs, and a brief statement of the proposed use of the strain collection(s) requested by the PI. Subsequently, a representative from Merck will contact Leah Cowen at leah.cowen@utoronto.ca to arrange distribution.
          </p>
          <p>
            The cost of the library is $2350 CDN (+ tax and shipping if appropriate).
          </p>
        </div>

        <div className="info-section">
          <h2>Public Distribution of the Merck <em>Candida albicans</em> Double Barcoded (DBC) strain library (updated April 25, 2018)</h2>
          <p>
            The National Research Council of Canada has been mandated by Merck Sharp &amp; Dohme Corp. for the distribution of its library of double barcoded <em>Candida albicans</em> mutants carrying heterozygous deletions.
          </p>
          <p>
            This library is most commonly used in the Genome-Wide Fitness Test as first reported by Xu et al. in 2007 (PLoS Pathogens 3 e92). This powerful method has been shown to be very effective in identifying the mode of action of various antifungal compounds. The collection has been replicated by members of the NRC Genomics Team from individual tubes of the original library of 5,470 strains. Since it was produced while the <em>C. albicans</em> annotation was still incomplete, some genes were inactivated in multiple independently derived mutants. We currently estimate the library to contain haploid mutations in 5,157 distinct genes.
          </p>
          <p>
            The mutants are supplied in 60 ul of YPD with 25% glycerol, organized in 59 96-well plates. In addition, we will provide you with several documents including:
          </p>
          <ul>
            <li>An Excel file containing the strain coordinates and annotations.</li>
            <li>Sequences and structure of the insertions as determined by Sanger-type sequencing.</li>
            <li>Standard protocol for the microarray version of the Merck Fitness Test. Once the strain reannotation is complete, we hope to develop a version of the Fitness Test adapted for Next Generation Sequencing.</li>
          </ul>
          <p>
            In order to validate the inactivated genes and barcode sequences, we isolated genomic DNA from pools of DBC strains produced by Merck in 2003 and 2007. We then used PCR to individually amplify the upstream and downstream barcodes along with genomic DNA from the insertion sites. These were subsequently sequenced in an Ion Torrent PGM. As of July 2013, we have validated 40.5% of the strains and this process will continue until the end of the year.
          </p>
          <p>
            <strong>Distribution of the library is now conducted by the Leah Cowen laboratory at the University of Toronto</strong>.
          </p>
          <p>
            The use of this library requires the execution of a fully executed MTA with Merck Sharp &amp; Dohme Corp. Consequently, interested laboratories should contact Scott Walker at scott.walker@merck.com and provide full contact information of the requesting PI, full contact information of the PI's institution that handles MTAs, and a brief statement of the proposed use of the strain collection(s) requested by the PI. Subsequently, a representative from Merck will contact Leah Cowen at leah.cowen@utoronto.ca to arrange distribution.
          </p>
          <p>
            The cost of the library is $4500 CDN (+ tax and shipping if appropriate).
          </p>
        </div>

        <div className="info-section">
          <h2>Memorial Gathering for Dr. Fred Sherman (posted November 14, 2013)</h2>
          <p>
            A memorial gathering in memory of Fred Sherman will be held at 10:00 am on Friday, December 6, 2013. The gathering will be held in the Ryan Case Methods Room (Rm #1-9576) of the University of Rochester School of Medicine and Dentistry, 601 Elmwood Avenue, Rochester NY 14642. This event will be a celebration of the life and science of Fred, comprised of reminiscences about Fred by some who knew him well, followed by an opportunity for any guest to say a few words about Fred. For more information, contact Mark Dumont (Mark_Dumont@urmc.rochester.edu), Department of Biochemistry and Biophysics, University of Rochester Medical Center, Rochester, NY 14642 (Phone 585-275-2466). <a href="https://www.urmc.rochester.edu/news/story/index.cfm?id=3937" target="_blank" rel="noopener noreferrer">View his obituary.</a>
          </p>
        </div>

        <div className="info-section">
          <h2>MochiView motif analysis and genome browser software (posted April 22, 2010)</h2>
          <p>
            An announcement from Oliver Homann:
          </p>
          <p>
            Hello, I'd like to alert the community to the availability of a new platform-independent Java genome browser and motif analysis software called MochiView. Hopefully some of you may find it useful. The software was originally designed for visualization and analysis of <em>C. albicans</em> ChIP-Chip data, but has also been utilized for pure motif analysis as well as with ChIP-Seq/RNA-Seq data and with multiple additional genomes, including <em>S. cerevisiae</em> and humans. It takes ~10 minutes to download the software and install the necessary genome sequence and gene information (using the GFF files stored on <a href="http://downloads.yeastgenome.org/chromosomal_feature/" target="_blank" rel="noopener noreferrer">SGD</a>, <Link to="/download/gff/">CGD</Link>, or <a href="http://www.aspgd.org/download/gff/" target="_blank" rel="noopener noreferrer">AspGD</a>). A <a href="http://www.biomedcentral.com/1741-7007/8/49" target="_blank" rel="noopener noreferrer">manuscript describing the software</a> has just been published in BMC Biology. Visit the MochiView website to view:
          </p>
          <ul>
            <li><a href="http://johnsonlab.ucsf.edu/sj/mochiview-screenshots/" target="_blank" rel="noopener noreferrer">Demo videos</a></li>
            <li><a href="http://johnsonlab.ucsf.edu/sj/mochiview-features/" target="_blank" rel="noopener noreferrer">List of features</a></li>
            <li><a href="http://johnsonlab.ucsf.edu/sj/mochiview-software/" target="_blank" rel="noopener noreferrer">Software download</a></li>
            <li><a href="http://johnsonlab.ucsf.edu/sj/mochiview-genome-downloads/" target="_blank" rel="noopener noreferrer">Genome import instructions</a></li>
            <li><a href="http://johnsonlab.ucsf.edu/sj/mochiview-motif_libraries/" target="_blank" rel="noopener noreferrer">Motif library downloads</a></li>
          </ul>
          <p>
            Contributions to the MochiView motif libraries would be appreciated! <a href="http://johnsonlab.ucsf.edu/sj/mochiview-contact/" target="_blank" rel="noopener noreferrer">Contact us</a> with suggestions, or to join the MochiView mailing list.
          </p>
        </div>

        <div className="info-section">
          <h2>List of possibly essential <em>C. albicans</em> genes (posted December 8, 2009)</h2>
          <p>
            The A. P. Mitchell laboratory provided CGD with a list of genes in which multiple transformations using the published UAU1 method yielded no disruptants. In each case, at least 12 independent transformants were tested, indicating that the gene may be essential. The inability to disrupt these genes using the UAU1 construct does not constitute definitive proof that they are essential and investigators may want to use another method to attempt disruption of these genes. The file, UAU1_nondisruptable.txt, is available for <Link to="/download/community/">download</Link>.
          </p>
        </div>

        <div className="info-section">
          <h2>Three new resources for the <em>Candida</em> community (posted September 29, 2009)</h2>
          <p>
            Carol Munro, University of Aberdeen, and Christophe d'Enfert, Institut Pasteur, have recently received funding from the Wellcome Trust, UK, to create three new resources for the <em>Candida</em> community. The three main goals of the project will be to create (1) a <em>C. albicans</em> ORFeome library by cloning every predicted ORF into a Gateway vector in <em>E. coli</em>, (2) a library of bar-coded <em>C. albicans</em> over-expression vectors by placing each ORF under the control of a reverse Tetracycline promoter in a <em>C. albicans</em> integrative plasmid based on CIp10 and (3) a library of <em>C. albicans</em> strains each over-expressing a single gene by integrating the plasmids generated in (2) into the RPS1 chromosomal locus. Each ORF will be verified by sequencing both ends. The funding ends in September 2012 and at this point the 3 collections will be made available to the community and distributed for a small fee that will cover maintenance and distribution costs.
          </p>
          <p>
            Contacts:<br />
            Carol Munro, <a href="mailto:c.a.munro@abdn.ac.uk">c.a.munro@abdn.ac.uk</a><br />
            Christophe d'Enfert, <a href="mailto:christophe.denfert@pasteur.fr">christophe.denfert@pasteur.fr</a>
          </p>
        </div>

        <div className="info-section">
          <h2>DSHB-Microbe: a monoclonal antibody resource for the microbial research community (posted November 5, 2007)</h2>
          <p>
            An announcement from David Soll:
          </p>
          <p>
            The Developmental Studies Hybridoma Bank (DSHB) is a national resource established under the auspices of the National Institutes of Health to maintain and distribute at cost hybridomas and their monoclonal antibodies to the general scientific community. For example, monoclonals cost $25 per ml of supernatant, not $200 or $700 per ml. The DSHB now banks close to 1,000 hybridomas and filled close to 9,000 orders for multiple antibodies last year. It will rapidly grow in the near future due to its selection by the National Cancer Institute as the official bank and distributor of the 20,000 hybridomas, now being generated by the NCI Proteomics Initiative, and the antibodies they secrete against 5,000 human genes involved directly or indirectly in cancer. This represents antibodies against proteins encoded by one-fourth of the entire human genome.
          </p>
          <p>
            The DSHB has now embarked on a new mission, to generate a bank, the DSHB-Microbe, that will collect and distribute hybridomas and their antibodies against microbial antigens - select viruses, bacteria, fungi, and parasites.
          </p>
          <p>
            <em>What will the DSHB do for you?</em> It will provide you with relevant monoclonals at one-tenth to one-fifteenth the commercial price. It will relieve those of you who have made hybridomas from the burden of distribution. Most importantly, it will facilitate microbial research. It will maintain, reclone and characterize the hybridomas and secreted monoclonals, and help customers use them through a phone hot line.
          </p>
          <p>
            <em>What can you do?</em> Send us your hybridomas for distribution. Remember, we distribute them, but you still own and can commercialize them. Alternatively, if you know of hybridomas that you would like made available at low cost and high quality, let us know their name, the scientist who generated them, and other details. We will contact the scientist and try to secure the hybridoma for the collection.
          </p>
          <p>
            The DSHB has served the community of animal cell researchers for 20 years. Help me build the DSHB-Microbe so that it can do the same for microbiologists. [See our web page: <a href="http://dshb.biology.uiowa.edu" target="_blank" rel="noopener noreferrer">dshb.biology.uiowa.edu</a>].
          </p>
          <p>
            Email: <a href="mailto:dshb@uiowa.edu">dshb@uiowa.edu</a>
          </p>
        </div>

        <div className="info-section">
          <h2><em>Candida albicans</em> DNA oligonucleotide arrays (posted May 2, 2007)</h2>
          <p>
            An announcement from Victoria Brown Kennerly:
          </p>
          <p>
            We have generated DNA oligo arrays representing the <em>Candida albicans</em> genome for use in microarray experiments. They are now available to the community at cost: $100/array (3 genomes spotted per array).
          </p>
          <p>
            Please see the following website for a complete description, or to order arrays: <a href="http://genome.wustl.edu/activity/ma/calbicans/" target="_blank" rel="noopener noreferrer">http://genome.wustl.edu/activity/ma/calbicans/</a>.
          </p>
        </div>

        <div className="info-section">
          <h2>Remembering Myra (posted November 18, 2005)</h2>
          <p>
            One of the true pioneers of our field, Myra Kurtz, died at home on November 1, 2005, after a long struggle with cancer. Her loving family was by her side. She was 60 years old.
          </p>
          <p>
            Myra's proudest professional accomplishment was her team's development of the hugely successful antifungal, caspofungin, at Merck. Her seminars were highlighted by "before" and "after" photographs documenting caspofungin's efficacy in treating esophageal candidiasis. We also remember Myra professionally as the first to develop <em>C. albicans</em> transformation methods, along with strains and vectors. Never satisfied with her success, Myra continued to improve upon her initial transformation strategies, and maintained an interest in new antifungal targets long after caspofungin proved to be a winner.
          </p>
          <p>
            Myra's collegiality set the standard for our field. She was enthusiastic about publication of her group's results as a mechanism to share her information. She was a regular participant at meetings that focused on basic science, offering encouragement and advice. It was common knowledge that a request for meeting support sent to Myra would make its way quickly to the appropriate desk, and would not be unanswered.
          </p>
          <p>
            Those of us lucky enough to know Myra personally remember her incredible breadth of interests and talents, fueled by endless energy. Whether the topic was poetry, beading, or cross-country skiing, Myra offered informed opinions based on considerable thought and experience. Most of all, Myra was fun! Her love of life was truly infectious.
          </p>
          <p>
            Myra set the bar high. We are fortunate to have had such a gifted individual as our friend and colleague.
          </p>
          <p>Aaron P. Mitchell</p>
        </div>

        <div className="info-section">
          <h2><em>Candida</em> gene disruption resource (posted February 10, 2005)</h2>
          <p>
            An announcement from Aaron Mitchell:
          </p>
          <p>
            We have a new resource that will facilitate disruption of large numbers of genes at little cost to the investigator, using UAU1 methodology [Enloe, B., Diamond, A., and Mitchell, A. P. (2000) J Bacteriol 182, 5730; Davis, D. A., Bruno, V. M., Loza, L., Filler, S. G., and Mitchell, A. P. (2002) Genetics 162, 1573].
          </p>
          <p>
            We have created Tn7-UAU1 transposon insertions in 4170 (or 65.5%) of the 6362 unique ORFs defined by the NRCC annotation <a href="http://candida.bri.nrc.ca/candida/index.cfm" target="_blank" rel="noopener noreferrer">http://candida.bri.nrc.ca/candida/index.cfm</a>. The insertions are carried in a genomic library constructed from strain CAI4 DNA. Typical clones in the library are over 10 Kbp and are flanked by NotI restriction sites, permitting excision of the insertion-bearing <em>C. albicans</em> DNA for transformation. We have selected insertions that lie at least 300 bp from the nearest end of the clone, permitting efficient targeting into the <em>C. albicans</em> genome. The project is described at <a href="http://www.tigr.org/tdb/e2k1/caa1/" target="_blank" rel="noopener noreferrer">http://www.tigr.org/tdb/e2k1/caa1/</a>. In our pilot studies, we have been able to construct multiple <em>C. albicans</em> insertion homozygotes in parallel.
          </p>
          <p>
            We invite you to request up to 20 insertion-bearing clones that we will provide free of charge, and as quickly as possible. Requests must come from the lab head, and should be emailed to Aaron Mitchell <a href="mailto:apm4@columbia.edu">apm4@columbia.edu</a>.
          </p>
        </div>

        <div className="info-section">
          <h2>Human-curated annotation of <em>Candida albicans</em> genes is now available (posted January, 2004)</h2>
          <p>
            The annotation is now available for queries. Please take a look to see if your favorite genes (especially those already published) are present and properly annotated. This page allows you to search by gene name, orf19 number, contig, CandidaDB/GenBank number (activate the DBxref field) or description. If you have only an orf6 number, you can use our gene name translator. If unsuccessful, you can try submitting DNA or a.a. sequences on the right window of our Blast server.
          </p>
          <p>
            Once you find your gene(s), just press the button near the left end to see the complete annotation. Click twice on the sub-window to close it.
          </p>
          <p>
            If you wish to submit a few corrections, just e-mail me and we'll gladly update the information.
          </p>
          <p>
            If you wish to tackle more than a few genes (a gene family for ex.) please register and send Andre Nantel an e-mail. We'll provide you with more extensive access.
          </p>
          <p>
            Andre Nantel, M.Sc., Ph.D.<br />
            Research Officer and Adjunct Professor<br />
            Biotechnology Research Institute<br />
            National Research Council of Canada<br />
            Montreal, PQ, Canada<br />
            andre.nantel@nrc-cnrc.gc.ca
          </p>
        </div>

        <div className="info-section">
          <h2>Completion of a human-curated annotation of <em>Candida albicans</em> genes (posted November, 2003)</h2>
          <p>
            Members of the Annotation Working Group and volunteer annotators have completed the manual annotation of 6484 confirmed ORFs based on version 19 of the <em>Candida albicans</em> genome assembly. In addition to gene names and descriptions, a total of 1421 polypeptides have been linked to EC numbers while 3666 contain informative GO terms. We have also identified 205 introns. We are currently in a "quality-control" phase that includes coordinating the gene names of gene families. Groups with expertise in the characterization of Candida gene families are invited to contact Andre Nantel (andre@bri.nrc.ca). The entire dataset will be released to the Candida research community during the ASM Conference on Candida and Candidasis (Austin, TX, 18-22 March 2004).
          </p>
        </div>

        <div className="info-section">
          <h2>Assembly 19 released by Stanford Genome Center (posted May, 2002)</h2>
          <p>
            The Candida sequencing group has released the latest assembly of the Candida sequence. This assembly solved earlier problems of dealing with a diploid sequence and is the accumulation of much thoughtful, difficult work by the <a href="http://www-sequence.stanford.edu/group/candida/people.html" target="_blank" rel="noopener noreferrer">Candida sequencing project group</a>. For more information or to download the sequence, see the Candida sequencing group's <a href="http://www-sequence.stanford.edu/group/candida/download.html" target="_blank" rel="noopener noreferrer">Release Notes page</a>.
          </p>
        </div>

        <div className="info-section">
          <h2>Annotation Working Group meeting (posted May, 2002)</h2>
          <p>
            Aaron Mitchell hosted the first Annotation Working Group meeting, held at Columbia University on May 17-18, 2002. A strategy for annotation was determined, and progress reports as well as data will be periodically posted on this site.
          </p>
          <p>
            Burroughs Wellcome, the Wellcome Trust, and Pharmacia-Upjohn generously provided funding support to allow this workshop to occur.
          </p>
        </div>

        <div className="info-section">
          <h2>Annotation Working Group formed (posted January, 2002)</h2>
          <p>
            At the genome workshop during the ASM Conference on <em>Candida</em> and Candidiasis (held January 13-17, 2002, in Tampa, FL), a working annotation group was formed to create a standard version of the <em>Candida</em> genome for the research community. This is the first time a group of researchers have volunteered their own time to work together on the annotation of a genome. The entire research community is indebted to this group for their heroic efforts. The <a href="http://www-sequence.stanford.edu/group/candida/people.html" target="_blank" rel="noopener noreferrer">sequencing group</a> at Stanford Genome Technology Center and Stewart Scherer were gratefully acknowledged for their sequencing and assembly efforts.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CommunityNewsPage;
