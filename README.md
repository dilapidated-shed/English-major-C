# English Major C

English Major C is an experimental programming language specified in ordinary English with lawyer-like precision. It is not a programming tutorial and is not claimed to have a working parser, compiler, or runtime.

**Start here:** [Given a machine: objects, processes, and execution](architecture/armv7-a/t32/Given%20a%20machine%20-%20objects%20and%20execution.english). Read the closed operation grant next, then the architecture provenance and alternatives record.

## Given these exact documents

1. [Given a machine - objects and execution.english](architecture/armv7-a/t32/Given%20a%20machine%20-%20objects%20and%20execution.english) defines the execution index, software-visible registers, memory, permissions, fetching, branching and the boundary between code and data.
2. [All and only these initial operations are permitted.english](architecture/armv7-a/t32/All%20and%20only%20these%20initial%20operations%20are%20permitted.english) names the **initial, deliberately limited** scalar T32 operation set in long English. Its ARM mappings and ISA limitations are normative constraints, not assembler shortcuts.
3. [Instruction set architecture - sources and unfulfilled coverage.english](architecture/armv7-a/t32/Instruction%20set%20architecture%20-%20sources%20and%20unfulfilled%20coverage.english) identifies ARM DDI 0406C.d, optional extensions, revision and verification obligations, and what is **not yet** completely specified.
4. [Choices for missing-value branching and execution.english](decisions/Choices%20for%20missing-value%20branching%20and%20execution.english) retains competing strategies and the tests required to select one. This is a decision history, not an assembly-performance claim.
5. The separately authored exact definition of "execution index" is under [PR #2 — Define the execution index](https://github.com/dilapidated-shed/English-major-C/pull/2); that PR remains a separate merge/acceptance item.

## Assembly-to-English decompilation target

[What a final English translation of assembly must contain.english](decompilation/What%20a%20final%20English%20translation%20of%20assembly%20must%20contain.english) defines the bottom-up translation target: begin from actual decoded machine instructions, account for all their machine-visible effects, preserve the original assembly and machine-code evidence, and allow arbitrarily extensive non-executable `(NOTE: ...)` and `(WHY? BECAUSE: ...)` explanations. This does **not** attempt to reproduce the route from R or another high-level language to the executable. The same principles apply to later A32 or x86-64 specimens after their exact machine contracts are supplied. The current 52-operation T32 grant is not enough to claim every possible real disassembly can already be expressed.

## Contract status

This revision is a **first source-level machine contract and closed initial operation profile**. It is **NOT** a complete independent transcription, enumeration, verification, or implementation of all ARMv7-A T32, Advanced SIMD, VFP, coprocessor, system, exception, or optional-extension instructions. Listing a short allowed vocabulary does not mean the physical CPU lacks other instructions.

The designated target is a **symbolic ARMv7-A processor executing T32 in unprivileged user mode**. No processor part number, DRAM part number, actual peripheral address, cache geometry, Android executable permission, VFP/NEON feature bit, or silicon timing has been measured or inferred. A deployed program must bind those facts in an independently verified target manifest before asserting that it runs on a particular device.

Authoring and GitHub publication of these text files are **not** evidence of language parsing, formal equivalence, compilation, ARM execution, or performance. No execution strategy is accepted merely because it appears in prose.

## Tracking

- [English Major C design and future Idris frontend exploration](https://github.com/dilapidated-shed/English-major-C/issues/1)
- [Flexible Pipes job envelope for this architecture source](https://github.com/isomorphisms/flexible-pipes/issues/91)
- [Execution-index definition job](https://github.com/isomorphisms/flexible-pipes/issues/90)
- No direct main-branch publication, merge authorization, or AICI acceptance is implied by the presence of this text.
