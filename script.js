const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches, fine=matchMedia('(pointer:fine)').matches;
setTimeout(()=>{$('#boot').classList.add('hide')},1500);

/* Cursor + physics-like trail */
const cur=$('.cursor i'), ring=$('.cursor b'), glow=$('.page-glow'), cube=$('#cube');
let x=innerWidth/2,y=innerHeight/2,rx=x,ry=y,trail=[];
addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;cur.style.left=x+'px';cur.style.top=y+'px';});
(function loop(){rx+=(x-rx)*.17;ry+=(y-ry)*.17;ring.style.left=rx+'px';ring.style.top=ry+'px';if(!reduced&&fine){trail.push({x,y,a:1});if(trail.length>14)trail.shift();}requestAnimationFrame(loop)})();
$$('a,button,.tilt,.skill-node,.project').forEach(el=>{el.addEventListener('mouseenter',()=>ring.classList.add('hover'));el.addEventListener('mouseleave',()=>ring.classList.remove('hover'))});

/* Scroll reveal */
const observer=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');observer.unobserve(e.target)}}),{threshold:.12});
$$('.reveal').forEach((e,i)=>{e.style.transitionDelay=(i%5*.06)+'s';observer.observe(e)});

/* Progress + career line */
addEventListener('scroll',()=>{const max=document.documentElement.scrollHeight-innerHeight;$('.progress').style.width=(scrollY/max*100)+'%';const exp=$('.experience'),line=$('.career-line i');if(exp){const r=exp.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight-r.top)/(r.height*.75)));line.style.height=(p*100)+'%'}});

/* Magnetic */
if(fine&&!reduced) $$('.magnetic').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.18}px,${(e.clientY-r.top-r.height/2)*.18}px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});

/* Tilt */
if(fine&&!reduced) $$('.tilt').forEach(el=>{el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect(),px=e.clientX/r.width-r.left/r.width,py=e.clientY/r.height-r.top/r.height;el.style.transform=`perspective(900px) rotateX(${-(py-.5)*7}deg) rotateY(${(px-.5)*7}deg) translateY(-3px)`});el.addEventListener('pointerleave',()=>el.style.transform='')});

/* 3D hero reacts to pointer */
if(fine&&!reduced) $('#hero3d').addEventListener('pointermove',e=>{const r=e.currentTarget.getBoundingClientRect(),px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;cube.style.transform=`rotateX(${-py*35}deg) rotateY(${35+px*55}deg)`});
if(fine&&!reduced) $('#hero3d').addEventListener('pointerleave',()=>cube.style.transform='rotateX(-20deg) rotateY(35deg)');

/* Counters */
$$('[data-count]').forEach(el=>{const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;let t=+el.dataset.count,s=performance.now();function tick(n){let p=Math.min(1,(n-s)/900);el.textContent=Math.round(t*(1-(1-p)**3));if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick);io.disconnect()}),{threshold:.7});io.observe(el)});

