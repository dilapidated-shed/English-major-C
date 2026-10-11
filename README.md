# English Major C

English Major C is an experimental programming language specified in ordinary English with lawyer-like precision. It is not a programming tutorial and is not claimed to have a working parser, compiler, or runtime.

**Start here:** [Given a machine: objects, processes, and execution](architecture/armv7-a/t32/Given%20a%20machine%20-%20objects%20and%20execution.english). Read the closed operation grant next, then the architecture provenance and alternatives record.

## Given these exact documents

1. [Given a machine - objects and execution.english](architecture/armv7-a/t32/Given%20a%20machine%20-%20objects%20and%20execution.english) defines the execution index, software-visible registers, memory, permissions, fetching, branching and the boundary between code and data.
2. [All and only these initial operations are permitted.english](architecture/armv7-a/t32/All%20and%20only%20these%20initial%20operations%20are%20permitted.english) names the **initial, deliberately limited** scalar T32 operation set in long English. Its ARM mappings and ISA limitations are normative constraints, not assembler shortcuts.
3. [Instruction set architecture - sources and unfulfilled coverage.english](architecture/armv7-a/t32/Instruction%20set%20architecture%20-%20sources%20and%20unfulfilled%20coverage.english) identifies ARM DDI 0406C.d, optional extensions, revision and verification obligations, and what is **not yet** completely specified.
4. [Choices for missing-value branching and execution.english](decisions/Choices%20for%20missing-value%20branching%20and%20execution.english) retains competing strategies and the tests required to select one. This is a decision history, not an assembly-performance claim.
5. The separately authored exact definition of "execution index" is under [PR #2 — Define the execution index](https://github.com/dilapidated-shed/English-major-C/pull/2); that PR remains a separate merge/acceptance item.

## Exact instruction-fetch, control-flow, and code/data documents

The following additional files narrow the initial machine model without pretending the complete ARM ISA has already been defined.

- [Which instruction is next and how it is found.english](architecture/armv7-a/t32/Which%20instruction%20is%20next%20and%20how%20it%20is%20found.english): two-byte and four-byte T32 decoding, execution index versus PC operand, branch destinations, BL return tagging, and source-level instruction boundaries.
- [Exactly when execution branches.english](architecture/armv7-a/t32/Exactly%20when%20execution%20branches.english): all the common condition predicates stated in English, signed/unsigned comparisons, CBZ/CBNZ restrictions, IT, indirect calls and TBB/TBH table data.
- [When bytes mean data and when bytes mean instructions.english](architecture/armv7-a/t32/When%20bytes%20mean%20data%20and%20when%20bytes%20mean%20instructions.english): byte interpretations, user-process permissions, native machine code versus interpreted bytecode, executable memory, and alternative designs.
- [What the current instruction grant does not yet contain.english](architecture/armv7-a/t32/What%20the%20current%20instruction%20grant%20does%20not%20yet%20contain.english): missing stack, arithmetic, memory, synchronization, floating-point, SIMD and system instruction families; the independent completeness obligations.

An initial byte-level bottom-up witness is [One actual Thumb branch listing translated from the bottom upward.english](examples/One%20actual%20Thumb%20branch%20listing%20translated%20from%20the%20bottom%20upward.english), based on a pinned Android Open Source Project assembler expectation. It records exact observed 16-bit halfwords and an independently specified English trace. The witness revealed that **MOVS (immediate) with flag changes requires a distinct long English operation**, now entry 53 in the initial grant. The specified trace has NOT been executed by an English Major C interpreter.

## Stack operations and word-transfer examples

[How registers enter memory and return from a stack.english](architecture/armv7-a/t32/How%20registers%20enter%20memory%20and%20return%20from%20a%20stack.english) defines seven additional **narrow** T32 instructions: PUSH, POP without or with a PC branch, STMIA, LDMIA, and immediate additions/subtractions of SP. The list ordering, exact transfer addresses, normal-success writeback, fault boundaries, T32-only return state and still-ungranted wide forms are explicitly recorded.

[Actual Thumb word transfers translated into English.english](examples/Actual%20Thumb%20word%20transfers%20translated%20into%20English.english) reads four pinned Android ART assembler expectation halfwords, `C409`, `CC09`, `B014` and `B094`, as independent instruction specimens. It does not pretend their original fixture arrays constitute one executed program.

The closed initial scalar operation grant now contains **64** entries, not the full ARMv7-A T32 ISA. Presence of an instruction in hardware is not equivalent to its authorization in this initial English Major C profile.

[Actual wide Thumb multiple-word operations in long English.english](examples/Actual%20wide%20Thumb%20multiple-word%20operations%20in%20long%20English.english) adds four precise, separately named 32-bit T32 STMIA and LDMDB operations, with and without base-register writeback. Each is anchored to a separate pinned AOSP expected-disassembly entry. The specification does not silently equate a four-byte Thumb encoding with two consecutive two-byte instructions.

## Assembly-to-English decompilation target

[What a final English translation of assembly must contain.english](decompilation/What%20a%20final%20English%20translation%20of%20assembly%20must%20contain.english) defines the bottom-up translation target: begin from actual decoded machine instructions, account for all their machine-visible effects, preserve the original assembly and machine-code evidence, and allow arbitrarily extensive non-executable `(NOTE: ...)` and `(WHY? BECAUSE: ...)` explanations. This does **not** attempt to reproduce the route from R or another high-level language to the executable. The same principles apply to later A32 or x86-64 specimens after their exact machine contracts are supplied. The current 64-operation T32 grant is not enough to claim every possible real disassembly can already be expressed.

## Contract status

This revision is a **first source-level machine contract and closed initial operation profile**. It is **NOT** a complete independent transcription, enumeration, verification, or implementation of all ARMv7-A T32, Advanced SIMD, VFP, coprocessor, system, exception, or optional-extension instructions. Listing a short allowed vocabulary does not mean the physical CPU lacks other instructions.

The designated target is a **symbolic ARMv7-A processor executing T32 in unprivileged user mode**. No processor part number, DRAM part number, actual peripheral address, cache geometry, Android executable permission, VFP/NEON feature bit, or silicon timing has been measured or inferred. A deployed program must bind those facts in an independently verified target manifest before asserting that it runs on a particular device.

Authoring and GitHub publication of these text files are **not** evidence of language parsing, formal equivalence, compilation, ARM execution, or performance. No execution strategy is accepted merely because it appears in prose.

## Tracking

- [English Major C design and future Idris frontend exploration](https://github.com/dilapidated-shed/English-major-C/issues/1)
- [Flexible Pipes job envelope for this architecture source](https://github.com/isomorphisms/flexible-pipes/issues/91)
- [Execution-index definition job](https://github.com/isomorphisms/flexible-pipes/issues/90)
- No direct main-branch publication, merge authorization, or AICI acceptance is implied by the presence of this text.
