# English Major Fortran inventory — blocked preflight

**EMC-FORTRAN-COVER-01 is incomplete.** Source identities and tree metadata are
preserved; byte accounting, semantic qualification, language coverage and
independent acceptance have not run.

The [exact FP envelope](https://github.com/isomorphisms/flexible-pipes/blob/646957bcdf0fbce3492553f84bc67b818dca643f/tasks/emc-fortran-cover-01/assignment.txt)
is authoritative for this attempt. [Tracking issue #224](https://github.com/isomorphisms/flexible-pipes/issues/224)
does not establish dispatch or acceptance.

## Present, missing, unknown

- Present: all six requested PR-head commit objects, with full immutable pins,
  PR titles and observed stack/state in [source-heads.tsv](source-heads.tsv).
  [provenance/](provenance/) contains their complete Git-tree metadata:
  respectively 68, 41, 68, 92, 40 and 22 entries. These **331 snapshot entries
  overlap**; the number is not an instruction count or a unique-corpus total.
- Missing implementation: a Kitchen inventory recipe, a matching independent
  ai-ci checker, and resolved Grease/Ike executables on this host.
- Unknown: byte/instruction completeness, source-to-machine mapping, verified
  semantic coverage, library closure and the Fortran language denominator.
  The [coverage matrix](coverage.tsv) keeps each separate.
- Historical starting figures from the assignment — x86 2,835 overlapping rows,
  ARM A32 1,149 instructions, 16 data words, 43 relocations and 64 overlapping x86
  CALL records — are **unrecomputed inputs**, not new findings.
- The later ARM softfp tree includes five reference BLAS source/object pairs
  and a linked ELF. The independent library inventory must examine these.
  It would be false to label every BLAS body absent from every specimen.
  The ARM hardfp linked specimen, softfp A32 objects, and T32 material must remain
  separate; no new instruction-mode determination is claimed here.

## Observed refusal

The candidate `emc-fortran-cover-01-preflight` pipeline actually ran at published
FP control commit `646957bcdf0fbce3492553f84bc67b818dca643f`, using the existing
maintained `scripts/run-pipeline` interface. That legacy controller uses Python;
no new Python logic or replacement controller was authored.

Envelope/material integrity and all six commit-availability stages returned 0.
`kitchen-owned-recipe` returned 128 because the proposed recipe path does not
exist at Kitchen `a91df2ef2bf0d37fb32c10be0a2f8208648220e0`.
The overall run returned 1 / FAIL. The independent-checker stage was **not run**.
The exact receipt and stdout/stderr are in [preflight/](preflight/).
The earlier local-control attempt is retained separately, including its original
commit object text; it is not relabeled as the published-control run.

This proves a failed material-availability preflight only. It does not prove
protected production admission, model-worker dispatch, an inventory run,
independent ai-ci acceptance, or leaf-head semantic testing. Even a future
successful availability check would not prove those claims.

## Evidence and preservation

The draft is based on main `6ffb09e771fecedf4852be34a6cde6cc910ab415`.
It changes only `coverage/fortran/`; original sources, binaries, annotations,
historical findings, checks and the QR interpreter are unchanged.
It neither merges nor restacks the independent experiments.

Each tree table row preserves PR number, full source commit, mode, object type,
Git object identity, byte length and exact path from `git ls-tree -r -l`.
Git blob identity is **not** a newly measured SHA-256 or a semantic certificate.
The tables include whole trees to avoid dropping a potentially relevant original
before corpus selection. They deliberately do not select only the three routines.

To reproduce tree metadata, obtain each exact commit in source-heads.tsv and use
Git's recursive long tree listing with `core.quotepath=false`; prepend the PR and
commit columns and normalize its mode/type/object/size fields into TSV.
No independent checking script is claimed: authoring and qualification of the
recipe/checker remain required. No percentage is reported.

## Remaining acceptance

[missing.tsv](missing.tsv) enumerates missing implementation, unexamined areas
and recovery paths. [follow-ups.md](follow-ups.md) gives the first bounded SUN
recovery job. Later semantic/corpus jobs must follow actual inventory findings;
they have not been invented from unexamined sources.

Required corrupted examples — drop, duplicate, reorder, byte alteration,
relocation loss, literal-as-code, swallowed gap, duplicate linked copy, false
library coverage and false semantic completion — remain NOT IMPLEMENTED / NOT RUN.
The Fortran feature overclaim case remains NOT IMPLEMENTED / NOT RUN too.

Source availability is 6/6. All other coverage numerators and denominators remain
UNKNOWN. Existing semantic audit results may prove some facts once examined;
UNKNOWN must not be replaced with a claim of zero prior knowledge.

Do not mark this job COMPLETE or merge the draft from this preflight. Recovery
requires the named owner implementation and exact runtime identities, a new
admitted inventory run, a separately pinned independent oracle, all corruption
negatives, and exact leaf-head receipts.
