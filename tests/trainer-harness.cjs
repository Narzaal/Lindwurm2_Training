const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=require('path').join(__dirname,'../dist/'),html=fs.readFileSync(root+'index.html','utf8');
const storage={};
function create(){
 const elements={},listeners={},canvasText=[],imageDraws=[];
 const ctx=new Proxy({drawImage:img=>imageDraws.push(img.src),fillText:t=>canvasText.push(t),measureText:s=>({width:s.length*6}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 function el(id){return elements[id]??= {id,textContent:'',innerHTML:'',hidden:false,style:{},value:'',checked:true,options:[],dataset:{},parentNode:{insertBefore(){}},nextSibling:null,classList:{add(){},remove(){},toggle(){}},getContext:()=>ctx,addEventListener(type,fn){(listeners[id+':'+type]??=[]).push(fn)},focus(){},setPointerCapture(){},getBoundingClientRect:()=>({left:0,top:0,width:500,height:500}),querySelectorAll:()=>[],appendChild(){},insertBefore(){},setAttribute(k,v){this[k]=v},showModal(){this.open=true},close(){this.open=false}}}
 for(const match of html.matchAll(/id="([^"]+)"/g)){assert(!elements[match[1]],'duplicate id '+match[1]);el(match[1])}
 const doc={body:el('body'),getElementById:id=>{assert(elements[id],'missing '+id);return elements[id]},querySelector:s=>s==='dialog[open]'?Object.values(elements).find(e=>e.open):el(s),querySelectorAll:()=>[],addEventListener(){},activeElement:null};
 const sandbox={console,Math,JSON,Set,Map,Date,Number,String,Object,Array,Infinity,Image:class{complete=false},localStorage:{getItem:k=>storage[k]??null,setItem:(k,v)=>storage[k]=v},document:doc,window:{addEventListener(){}},requestAnimationFrame(){},performance:{now:()=>0}};
 vm.createContext(sandbox);
 for(const f of ['combat','reconstitution','decisions','replication1','candies','idyllic','encounter','training','dream-lesson','dream-towers','dream-elements','dream-resume','dream-finale','dream-pairs','dream-demo','dream-workshops','app','interface'])vm.runInContext(fs.readFileSync(root+f+'.js','utf8'),sandbox,{filename:f+'.js'});
 return {el,canvasText,imageDraws,run:code=>vm.runInContext(code,sandbox)};
}
module.exports={create,html};
