(function () {
  // ── Styles ────────────────────────────────────────────────────────────────
  var style = document.createElement("style");
  style.textContent = [
    "@font-face { font-family: 'Cambria Math'; panose-1: 2 4 5 3 5 4 6 3 2 4; }",
    "@font-face { font-family: Aptos; panose-1: 2 11 0 4 2 2 2 2 2 4; }",
    "@font-face { font-family: Cambria; panose-1: 2 4 5 3 5 4 6 3 2 4; }",
    "p.MsoNormal, li.MsoNormal, div.MsoNormal { margin: 0in; font-size: 12.0pt; font-family: 'Aptos', sans-serif; }",
    "a:link, span.MsoHyperlink { color: #467886; text-decoration: underline; }",
    "p.MsoListParagraph, li.MsoListParagraph, div.MsoListParagraph { margin-top: 0in; margin-right: 0in; margin-bottom: 0in; margin-left: .5in; font-size: 12.0pt; font-family: 'Aptos', sans-serif; }",
    ".MsoChpDefault { font-size: 10.0pt; font-family: 'Aptos', sans-serif; }",
    "@page WordSection1 { size: 8.5in 11.0in; margin: 1.0in 1.0in 1.0in 1.0in; }",
    "div.WordSection1 { page: WordSection1; }",
    "ol { margin-bottom: 0in; }",
    "ul { margin-bottom: 0in; }"
  ].join("\n");
  document.head.appendChild(style);

  // Set body attributes to match the original
  document.body.setAttribute("lang", "EN-US");
  document.body.setAttribute("link", "#467886");
  document.body.setAttribute("vlink", "#96607D");
  document.body.style.wordWrap = "break-word";

  // ── Helper utilities ───────────────────────────────────────────────────────
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (k === "style") { e.style.cssText = attrs[k]; }
        else if (k === "className") { e.className = attrs[k]; }
        else { e.setAttribute(k, attrs[k]); }
      }
    }
    if (html !== undefined) { e.innerHTML = html; }
    return e;
  }

  function p(className, styleStr, html) {
    return el("p", { className: className, style: styleStr || "" }, html);
  }

  function bullet(styleStr, html) {
    // Each bullet row is a MsoListParagraph with the Symbol · + spacer + content
    var prefix = "<span style='font-family:Symbol'>\u00b7</span>"
               + "<span style='font-size:7.0pt;font-family:\"Times New Roman\",serif'>\u00a0\u00a0\u00a0\u00a0\u00a0 </span>";
    return p("MsoListParagraph", styleStr, prefix + html);
  }

  function a(href, text, target, extraStyle) {
    var t = target ? " target=\"" + target + "\"" : "";
    var s = extraStyle ? " style='" + extraStyle + "'" : "";
    return "<a href=\"" + href + "\"" + t + s + ">" + text + "</a>";
  }

  // ── Root container ─────────────────────────────────────────────────────────
  var section = el("div", { className: "WordSection1" });
  document.body.appendChild(section);

  function add(node) { section.appendChild(node); }

  // ── Page title ─────────────────────────────────────────────────────────────
  add(p("MsoNormal", "", "<b>External Resources\u00a0 </b>"));

  var hrWrap = el("div", { className: "MsoNormal", style: "text-align:center" });
  hrWrap.appendChild(el("hr", { size: "1", width: "100%", align: "center" }));
  add(hrWrap);

  // ── Table of Contents (bulleted list) ──────────────────────────────────────
  var tocSpan = el("span", { style: "font-size:12.0pt;font-family:'Aptos',sans-serif" });

  var ul = el("ul", { style: "margin-top:0in", type: "disc" });

  function tocItem(html) {
    var li = el("li", { className: "MsoNormal" }, html);
    ul.appendChild(li);
  }

  tocItem(a("https://www.candidagenome.org/external-resources#genomes",
            "<i><span style='text-decoration:none'>Candida</span></i><span style='text-decoration:none'> Reference\u00a0Genomes</span>"));
  tocItem(a("https://www.candidagenome.org/external-resources#candida",
            "<i><span style='text-decoration:none'>Candida\u00a0</span></i><span style='text-decoration:none'>Species Comparisons</span>"));
  tocItem("Resources for Fungal Comparative Genomics");
  tocItem("Resources for Laboratory Research");
  tocItem(a("https://www.candidagenome.org/external-resources#tools",
            "<span style='text-decoration:none'>Analysis Tools</span>"));
  tocItem(a("https://www.candidagenome.org/external-resources#medical",
            "<span style='text-decoration:none'>Medical Mycology Resources</span>"));
  tocItem("Other Fungal Genome Databases");
  tocItem(a("https://www.candidagenome.org/external-resources#other",
            "<span style='text-decoration:none'>Other Resources</span>"));

  tocSpan.appendChild(ul);
  add(tocSpan);

  add(p("MsoNormal", "", "<b><i>\u00a0</i></b>"));

  // ── Candida Reference Genomes ──────────────────────────────────────────────
  add(p("MsoNormal", "", "<b><i>Candida</i>\u00a0Reference Genomes</b>"));

  // C. albicans SC5314
  add(bullet("text-indent:-.25in",
    a("https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000182965.3/",
      "<i>Candida albicans</i>\u00a0SC5314") + " genome projects"));

  // Sub-bullets (Assembly 22, 21, 19) use margin-left:1.0in
  var subBulletStyle = "margin-left:1.0in;text-indent:-.25in";
  var subPrefix = "<span style='font-family:\"Courier New\"'>o</span>"
                + "<span style='font-size:7.0pt;font-family:\"Times New Roman\",serif'>\u00a0\u00a0 </span>";

  add(p("MsoListParagraph", subBulletStyle,
    subPrefix + "<b>Assembly 22</b>: The "
    + a("https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000182965.3/", "phased diploid Assembly 22")
    + " is described in "
    + a("https://pubmed.ncbi.nlm.nih.gov/24025428/", "Muzzy et al., 2013") + "."));

  add(p("MsoListParagraph", subBulletStyle,
    subPrefix + "<b>Assembly 21:</b>\u00a0The haploid chromosomal-level Assembly 21 reference sequence is described in\u00a0"
    + a("https://pubmed.ncbi.nlm.nih.gov/17419877/", "van het Hoog et al., 2007") + "."));

  add(p("MsoListParagraph", subBulletStyle,
    subPrefix + "<b>Assembly 19:</b>\u00a0The\u00a0<i>C. albicans</i>\u00a0strain SC5314 genome sequence and diploid contig-level assembly by the\u00a0Stanford Genome Technology Center\u00a0was published in "
    + a("https://pubmed.ncbi.nlm.nih.gov/15123810/", "Jones et al., 2004.\u00a0")
    + "The construction of the sequencing library and sequencing methods are described in\u00a0"
    + a("https://pubmed.ncbi.nlm.nih.gov/11248064/", "Tzung et al., 2001") + "."));

  // C. albicans WO-1
  add(bullet("text-indent:-.25in",
    a("https://www.ncbi.nlm.nih.gov/datasets/genome/GCA_000149445.2/",
      "<i>Candida albicans</i> WO-1", "_blank")
    + "\u00a0genome project <br>"
    + "The genome of\u00a0<i>C. albicans</i>\u00a0strain WO-1 was sequenced at the Broad Institute as part of the\u00a0"
    + a("https://www.broadinstitute.org/fungal-genome-initiative", "Fungal Genome Initiative\u00a0")
    + "(FGI)."));

  // C. dubliniensis CD36
  add(bullet("text-indent:-.25in",
    a("https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000026945.1/",
      "<i>Candida dubliniensis</i>\u00a0CD36")
    + " genome project<br>"
    + "Deposited at NCBI by the\u00a0"
    + a("http://www.sanger.ac.uk/", "Sanger Institute", "_blank") + "."));

  // C. glabrata
  add(bullet("text-indent:-.25in",
    a("https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_010111755.1/",
      "<i>Candida glabrata</i> ATCC 2001 (<i>Nakaseomyces glabratus</i>)\u00a0", "_blank")
    + "genome project<br>"
    + "Original sequencing was performed by the\u00a0Genolevures Consortium. A more recent assembly was published by "
    + a("https://pubmed.ncbi.nlm.nih.gov/32068314/", "Xu et al., 2020")
    + " and deposited at NCBI."));

  // C. guilliermondii
  add(bullet("text-indent:-.25in",
    a("https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000149425.1/",
      "<i>Candida guilliermondii</i>\u00a0(<i>Meyerozyma guilliermondii</i>)")
    + " genome project<br>"
    + "The\u00a0<i>C. guilliermondii</i>\u00a0genome was sequenced at the Broad Institute as part of the\u00a0"
    + a("https://www.broadinstitute.org/fungal-genome-initiative", "Fungal Genome Initiative\u00a0")
    + "(FGI)."));

  // C. lusitaniae
  add(bullet("text-indent:-.25in",
    a("https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_014636115.1/",
      "<i>Candida lusitaniae</i>\u00a0(<i>Clavispora lusitaniae</i>)")
    + " genome project<br>"
    + "The\u00a0<i>C. lusitaniae</i>\u00a0genome was originally sequenced at the Broad Institute as part of the\u00a0"
    + a("https://www.broadinstitute.org/fungal-genome-initiative", "Fungal Genome Initiative\u00a0")
    + "(FGI). A more recent sequencing and assembly was performed by the US Food and Drug Administration, published in "
    + a("https://pubmed.ncbi.nlm.nih.gov/31346170/", "Sichtig et al., 2019") + "."));

  // C. parapsilosis
  add(bullet("text-indent:-.25in",
    a("https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000182765.1/",
      "<i>Candida parapsilosis</i>\u00a0CDC317")
    + " genome project<br>"
    + "Deposited at NCBI by the\u00a0"
    + a("http://www.sanger.ac.uk/", "Sanger Institute", "_blank") + "."));

  // C. tropicalis
  add(bullet("text-indent:-.25in",
    a("https://www.ncbi.nlm.nih.gov/datasets/genome/GCF_000006335.3/",
      "<i>Candida tropicalis</i>\u00a0MYA-3404")
    + " genome project<br>"
    + "The\u00a0<i>C. tropicalis</i>\u00a0genome was sequenced at the Broad Institute as part of the\u00a0"
    + a("https://www.broadinstitute.org/fungal-genome-initiative", "Fungal Genome Initiative\u00a0")
    + "(FGI). A more recent sequencing and assembly was performed by "
    + a("https://pubmed.ncbi.nlm.nih.gov/32469306/", "Guin et al., 2020") + "."));

  add(p("MsoNormal", "", "\u00a0"));

  // ── Candida Species Comparisons ────────────────────────────────────────────
  add(p("MsoNormal", "", "<b><i>Candida</i>\u00a0species comparisons</b>"));

  add(bullet("text-indent:-.25in",
    a("https://pubmed.ncbi.nlm.nih.gov/19465905/", "Butler et al. (2009)")
    + "\u2014Supplementary data from for eight\u00a0<i>Candida</i>\u00a0genomes includes genome characteristics (size, telomeres, centromeres, retrotransposons and repeats, CUG usage, SNPs, etc.), phylogeny, gene families and function (pathogenesis-associated gene families, cell wall, stress response, mating and meiosis, etc.), cross-species comparisons (alignments, synteny). Data are available for download as\u00a0supplementary material\u00a0associated with the paper. "));

  add(bullet("text-indent:-.25in",
    a("http://publicwiki.candidagenome.org/index.php?title=Main_Page", "CGD Public Wiki")
    + "\u2014Contains seminal <i>Candida</i> papers, strain information, and species comparisons by topic such as codon usage, filamentation style, mitochondrial genomes, and more."));

  add(p("MsoNormal", "", "\u00a0"));

  // ── Resources for Fungal Comparative Genomics ──────────────────────────────
  add(p("MsoNormal", "", "<b>Resources for fungal comparative genomics</b>"));

  add(bullet("text-indent:-.25in",
    a("https://fungi.ensembl.org", "Ensembl Fungi")
    + " \u2014 genome browsers and comparative genomics for fungal species"));

  add(bullet("text-indent:-.25in",
    a("https://mycocosm.jgi.doe.gov", "JGI MycoCosm")
    + " \u2014 fungal genomics portal with genome sequences and comparative tools"));

  add(bullet("text-indent:-.25in",
    a("https://fungidb.org", "FungiDB")
    + " \u2014 integrated genomic and functional genomic data for fungi <span style='font-family:\"Cambria\",serif'>(may </span>require a subscription for access)"));

  add(p("MsoNormal", "", "<b>\u00a0</b>"));

  // ── Resources for Laboratory Research ─────────────────────────────────────
  add(p("MsoNormal", "", "<b>Resources for laboratory research</b>"));

  add(bullet("text-indent:-.25in",
    a("https://www.fgsc.net/", "Fungal Genetics Stock Center")
    + "\u2014 strain and plasmid repository"));

  add(bullet("text-indent:-.25in",
    a("http://www.fgsc.net/candida/FGSCcandidaresources.htm",
      "Candida\u00a0collections at the Fungal Genetics Stock Center", "_blank")
    + "\u2014Request strains from several different mutant collections"));

  add(bullet("text-indent:-.25in",
    a("https://www.eucast.org/", "EUCAST")
    + "\u2014antifungal methodology"));

  add(bullet("text-indent:-.25in",
    a("https://clsi.org/", "Clinical and Laboratory Standards Institute")
    + " \u2014 antifungal methodology"));

  add(bullet("text-indent:-.25in",
    a("http://dshb.biology.uiowa.edu/", "Developmental Studies Hybridoma Bank", "_blank")
    + "\u2014Collection of hybridomas and their antibodies that in the future will include DSHB-Microbe, a collection of antibodies against\u00a0<i>C. albicans</i>\u00a0antigens and those of other microbial pathogens."));

  add(p("MsoNormal", "", "\u00a0"));

  // ── Analysis Tools ─────────────────────────────────────────────────────────
  add(p("MsoNormal", "", "<b>Analysis Tools</b>"));

  add(bullet("text-indent:-.25in",
    a("https://yeastract-plus.org/pathoyeastract/", "PathoYeastract", "_blank")
    + "\u2014 Pathogenic Yeast Search for Transcriptional Regulators And Consensus Tracking) is a curated repository of all known regulatory associations between transcription factors (TF) and target genes in pathogenic\u00a0<i>Candida</i>\u00a0species, based on hundreds of bibliographic references. Includes\u00a0<i>C. albicans</i>,\u00a0<i>C. glabrata</i>, <i>C. auris, C. parapsilosis, and C. tropicalis</i>. Described in\u00a0"
    + a("https://www.ncbi.nlm.nih.gov/pubmed/27625390", "Monteiro et al., 2017", "_blank") + "."));

  add(bullet("text-indent:-.25in",
    a("https://bio.tools/fungifun", "FungiFun2", "_blank")
    + "\u2014 Online resource that assigns functional annotations to lists of fungal genes or proteins based on different classification methods (Gene Ontology, Functional Catalog, KEGG) and performs an enrichment analysis to identify significantly enriched pathways or processes. Described in\u00a0"
    + a("https://www.ncbi.nlm.nih.gov/pubmed/25294921", "Priebe et al., 2015", "_blank") + "."));

  add(bullet("text-indent:-.25in",
    a("https://fungifun3.hki-jena.de/", "FungiFun3")
    + "\u2014 Rewritten tools for analysis of differential gene expression. Described in "
    + a("https://pubmed.ncbi.nlm.nih.gov/39576688/", "Garcia Lopez et al., 2024") + "."));

  add(bullet("text-indent:-.25in",
    a("http://calbicans.mlst.net/",
      "<i>C. albicans</i>\u00a0Multilocus Sequence Typing (MLST)", "_blank")
    + " \u2014 Tools for strain typing and epidemiology, hosted at Imperial College London, and described in\u00a0"
    + a("https://pubmed.ncbi.nlm.nih.gov/11923347/", "M.-E. Bougnoux et al., 2003") + "."));

  add(bullet("text-indent:-.25in",
    a("https://services.healthtech.dtu.dk/", "Bioinformatics Analysis Tools")
    + "\u2014 Extensive set of tools listed at the Department of Health Technology of the Technical University of Denmark. Gene-finding and splice sites, genomic epidemiology, immunological features, post-translational modifications, protein structure and sorting predictions, numerous datasets, and more."));

  add(bullet("text-indent:-.25in",
    a("https://neuinfo.org/data/record/nlx_144509-1/RRID:SCR_003077/resolver/pdf&i=rrid:scr_003077",
      "Multi-genome Analysis of Positions and Patterns of Elements of Regulation (MAPPER)", "_blank")
    + " \u2014 Tools for prediction of transcription factor binding sites in human, mouse, and fly. Original reference is "
    + a("https://pubmed.ncbi.nlm.nih.gov/15799782/", "Marinescu et al., 2005")
    + ", most recent updates published by the"
    + a("https://neuinfo.org/", " Neuroscience Information Framework") + "."));

  add(bullet("text-indent:-.25in",
    a("https://www.yeastgenome.org/blast-fungal", "Fungal Genomes BLAST at SGD", "_blank")
    + "\u2014 BLAST search for sequence similarity within fungal genomes, provided by the\u00a0<i>Saccharomyces</i>\u00a0Genome Database."));

  add(p("MsoNormal", "", "\u00a0"));
  add(p("MsoNormal", "", "\u00a0"));

  // ── Medical Mycology Resources ─────────────────────────────────────────────
  add(p("MsoNormal", "", "<b>Medical Mycology Resources</b>"));

  add(bullet("text-indent:-.25in",
    a("http://www.nlm.nih.gov/medlineplus/candidiasis.html",
      "Candidiasis Information at Medline Plus", "_blank")
    + "<br>Medical information about candidiasis."));

  add(p("MsoNormal", "", "\u00a0"));

  // ── Other Fungal Genome Databases ─────────────────────────────────────────
  add(p("MsoNormal", "", "<b>Other Fungal Genome Databases</b>"));

  add(bullet("text-indent:-.25in",
    a("http://www.yeastgenome.org/", "<i>Saccharomyces</i>\u00a0Genome Database", "_blank")
    + "\u2014Genome, gene, and protein information for the model yeast\u00a0<i>Saccharomyces cerevisiae</i>."));

  add(bullet("text-indent:-.25in",
    a("https://www.broadinstitute.org/fungal-genome-initiative/cryptococcus-neoformans-serotype-genome-project",
      "<i>Cryptococcus neoformans</i>\u00a0genome project", "_blank")
    + "\u2014Genome sequencing efforts for the fungal pathogen\u00a0<i>C. neoformans</i>\u00a0at the Broad Institute "
    + a("https://www.broadinstitute.org/fungal-genome-initiative", "Fungal Genome Initiative \u00a0")));

  add(bullet("text-indent:-.25in",
    a("https://www.aspergillus.org.uk/", "The Aspergillus Website", "_blank")
    + "\u2014Database with genomic information on the fungal pathogen\u00a0<i>Aspergillus fumigatus</i>\u00a0and clinical information on aspergillosis."));

  add(bullet("text-indent:-.25in",
    a("http://www.broad.mit.edu/annotation/fungi/aspergillus/",
      "<i>Aspergillus nidulans</i>\u00a0genome", "_blank")
    + " project\u2014Home page for the\u00a0<i>A. nidulans</i>\u00a0genome project at the Broad Institute, part of the\u00a0"
    + a("https://www.broadinstitute.org/fungal-genome-initiative", "Fungal Genome Initiative", "_blank") + "."));

  add(bullet("text-indent:-.25in",
    a("https://www.broadinstitute.org/scientific-community/science/projects/fungal-genome-initiative/magnaporthe-comparative-genomics-proj",
      "<i>Magnaporthe </i>comparative genomics", "_blank")
    + "\u2014Home page for the\u00a0<i>M. grisea</i>\u00a0genome project at the Broad Institute, "
    + a("https://www.broadinstitute.org/fungal-genome-initiative", "Fungal Genome Initiative", "_blank") + "."));

  add(bullet("text-indent:-.25in",
    a("https://www.pombase.org/", "<i>Schizosaccharomyces pombe</i>\u00a0Pombase")
    + "\u2014Comprehensive, curated, connected genomic, genetic and molecular data for\u00a0<i>Schizosaccharomyces pombe</i>"));

  add(bullet("text-indent:-.25in",
    a("https://neurospora.org/resources/", "<i>Neurospora Resources</i>", "_blank")
    + "\u2014An information resource for the Neurospora community"));

  add(bullet("text-indent:-.25in",
    a("http://www.fgsc.net/", "Fungal Genetics Stock Center", "_blank")
    + "\u2014General fungal information, focusing on filamentous fungi; has links to many fungal genome projects."));

  add(p("MsoNormal", "", "\u00a0"));

  // ── Other Resources ────────────────────────────────────────────────────────
  add(p("MsoNormal", "", "<b>Other Resources</b>"));

  add(bullet("text-indent:-.25in",
    a("https://www.ncbi.nlm.nih.gov/genbank/submit/", "GenBank", "_blank")
    + "\u2014Sequence repository at the\u00a0"
    + a("http://www.ncbi.nlm.nih.gov/", "NCBI", "_blank")
    + ", Bethesda, Maryland, USA."));

  add(bullet("text-indent:-.25in",
    a("https://www.ebi.ac.uk/", "EMBL-EBI", "_blank")
    + "\u2014Sequence repository and numerous analytics tools at the European Bioinformatics Institute\u00a0(EBI), Hinxton Hall, Cambridge, UK."));

  add(bullet("text-indent:-.25in",
    a("https://www.ddbj.nig.ac.jp/index-e.html", "DDBJ", "_blank")
    + "\u2014Sequence repository at Mishima, Japan."));

  add(bullet("text-indent:-.25in",
    a("http://www.genepalette.org/index.html", "GenePalette", "_blank")
    + "\u2014Software application, freely available to academic users, for visualizing annotated features and other sequence elements in GenBank sequences."));

  add(bullet("text-indent:-.25in",
    a("https://alphafold.ebi.ac.uk/", "AlphaFold Protein Structure Database", "_blank")
    + "\u2014Program for protein structure prediction, from the Protein Design Group at "
    + a("https://www.ebi.ac.uk/", "EMBL-EBI", "_blank")));

  add(bullet("text-indent:-.25in",
    a("http://www.geneontology.org/", "Gene Ontology", "_blank")
    + "\u2014Gene Ontology (GO) Consortium home page."));

  add(bullet("text-indent:-.25in",
    a("http://www.genome.ad.jp/kegg/", "KEGG", "_blank")
    + "\u2014Metabolic reactions and pathways from Kyoto University, Kyoto, Japan."));

  add(p("MsoNormal", "", "\u00a0"));
  add(p("MsoNormal", "", "\u00a0"));
})();
