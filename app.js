'use strict';
document.documentElement.classList.add('js');
const $=selector=>document.querySelector(selector);
const toggle=$('#menuToggle');
toggle.addEventListener('click',()=>{const expanded=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!expanded));document.body.classList.toggle('nav-open',!expanded);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'){document.body.classList.remove('nav-open');toggle.setAttribute('aria-expanded','false');}});
let noticeTimer;
function notice(text){$('#notice').textContent=text;$('#notice').classList.add('visible');clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('#notice').classList.remove('visible'),3000);}
for(const button of document.querySelectorAll('[data-copy]')) button.addEventListener('click',async()=>{
 const url=new URL(location.href);if(button.dataset.copy==='page')url.hash='';else url.hash=button.dataset.copy;
 try{await navigator.clipboard.writeText(url.href);notice('Lien copié. Tu peux le coller dans ton salon Discord.');}
 catch{const dialog=$('#copyDialog');$('#copyValue').value=url.href;dialog.showModal();$('#copyValue').focus();$('#copyValue').select();}
});
const search=$('#search');
const normalize=value=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
if(search){
 $('.search-tools').hidden=false;
 const articles=[...document.querySelectorAll('[data-rule]')];
 search.addEventListener('input',()=>{
  const words=normalize(search.value.trim()).split(/\s+/).filter(Boolean);let count=0;
  for(const article of articles){const text=normalize(article.querySelector('.rule-body').textContent);article.hidden=!words.every(word=>text.includes(word));if(!article.hidden)count++;}
  for(const group of document.querySelectorAll('[data-group]'))group.hidden=![...group.querySelectorAll('[data-rule]')].some(article=>!article.hidden);
  $('#searchCount').textContent=`${count} article${count===1?'':'s'}${words.length?' trouvé'+(count===1?'':'s'):''}`;$('#noResults').hidden=count!==0;
 });
 document.addEventListener('keydown',event=>{if(event.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName)&&!event.ctrlKey&&!event.metaKey){event.preventDefault();search.focus();}});
 // Following the table of contents also clears a filter that could hide the destination.
 document.querySelectorAll('.toc a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{if(search.value){search.value='';search.dispatchEvent(new Event('input'));}}));
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting)document.querySelectorAll('.toc a[href^="#"]').forEach(link=>link.classList.toggle('active',link.hash===`#${entry.target.id}`));},{rootMargin:'-15% 0px -65% 0px'});
 document.querySelectorAll('[data-group]').forEach(group=>observer.observe(group));
}
let scrollFrame;
function updateProgress(){const total=document.documentElement.scrollHeight-innerHeight;$('#readingProgress').style.width=(total>0?Math.min(100,scrollY/total*100):0)+'%';scrollFrame=undefined;}
addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateProgress);},{passive:true});addEventListener('resize',updateProgress);updateProgress();
