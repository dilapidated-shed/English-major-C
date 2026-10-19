# Atomic A32 instruction parser in Idriç

This is a **separate ARMv7-A A32 assembly/disassembly parser**, not a replacement
for the existing English-sentence `DiscreteInterpreter.idric` and not a
complete ARM ISA decoder or executor. It reads GNU objdump lines containing
an instruction address, eight hexadecimal machine-word digits and a printed
assembly operation. It accepts an operation only when Idriç can construct
typed operands **and independently re-encode the same 32-bit word**.

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

## Next slices

The word-only decoder in `A32Decode.idric` extracts fixed fields and typed
register operands directly from a saved word, before any printed assembly is
considered. The listing parser also reconstructs the word from printed operands.
This additional check is limited to the same six forms. `--word HEXWORD`
exercises the raw decoder; it does not execute the decoded instruction.

`profile.tsv` pins the actual architectural PDF and archived target facts.
Optional features remain unqualified until their eligibility and semantics are
checked. No complete ISA denominator or whole-language acceptance is claimed.

1. Parse conditional A32 branches and the exact branch-and-save-return relocation at
   `0x5c`, without treating unlinked placeholder destinations as executable
   absolute addresses.
2. Add separate atomic forms for comparison, addition, zero-filling left shift,
   adjacent doubleword storage, stack restoration, and every further operation in the three
   QR routines. Account for skipped data/literal regions and source spans.
3. Enumerate the **complete ISA** against a pinned ARMv7-A architectural
   reference, including the encoding/form distinctions hidden by aliases.
   Every form must have an atomic type and explicit operand constraints.
4. Extend to T32 as a separate selected-machine catalogue, preserving
   two-byte/four-byte instruction boundaries and ITSTATE.
5. Give checked forms explicit English state-transformer contracts:
   integer/APSR/FPSCR state, execution-index changes, memory and faults,
   and the AAPCS32 ABI boundary. Compare with real recorded machine traces.
