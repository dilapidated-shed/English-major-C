// This harness supplies genuine objdump input to the Idriç-built executable.
// It does NOT parse ARM instructions on behalf of Idriç or count source patterns
// as language execution. Pinned A32 expected words/operands are independent
// machine-listing acceptance assertions, not an executable instruction model.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, mkdtempSync, writeFileSync, rmSync, statSync} from 'node:fs';
import {spawnSync,execFileSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';

const executable=process.env.A32_BINARY;
if (!executable || !resolve(executable).startsWith(process.cwd()) ||
    !statSync(executable).isFile()) throw new Error('Missing actual Idriç-built A32_BINARY');
const original=readFileSync('examples/r-lm-native-armv7-a32/dqrls.armv7-a32.disasm.txt','utf8');
const sourceHead=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
if (process.env.EXPECTED_SOURCE_SHA && sourceHead!==process.env.EXPECTED_SOURCE_SHA)
  throw new Error('The input checkout is not the exact requested PR head');
console.log('A32_IDRIC_SOURCE_HEAD '+sourceHead);

function actualParse(source) {
  const dir=mkdtempSync(join(tmpdir(),'emc-a32-idric-'));
  try {
    const input=join(dir,'listing.txt');writeFileSync(input,source);
    return spawnSync(executable,[input],{encoding:'utf8',timeout:15000,
      maxBuffer:1024*1024,shell:false});
  } finally {rmSync(dir,{recursive:true,force:true});}
}
function accepted(source) {
  const result=actualParse(source);
  assert.equal(result.error,undefined,String(result.error));
  assert.equal(result.status,0,result.stdout+'\n'+result.stderr);
  return result.stdout.trim().split('\n');
}
function rejected(source,message) {
  const result=actualParse(source);
  assert.equal(result.error,undefined,String(result.error));
  assert.notEqual(result.status,0,'Invalid instruction unexpectedly accepted: '+source);
  assert.match(result.stdout,new RegExp(message));
}

const expected=[
  '0|e92d4ff0|push_a1|register_mask=20464',
  '4|e1a06003|mov_register_a1|r6|r3',
  '8|e592c000|ldr_immediate_a1|r12|r2|0',
  '12|e24dd04c|sub_immediate_a1|r13|r13|76',
  '16|e5914000|ldr_immediate_a1|r4|r1|0',
  '20|e1a03002|mov_register_a1|r3|r2',
  '24|e1a0a001|mov_register_a1|r10|r1',
  '28|e1cc8fcc|bic_asr_a1|r8|r12|r12|asr|31',
  '32|e59dc074|ldr_immediate_a1|r12|r13|116',
  '36|e1c44fc4|bic_asr_a1|r4|r4|r4|asr|31',
  '40|e59d2084|ldr_immediate_a1|r2|r13|132',
  '44|e58dc000|str_immediate_a1|r12|r13|0',
  '48|e59dc088|ldr_immediate_a1|r12|r13|136',
  '52|e58d2004|str_immediate_a1|r2|r13|4',
  '56|e58dc00c|str_immediate_a1|r12|r13|12',
  '60|e59d208c|ldr_immediate_a1|r2|r13|140',
  '64|e59dc090|ldr_immediate_a1|r12|r13|144',
  '68|e58d2008|str_immediate_a1|r2|r13|8',
  '72|e1a02001|mov_register_a1|r2|r1',
  '76|e58dc010|str_immediate_a1|r12|r13|16',
  '80|e58d0028|str_immediate_a1|r0|r13|40',
  '84|e58d302c|str_immediate_a1|r3|r13|44',
  '88|e58d8038|str_immediate_a1|r8|r13|56'
];
const machineLines=original.split('\n').filter(line=>/^\s*[0-9a-f]+:\s+[0-9a-f]{8}\s+\S+/i.test(line));
const prefix=machineLines.filter(line=>
  parseInt(line.match(/^\s*([0-9a-f]+):/i)[1],16)<=0x58);
assert.equal(prefix.length,23,'The original QR disassembly prefix has changed');

test('all 23 original dqrls A32 words match independently checked typed operands',()=>{
  assert.deepEqual(accepted(prefix.join('\n')+'\n'),[...expected,'A32_CHECKED_INSTRUCTIONS=23']);
});
test('source headers, symbol declarations and relocation rows are not instructions',()=>{
  assert.deepEqual(accepted('Disassembly of section .text:\n00000000 <dqrls_>:\n'+
    '5c: R_ARM_CALL dqrdc2_\n'),['A32_CHECKED_INSTRUCTIONS=0']);
});
test('physical alias sl identifies register r10 and ip identifies r12',()=>{
  assert.deepEqual(accepted('18: e1a0a001 mov sl, r1\n'+
    '8: e592c000 ldr ip, [r2]\n'),[
      '24|e1a0a001|mov_register_a1|r10|r1',
      '8|e592c000|ldr_immediate_a1|r12|r2|0',
      'A32_CHECKED_INSTRUCTIONS=2'
  ]);
});
test('an incorrect printed source operand cannot survive a correct machine word',()=>{
  rejected('4: e1a06003 mov r6, r2\n','disagrees');
  rejected('8: e592c000 ldr ip, [r3]\n','disagrees');
});
test('register type restrictions reject PC and SP when disallowed',()=>{
  rejected('4: e1a06003 mov sp, r3\n','Unsupported');
  rejected('4: e1a06003 mov r6, pc\n','Unsupported');
  rejected('8: e592c000 ldr ip, [pc]\n','Unsupported');
});
test('reject incorrect opcode, flag variant, unknown shift and bad immediate',()=>{
  rejected('4: e1b06003 mov r6, r3\n','disagrees');
  rejected('4: e1a06003 mov r6, r3, lsl #2\n','Unsupported');
  rejected('1c: e1cc8fcc bic r8, ip, ip, asr #0\n','Unsupported');
  rejected('c: e24dd04c sub sp, sp, #257\n','Unsupported');
  rejected('8: e592c000 ldr ip, [sp, #4096]\n','Unsupported');
});
test('reject duplicate push registers and malformed machine word',()=>{
  rejected('0: e92d4ff0 push {r4, r4, r6}\n','Unsupported');
  rejected('4: z1a06003 mov r6, r3\n','Malformed');
});
test('unknown BL/relocation remains unsupported rather than silently parsed',()=>{
  rejected('5c: ebfffffe bl 0 <dqrdc2_>\n','Unsupported');
  rejected(original,'Unsupported');
});
