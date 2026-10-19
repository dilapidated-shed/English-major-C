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
nonempty push-register list, or an immediate shift. The raw `Text` input is
discarded at the typed instruction boundary. The machine word and address are
retained as separate listing evidence, not an executable value.

A production type-indexed instruction family can later replace the closed
`a32_instruction` union. This initial implementation already prevents
constructing one instruction form with another form's opcode type.

## Deliberately admitted A32 subset

| Opcode atom | Printed GNU mnemonic | Exact admitted encoding form |
| --- | --- | --- |
| `opcode_push_a1` | `push {…}` | A32 STMDB SP!, nonempty distinct register list, excludes SP/PC |
| `opcode_mov_register_a1` | `mov Rd, Rm` | A32 register, no shift, no flag update |
| `opcode_ldr_immediate_a1` | `ldr Rt, [Rn, #imm]` | A32 positive unsigned 12-bit offset, preindexed, no writeback, word transfer |
| `opcode_str_immediate_a1` | `str Rt, [Rn, #imm]` | Same immediate/addressing form; store word |
| `opcode_sub_immediate_a1` | `sub Rd, Rn, #imm` | A32 immediate, unrotated 0–255, no flag update |
| `opcode_bic_asr_a1` | `bic Rd, Rn, Rm, asr #shift` | A32 register mask, arithmetic right shift 1–31, no flag update |

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
- List-section headings and symbol headings are ignored; explicit
  `R_ARM_CALL` annotation rows and `.word` lines are not executed.
  This is **not** complete byte/section accounting. That remains owned by
  the separate ARM inventory and relocation audit.

Build with pinned canonical Idriç, matching the existing independent Idriç
experiment:

```sh
/path/to/pinned/Idric/build/exec/idris2 --build english-a32.ipkg
A32_BINARY="$PWD/build/exec/english-a32" node --test research/a32-typed/test-a32.mjs
```

The GitHub Actions workflow pins the Idriç source revision
`2734ac5a86610eddfab73b1644d72b4ac85a65ee`, bootstraps and runs its
existing compiler smoke before attempting the parser build. Until that exact
workflow completes, the Idriç parser **must not be described as compiled or
executed**. Even a passing host run establishes only parsing/encoding checks;
it does not execute ARM code or provide independent AICI acceptance.

## Next slices

1. Parse conditional A32 branches and the exact `BL` relocation at
   `0x5c`, without treating unlinked placeholder destinations as executable
   absolute addresses.
2. Add separate atomic forms for `CMP`, `ADD`, `LSL`, `STRD`,
   `POP`, and every further A32 operation actually occurring in the three
   QR routines. Account for skipped data/literal regions and source spans.
3. Enumerate the **complete ISA** against a pinned ARMv7-A architectural
   reference, including the encoding/form distinctions hidden by aliases.
   Every form must have an atomic type and explicit operand constraints.
4. Extend to T32 as a separate selected-machine catalogue, preserving
   two-byte/four-byte instruction boundaries and ITSTATE.
5. Give checked forms explicit English state-transformer contracts:
   integer/APSR/FPSCR state, execution-index changes, memory and faults,
   and the AAPCS32 ABI boundary. Compare with real recorded machine traces.
