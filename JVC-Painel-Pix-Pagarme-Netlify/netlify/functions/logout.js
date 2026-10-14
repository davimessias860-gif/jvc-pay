const {reply}=require('./_shared');exports.handler=async()=>reply(200,{ok:true},{'Set-Cookie':'jvc_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'});
