/* ZombieMusicEngine v4.0 — adaptive 20-track soundtrack with distinct arrangements */
(function(root){'use strict';
const TRACKS=[{name:'Quiet Ruins',bpm:78,root:48,mood:'ambient',inst:'piano',scale:[0,2,4,7,9],prog:[[0,4,7],[5,9,12],[3,7,10],[0,4,7]]},
 {name:'Rain on Glass',bpm:84,root:50,mood:'ambient',inst:'ambient',scale:[0,2,4,7,9],prog:[[0,4,7],[5,9,12],[3,7,10],[0,4,7]]},
 {name:'Safehouse Lights',bpm:92,root:53,mood:'ambient',inst:'plucks',scale:[0,2,4,7,9],prog:[[0,4,7],[5,9,12],[3,7,10],[0,4,7]]},
 {name:'After the Storm',bpm:72,root:45,mood:'ambient',inst:'strings',scale:[0,2,4,7,9],prog:[[0,4,7],[5,9,12],[3,7,10],[0,4,7]]},
 {name:'Adrenaline Protocol',bpm:154,root:38,mood:'battle',inst:'industrial',scale:[0,3,5,7,10],prog:[[0,3,7],[5,8,12],[3,7,10],[0,5,8]]},
 {name:'Run or Die',bpm:168,root:36,mood:'battle',inst:'drums',scale:[0,3,5,7,10],prog:[[0,3,7],[5,8,12],[3,7,10],[0,5,8]]},
 {name:'Redline',bpm:146,root:40,mood:'battle',inst:'synth',scale:[0,3,5,7,10],prog:[[0,3,7],[5,8,12],[3,7,10],[0,5,8]]},
 {name:'Horde Incoming',bpm:160,root:35,mood:'battle',inst:'tribal',scale:[0,3,5,7,10],prog:[[0,3,7],[5,8,12],[3,7,10],[0,5,8]]},
 {name:'Last Magazine',bpm:138,root:41,mood:'battle',inst:'strings',scale:[0,3,5,7,10],prog:[[0,3,7],[5,8,12],[3,7,10],[0,5,8]]},
 {name:'Neon Pursuit',bpm:174,root:39,mood:'battle',inst:'arp',scale:[0,3,5,7,10],prog:[[0,3,7],[5,8,12],[3,7,10],[0,5,8]]},
 {name:'Elite Hunter',bpm:142,root:37,mood:'elite',inst:'industrial',scale:[0,3,5,7,10],prog:[[0,3,7],[5,8,12],[3,7,10],[0,5,8]]},
 {name:'The Abomination',bpm:132,root:34,mood:'elite',inst:'brass',scale:[0,3,5,7,10],prog:[[0,3,7],[5,8,12],[3,7,10],[0,5,8]]},
 {name:'Predator Signal',bpm:150,root:36,mood:'elite',inst:'tribal',scale:[0,3,5,7,10],prog:[[0,3,7],[5,8,12],[3,7,10],[0,5,8]]},
 {name:'Mutant Prime',bpm:144,root:33,mood:'elite',inst:'synth',scale:[0,3,5,7,10],prog:[[0,3,7],[5,8,12],[3,7,10],[0,5,8]]},
 {name:'Colossus Awakens',bpm:112,root:31,mood:'boss',inst:'orchestra',scale:[0,1,5,7,8],prog:[[0,3,7],[1,4,8],[8,12,15],[10,14,17]]},
 {name:'King of Rot',bpm:120,root:29,mood:'boss',inst:'brass',scale:[0,1,5,7,8],prog:[[0,3,7],[1,4,8],[8,12,15],[10,14,17]]},
 {name:'The Last Titan',bpm:116,root:30,mood:'boss',inst:'choir',scale:[0,1,5,7,8],prog:[[0,3,7],[1,4,8],[8,12,15],[10,14,17]]},
 {name:'Extinction Event',bpm:164,root:28,mood:'final',inst:'orchestra',scale:[0,1,5,7,8],prog:[[0,3,7],[1,4,8],[8,12,15],[10,14,17]]},
 {name:'Ascension',bpm:96,root:52,mood:'evolution',inst:'choir',scale:[0,2,4,7,9],prog:[[0,4,7],[5,9,12],[3,7,10],[0,4,7]]},
 {name:'Rebirth of the Species',bpm:104,root:55,mood:'evolution',inst:'orchestra',scale:[0,2,4,7,9],prog:[[0,4,7],[5,9,12],[3,7,10],[0,4,7]]}];
function createZombieMusicEngine(opts={}){
 const enabled=typeof opts.isMusicEnabled==='function'?opts.isMusicEnabled:()=>true;
 const enemyFn=typeof opts.getEnemy==='function'?opts.getEnemy:()=>null;
 const hpFn=typeof opts.getPlayerHealthRatio==='function'?opts.getPlayerHealthRatio:()=>1;
 let audio=null,master=null,timer=null,mode='idle',lastMode='ambient',step=0,generation=0,volume=.82,tempo=1,selected=0,seed=(opts.seed??(Math.random()*0xffffffff))>>>0;
 function rnd(){seed=(seed+0x6D2B79F5)>>>0;let t=seed;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}
 const pick=a=>a[Math.floor(rnd()*a.length)],midi=n=>440*Math.pow(2,(n-69)/12);
 function ctx(){try{audio=audio||(new(window.AudioContext||window.webkitAudioContext)());if(audio.state==='suspended')audio.resume().catch(()=>{});return audio}catch(e){return null}}
 function voice(c,f,w,g,d,t,cut=5000,detune=0){const o=c.createOscillator(),fl=c.createBiquadFilter(),a=c.createGain();o.type=w;o.frequency.setValueAtTime(Math.max(22,f),t);o.detune.value=detune;fl.type='lowpass';fl.frequency.setValueAtTime(cut,t);a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(Math.max(.00015,g),t+.025);a.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(fl);fl.connect(a);a.connect(master);o.onended=()=>{try{o.disconnect();fl.disconnect();a.disconnect()}catch(e){}};o.start(t);o.stop(t+d+.04)}
 function noise(c,t,d,g,cut=4500){const n=c.createBufferSource(),b=c.createBuffer(1,Math.max(128,Math.floor(c.sampleRate*d)),c.sampleRate),x=b.getChannelData(0);for(let i=0;i<x.length;i++)x[i]=rnd()*2-1;n.buffer=b;const f=c.createBiquadFilter(),a=c.createGain();f.type='highpass';f.frequency.value=cut;a.gain.setValueAtTime(g,t);a.gain.exponentialRampToValueAtTime(.0001,t+d);n.connect(f);f.connect(a);a.connect(master);n.onended=()=>{try{n.disconnect();f.disconnect();a.disconnect()}catch(e){}};n.start(t);n.stop(t+d+.025)}
 function kick(c,t,p=1){voice(c,105,'sine',.22*p,.2,t,150);voice(c,48,'sine',.13*p,.14,t+.02,100)}
 function snare(c,t,p=1){noise(c,t,.14,.075*p,850);voice(c,185,'triangle',.05*p,.1,t,1100)}
 function piano(c,n,t,g=.035,d=.55){const f=midi(n);voice(c,f,'triangle',g,d,t,4200);voice(c,f*2.003,'sine',g*.24,d*.48,t,6500);voice(c,f*3.01,'sine',g*.08,d*.25,t,7500)}
 function bell(c,n,t,g=.025){const f=midi(n);voice(c,f,'sine',g,.8,t,9000);voice(c,f*2.71,'sine',g*.32,.48,t,9000);voice(c,f*4.16,'sine',g*.12,.3,t,9000)}
 function strings(c,n,t,g=.018,d=.9){const f=midi(n);voice(c,f,'sawtooth',g,d,t,1700,-7);voice(c,f*1.006,'sawtooth',g*.72,d,t,2100,7);voice(c,f*2,'triangle',g*.22,d*.8,t,2800)}
 function brass(c,n,t,g=.03,d=.38){const f=midi(n);voice(c,f,'sawtooth',g,d,t,1000);voice(c,f*1.5,'square',g*.25,d*.7,t,1300);}
 function choir(c,n,t,g=.015,d=1.2){const f=midi(n);voice(c,f,'sine',g,d,t,1800,-8);voice(c,f*1.003,'triangle',g*.65,d,t,2400,8);voice(c,f*2,'sine',g*.18,d*.8,t,3200)}
 function pluck(c,n,t,g=.025){const f=midi(n);voice(c,f,'triangle',g,.16,t,5000);voice(c,f*2,'sine',g*.22,.09,t,7000)}
 function instrument(c,tr,n,t,g,d){switch(tr.inst){case'piano':piano(c,n,t,g,d);break;case'ambient':choir(c,n,t,g*.8,d*1.8);bell(c,n+12,t+.12,g*.7);break;case'plucks':pluck(c,n,t,g);bell(c,n+12,t+.08,g*.5);break;case'strings':strings(c,n,t,g,d);break;case'industrial':voice(c,midi(n),'sawtooth',g,d,t,950);noise(c,t,.045,g*.5,1800);break;case'drums':pluck(c,n,t,g*.8);break;case'synth':voice(c,midi(n),'square',g,d,t,2600);voice(c,midi(n+12),'sawtooth',g*.25,d*.7,t,3400,5);break;case'tribal':voice(c,midi(n-12),'sine',g*1.5,d,t,260);noise(c,t,.06,g*.5,600);break;case'arp':pluck(c,n,t,g);bell(c,n+7,t+.04,g*.6);break;case'orchestra':strings(c,n,t,g,d);brass(c,n-12,t,g*.7,d*.75);break;case'brass':brass(c,n,t,g,d);strings(c,n+12,t,g*.3,d);break;case'choir':choir(c,n,t,g,d);strings(c,n+12,t,g*.4,d);break;}}
 function stop(){generation++;if(timer){clearInterval(timer);timer=null}try{if(master&&audio){master.gain.cancelScheduledValues(audio.currentTime);master.gain.setTargetAtTime(.0001,audio.currentTime,.07)}}catch(e){}master=null;mode='idle';step=0}
 function pool(m){return TRACKS.map((t,i)=>({t,i})).filter(x=>x.t.mood===m)}
 function startMode(m,oneShot=false){if(!enabled())return;stop();mode=m;lastMode=m;const token=generation,c=ctx();if(!c)return;const candidates=pool(m);if(candidates.length){const choices=candidates.filter(x=>x.i!==selected);const x=pick(choices.length?choices:candidates);selected=x.i}const tr=TRACKS[selected];const factor=m==='boss'?.88:m==='final'?1.08:m==='elite'?1.04:m==='evolution'?.82:m==='ambient'?.76:1;const bpm=tr.bpm*factor*tempo,sec=60/bpm/4;master=c.createGain();master.gain.value=(m==='ambient'?.105:m==='evolution'?.14:m==='final'?.19:.16)*volume;master.connect(c.destination);let at=c.currentTime+.08,steps=0;
 timer=setInterval(()=>{if(!enabled()||token!==generation)return;try{while(at<c.currentTime+.14){const s=step,bar=Math.floor(s/16),beat=s%16,t=at,ch=tr.prog[bar%4],root=tr.root+(m==='boss'||m==='final'?-2:0),calm=m==='ambient',evo=m==='evolution',heavy=['elite','boss','final'].includes(m);const chordNotes=ch.map(v=>root+v+12);
 if(calm){if(beat===0||beat===8)chordNotes.forEach((n,j)=>{if(tr.inst==='piano')piano(c,n,t+j*.035,.018,.95);else choir(c,n,t+j*.025,.014,1.5)});if(beat%4===0){const n=root-12+ch[0];piano(c,n,t,.022,.8)}if(beat%4===2&&rnd()<.7)bell(c,root+24+pick(tr.scale),t,.012);if(beat%2===0&&rnd()<.3)instrument(c,tr,root+24+pick(tr.scale),t,.012,.4)}
 else {if(beat===0||beat===8)chordNotes.forEach((n,j)=>instrument(c,tr,n,t+j*.025,evo?.018:heavy?.024:.016,evo?1.3:.85));if(beat%4===0)voice(c,midi(root+ch[0]-12),tr.inst==='industrial'?'sawtooth':'triangle',.065,.24,t,heavy?500:320);if(!evo&&(beat===0||beat===8))kick(c,t,m==='final'?1.35:heavy?1.12:1);if(!evo&&(beat===4||beat===12))snare(c,t,m==='boss'?.9:1);if(!evo&&beat%2===0)noise(c,t,.035,.02*(beat%4?0.65:1),tr.inst==='industrial'?2400:6500);
 if(beat%2===0&&rnd()<(m==='final'?.94:heavy?.78:.7)){const n=root+24+pick(tr.scale)+(rnd()<.2?12:0);instrument(c,tr,n,t,.035,sec*(.9+rnd()*1.5))}if(heavy&&beat%4===2){brass(c,root+ch[beat%3]+12,t,.028,.32);if(m==='boss'||m==='final')strings(c,root+ch[(beat+1)%3]+24,t,.018,.65)}if(m==='final'&&beat%4===0)choir(c,root+ch[0]+24,t,.014,.9);if(m==='elite'&&beat%8===6)bell(c,root+31,t,.02);if(!evo&&beat===0&&rnd()<(m==='final'?.16:m==='boss'?.12:m==='elite'?.08:.04)){voice(c,65,'sawtooth',.055,.5,t,420);noise(c,t,.18,.035,500)}}
 if(evo&&beat%4===0){choir(c,root+ch[0]+24,t,.025,1.3);if(beat===8)bell(c,root+36,t,.022)}step++;steps++;at+=sec;if(oneShot&&steps>=128){clearInterval(timer);timer=null;setTimeout(()=>{if(token===generation&&enabled()){if(enemyFn())startBattle();else ambient()}},450);break}}
 }catch(e){console.warn('Zombie music scheduler',e)}},24)}
 function desired(){const e=enemyFn();if(!e)return'ambient';return e.isBoss?((e.hp<=e.maxHp*.35||hpFn()<=.22)?'final':'boss'):(e.elite?'elite':'battle')}
 function startBattle(){if(!enabled())return;if(timer&&mode===desired())return;startMode(desired())}
 function ambient(){if(!enabled())return;if(timer&&mode==='ambient')return;startMode('ambient')}
 function refresh(){if(!enabled())return;const m=desired();if(mode!==m)startMode(m)}
 function evolution(){if(enabled())startMode('evolution',true)}
 function sound(freq=220,dur=.08){if(!enabled())return;const c=ctx();if(!c)return;voice(c,Math.max(25,freq),'square',.025,dur,c.currentTime,5000)}
 function hit(crit=false){if(!enabled())return;const c=ctx();if(c){snare(c,c.currentTime,crit?1.25:.72);if(crit)kick(c,c.currentTime+.01,1.1)}}
 function hurt(){if(!enabled())return;const c=ctx();if(c){brass(c,38,c.currentTime,.055,.35);noise(c,c.currentTime,.16,.05,350)}}
 function levelUp(){if(!enabled())return;const c=ctx();if(c)[0,4,7,12,16].forEach((n,i)=>{const t=c.currentTime+i*.075;bell(c,60+n,t,.035);strings(c,60+n,t,.018,.55)})}
 function setVolume(v){volume=Math.max(0,Math.min(1,Number(v)||0));if(master&&audio)master.gain.setTargetAtTime((mode==='ambient'?.105:mode==='evolution'?.14:mode==='final'?.19:.16)*volume,audio.currentTime,.06)}
 function setTempoScale(v){tempo=Math.max(.5,Math.min(2,Number(v)||1))}
 if(typeof document!=='undefined')document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(enabled())(enemyFn()?startBattle():ambient())});
 return{play:startMode,startBattle,ambient,refresh,evolution,stop,sound,hit,hurt,levelUp,setVolume,setTempoScale,get mode(){return mode},get track(){return TRACKS[selected].name},get tracks(){return TRACKS.map(t=>t.name)}};
 }
 root.createZombieMusicEngine=createZombieMusicEngine;
})(typeof window!=='undefined'?window:globalThis);
