export default async function handler(req,res){
  const gid=req.query.guild||process.env.JOIN_GUILD_ID||""
  const p=new URLSearchParams({
    client_id:process.env.CLIENT_ID,
    redirect_uri:process.env.REDIRECT_URI,
    response_type:"code",
    scope:"identify email guilds.join",
    prompt:"consent",
    state:gid
  }).toString()
  if(req.query.show==="1"){
    res.setHeader("Content-Type","text/plain; charset=utf-8")
    res.end("https://discord.com/api/oauth2/authorize?"+p)
    return
  }
  res.redirect("https://discord.com/api/oauth2/authorize?"+p)
}
