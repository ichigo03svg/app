export default async function handler(req,res){
  try{
    const code=req.query.code||""
    const gid=req.query.state||process.env.JOIN_GUILD_ID||""
    const body=new URLSearchParams({
      client_id:process.env.CLIENT_ID,
      client_secret:process.env.CLIENT_SECRET,
      grant_type:"authorization_code",
      code,
      redirect_uri:process.env.REDIRECT_URI
    }).toString()
    const t=await fetch("https://discord.com/api/oauth2/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body})
    const tok=await t.json()
    if(!tok.access_token) return res.status(400).send("erro")
    const u=await fetch("https://discord.com/api/users/@me",{headers:{Authorization:`Bearer ${tok.access_token}`}}).then(r=>r.json())
    if(gid){
      await fetch(`https://discord.com/api/guilds/${gid}/members/${u.id}`,{
        method:"PUT",
        headers:{"Content-Type":"application/json",Authorization:`Bot ${process.env.DISCORD_TOKEN}`},
        body:JSON.stringify({access_token:tok.access_token})
      })
    }
    res.setHeader("Content-Type","text/html; charset=utf-8")
    res.end(`<h1>ok</h1><pre>${u.username} (${u.id})</pre>`)
  }catch(e){
    res.status(500).send("erro")
  }
}
