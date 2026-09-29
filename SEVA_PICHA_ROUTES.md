# Routes za picha za ukurasa (seva ya njiamauzo-afrika, /api/mjueyesu)

Programu inatuma/inaomba:
- POST /image        body: {id, data: "data:image/jpeg;base64,..."}  -> {ok:true}   (inahitaji X-Admin-User / X-Admin-Pass kama /save)
- GET  /image/:id    -> baiti za picha (Content-Type: image/jpeg), au 404
- POST /image/delete body: {id} -> {ok:true}

Mfano (Express) — badilisha kulingana na uhifadhi wa seva yako (kumbuka: diski ya Render ya bure hufutwa; tumia DB au disk ya kudumu).
Ongeza `express.json({limit:'2mb'})` kwa route ya /image (kikomo cha kawaida 100kb ni kidogo).

```js
const imgs = new Map(); // BADILISHA: tumia MongoDB/Postgres/disk ya kudumu
router.post('/image', express.json({limit:'2mb'}), requireAdmin, (req,res)=>{
  const {id,data}=req.body||{};
  const m=/^data:(image\/jpeg|image\/png);base64,(.+)$/.exec(data||'');
  if(!id||!m) return res.status(400).json({ok:false});
  imgs.set(String(id),{type:m[1],buf:Buffer.from(m[2],'base64')});
  res.json({ok:true});
});
router.get('/image/:id',(req,res)=>{
  const i=imgs.get(req.params.id); if(!i) return res.sendStatus(404);
  res.type(i.type).send(i.buf);
});
router.post('/image/delete', express.json(), requireAdmin, (req,res)=>{ imgs.delete(String(req.body&&req.body.id)); res.json({ok:true}); });
```