/* Terminal + live GitHub integration */
const terminal=$('#terminalBody'), input=$('#terminalInput');
const GITHUB_USER='Souvik-Pramanik';
const GITHUB_API='https://api.github.com';
let githubCache=null;
const escapeHTML=value=>String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const formatDate=value=>{if(!value)return '—';const d=new Date(value);const days=Math.max(0,Math.floor((Date.now()-d.getTime())/86400000));if(days===0)return 'today';if(days===1)return '1d ago';if(days<30)return `${days}d ago`;if(days<365)return `${Math.floor(days/30)}mo ago`;return `${Math.floor(days/365)}y ago`};
const iconForEvent=t=>({PushEvent:'↑',CreateEvent:'＋',WatchEvent:'★',ForkEvent:'⑂',IssuesEvent:'!',IssueCommentEvent:'◌',PullRequestEvent:'⇄',ReleaseEvent:'◈',DeleteEvent:'×'}[t]||'·');
const eventText=e=>{
  const repo=escapeHTML(e.repo?.name||'repository');
  const action={PushEvent:'pushed commits to',CreateEvent:'created',WatchEvent:'starred',ForkEvent:'forked',IssuesEvent:'updated an issue in',IssueCommentEvent:'commented on',PullRequestEvent:'updated a pull request in',ReleaseEvent:'published a release in',DeleteEvent:'deleted'}[e.type]||'updated';
  if(e.type==='CreateEvent') return `${action} <strong>${repo}</strong>`;
  if(e.type==='PushEvent'){const count=e.payload?.size||e.payload?.commits?.length||1;return `pushed <strong>${count} commit${count===1?'':'s'}</strong> to <strong>${repo}</strong>`}
  return `${action} <strong>${repo}</strong>`;
};
async function githubFetch(path){
  const r=await fetch(`${GITHUB_API}${path}`,{headers:{Accept:'application/vnd.github+json'}});
  if(!r.ok) throw new Error(`GitHub API ${r.status}`);
  return r.json();
}
function renderGithub(data){
  const {profile,repos,events}=data;
  $('#githubName').textContent=profile.name||profile.login||GITHUB_USER;
  $('#githubBio').textContent=profile.bio||'Public GitHub profile — repositories, activity and engineering work.';
  $('#githubUpdated').textContent=`SYNCED ${new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  $('#githubStats').innerHTML=[
    [profile.public_repos,'REPOSITORIES'],[profile.followers,'FOLLOWERS'],[profile.following,'FOLLOWING'],[(repos||[]).reduce((sum,r)=>sum+(r.stargazers_count||0),0),'REPO STARS']
  ].map(([n,l])=>`<div class="gh-stat"><b>${escapeHTML(n)}</b><span>${l}</span></div>`).join('');
  const reposEl=$('#githubRepos');
  const visible=repos.filter(r=>!r.fork).slice(0,6);
  reposEl.innerHTML=visible.length?visible.map(r=>`<article class="repo-card"><div class="repo-main"><div class="repo-name">${escapeHTML(r.name)}</div><p class="repo-desc">${escapeHTML(r.description||'No repository description provided.')}</p><div class="repo-meta"><span>${r.language?`<b>${escapeHTML(r.language)}</b>`:'<b>CODE</b>'}</span><span>★ ${escapeHTML(r.stargazers_count)}</span><span>⑂ ${escapeHTML(r.forks_count)}</span><span>${formatDate(r.updated_at)}</span></div></div><a class="repo-open" href="${escapeHTML(r.html_url)}" target="_blank" rel="noreferrer" aria-label="Open ${escapeHTML(r.name)}">↗</a></article>`).join(''):`<div class="github-empty">No public repositories available to display.</div>`;
  const activityEl=$('#githubActivity');
  const ev=events.filter(e=>['PushEvent','CreateEvent','WatchEvent','ForkEvent','IssuesEvent','IssueCommentEvent','PullRequestEvent','ReleaseEvent','DeleteEvent'].includes(e.type)).slice(0,7);
  activityEl.innerHTML=ev.length?ev.map(e=>`<div class="activity-item"><div class="activity-icon">${iconForEvent(e.type)}</div><div class="activity-copy">${eventText(e)}<span class="activity-time">${escapeHTML(formatDate(e.created_at))}</span></div></div>`).join(''):`<div class="github-empty">No recent public activity is available from the GitHub Events API.</div>`;
}
async function loadGithub(force=false){
  if(githubCache&&!force){renderGithub(githubCache);return githubCache}
  const reposEl=$('#githubRepos'), activityEl=$('#githubActivity');
  reposEl.innerHTML='<div class="github-loading"><i></i> Fetching repositories…</div>';
  activityEl.innerHTML='<div class="github-loading"><i></i> Fetching activity…</div>';
  try{
    const [profile,repos,events]=await Promise.all([
      githubFetch(`/users/${GITHUB_USER}`),
      githubFetch(`/users/${GITHUB_USER}/repos?per_page=100&sort=updated&direction=desc&type=owner`),
      githubFetch(`/users/${GITHUB_USER}/events/public?per_page=12`)
    ]);
    githubCache={profile,repos,events}; renderGithub(githubCache); return githubCache;
  }catch(err){
    reposEl.innerHTML='<div class="github-error">GitHub public data could not be loaded right now.<br><br><button type="button" id="githubRetry">RETRY</button> · <a href="https://github.com/Souvik-Pramanik" target="_blank" rel="noreferrer">OPEN GITHUB</a></div>';
    activityEl.innerHTML='<div class="github-empty">The live activity feed is temporarily unavailable. The profile link remains available above.</div>';
    $('#githubRetry')?.addEventListener('click',()=>loadGithub(true));
    throw err;
  }
}
const commands={
help:()=>`Available: about · devops · cloud · experience · projects · skills · github · contact · clear`,
about:()=>`Souvik Pramanik — Cloud / DevOps Engineer in progress. CSE graduate with strong Linux, Bash and networking foundations.`,
devops:()=>`TARGET: Cloud / DevOps Engineer\nFOCUS: Linux · Docker · CI/CD · Cloud · Automation\nBUILD: Dedicated DevOps project in development`,
cloud:()=>`AWS: EC2 · S3 · IAM · CloudWatch · Lambda · ECS · EKS\nAzure: Intermediate\nKubernetes / Terraform / Ansible / Observability: learning`,
experience:()=>`2026 → IT Executive / ERP & systems\n2025 → Field Support Engineer\n2024 → Full Stack Web + Penetration Testing`,
projects:()=>`01 Animated Weather Application\n02 Facemask Detection using Python + ML\n03 Quantum Image Morphological Operation`,
skills:()=>`LINUX (ADV) · BASH (ADV) · NETWORKING (ADV) · GIT (INT) · DOCKER (INT) · AWS (INT) · AZURE (INT) · PYTHON (INT) · K8S (BEG) · TERRAFORM (BEG)`,
github:async()=>{
  const d=await loadGithub();
  const top=d.repos.filter(r=>!r.fork).slice(0,5).map((r,i)=>`${String(i+1).padStart(2,'0')} ${r.name} · ${r.language||'CODE'} · ★${r.stargazers_count}`).join('\n');
  return `LIVE GITHUB\n${d.profile.public_repos} public repositories · ${d.profile.followers} followers\n\n${top||'No public repositories found.'}\n\nOPEN: github.com/Souvik-Pramanik`;
},
contact:()=>`Email: snaptokon@proton.me\nGitHub: github.com/Souvik-Pramanik\nLinkedIn: linkedin.com/in/nukebyte`,
clear:()=>`__CLEAR__`
};
async function runCommand(cmd){
  cmd=cmd.trim().toLowerCase();
  if(!cmd)return;
  terminal.insertAdjacentHTML('beforeend',`<div class="cmd">souvik@portfolio:~$ ${escapeHTML(cmd)}</div>`);
  try{
    const fn=commands[cmd];
    let out=fn?await fn():`Unknown command. Type <span class="green">help</span>.`;
    if(out==='__CLEAR__')terminal.innerHTML='';
    else terminal.insertAdjacentHTML('beforeend',`<div class="result">${String(out).replace(/\n/g,'<br>')}</div>`);
  }catch(err){terminal.insertAdjacentHTML('beforeend',`<div class="result error">GitHub connection unavailable. Try <span class="green">github</span> again.</div>`)}
  terminal.scrollTop=terminal.scrollHeight;
}
$('#terminalForm').addEventListener('submit',e=>{e.preventDefault();runCommand(input.value);input.value=''});
$$('.terminal-help button').forEach(b=>b.onclick=()=>runCommand(b.dataset.cmd));
$('#githubRefresh')?.addEventListener('click',()=>loadGithub(true));
loadGithub().catch(()=>{});

/* Skill network SVG connections */
const network=$('#network'),svg=network.querySelector('svg'),nodes=$$('.skill-node');
function drawNetwork(){svg.innerHTML='';const nr=network.getBoundingClientRect(),cr=$('.skill-center').getBoundingClientRect();const cx=cr.left-nr.left+cr.width/2,cy=cr.top-nr.top+cr.height/2;nodes.forEach((n,i)=>{const r=n.getBoundingClientRect(),nx=r.left-nr.left+r.width/2,ny=r.top-nr.top+r.height/2;let l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('x1',cx);l.setAttribute('y1',cy);l.setAttribute('x2',nx);l.setAttribute('y2',ny);l.dataset.i=i;svg.appendChild(l)})}
addEventListener('load',drawNetwork);addEventListener('resize',drawNetwork);
nodes.forEach((n,i)=>{n.addEventListener('mouseenter',()=>{nodes.forEach(x=>x.classList.remove('active'));n.classList.add('active');[...svg.querySelectorAll('line')].forEach(l=>l.style.stroke=+l.dataset.i===i?'#d8ff45':'#252a22')});n.addEventListener('mouseleave',()=>{n.classList.remove('active');[...svg.querySelectorAll('line')].forEach(l=>l.style.stroke='')})});

/* Project case files */
const data={
weather:{k:'01 / FLUTTER · DEC 2024',t:'Animated Weather Application',d:'A feature-rich Flutter application designed around real-time weather updates and a detailed 7-day forecast.',items:[['CORE','Flutter application'],['INTERACTION','Dynamic weather animations'],['LOCATION','GPS-based tracking'],['DATA','Real-time + 7-day forecast']]},
ml:{k:'02 / PYTHON · ML · 2023',t:'Facemask Detection',d:'A machine-learning project focused on identifying whether individuals in images are wearing facemasks.',items:[['DOMAIN','Machine Learning'],['LANGUAGE','Python'],['INPUT','Images'],['OUTPUT','Mask / no-mask classification']]},
quantum:{k:'03 / IMAGE PROCESSING · 2023',t:'Quantum Image Morphological Operation',d:'An exploration of image sharpening and restoration using quantum and classical image-processing techniques.',items:[['DOMAIN','Image Processing'],['APPROACH','Quantum + classical'],['GOAL','Sharpening'],['GOAL 2','Restoration']]}
};
$$('.open-project').forEach(btn=>btn.onclick=e=>{e.stopPropagation();const d=data[btn.closest('.project').dataset.project];$('#modalContent').innerHTML=`<div class="case-kicker">${d.k}</div><h2>${d.t}</h2><p>${d.d}</p><div class="case-grid">${d.items.map(x=>`<div><span>${x[0]}</span><b>${x[1]}</b></div>`).join('')}</div><p style="margin-top:30px">This case file is a portfolio summary. Add your repository, screenshots, demo URL or architecture diagram here when those assets are available.</p>`;$('#modal').classList.add('open')});
$('#modalClose').onclick=()=>$('#modal').classList.remove('open');$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.remove('open')};

/* View modes — one information architecture, three visual personalities */
const modeBtn=$('#modeBtn'),panel=$('#modePanel'),modeTransition=$('#modeTransition'),modeLabel=$('#modeTransitionLabel'),modeBadge=$('#modeBadge'),modeHint=$('#modeHint');
const modeNames={os:'DIGITAL OS',recruiter:'RECRUITER',developer:'DEVELOPER'};
const modeHints={os:'SYSTEM INTERFACE',recruiter:'CAREER SIGNAL',developer:'ENGINEERING CONSOLE'};
let currentMode='os';
function applyMode(mode,animate=true){
  if(!modeNames[mode]) return;
  const changed=mode!==currentMode; currentMode=mode;
  document.body.classList.remove('mode-os','mode-recruiter','mode-developer');
  document.body.classList.add('mode-'+mode);
  document.body.dataset.view=mode;
  modeBtn.innerHTML=`VIEW: <b>${modeNames[mode].split(' ')[0]}</b>`;
  modeHint.textContent=modeHints[mode];
  modeBadge.querySelector('b').textContent=modeNames[mode];
  panel.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));
  if(animate&&changed&&!reduced){
    modeLabel.textContent=`SWITCHING TO ${modeNames[mode]}`;
    modeTransition.classList.remove('play'); void modeTransition.offsetWidth; modeTransition.classList.add('play');
  }
  // Recalculate the skill graph because visual mode changes can alter dimensions.
  requestAnimationFrame(()=>{drawNetwork(); window.scrollTo({top:scrollY,behavior:'instant'});});
}
modeBtn.onclick=e=>{e.stopPropagation();panel.classList.toggle('open')};
panel.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();applyMode(b.dataset.mode);panel.classList.remove('open')});
document.addEventListener('click',e=>{if(!panel.contains(e.target)&&e.target!==modeBtn)panel.classList.remove('open')});
addEventListener('keydown',e=>{if(e.key==='Escape')panel.classList.remove('open')});
applyMode('os',false);

/* Easter egg: Konami */
const seq=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];let pos=0;
addEventListener('keydown',e=>{if(e.key===seq[pos]||e.key.toLowerCase()===seq[pos]){pos++;if(pos===seq.length){$('#easter').classList.add('open');pos=0}}else pos=0});
$('#easterClose').onclick=()=>$('#easter').classList.remove('open');

/* Background particle field */
const c=$('#bgCanvas'),ctx=c.getContext('2d');let W,H,ps=[];
function resize(){W=c.width=innerWidth;H=c.height=innerHeight;ps=Array.from({length:Math.min(75,Math.floor(innerWidth/17))},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.22,vy:(Math.random()-.5)*.22,r:Math.random()*1.2+.3}))}resize();addEventListener('resize',resize);
function draw(){ctx.clearRect(0,0,W,H);if(!reduced){for(const p of ps){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;ctx.fillStyle='#d8ff4540';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){let a=ps[i],b=ps[j],d=Math.hypot(a.x-b.x,a.y-b.y);if(d<110){ctx.strokeStyle=`rgba(216,255,69,${.055*(1-d/110)})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke()}}}requestAnimationFrame(draw)}draw();

/* Keyboard shortcut / */
addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();input.focus()}});
