if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config();
}

const stripeSecretKey=process.env.STRIPE_SECRET_KEY;
const stripePublicKey=process.env.STRIPE_PUBLIC_KEY;
console.log(stripeSecretKey,stripePublicKey);

const express=require("express");
const app=express();
const fs=require('fs');
const { request } = require('http');
const stripe=require('stripe')(stripeSecretKey)
//frontend will be run in ejs
app.set('view engine','ejs'); 
app.use(express.static('public'));
app.use(express.json())
//for items
app.get('/store',(req,res)=>{
    fs.readFile('items.json',function(error,data){
        if(error){
            res.status(404).end();
        }else{
            res.render('store.ejs',{
                stripePublicKey:stripePublicKey,
                items:JSON.parse(data)
            })
        }
    })
})


app.post('/purchase',(req,res)=>{
    fs.readFile('items.json',function(error,data){
        if(error){
            res.status(404).end();
        }else{
         const itemJson=JSON.parse(data)
         const itemArray=itemJson.music.concat(itemJson.merch)
         let total=0;
         req.body.items.forEach(function(item){
             const itemJson=itemArray.find(function(i){
                 return i.id==item.id;
             })
             total=total+itemJson.price *item.quantity;
         })
stripe.charges.create({
    amount:total,
    source:req.body.stripeTokenId,
    currency:'usd'
}).then(function(){
    console.log('charge successful');
    res.json({message:'Successfully purchased items'})
}).catch(function(){
    console.log('charge Fail');
    res.status(404).end();
})
        }
    })
})


const Port=process.env.PORT||3000;
app.listen(Port,()=>{console.log(`Server is running in ${Port}`);})