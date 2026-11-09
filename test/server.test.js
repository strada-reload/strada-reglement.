'use strict';
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createServer } = require('../index');
const { validate, render } = require('../build');
const data = require('../content.json');
let server, base;
before(async () => { server=createServer(); await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); base=`http://127.0.0.1:${server.address().port}`; });
after(async () => { await new Promise(resolve=>server.close(resolve)); });
test('Serves both complete regulations, aliases and assets', async () => {
  for (const url of ['/', '/index.html', '/discord.html','/discord','/ig.html','/ig','/style.css','/app.js','/assets/logo.png','/assets/regular.ttf']) {
    const response=await fetch(base+url);assert.equal(response.status,200,url);assert.ok((await response.arrayBuffer()).byteLength>0,url);
  }
  const discord=await (await fetch(base+'/discord')).text();assert.equal((discord.match(/data-rule/g)||[]).length,12);
  const ig=await (await fetch(base+'/ig')).text();assert.equal((ig.match(/data-rule/g)||[]).length,16);
});
test('Does not expose server files, content editing files or traversal paths', async () => {
  for (const url of ['/index.js','/package.json','/.git/config','/content.json','/templates/ig.html','/assets/..%2findex.js','/assets/%2e%2e%2f.env','/absent']) assert.equal((await fetch(base+url)).status,404,url);
  assert.equal((await fetch(base+'/%notvalid')).status,400);
});
test('Handles HEAD, method rejection, health checks and conditional cache', async () => {
  const response=await fetch(base+'/ig.html?version=1');assert.match(response.headers.get('content-type'),/text\/html/);assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  const etag=response.headers.get('etag');await response.text();
  assert.equal((await fetch(base+'/ig.html',{headers:{'If-None-Match':etag}})).status,304);
  const head=await fetch(base+'/assets/logo.png',{method:'HEAD'});assert.equal(head.status,200);assert.equal(await head.text(),'');assert.ok(Number(head.headers.get('content-length'))>0);
  assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
  assert.deepEqual(await (await fetch(base+'/healthz')).json(),{status:'ok'});
});
test('Node builder validates content and rejects duplicate or unsafe anchors', () => {
  assert.doesNotThrow(()=>validate(data));
  const bad=structuredClone(data);bad.ig.groups[0].rules[0].id=bad.ig.groups[0].id;assert.throws(()=>validate(bad),/double/);
  const badId=structuredClone(data);badId.discord.groups[0].id='../private';assert.throws(()=>validate(badId),/Identifiant/);
  assert.throws(()=>render('{{MISSING}}',{}),/absente/);
});
