const http=require("node:http"),fs=require("node:fs"),path=require("node:path"),{URL}=require("node:url");
const root=__dirname,publicRoot=path.join(root,"public"),port=Number(process.env.PORT)||10000;
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".jpg":"image/jpeg",".jpeg":"image/jpeg",".png":"image/png",".webp":"image/webp",".json":"application/json; charset=utf-8",".ico":"image/x-icon",".txt":"text/plain; charset=utf-8",".xml":"application/xml; charset=utf-8"};
const safe=(base,rel)=>{const b=path.resolve(base),p=path.resolve(base,rel);return p===b||p.startsWith(b+path.sep)?p:null};
const commercialAttempts=new Map();
const server=http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,"http://localhost"),p=u.pathname;
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
