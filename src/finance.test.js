import { test } from 'node:test';
import assert from 'node:assert/strict';
import { totals, parseAmount } from './finance.js';
test('receitas, todos os custos e ROAS usam valores em centavos', () => {
  assert.deepEqual(totals([{type:'revenue',amount:100000},{type:'expense',category:'Anúncios',amount:25000},{type:'expense',category:'BM',amount:10000}]),{revenue:100000,expenses:35000,profit:65000,roas:4});
});
test('ROAS sem anúncios não divide por zero e prejuízo é negativo', () => {
  assert.deepEqual(totals([{type:'expense',category:'Domínio',amount:9900}]),{revenue:0,expenses:9900,profit:-9900,roas:null});
});
test('valor brasileiro mantém precisão e rejeita entradas ambíguas', () => {
  assert.equal(parseAmount('19,90'),1990);
  assert.equal(parseAmount('0,01'),1);
  for (const input of ['0','-1','1.000','1,234','abc','Infinity','']) assert.equal(parseAmount(input),null);
});
