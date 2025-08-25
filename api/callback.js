import { kv } from "@vercel/kv"

async function j(url,init){const r=await fetch(url,init);return r}
export default async function handler(req,res){
  try{
    const code=req.query.code||""
    const gid=req.query.state||process.env.JOIN_GUILD_ID||""
    const ru=(process.env.REDIRECT_URI||"").trim()
    const body=new URLSearchParams({
      client_id:process.env.CLIENT_ID,
      client_secret:process.env.CLIENT_SECRET,
      grant_type:"authorization_code",
      code,
      redirect_uri:ru
    }).toString()
    const t=await fetch("https://discord.com/api/oauth2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body})
    const tok=await t.json()
    if(!tok.access_token) return res.status(400).send("erro")
    const u=await fetch("https://discord.com/api/users/@me",{headers:{Authorization:`Bearer ${tok.access_token}`}}).then(r=>r.json())
    await kv.hset(`user:${u.id}`,{id:u.id,username:`${u.username}#${u.discriminator||"0"}`,email:u.email||null,access_token:tok.access_token,refresh_token:tok.refresh_token||null,expires_at:Date.now()+(tok.expires_in||0)*1000})
    await kv.sadd("verified:all",u.id)
    await kv.incr("stats:verified_count")
    if(gid) await kv.sadd(`verified:target:${gid}`,u.id)
    if(gid) await j(`https://discord.com/api/guilds/${gid}/members/${u.id}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bot ${process.env.DISCORD_TOKEN}`},body:JSON.stringify({access_token:tok.access_token})})
    const log=process.env.LOG_CHANNEL_ID
    if(log) await j(`https://discord.com/api/channels/${log}/messages`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bot ${process.env.DISCORD_TOKEN}`},body:JSON.stringify({embeds:[{title:"Novo Usuário Verificado",description:"`Nome:` "+"<@"+u.id+">"+"\n"+"`ID:` "+u.id+"\n"+"`E-mail:` "+(u.email||"indisponível")}]})})
    res.setHeader("Content-Type","text/html; charset=utf-8")
    res.end(`<h1>ok</h1><pre>${u.username} (${u.id})</pre>`)
  }catch(e){res.status(500).send("erro")}
}
