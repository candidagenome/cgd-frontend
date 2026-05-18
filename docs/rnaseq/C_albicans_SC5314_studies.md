# C. albicans SC5314 RNA-Seq Studies

## Overview

This document tracks RNA-Seq dataset processing status for *Candida albicans* SC5314.

**Data location:** `/data/HTS/C_albicans_SC5314/bam/`

**Note:** C. albicans SC5314 is a diploid organism with two haplotypes (HapA and HapB). Samples may be aligned to one or both haplotypes.

## Completed Studies

| Study | Samples | Status | PMID | Notes |
|-------|---------|--------|------|-------|
| Bruno_2010 | 22 | Complete | 20810668 | |
| Desai_2013 | 20 | Complete | 23572557 | SC5314, WO-1, biofilms |
| Glazier_2023 | 24 | Complete | 37737633 | ROB1 allele |
| Lohse_2016 | 8 | Complete | 26772749 | Wor1p ChIP-Seq |
| Muzzey_2013 | 20 | Complete | 24025428 | By chromosome and haplotype |
| Niemiec_2017 | 24 | Complete | 28874114 | Hyphae v yeast by haplotype |
| Rai_2024 | 36 | Complete | 38905306 | OE discovers genes that repress biofilms |
| Shivarathri_2019 | 32 | Complete | 31263212 | (+/-) CSP in gcn5 v wt |
| Xie_2013 | 4 | Complete | 23555196 | White v opaque by haplotype |
| Zhang_2024 | 12 | Complete | 38921373 | (+/-) MMS |

**Total completed: 10 studies, 202 samples**

## In Progress

| Study | Samples | Completed | Status | PMID | Notes |
|-------|---------|-----------|--------|------|-------|
| Iracane_2024 | ? | 1 | Partial | 38625945 | RNAi paper - SC5314 only |

## Pending Studies (NEXT)

| Study | BioProject | PMID | Description | Priority |
|-------|------------|------|-------------|----------|
| Wu Y | PRJNA900690 | 37072087 | (+/-) miltefosine | NEXT |
| Yau KPS | ? | 37075064 | WT v rpn4 and (+/-) FLC | NEXT |
| Brandt et al | PRJNA925798 | 37097196 | (+/-) carbon and nitrogen sources | NEXT |
| Henry | GSE245114 | 38380913 | (+/-) manganese | NEXT |
| Danhof_2016 | GSE87832 | 27935835 | (+/-) carboxylic acids | NEXT |
| Azadmanesh_2017 | GSE99902 | 28951491 | Filamentation on diff media | NEXT |
| Wartenberg_2014 | PRJNA242634 | 25474009 | Microevolution in macrophages | NEXT |
| Zhang et al | PRJNA811694 | 38921373 | (+/-) MMS | NEXT |
| Zhang et al | PRJNA985884 | 38921373 | (+/-) MMS (+/-) rad53 | NEXT |
| Wang S et al | PRJNA1137062 | 39845529 | (+/-) EPA antibiofilm agent | NEXT |
| Gutzmann et al | GSE289051 | 40919816 | (+/-) CWH8 = (+/-) farnesol | NEXT |
| Lok et al | PRJNA981293 | 41564980 | Glucose v fructose v galactose +/- FLC | NEXT |

### Waiting for Data

| Study | PMID | Description |
|-------|------|-------------|
| Lash et al | 38980041 | Splicing and expression changes |
| Yue et al | 39929396 | (+/-) Berberine - targets iron transport |
| Zeise et al | 40401963 | Aerobic v anaerobic |

### Other Pending

| Study | BioProject | PMID | Description |
|-------|------------|------|-------------|
| Luther | PRJNA941841 | 37082713 | WT v sky1/sky2 null |
| Jin X | GSE209608 | 37160123 | (+/-) drug candidate H55 |
| Hu L | GSE226137 | 37173314 | (+/-) drug candidate 2H |
| Sharma | GSE198594 | 37405402 | WT v hgc1 mutants |
| Ganser et al | PRJNA1030346 | 38091321 | efg1 v brg1 v wt |
| Rashid et al | PRJNA798386 | 35350439 | SAGA complex subunits |
| Qi et al | PRJNA755282 | 35687592 | (+/-) Tor1 kinase |
| Reuter-Weissenberger | PRJNA752883 | 34781731 | (+/-) nigericin, brefeldin A |
| Anand et al | PRJNA714400 | 38139056 | (+/-) butanol stress |
| Scaduto et al | PRJNA404011 | 29255038 | White v opaque cells |
| Avelar | PRJEB47705 | 38259065 | Beta-glucan masking |
| Tao_2017 | GSE102039 | 28787458 | (+/-) CO2 in WT v sfl2 |
| Du_2015 | GSE64659 | 26350972 | GlcNAc 5h v 24h |
| Tscherner | GSE73409 | 26473952 | Responses to treatments |
| Cottier_2017 | GSE99767 | 28877970 | (+/-) weak acids |
| Cottier_2015 | GSE49310 | 25636313 | (+/-) weak acids |

### Lower Priority

| Study | BioProject | PMID | Reason |
|-------|------------|------|--------|
| Herzel lab | PRJNA1093142 | unpublished | Lower priority |
| Guan_2023 | PRJNA946283 | 37933972 | Lower priority |
| van Wijlick_2022 | PRJNA853561 | 36004328 | Lower priority |
| Liboro_2021 | PRJNA574426 | 33796481 | Lower priority |
| Koch_2018 | PRJNA414964 | 30463019 | Lower priority |
| Zhu et al | PRJNA1102310 | 38921377 | Lower priority |

### Skipped

| Study | BioProject | PMID | Reason |
|-------|------------|------|--------|
| Tirosh et al | PRJNA79981 | 21930916 | Wouldn't align |
| Choudhary et al | PRJNA945876 | 37610232 | Wouldn't align |
| Dumeaux et al | PRJNA842701 | 37888959 | Wouldn't align |

## Processing Notes

- Processing server: `cgd-frontend-dev`
- Pipeline scripts: `scripts/dataset_import/`
- Working directory: `/data/tmp/dataset_import/`
- Final output: `/data/HTS/C_albicans_SC5314/bam/<study>/`
- Haplotype alignment: Files go to `<study>/HapA/` and `<study>/HapB/`

## Last Updated

2025-05-16
