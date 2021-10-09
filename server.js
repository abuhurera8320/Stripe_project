if(process.env.NODE_ENV !== 'production'){
      require('dotenv').config()
}
const stripesecret= process.env.stripe_private;
const stripepublic= process.env.stripe_public;
const express= require('express');
const app= express()
const ejs= require('ejs')
const fs= require('fs')
const stripe= require('stripe')(stripesecret)


app.set('view engine','ejs')
app.use(express.static('public'))
app.use(express.json())

app.get('/store',(req,res)=>{
    fs.readFile('items.json',(err,data)=>{
        if(err){
            res.status(500).end()
        }else{
            res.render('store',{
                items:JSON.parse(data),
                stripePublicKey:stripepublic
            })
        }
    })
})

app.post('/purchase',(req,res)=>{
    fs.readFile('items.json',(err,data)=>{
        if(err){
            res.status(500).end()
        }else{
             const itemsJson= JSON.parse(data)
             const itemsArray= itemsJson.music.concat(itemsJson.merch)
             let total=0
             req.body.items.forEach(item => {
                 const itemJson= itemsArray.find((i)=>{
                     return i.id==item.id
                 })
                 
                 total += itemJson.price * item.qty
                 console.log(total+'='+itemJson.price +'*'+item.qty)
             });
            stripe.charges.create({
                amount:total,
                source:req.body.stripeTokenId,
                currency:'usd'
            }).then(()=>{
              console.log('Charge Successful')
              res.json({message:'Items purchased successfully'})
            }).catch(()=>{
                console.log('charge unsuccessful')
                res.status(500).end()
            })
        }
    })
})


const port= process.env.PORT || 3000
app.listen(port,()=>{
console.log(`server is running on ${port}`)
})