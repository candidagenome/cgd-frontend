import React from 'react';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const REPEAT_TE_DIR = '/download/repeat_te';
const GITHUB_REPO = 'https://github.com/candidagenome/cgd-backend';

// Per-species de novo libraries in /download/repeat_te/ (tag = file prefix)
const SPECIES_LIBRARIES = [
  { tag: 'CALB', species: 'C. albicans', strain: 'SC5314' },
  { tag: 'CAURIS', species: 'C. auris', strain: 'B8441' },
  { tag: 'CDUB', species: 'C. dubliniensis', strain: 'CD36' },
  { tag: 'CGLAB', species: 'C. glabrata', strain: 'CBS138' },
  { tag: 'CPARA', species: 'C. parapsilosis', strain: 'CDC317' },
  { tag: 'CTROP', species: 'C. tropicalis', strain: 'MYA-3404' },
];

const RepeatTEDownloadsPage = () => {
  return (
    <div className="info-page">
      <div className="info-page-content">
        <h1>Repeat/TE Downloads</h1>
        <p style={{ textAlign: 'center', marginBottom: '20px' }}>
          <strong>
            Repeat libraries, pipeline scripts, and documentation from CGD&apos;s 2026
            repeat and transposable element (TE) annotation of all six species. See the{' '}
            <Link to="/help/repeat-te">Repeat and Transposable Element Annotations</Link> help
            page for methods and results.
          </strong>
        </p>
        <hr />

        <div className="info-section">
          <div className="help-item">
            <h3><strong>Repeat Library Directory</strong></h3>
            <p>
              All repeat libraries are in a single download directory. Its README describes
              each file, the header formats, and the species tags.
            </p>
            <div className="help-links">
              <a href={`${REPEAT_TE_DIR}/`}>Go to the Repeat/TE Directory</a>
              <a href={`${REPEAT_TE_DIR}/README`}>View the README</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Curated <em>C. albicans</em> Repeat/TE Sequences</strong></h3>
            <p>
              The 366 curated <em>C. albicans</em> SC5314 repeat/TE sequences (Tca
              retrotransposons, Greek-letter LTR families, MRS repeat regions, and Zorro
              LINEs), formatted as a RepeatMasker library. CGD used this library for the
              cross-species homology survey.
            </p>
            <div className="help-links">
              <a href={`${REPEAT_TE_DIR}/albicans_te_seeds.fasta`}>albicans_te_seeds.fasta</a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>De Novo Repeat Consensus Libraries</strong></h3>
            <p>
              Per-species RepeatModeler2 consensus libraries (<code>-families.fa</code>), and
              the same consensi with TEsorter/REXdb classifications
              (<code>_tesorter.cls.lib</code>).
            </p>
            <ul>
              {SPECIES_LIBRARIES.map(({ tag, species, strain }) => (
                <li key={tag}>
                  <em>{species}</em> {strain}:{' '}
                  <a href={`${REPEAT_TE_DIR}/${tag}-families.fa`}>{tag}-families.fa</a>
                  {' | '}
                  <a href={`${REPEAT_TE_DIR}/${tag}_tesorter.cls.lib`}>{tag}_tesorter.cls.lib</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="help-item">
            <h3><strong>Pipeline Scripts</strong></h3>
            <p>
              The discovery, candidate-extraction, and loading scripts are in the public CGD
              GitHub repository.
            </p>
            <div className="help-links">
              <a
                href={`${GITHUB_REPO}/tree/main/scripts/repeat_te`}
                target="_blank"
                rel="noopener noreferrer"
              >
                candidagenome/cgd-backend &rarr; scripts/repeat_te
              </a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Annotation Strategy Document</strong></h3>
            <p>
              The full description of the annotation strategy: tools, parameters, curator
              review, feature typing, and naming.
            </p>
            <div className="help-links">
              <a
                href={`${GITHUB_REPO}/blob/main/docs/REPEAT_TE_ANNOTATION_STRATEGY.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                REPEAT_TE_ANNOTATION_STRATEGY.md
              </a>
            </div>
          </div>

          <div className="help-item">
            <h3><strong>Repeat/TE Feature Coordinates</strong></h3>
            <p>
              Genome coordinates of the released repeat/TE features (along with all other
              annotated features) are in the per-species GFF files, which are regenerated
              weekly from the database. Filter by feature type (<code>retrotransposon</code>,{' '}
              <code>DNA_transposon</code>, <code>long_terminal_repeat</code>,{' '}
              <code>repeat_region</code>) to extract them.
            </p>
            <div className="help-links">
              <a href="/download/gff/">Go to the GFF Directory</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepeatTEDownloadsPage;
