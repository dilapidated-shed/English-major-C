# Atomic A32 instruction parser in Idriç

This is a **separate ARMv7-A A32 assembly/disassembly parser**, not a replacement
for the existing English-sentence `DiscreteInterpreter.idric` and not a
complete ARM ISA decoder or executor. It reads GNU objdump lines containing
an instruction address, eight hexadecimal machine-word digits and a printed
assembly operation. It accepts an operation only when Idriç can construct
typed operands **and independently re-encode the same 32-bit word**.

## QR-only machine-word target (human correction, 2026-10-19)

English Major ARM targets **only the original machine instructions used by the
selected QR translation**. This is an evidence-bounded translation project,
**not** an effort to enumerate or implement the ARM instruction set.

The primary sources are the preserved original QR ARMv7-A A32 object words,
their relocation-bearing disassemblies, and the selected linked/recorded
execution path. For every in-scope instruction occurrence, retain its exact
address, 32-bit word, architectural encoding variant, operands, condition,
provenance and English state effects. A relocation and a literal/data word
must not be mistaken for an instruction. A missing external callee is recorded
as a boundary rather than supplied by invention.

A typed instruction form is eligible **only if at least one saved QR machine
word requires that form**. Each form retains its full descriptive English name,
typed operands and exact checked encoding. Admission of a form permits the
checked operand values that its definition allows; **it does not imply support
for the rest of that mnemonic, unrelated encodings, or any whole-ISA profile**.
No instruction form is added merely because it appears in an ARM reference.
Only use T32/Thumb, VFP/NEON, or other state families if the selected QR machine
words or their recorded execution actually require them.

The first accepted portion is exactly 23 A32 words at offsets 0x0000–0x0058
of the original `dqrls` entry, representing six forms with occurrence counts:
stack register save **1**, register copy **4**, word load **7**, immediate
subtraction **1**, shifted-bit clearing **2**, word store **8**. The call at
0x005c remains outside this accepted prefix because its target is relocated.
This is a **prefix**, not the whole QR routine; subsequent expansion is driven
by the saved QR words, never a universal ISA checklist.

