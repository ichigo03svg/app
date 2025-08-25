import { kv } from "@vercel/kv"

async function join(g,u,t){return fetch(`https://discord.com/api/guilds/${g}/members/${u}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bot ${process.env.DISCORD_TOKEN}`},body:JSON.stringify({access_token:t})})}
const wait=ms=>new Promise(r=>setTimeout(r,ms))

export default async function handler(req,res){
  const key=req.query.key||""
  if(key!==process.env.ADMIN_KEY) return res.status(401).send("unauthorized")
  const gid=req.query.guild||process.env.JOIN_GUILD_ID||""
  if(!gid) return res.status(400).send("missing guild")
  const ids=await kv.smembers("verified:all")
  let ok=0,fail=0
  for(const id of ids){
    const u=await kv.hgetall(`user:${id}`)
    if(!u||!u.access_token){fail++;continue}
    const r=await join(gid,id,u.access_token)
    if(r.ok) ok++; else fail++
    await wait(250)
  }
  res.setHeader("Content-Type","application/json")
  res.end(JSON.stringify({ok,fail,count:ids.length}))
}
