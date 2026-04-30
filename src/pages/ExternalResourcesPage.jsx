/**
 * External Resources 2026
 * Converted from External_Resources_2026.html (Microsoft Word 15, filtered)
 */

const externalResources = {
  title: "External Resources",

  tableOfContents: [
    { label: "Candida Reference Genomes",              href: "https://www.candidagenome.org/external-resources#genomes"  },
    { label: "Candida Species Comparisons",            href: "https://www.candidagenome.org/external-resources#candida"  },
    { label: "Resources for Fungal Comparative Genomics" },
    { label: "Resources for Laboratory Research" },
    { label: "Analysis Tools",                         href: "https://www.candidagenome.org/external-resources#tools"    },
    { label: "Medical Mycology Resources",             href: "https://www.candidagenome.org/external-resources#medical"  },
    { label: "Other Fungal Genome Databases" },
    { label: "Other Resources",                        href: "https://www.candidagenome.org/external-resources#other"    },
  ],

  sections: [

    // -------------------------------------------------------------------------
    // Candida Reference Genomes
    // -------------------------------------------------------------------------
    {
      id: "genomes",
      heading: "Candida Reference Genomes",
      entries: [
        {
          label: "Candida albicans SC5314",
          href: "https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000182965.3/",
          description: "genome projects",
          subEntries: [
            {
              label: "Assembly 22",
              description: "The phased diploid Assembly 22",
              href: "https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000182965.3/",
              reference: { text: "Muzzy et al., 2013", href: "https://pubmed.ncbi.nlm.nih.gov/24025428/" },
            },
            {
              label: "Assembly 21",
              description:
                "The haploid chromosomal-level Assembly 21 reference sequence",
              reference: { text: "van het Hoog et al., 2007", href: "https://pubmed.ncbi.nlm.nih.gov/17419877/" },
            },
            {
              label: "Assembly 19",
              description:
                "The C. albicans strain SC5314 genome sequence and diploid contig-level assembly by the Stanford Genome Technology Center",
              references: [
                { text: "Jones et al., 2004",  href: "https://pubmed.ncbi.nlm.nih.gov/15123810/" },
                { text: "Tzung et al., 2001",  href: "https://pubmed.ncbi.nlm.nih.gov/11248064/" },
              ],
            },
          ],
        },
        {
          label: "Candida albicans WO-1",
          href: "https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_000149445.2/",
          description:
            "genome project. The genome of C. albicans strain WO-1 was sequenced at the Broad Institute as part of the Fungal Genome Initiative (FGI).",
          links: [
            { text: "Fungal Genome Initiative", href: "https://www.broadinstitute.org/fungal-genome-initiative" },
          ],
        },
        {
          label: "Candida dubliniensis CD36",
          href: "https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000026945.1/",
          description: "genome project. Deposited at NCBI by the Sanger Institute.",
          links: [
            { text: "Sanger Institute", href: "http://www.sanger.ac.uk/" },
          ],
        },
        {
          label: "Candida glabrata ATCC 2001 (Nakaseomyces glabratus)",
          href: "https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_010111755.1/",
          description:
            "genome project. Original sequencing was performed by the Genolevures Consortium. A more recent assembly was deposited at NCBI.",
          reference: { text: "Xu et al., 2020", href: "https://pubmed.ncbi.nlm.nih.gov/32068314/" },
        },
        {
          label: "Candida guilliermondii (Meyerozyma guilliermondii)",
          href: "https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000149425.1/",
          description:
            "genome project. The C. guilliermondii genome was sequenced at the Broad Institute as part of the Fungal Genome Initiative (FGI).",
          links: [
            { text: "Fungal Genome Initiative", href: "https://www.broadinstitute.org/fungal-genome-initiative" },
          ],
        },
        {
          label: "Candida lusitaniae (Clavispora lusitaniae)",
          href: "https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_014636115.1/",
          description:
            "genome project. The C. lusitaniae genome was originally sequenced at the Broad Institute as part of the Fungal Genome Initiative (FGI). A more recent sequencing and assembly was performed by the US Food and Drug Administration.",
          links: [
            { text: "Fungal Genome Initiative", href: "https://www.broadinstitute.org/fungal-genome-initiative" },
          ],
          reference: { text: "Sichtig et al., 2019", href: "https://pubmed.ncbi.nlm.nih.gov/31346170/" },
        },
        {
          label: "Candida parapsilosis CDC317",
          href: "https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000182765.1/",
          description: "genome project. Deposited at NCBI by the Sanger Institute.",
          links: [
            { text: "Sanger Institute", href: "http://www.sanger.ac.uk/" },
          ],
        },
        {
          label: "Candida tropicalis MYA-3404",
          href: "https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000006335.3/",
          description:
            "genome project. The C. tropicalis genome was sequenced at the Broad Institute as part of the Fungal Genome Initiative (FGI). A more recent sequencing and assembly was performed by Guin et al.",
          links: [
            { text: "Fungal Genome Initiative", href: "https://www.broadinstitute.org/fungal-genome-initiative" },
          ],
          reference: { text: "Guin et al., 2020", href: "https://pubmed.ncbi.nlm.nih.gov/32469306/" },
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Candida Species Comparisons
    // -------------------------------------------------------------------------
    {
      id: "candida",
      heading: "Candida species comparisons",
      entries: [
        {
          label: "Butler et al. (2009)",
          href: "https://pubmed.ncbi.nlm.nih.gov/19465905/",
          description:
            "Supplementary data for eight Candida genomes includes genome characteristics (size, telomeres, centromeres, retrotransposons and repeats, CUG usage, SNPs, etc.), phylogeny, gene families and function (pathogenesis-associated gene families, cell wall, stress response, mating and meiosis, etc.), cross-species comparisons (alignments, synteny). Data are available for download as supplementary material associated with the paper.",
        },
        {
          label: "CGD Public Wiki",
          href: "http://publicwiki.candidagenome.org/index.php?title=Main_Page",
          description:
            "Contains seminal Candida papers, strain information, and species comparisons by topic such as codon usage, filamentation style, mitochondrial genomes, and more.",
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Resources for Fungal Comparative Genomics
    // -------------------------------------------------------------------------
    {
      id: "fungal-comparative",
      heading: "Resources for fungal comparative genomics",
      entries: [
        {
          label: "Ensembl Fungi",
          href: "https://fungi.ensembl.org",
          description: "genome browsers and comparative genomics for fungal species",
        },
        {
          label: "JGI MycoCosm",
          href: "https://mycocosm.jgi.doe.gov",
          description: "fungal genomics portal with genome sequences and comparative tools",
        },
        {
          label: "FungiDB",
          href: "https://fungidb.org",
          description:
            "integrated genomic and functional genomic data for fungi (may require a subscription for access)",
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Resources for Laboratory Research
    // -------------------------------------------------------------------------
    {
      id: "lab-research",
      heading: "Resources for laboratory research",
      entries: [
        {
          label: "Fungal Genetics Stock Center",
          href: "https://www.fgsc.net/",
          description: "strain and plasmid repository",
        },
        {
          label: "Candida collections at the Fungal Genetics Stock Center",
          href: "http://www.fgsc.net/candida/FGSCcandidaresources.htm",
          description: "Request strains from several different mutant collections",
        },
        {
          label: "EUCAST",
          href: "https://www.eucast.org/",
          description: "antifungal methodology",
        },
        {
          label: "Clinical and Laboratory Standards Institute",
          href: "https://clsi.org/",
          description: "antifungal methodology",
        },
        {
          label: "Developmental Studies Hybridoma Bank",
          href: "http://dshb.biology.uiowa.edu/",
          description:
            "Collection of hybridomas and their antibodies that in the future will include DSHB-Microbe, a collection of antibodies against C. albicans antigens and those of other microbial pathogens.",
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Analysis Tools
    // -------------------------------------------------------------------------
    {
      id: "tools",
      heading: "Analysis Tools",
      entries: [
        {
          label: "PathoYeastract",
          href: "https://yeastract-plus.org/pathoyeastract/",
          description:
            "Pathogenic Yeast Search for Transcriptional Regulators And Consensus Tracking. A curated repository of all known regulatory associations between transcription factors (TF) and target genes in pathogenic Candida species, based on hundreds of bibliographic references. Includes C. albicans, C. glabrata, C. auris, C. parapsilosis, and C. tropicalis.",
          reference: { text: "Monteiro et al., 2017", href: "https://www.ncbi.nlm.nih.gov/pubmed/27625390" },
        },
        {
          label: "FungiFun2",
          href: "https://bio.tools/fungifun",
          description:
            "Online resource that assigns functional annotations to lists of fungal genes or proteins based on different classification methods (Gene Ontology, Functional Catalog, KEGG) and performs an enrichment analysis to identify significantly enriched pathways or processes.",
          reference: { text: "Priebe et al., 2015", href: "https://www.ncbi.nlm.nih.gov/pubmed/25294921" },
        },
        {
          label: "FungiFun3",
          href: "https://fungifun3.hki-jena.de/",
          description: "Rewritten tools for analysis of differential gene expression.",
          reference: { text: "Garcia Lopez et al., 2024", href: "https://pubmed.ncbi.nlm.nih.gov/39576688/" },
        },
        {
          label: "C. albicans Multilocus Sequence Typing (MLST)",
          href: "http://calbicans.mlst.net/",
          description:
            "Tools for strain typing and epidemiology, hosted at Imperial College London.",
          reference: { text: "M.-E. Bougnoux et al., 2003", href: "https://pubmed.ncbi.nlm.nih.gov/11923347/" },
        },
        {
          label: "Bioinformatics Analysis Tools",
          href: "https://services.healthtech.dtu.dk/",
          description:
            "Extensive set of tools listed at the Department of Health Technology of the Technical University of Denmark. Gene-finding and splice sites, genomic epidemiology, immunological features, post-translational modifications, protein structure and sorting predictions, numerous datasets, and more.",
        },
        {
          label: "Multi-genome Analysis of Positions and Patterns of Elements of Regulation (MAPPER)",
          href: "https://neuinfo.org/data/record/nlx_144509-1/RRID:SCR_003077/resolver/pdf&i=rrid:scr_003077",
          description:
            "Tools for prediction of transcription factor binding sites in human, mouse, and fly.",
          references: [
            { text: "Marinescu et al., 2005",        href: "https://pubmed.ncbi.nlm.nih.gov/15799782/" },
            { text: "Neuroscience Information Framework", href: "https://neuinfo.org/" },
          ],
        },
        {
          label: "Fungal Genomes BLAST at SGD",
          href: "https://www.yeastgenome.org/blast-fungal",
          description:
            "BLAST search for sequence similarity within fungal genomes, provided by the Saccharomyces Genome Database.",
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Medical Mycology Resources
    // -------------------------------------------------------------------------
    {
      id: "medical",
      heading: "Medical Mycology Resources",
      entries: [
        {
          label: "Candidiasis Information at Medline Plus",
          href: "http://www.nlm.nih.gov/medlineplus/candidiasis.html",
          description: "Medical information about candidiasis.",
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Other Fungal Genome Databases
    // -------------------------------------------------------------------------
    {
      id: "fungal-databases",
      heading: "Other Fungal Genome Databases",
      entries: [
        {
          label: "Saccharomyces Genome Database",
          href: "http://www.yeastgenome.org/",
          description:
            "Genome, gene, and protein information for the model yeast Saccharomyces cerevisiae.",
        },
        {
          label: "Cryptococcus neoformans genome project",
          href: "https://www.broadinstitute.org/fungal-genome-initiative/cryptococcus-neoformans-serotype-genome-project",
          description:
            "Genome sequencing efforts for the fungal pathogen C. neoformans at the Broad Institute Fungal Genome Initiative.",
          links: [
            { text: "Fungal Genome Initiative", href: "https://www.broadinstitute.org/fungal-genome-initiative" },
          ],
        },
        {
          label: "The Aspergillus Website",
          href: "https://www.aspergillus.org.uk/",
          description:
            "Database with genomic information on the fungal pathogen Aspergillus fumigatus and clinical information on aspergillosis.",
        },
        {
          label: "Aspergillus nidulans genome project",
          href: "http://www.broad.mit.edu/annotation/fungi/aspergillus/",
          description:
            "Home page for the A. nidulans genome project at the Broad Institute, part of the Fungal Genome Initiative.",
          links: [
            { text: "Fungal Genome Initiative", href: "https://www.broadinstitute.org/fungal-genome-initiative" },
          ],
        },
        {
          label: "Magnaporthe comparative genomics",
          href: "https://www.broadinstitute.org/scientific-community/science/projects/fungal-genome-initiative/magnaporthe-comparative-genomics-proj",
          description:
            "Home page for the M. grisea genome project at the Broad Institute, Fungal Genome Initiative.",
          links: [
            { text: "Fungal Genome Initiative", href: "https://www.broadinstitute.org/fungal-genome-initiative" },
          ],
        },
        {
          label: "Schizosaccharomyces pombe Pombase",
          href: "https://www.pombase.org/",
          description:
            "Comprehensive, curated, connected genomic, genetic and molecular data for Schizosaccharomyces pombe.",
        },
        {
          label: "Neurospora Resources",
          href: "https://neurospora.org/resources/",
          description: "An information resource for the Neurospora community.",
        },
        {
          label: "Fungal Genetics Stock Center",
          href: "http://www.fgsc.net/",
          description:
            "General fungal information, focusing on filamentous fungi; has links to many fungal genome projects.",
        },
      ],
    },

    // -------------------------------------------------------------------------
    // Other Resources
    // -------------------------------------------------------------------------
    {
      id: "other",
      heading: "Other Resources",
      entries: [
        {
          label: "GenBank",
          href: "https://www.ncbi.nlm.nih.gov/genbank/submit/",
          description: "Sequence repository at the NCBI, Bethesda, Maryland, USA.",
          links: [
            { text: "NCBI", href: "http://www.ncbi.nlm.nih.gov/" },
          ],
        },
        {
          label: "EMBL-EBI",
          href: "https://www.ebi.ac.uk/",
          description:
            "Sequence repository and numerous analytics tools at the European Bioinformatics Institute (EBI), Hinxton Hall, Cambridge, UK.",
        },
        {
          label: "DDBJ",
          href: "https://www.ddbj.nig.ac.jp/index-e.html",
          description: "Sequence repository at Mishima, Japan.",
        },
        {
          label: "GenePalette",
          href: "http://www.genepalette.org/index.html",
          description:
            "Software application, freely available to academic users, for visualizing annotated features and other sequence elements in GenBank sequences.",
        },
        {
          label: "AlphaFold Protein Structure Database",
          href: "https://alphafold.ebi.ac.uk/",
          description: "Program for protein structure prediction, from the Protein Design Group at EMBL-EBI.",
          links: [
            { text: "EMBL-EBI", href: "https://www.ebi.ac.uk/" },
          ],
        },
        {
          label: "Gene Ontology",
          href: "http://www.geneontology.org/",
          description: "Gene Ontology (GO) Consortium home page.",
        },
        {
          label: "KEGG",
          href: "http://www.genome.ad.jp/kegg/",
          description: "Metabolic reactions and pathways from Kyoto University, Kyoto, Japan.",
        },
      ],
    },

  ], // end sections
};

// Export for use as an ES module or CommonJS module
if (typeof module !== "undefined" && module.exports) {
  module.exports = externalResources;
} else if (typeof define === "function" && define.amd) {
  define([], function () { return externalResources; });
} else {
  (typeof globalThis !== "undefined" ? globalThis : window).externalResources = externalResources;
}