For acceptance, report four separate counts: original QR word/byte accounting,
decoded typed forms, mechanically checked English effects, and matched
observed execution transitions. Reject unknown instructions explicitly.
Preserve the complete-original-listing rejection test until that whole
selected listing genuinely has implemented word-by-word semantics.
The controlling work scope is
[Flexible Pipes #228](https://github.com/isomorphisms/flexible-pipes/issues/228).

## Atomic register and instruction identities

`A32Atoms.idric` declares sixteen distinct singleton types, `r0` through
`r15`, rather than an enumeration whose alternatives share one register type.
`a32_register` is a tagged union of those atom types; narrower choices
`a32_data_register`, `a32_non_pc_register`, and `a32_stack_member`
admit particular register roles. These subset types are intentionally **more
restrictive than the complete A32 architecture**: special PC/SP encodings
will get their own instruction forms instead of being guessed here.

Aliases `sb`, `sl`, `fp`, `ip`, `sp`, `lr` and `pc` refer to the
same physical register as `r9`–`r15` respectively; alias spelling is not
another physical register type.

Each permitted operation form also has its **own singleton opcode type**.
`a32_instruction` then constructs only the operand shapes associated with
those opcodes: registers, base register and unsigned immediate offset, a
nonempty push-register list, or an immediate shift. The original source text and one-based line number are
retained separately from the typed instruction. The machine word and address are
retained as separate listing evidence, not an executable value.

A production type-indexed instruction family can later replace the closed
`a32_instruction` union. This initial implementation already prevents
constructing one instruction form with another form's opcode type.

## Deliberately admitted A32 subset

| Opcode atom | Printed GNU mnemonic | Exact admitted encoding form |
| --- | --- | --- |
| `form_for_storing_selected_register_values_below_stack_pointer_with_stack_pointer_writeback` | `push {…}` | A32 STMDB SP!, nonempty distinct register list, excludes SP/PC |
| `form_for_copying_thirty_two_bit_register_contents_without_changing_condition_flags` | `mov Rd, Rm` | A32 register, no shift, no flag update |
| `form_for_loading_thirty_two_bits_using_base_plus_unsigned_immediate_without_base_writeback` | `ldr Rt, [Rn, #imm]` | A32 positive unsigned 12-bit offset, preindexed, no writeback, word transfer |
| `form_for_storing_thirty_two_bits_using_base_plus_unsigned_immediate_without_base_writeback` | `str Rt, [Rn, #imm]` | Same immediate/addressing form; store word |
| `form_for_subtracting_unrotated_eight_bit_immediate_without_changing_condition_flags` | `sub Rd, Rn, #imm` | A32 immediate, unrotated 0–255, no flag update |
| `form_for_clearing_bits_selected_by_sign_extending_right_shift_without_changing_condition_flags` | `bic Rd, Rn, Rm, asr #shift` | A32 register mask, arithmetic right shift 1–31, no flag update |

All six are currently **AL/unconditional forms**. The fixed `0xE`
condition nibble is checked through independent word reconstruction.
Other condition suffixes, rotated immediates, literal loads, PC writes,
bit operations, VFP/NEON, exceptions, branch/return instructions, relocations
and Thumb encodings are **not** claimed to be understood.

`push` is the printed alias of the A32 STMDB SP!, register-list encoding.
It has a distinct typed atom for the documented source-level operation,
while `expected_machine_word` reconstructs the actual A32 encoding.

## Source and acceptance

- Real source fixture:
  `examples/r-lm-native-armv7-a32/dqrls.armv7-a32.disasm.txt`.
- First accepted prefix: instruction offsets `0x0`–`0x58` inclusive,
  **23 actual saved four-byte A32 words**. The following `BL` at `0x5c`
  with its linker relocation is intentionally rejected by this version.
- `test-a32.mjs` invokes **the Idriç-compiled executable** on this prefix;
  it checks all 23 expected normalized instructions and rejects altered raw
  words, altered operands, illegal register roles, duplicates, overlarge
  offsets, unimplemented shift forms and unknown branch instructions.
- List-section headings, object headers and symbol headings are classified; explicit
  `R_ARM_CALL` annotation rows and `.word` lines are not executed. Every accepted record retains
  its original line number and text. `--with-source` exposes these records.
  Unknown records fail closed instead of silently losing input.
  This is **not** complete byte/section accounting. That remains owned by
  the separate ARM inventory and relocation audit.

The existing exact-head workflow builds with canonical Idriç revision
`2734ac5a86610eddfab73b1644d72b4ac85a65ee`. The reproducible Kitchen/Ike
qualification route is tracked with the assignment in Flexible Pipes issue 228.

The GitHub Actions workflow pins the Idriç source revision
`2734ac5a86610eddfab73b1644d72b4ac85a65ee`, bootstraps and runs its
existing compiler smoke before attempting the parser build. Until that exact
workflow completes, the Idriç parser **must not be described as compiled or
executed**. Even a passing host run establishes only parsing/encoding checks;
it does not execute ARM code or provide independent AICI acceptance.

## Next QR-driven slices

1. Resolve and type the saved relocation-backed call at `dqrls` offset
   `0x5c`; use the linked target, never the unlinked placeholder as a
   literal runtime destination.
2. Enumerate each original machine word in the **selected QR translation**
   beyond the first 23, including the relevant `dqrls`, `dqrdc2`,
   `dqrsl` routines and captured linked execution only where selected.
   Distinguish code bytes, literal data, relocation sites, and unavailable
   external bodies. Build a finite, evidence-derived coverage denominator.
3. Add separate full-English Idriç atomic forms only for **new encoding forms
   present in that QR inventory** (for example, comparisons, addition, shifts,
   paired storage, returns or floating-point operations when encountered).
   Independently check saved words against typed operands; retain hostile
   mutation and unsupported-form rejection tests.
4. Implement exact English machine-state effects for those QR-attested forms:
   reads/writes, flags, execution index, memory, faults, stack, calls, return
   and ABI effects as relevant. Compare saved machine-state traces and
   numerical results under explicit floating-point assumptions.

**Out of scope:** a complete ARMv7-A A32 or T32 instruction catalogue,
instruction families absent from the selected QR translation, generic
full-language acceptance, and unrelated compiler backends. Other projects
can add broader ISA coverage under separate assignments.
