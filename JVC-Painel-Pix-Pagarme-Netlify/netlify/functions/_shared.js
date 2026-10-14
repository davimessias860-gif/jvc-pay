const crypto=require('node:crypto');
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const reply=(statusCode,data,extra={})=>({statusCode,headers:{...headers,...extra},body:JSON.stringify(data)});
const parse=(event)=>{try{return JSON.parse(event.body||'{}')}catch{return {}}};
function tokenSecret(){return process.env.SESSION_SECRET||''}
function sign(text){return crypto.createHmac('sha256',tokenSecret()).update(text).digest('base64url')}
function cookie(event){return (event.headers.cookie||event.headers.Cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('jvc_session='))?.split('=')[1]}
function authenticated(event){if(!tokenSecret())return false;const t=cookie(event);if(!t)return false;const bits=t.split('.');if(bits.length!==2)return false;const a=Buffer.from(bits[1]),b=Buffer.from(sign(bits[0]));if(a.length!==b.length||!crypto.timingSafeEqual(a,b))return false;try{const p=JSON.parse(Buffer.from(bits[0],'base64url').toString());return p.role==='admin'&&p.exp>Date.now()}catch{return false}}
const unauthorized=()=>reply(401,{error:'Faça login novamente.'});
function sessionCookie(expiry){const payload=Buffer.from(JSON.stringify({role:'admin',exp:expiry})).toString('base64url');return `jvc_session=${payload}.${sign(payload)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`}
function secretsReady(){return !!process.env.PAGARME_SECRET_KEY}
async function pagarme(path,options={}){if(!secretsReady())throw Object.assign(new Error('Cadastre PAGARME_SECRET_KEY no Netlify.'),{status:503});const key=process.env.PAGARME_SECRET_KEY;const host=key.startsWith('sk_test')?'https://sdx-api.pagar.me/core/v5':'https://api.pagar.me/core/v5';const resp=await fetch(host+path,{...options,headers:{Authorization:'Basic '+Buffer.from(key+':').toString('base64'),Accept:'application/json','Content-Type':'application/json',...(options.headers||{})},signal:AbortSignal.timeout(15000)});let body;try{body=await resp.json()}catch{body={}}if(!resp.ok){const err=new Error('Pagar.me rejeitou a operação.');err.status=resp.status;err.details=body;throw err}return body}
function failure(e){return reply(e.status===503?503:502,{error:e.message||'Falha de comunicação com o serviço.',details:e.details?.errors||e.details?.message||null})}
module.exports={reply,parse,authenticated,unauthorized,sessionCookie,pagarme,failure};
