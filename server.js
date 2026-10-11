const http=require("node:http"),fs=require("node:fs"),path=require("node:path"),{URL}=require("node:url");
const root=__dirname,publicRoot=path.join(root,"public"),port=Number(process.env.PORT)||10000;
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".webp":"image/webp",".json":"application/json; charset=utf-8",".ico":"image/x-icon",".txt":"text/plain; charset=utf-8",".xml":"application/xml; charset=utf-8"};
const safe=(base,rel)=>{const b=path.resolve(base),p=path.resolve(base,rel);return p===b||p.startsWith(b+path.sep)?p:null};
const commercialAttempts=new Map();
const telegramReady=()=>Boolean(process.env.TELEGRAM_BOT_TOKEN&&process.env.TELEGRAM_CHAT_ID);
async function notifyCommercialTelegram(endpoint,requestBody,responsePayload){
 if(!telegramReady()){console.warn("MMW-COMPANY Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured");return false;}
 const clip=(v,n=700)=>String(v??"").trim().slice(0,n)||"—";
 const lines=[];
 if(endpoint==="orders"){
  const o=responsePayload?.order||{};
  lines.push("НОВАЯ ЗАЯВКА MMW-COMPANY", "Номер: "+clip(o.orderNumber), "Статус: "+clip(o.status||"new"), "", "КЛИЕНТ", "Имя: "+clip(requestBody.customerName), "Телефон: "+clip(requestBody.customerPhone), "Email: "+clip(requestBody.customerEmail), "Компания: "+clip(requestBody.organization), "", "СОСТАВ ЗАЯВКИ", ...(Array.isArray(requestBody.items)?requestBody.items.slice(0,40).map(i=>"• "+clip(i.sku,120)+" × "+Math.max(1,Math.min(100,Number(i.quantity)||1))):["—"]), "", "Предварительная сумма: "+clip(o.subtotal)+" "+clip(o.currency||"UAH"), "Код доступа: "+clip(o.accessCode||"используется существующий код"), "Комментарий: "+clip(requestBody.notes,1000), "", "Журнал: https://mmw-company.onrender.com/commercial.html#admin");
 }else if(endpoint==="inquiries"){
  const q=responsePayload?.inquiry||responsePayload||{};
  lines.push("НОВОЕ ОБРАЩЕНИЕ MMW-COMPANY","Номер: "+clip(q.inquiryNumber),"Имя: "+clip(requestBody.name),"Телефон: "+clip(requestBody.phone),"Email: "+clip(requestBody.email),"Организация: "+clip(requestBody.organization),"Проект: "+clip(requestBody.projectSlug),"Тип: "+clip(requestBody.inquiryType),"Сообщение: "+clip(requestBody.message,1800),"","Журнал: https://mmw-company.onrender.com/commercial.html#admin");
 }else return false;
 const text=lines.join("\n").slice(0,3900);
 try{
  const response=await fetch("https://api.telegram.org/bot"+process.env.TELEGRAM_BOT_TOKEN+"/sendMessage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:process.env.TELEGRAM_CHAT_ID,text,disable_web_page_preview:true})});
  const result=await response.json().catch(()=>({}));
  if(!response.ok||result.ok!==true){console.error("MMW-COMPANY Telegram notification failed:",result.description||("HTTP "+response.status));return false;}
  console.log("MMW-COMPANY Telegram notification accepted:",endpoint,"message_id="+String(result.result?.message_id||"unknown"));
  return true;
 }catch(e){console.error("MMW-COMPANY Telegram notification error:",e.message);return false;}
}

const server=http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,"http://localhost"),p=u.pathname;
  if(p==="/api/telegram-link"){
   if(req.method!=="GET"){res.writeHead(405,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});return res.end(JSON.stringify({ok:false}));}
   const token=process.env.TELEGRAM_BOT_TOKEN;
   if(!token){res.writeHead(200,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});return res.end(JSON.stringify({ok:false}));}
   try{const r=await fetch("https://api.telegram.org/bot"+token+"/getMe");const d=await r.json();const username=d?.ok&&d?.result?.username?String(d.result.username):"";res.writeHead(200,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});return res.end(JSON.stringify(username?{ok:true,url:"https://t.me/"+username}:{ok:false}));}catch(e){res.writeHead(200,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});return res.end(JSON.stringify({ok:false}));}
  }
  if(p==="/healthz"){res.writeHead(200,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});return res.end(JSON.stringify({ok:true,service:"MMW-COMPANY"}))}
  if(p.startsWith("/api/commercial/")){
   const endpoint=p.slice("/api/commercial/".length).replace(/\/$/,"");
   const allowed=new Set(["catalog","orders","inquiries","snapshot","status","order-access","change-code","profile-email","health"]);
   if(!allowed.has(endpoint)){res.writeHead(404,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});return res.end(JSON.stringify({error:"Not found"}));}
   const origin=req.headers.origin;
   if(origin&&origin!=="https://mmw-company.onrender.com"){res.writeHead(403,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});return res.end(JSON.stringify({error:"Origin not allowed"}));}
   if(endpoint==="catalog"||endpoint==="health"){
    if(req.method!=="GET"){res.writeHead(405,{"Content-Type":"application/json; charset=utf-8"});return res.end(JSON.stringify({error:"Method not allowed"}));}
   }else if(req.method!=="POST"){res.writeHead(405,{"Content-Type":"application/json; charset=utf-8"});return res.end(JSON.stringify({error:"Method not allowed"}));}
   const ip=(req.headers["x-forwarded-for"]||req.socket.remoteAddress||"unknown").toString().split(",")[0].trim();
   const now=Date.now(),windowMs=10*60*1000,rateKey=ip+":"+endpoint,max=endpoint==="profile-email"?3:endpoint==="change-code"?6:endpoint==="order-access"?30:endpoint==="snapshot"||endpoint==="status"?12:20;
   const recent=(commercialAttempts.get(rateKey)||[]).filter(t=>now-t<windowMs);
   if(recent.length>=max){res.writeHead(429,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});return res.end(JSON.stringify({error:"Слишком много запросов к этому действию. Повторите позже."}));}
   recent.push(now);commercialAttempts.set(rateKey,recent);
   const base=process.env.SUPABASE_FUNCTION_URL,anon=process.env.SUPABASE_ANON_KEY,publishable=process.env.SUPABASE_PUBLISHABLE_KEY;
   if(!base||!anon||!publishable){res.writeHead(503,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});return res.end(JSON.stringify({error:"Коммерческий сервис ещё не настроен."}));}
   let body;
   if(req.method==="POST"){
    try{
     let raw="";for await(const chunk of req){raw+=chunk;if(raw.length>100000){res.writeHead(413,{"Content-Type":"application/json; charset=utf-8"});return res.end(JSON.stringify({error:"Request too large"}));}}
     body=JSON.parse(raw||"{}");
    }catch(e){res.writeHead(400,{"Content-Type":"application/json; charset=utf-8"});return res.end(JSON.stringify({error:"Некорректный JSON"}));}
   }
   try{
    const upstream=await fetch(base.replace(/\/$/,"")+"/"+endpoint,{method:req.method,headers:{"apikey":publishable,"Authorization":"Bearer "+anon,"Content-Type":"application/json"},body:body===undefined?undefined:JSON.stringify(body)});
    const payload=await upstream.text();
    if(upstream.status===201&&(endpoint==="orders"||endpoint==="inquiries")){
     try{await notifyCommercialTelegram(endpoint,body,JSON.parse(payload));}
     catch(e){console.error("MMW-COMPANY notification processing error:",e.message);}
    }
    res.writeHead(upstream.status,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});
    return res.end(payload);
   }catch(e){console.error("Commercial API proxy failed:",e.message);res.writeHead(502,{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"});return res.end(JSON.stringify({error:"Коммерческий сервис временно недоступен."}));}
  }
  let rel=decodeURIComponent(p);if(rel==="/")rel="/index.html";
  const f=safe(publicRoot,rel.slice(1));
  if(f&&fs.existsSync(f)&&fs.statSync(f).isFile()){
   const ext=path.extname(f).toLowerCase();
   res.writeHead(200,{"Content-Type":mime[ext]||"application/octet-stream","Cache-Control":"no-cache"});
   return fs.createReadStream(f).pipe(res);
  }
  res.writeHead(404,{"Content-Type":"text/plain; charset=utf-8"});return res.end("Not found");
 }catch(e){console.error(e);res.writeHead(500,{"Content-Type":"text/plain; charset=utf-8"});return res.end("Server error")}
});
server.listen(port,"0.0.0.0",()=>console.log("MMW-COMPANY service listening on "+port));
