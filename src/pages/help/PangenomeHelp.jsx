import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../InfoPages.css';

function PangenomeHelp() {
  const { hash } = useLocation();

  // Jump to a section when linked from a browser (e.g. #strain-variation)
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Pangenome and Strain Variation Browsers Help</h1>
        <hr />

        <div className="info-section">
          <p>
            CGD describes each species through the annotation of one reference strain, such as CDC317
            for <em>C. parapsilosis</em>. Studies that sequence many isolates of a species show how
            much genes vary between isolates. Two browsers present published studies of this kind
            alongside the CGD annotation:
          </p>
          <ul>
            <li>
              The <Link to="/pangenome">Pangenome Browser</Link> shows gene content: which genes all
              or nearly all isolates share (core), which only some carry (accessory), and genes the
              reference strain lacks.
            </li>
            <li>
              The <Link to="/strain-variation">Strain Variation Browser</Link> follows the reference
              strain&apos;s own genes across isolates: their copy number, isolates that have lost
              them, and premature stop codons.
            </li>
          </ul>
          <ul>
            <li><a href="#studies">Studies and data sources</a></li>
            <li><a href="#pangenome">Pangenome Browser</a></li>
            <li><a href="#strain-variation">Strain Variation Browser</a></li>
            <li><a href="#study-pages">Study pages</a></li>
            <li><a href="#study-ids">Gene IDs that are not in CGD</a></li>
            <li><a href="#downloads">Downloads</a></li>
            <li><a href="#locus-pages">On locus pages</a></li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="studies">Studies and data sources</h2>
          <p>
            Each browser opens with a list of its studies, giving the species, the number of isolates
            and the number of genes. All data come from the supplementary files of published,
            peer-reviewed papers; CGD does not include preprints. Gene positions and chromosome
            lengths are taken from CGD&apos;s current annotation, so the map matches the rest of CGD.
            Each study page gives the citation, links to PubMed and the DOI, the data files used, and
            notes on how the study&apos;s data were interpreted. If you use these data, please cite
            the original paper.
          </p>
        </div>

        <div className="info-section">
          <h2 id="pangenome">Pangenome Browser</h2>
          <p>
            A pangenome is the complete set of genes found across all isolates of a species. Studies
            group genes from every isolate into families and count how many isolates carry each one:
          </p>
          <ul>
            <li>
              <strong>Core</strong> genes are found in all or nearly all isolates. Each study defines
              its own cut-off, shown on the study page (for example, present in at least 99.5% of
              isolates). Where a study splits core into core and soft-core, CGD counts both as core,
              as the papers do, and shows the study&apos;s class in the Type column.
            </li>
            <li>
              <strong>Accessory</strong> genes are found in only some isolates. The study page gives
              the number of isolates carrying each one.
            </li>
            <li>
              <strong>Not in the reference</strong>: genes, core or accessory, that the reference
              strain&apos;s CGD annotation does not include. They are listed under the study&apos;s
              own IDs; see <a href="#study-ids">Gene IDs that are not in CGD</a>.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="strain-variation">Strain Variation Browser</h2>
          <p>
            Strain variation studies start from the reference strain&apos;s genes and ask how each one
            differs in other isolates. Unlike a pangenome, they say nothing about genes the reference
            strain lacks. Depending on the study, a gene may have:
          </p>
          <ul>
            <li>
              <strong>Copy number</strong> for each isolate. Some studies estimate it from sequencing
              read depth, where the normal copy number of a diploid species such as{' '}
              <em>C. parapsilosis</em> is about 2. Others count the genes each isolate has in a gene
              family, where the normal number for a haploid species such as <em>C. glabrata</em> is 1.
              The study page says which. A gene with at least twice the normal copy number in an isolate
              (4 or more copies in a diploid, 2 or more in a haploid) counts as <strong>duplicated</strong>{' '}
              there; lower cut-offs would also flag every gene on an extra copy of a chromosome. For these
              studies the genome browser shows duplications, with a button to switch to losses.
            </li>
            <li>
              <strong>Detected in all isolates</strong>, or <strong>absent from some isolates</strong>,
              meaning the gene was not found, or its estimated copy number is close to zero, in those
              isolates.
            </li>
            <li>
              <strong>Premature stop codons</strong>: mutations that create a stop codon inside the
              gene, which usually truncate the protein. For each stop, the study gives the isolates
              that carry it on both copies of the chromosome (homozygous) or on one copy
              (heterozygous).
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="study-pages">Study pages</h2>
          <p>Each study page has these parts:</p>
          <ul>
            <li>
              <strong>Summary</strong>: the number of isolates, core and accessory genes (or genes
              detected in all isolates and genes absent from some), genes not in the reference
              strain, and genes with premature stop codons, followed by notes on the data.
            </li>
            <li>
              <strong>Genome browser</strong>: the <em>genome overview</em> draws every chromosome,
              with colored ticks for accessory genes (or genes absent from some isolates) and purple
              marks for premature stop codons. Click anywhere on it to zoom in on that region. The{' '}
              <em>region view</em> below draws the genes in the selected region, colored by how
              many isolates carry them. Type a gene name or ID in the box beside the chromosome menu
              to jump to it. Use the arrows to pan, Zoom in and Zoom out to change the scale, and
              Previous and Next to jump between variable genes. Click a gene to see a
              summary with links to its CGD locus page and its row in the gene table. Genes with no
              position in the CGD annotation, such as genes the reference strain lacks, are listed
              below the map rather than drawn; a study gene derived from a CGD gene is drawn at
              that gene.
            </li>
            <li>
              <strong>Genes</strong>: a table of every gene in the study, 10 per page (up to 100 with
              the page-size menu). Filter by category, by whether the gene is in the reference
              annotation, or by premature stop codons; sort by chromosome position, gene ID or
              rarity; or search by gene name, systematic name, ortholog or protein domain. Click a
              row to see the gene&apos;s details: the isolates carrying it and their own gene IDs,
              copy number in each isolate, and premature stop codons by isolate.
            </li>
            <li>
              <strong>Downloads</strong> and <strong>Isolates</strong>: tab-separated files of the
              study&apos;s data (see <a href="#downloads">Downloads</a>), and a table of the
              study&apos;s isolates with their origin, sequencing accessions and assembly statistics
              where the paper gives them.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="study-ids">Gene IDs that are not in CGD</h2>
          <p>
            Genes that are not in the reference strain&apos;s CGD annotation keep the IDs the study
            gave them, so searching CGD for them finds nothing. Examples:
          </p>
          <ul>
            <li>
              <strong>Variants of a CGD gene</strong>, such as PARALOG_103390_1 (a tandem duplicate of
              CPAR2_103390) or CPAR2_103390_B (a fusion form). The table and downloads name the CGD
              gene they derive from and link to its locus page.
            </li>
            <li>
              <strong>Genes with no counterpart in the reference strain</strong>, such as
              HYPOTHETICAL_000015 (<em>C. parapsilosis</em>), CA_000100 (<em>C. auris</em>) or
              gene families numbered like 2PG1 (<em>C. glabrata</em>). These are known only from
              the study; their sequences are in the paper&apos;s supplementary data.
            </li>
          </ul>
        </div>

        <div className="info-section">
          <h2 id="downloads">Downloads</h2>
          <p>Each study page offers some of these tab-separated (TSV) files, depending on its data:</p>
          <ul>
            <li>
              <strong>All pangenome genes</strong> (All genes in the Strain Variation Browser), and{' '}
              <strong>Core genes</strong> and <strong>Accessory genes</strong> (Genes absent from some
              isolates): one row per gene. In pangenome files, the <em>core</em> and{' '}
              <em>accessory</em> columns mark each gene with an X, for sorting and filtering in a
              spreadsheet. The <em>cgd_page</em> column links to the gene&apos;s CGD locus page, or
              for a study gene not in CGD to the CGD gene it derives from, and <em>about_id</em> says
              which kind of ID each row has.
            </li>
            <li>
              <strong>Genes duplicated in some isolates</strong> (copy-number studies): one row per gene, with
              the number of isolates in which it is duplicated.
            </li>
            <li><strong>Premature stop codons by isolate</strong>: one row per stop codon.</li>
            <li><strong>Copy number by gene and isolate</strong>: a gene-by-isolate table.</li>
            <li><strong>Isolates</strong>: the study&apos;s isolates.</li>
          </ul>
          <p>
            Each file starts with lines beginning with #, giving the study, its citation and its
            license.
          </p>
        </div>

        <div className="info-section">
          <h2 id="locus-pages">On locus pages</h2>
          <p>
            When a loaded study covers a gene, its locus Summary page has a <strong>Pangenome</strong>{' '}
            row, a <strong>Strain variation</strong> row, or both, with one line per study (for
            example, &quot;CDR1B is a core gene (present in at least 99.5% of isolates)&quot;) and a
            link to the gene in the browser. For a gene name used in several species, such as ACT1,
            the rows follow the organism selected on the page.
          </p>
          <p>
            Questions, corrections or suggestions of studies to add are welcome; please{' '}
            <Link to="/contact">contact the CGD curators</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PangenomeHelp;
