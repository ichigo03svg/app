export default async function handler(req,res){
  const mask=s=>s?s.slice(0,4)+"…"+s.slice(-4):""
  res.setHeader("Content-Type","application/json")
  res.end(JSON.stringify({redirect_uri:(process.env.REDIRECT_URI||"").trim(),client_id_preview:mask(process.env.CLIENT_ID||""),env:process.env.VERCEL_ENV||""}))
}
