// Netlify Function: secure server-side catalogue proxy.
// Set TMDB_API_KEY in Netlify Site configuration > Environment variables.
// The key stays on the server and is never shipped to the browser.
const CATEGORIES = {
  movies: {path:"/discover/movie", params:{}},
  shows: {path:"/discover/tv", params:{without_original_language:"ko,zh"}},
  kdrama: {path:"/discover/tv", params:{with_original_language:"ko",with_origin_country:"KR"}},
  cdrama: {path:"/discover/tv", params:{with_original_language:"zh",with_origin_country:"CN|TW|HK"}},
  chinesemovies: {path:"/discover/movie", params:{with_original_language:"zh",with_origin_country:"CN|TW|HK"}}
};
const GENRES = {
  28:"Action",12:"Adventure",16:"Animation",35:"Comedy",80:"Crime",99:"Documentary",
  18:"Drama",10751:"Family",14:"Fantasy",36:"History",27:"Horror",10402:"Music",
  9648:"Mystery",10749:"Romance",878:"Sci-fi",10770:"TV Movie",53:"Thriller",10752:"War",37:"Western",
  10759:"Action & Adventure",10762:"Kids",10763:"News",10764:"Reality",10765:"Sci-fi & Fantasy",
  10766:"Soap",10767:"Talk",10768:"War & Politics"
};
function moodsFor(genres=[]){
  const g=genres.map(x=>x.toLowerCase()),m=[];
  if(g.some(x=>x.includes("romance")))m.push("romantic","yearning");
  if(g.some(x=>["comedy","family","kids"].includes(x)))m.push("funny","cozy");
  if(g.some(x=>["horror","thriller","crime"].includes(x)))m.push("disturbing","intense","twisty");
  if(g.some(x=>["drama","history","war"].includes(x)))m.push("thoughtful","cry");
  if(g.some(x=>["fantasy","science fiction","sci-fi","animation"].includes(x)))m.push("mind-bending","weird");
  if(g.some(x=>["documentary","music"].includes(x)))m.push("quiet","thoughtful");
  return [...new Set(m.length?m:["thoughtful"])];
}
function normalizeTMDB(x,category){
  const genres=(x.genre_ids||[]).map(id=>GENRES[id]).filter(Boolean);
  return {id:`tmdb-${category}-${x.id}`,title:x.title||x.name||x.original_title||x.original_name||"Untitled",
    type:category==="movies"||category==="chinesemovies"?"Movie":category==="kdrama"?"K-Drama":category==="cdrama"?"C-Drama":"TV show",
    category,year:Number((x.release_date||x.first_air_date||"").slice(0,4))||null,
    genres,moods:moodsFor(genres),rating:0,
    synopsis:(x.overview||"Synopsis not available in the source catalogue.").replace(/<[^>]*>/g,""),
    source:"TMDB"};
}
exports.handler = async function(event){
  const params=event.queryStringParameters||{};
  const category=params.category||"";
  const page=Math.max(1,Math.min(50,parseInt(params.page||"1",10)||1));
  if(category==="anime"){
    if(page>40)return {statusCode:200,headers:{"Content-Type":"application/json"},body:JSON.stringify({items:[],hasMore:false})};
    try{
      const r=await fetch(`https://api.jikan.moe/v4/top/anime?page=${page}&limit=25`);
      if(!r.ok)throw new Error(`Anime source returned ${r.status}`);
      const j=await r.json();
      const items=(j.data||[]).map(x=>{
        const genres=(x.genres||[]).map(g=>g.name);
        return {id:`jikan-${x.mal_id}`,title:x.title_english||x.title,type:"Anime",category:"anime",
          year:x.year||Number((x.aired?.from||"").slice(0,4))||null,genres,moods:moodsFor(genres),
          rating:0,synopsis:x.synopsis||"Synopsis not available in the source catalogue.",source:"Jikan"};
      });
      return {statusCode:200,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=3600"},body:JSON.stringify({items,hasMore:!!j.pagination?.has_next_page})};
    }catch(e){return {statusCode:502,headers:{"Content-Type":"application/json"},body:JSON.stringify({error:e.message})};}
  }
  const config=CATEGORIES[category];
  if(!config)return {statusCode:400,headers:{"Content-Type":"application/json"},body:JSON.stringify({error:"Unknown catalogue category."})};
  const key=process.env.TMDB_API_KEY;
  if(!key)return {statusCode:503,headers:{"Content-Type":"application/json"},body:JSON.stringify({error:"TMDB_API_KEY is not configured. Add it in Netlify environment variables."})};
  const qs=new URLSearchParams({api_key:key,language:"en-US",include_adult:"false",sort_by:"popularity.desc",page:String(page),...config.params});
  try{
    const r=await fetch(`https://api.themoviedb.org/3${config.path}?${qs.toString()}`);
    const j=await r.json();
    if(!r.ok)throw new Error(j.status_message||`TMDB returned ${r.status}`);
    const items=(j.results||[]).map(x=>normalizeTMDB(x,category));
    return {statusCode:200,headers:{"Content-Type":"application/json","Cache-Control":"public, max-age=1800"},body:JSON.stringify({items,hasMore:page<50&&page<j.total_pages})};
  }catch(e){return {statusCode:502,headers:{"Content-Type":"application/json"},body:JSON.stringify({error:e.message})};}
};