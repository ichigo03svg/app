import { kv } from "@vercel/kv"
export default async function handler(req,res){
  const c=await kv.get("stats:verified_count")
  res.setHeader("Content-Type","application/json")
  res.end(JSON.stringify({verified: Number(c||0)}))
}
