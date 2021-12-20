var express = require('express');
var dbConfig = require('./db.config');
var Sequelize = require('sequelize');
var cors = require('cors');
var nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
 const path = require('path');
const app = express();
app.use(cors());
 app.use(bodyParser.urlencoded({extended:false}))
 app.use(bodyParser.json())
 

//db connection
const sequelize = new Sequelize(dbConfig.DB , dbConfig.USER, dbConfig.password,{
    host:dbConfig.HOST,
    dialect:dbConfig.dialect,
    pool:{
        max:dbConfig.pool.max,
        min:dbConfig.pool.min,
        acquire:dbConfig.pool.acquire,
        idle:dbConfig.pool.idle
    }
});

//authenticate db connection 
sequelize.authenticate().then( ()=>{
    console.log("DB is connected..");
}).catch( (err)=>{
    console.log(err);
});

app.use(express.json());


//define table

let UserTable = sequelize.define('usercredential', {
    id: 
    {     autoIncrement: true,
        type: Sequelize.INTEGER
    },
    name: Sequelize.STRING,
    phone : Sequelize.STRING,
    email : 
    {
        primaryKey:true,
        type: Sequelize.STRING 
    },
    password: Sequelize.STRING,
},{
    timestamps:false,
    freezeTableName:true
});
//table creation 
/*
UserTable.sync({force:true}).then( ()=>{
    console.log(" User Credentials Table is created..");
}).catch( (err)=>{
    console.log(err);
});
*/




let plants = sequelize.define('plants',
{
    cost: Sequelize.INTEGER,
    cardtitle : Sequelize.STRING,
    url: Sequelize.STRING,
    category:Sequelize.STRING,
    id:{
        primaryKey:true,
        type:Sequelize.INTEGER
    },
    quantity:Sequelize.INTEGER
},
{
    timestamps:false,
    freezeTableName:true
});
/*
plants.sync({force:true}).then( ()=>{
    console.log("Plants table created..");
}).catch( (err)=>{
    console.log(err);
})
*/

let Cart = sequelize.define('cart',
{
    cost: Sequelize.INTEGER,
    cardtitle : Sequelize.STRING,
    url: Sequelize.STRING,
    category:Sequelize.STRING,
    id:{
        primaryKey:true,
        type:Sequelize.INTEGER
    },
    quantity:Sequelize.INTEGER,
    totalprice:Sequelize.INTEGER
},
{
    timestamps:false,
    freezeTableName:true
});
/*
Cart.sync({force:true}).then( ()=>{
    console.log("cart table created..");
}).catch( (err)=>{
    console.log(err);
})
*/


app.post('/cart' ,(req,res)=>{
    console.log( "cost is :"+req.body.cost);
    var cost = req.body.cost;
    var cardtitle = req.body.cardtitle;
    var url = req.body.url;
    var category = req.body.category;
    var id = req.body.id;
    var quantity = req.body.quantity;
    var totalprice = req.body.cost;
    

    var userObj = Cart.build({
       cost:cost,
       cardtitle:cardtitle,
       url:url,
       category:category,
       id:id,
       quantity:quantity,
       totalprice:totalprice

    });
    userObj.save().then( (data)=>{
        msg="Cart item entered Successfully..";
        
        res.status(200).send(msg);

    }).catch( (err)=>{
        console.log(err);
        res.status(400).send(err);
    })
});
  app.delete('/removeProduct/:id' ,(req,res)=>{
      var id = req.params.id;
      Cart.destroy({where:{id:id} , raw:true}).then(
          (data)=>{
              console.log(data);
              msg="cart item deleted";
               res.status(200).send(msg);
          }
          
      ).catch((err)=>{
        console.log(err);
    })
  });

  app.delete('/emptyCart' , (req,res)=>{
      Cart.destroy({where:{} , raw:true}).then( 
          (data)=>{
              msg="cart Emptied";
              res.status(200).send(msg);
          }
      ).catch((err)=>{
        console.log(err);
    })
  });

app.put('/decQuantity', (req,res)=>{
    console.log("DecQuantity is working!");
  Cart.update(
      {
         
        //  cost : req.body.cost,
        //  cardtitle : req.body.cardtitle,
        //  url : req.body.url,
        //  category : req.body.category,
        quantity : req.body.quantity - 1,
        totalprice: req.body.cost * (req.body.quantity - 1)

      },{where:{id : req.body.id}}
  ).then( (data)=>{
      console.log("Data decremented successfully");
      msg="Data decremented successfully"
      res.status(200).send();
  })  .catch( (error)=>{
    console.log(error);
    res.status(400).send(error);
  })

});
app.put('/incQuantity', (req,res)=>{
    Cart.update(
        {
        //    cost : req.body.cost,
        //    cardtitle : req.body.cardtitle,
        //    url : req.body.url,
        //    category : req.body.category,
          quantity : req.body.quantity + 1,
          totalprice: req.body.cost * (req.body.quantity + 1)
  
        },{where:{id : req.body.id}}
    ).then( (data)=>{
        console.log("Data Incremented successfully");
        msg="Data Incremented successfully"
        res.status(200).send(msg);
    })  .catch( (error)=>{
      console.log(error);
      res.status(400).send(error);
    })
  
  });

app.get('/grandTotal',(req,res)=>{
   Cart.findAll({
        attributes: [ sequelize.fn('sum', sequelize.col('totalprice'))],
        raw: true
      }).then( (data)=>{
          console.log("grand total is: "+data);
          res.status(200).send(data);
      }) .catch( (error)=>{
        console.log(error);
        res.status(400).send(error);
      })
});


var transporter = nodemailer.createTransport(
    {
        service:'gmail',
        auth:{
            user: 'vakkalamadhuri@gmail.com',
            pass:'Madhuri@1217'
        }
    }
);





// Login
app.post('/login', (req,res)=>{
    var email = req.body.email;
    var pwd = req.body.password;
    strtoReturn = "You are not a valid user";
    UserTable.findAll( {where: {
    email:email},raw:true}).then( (data)=>{

        if(data[0].password.toString() ==pwd)
        {
        strtoReturn="valid user";
        res.status(200).send(strtoReturn);
        }
        else {
         res.status(404).send(strtoReturn); 
        }
    }).catch( (err)=>{
     res.status(401).send(err);
        
    })

});
// let Otp = sequelize.define('otp',{
//     otp: Sequelize.INTEGER,
//     email:Sequelize.STRING
// })
/*
Otp.sync({force:true}).then( (data)=>{
    console.log("Otp table created")
}).catch((err)=>{
    console.log(err);
})
const Otp = sequelize.define("otp", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    otp: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    expiresIn: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  return Otp;
  */


  app.post('/forgotpassword', (req,res)=>{
    var email = req.body.email;
    UserTable.findAll( {where: {
    email:email},raw:true}).then( (data)=>
    {
        res.status(200).send(data);
        var mailOptions={
            from:'vakkalamadhuri@gmail.com',
            to: email,
            subject:'Forgot Password mail from Growgreen Website',
            html:'<a href="http://localhost:4200/resetpassword">Reset Password</a>'
        };
        console.log(mailOptions.to);
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

    }).catch( (err)=>{
        console.log(err);
        res.status(400).send(err);
    })
});

app.put('/resetpassword', (req,res)=>{
    var email = req.body.email;
    var password= req.body.password;

    UserTable.update({ password:password},
        {where:{email:email}} ).then( (data)=>{
            msg ="Record updated Successfully..";
            res.status(200).send(data);
        }).catch( (err)=>{
            console.error("Error from db is: "+err);
            res.status(400).send(err);
        })
});




//register
app.post('/register' ,(req,res)=>{
    var name = req.body.name;
    var phone = req.body.phone;
    var email = req.body.email;
    var pwd = req.body.password;
    

    var userObj = UserTable.build({
       name:name,
       phone:phone,
       email:email,
       password:pwd
    });
    userObj.save().then( (data)=>{
        console.log("User registered Successfully..");
        var msg = "Registration Successful..";
        res.status(200).send(msg);

        var mailOptions={
            from:'vakkalamadhuri@gmail.com',
            to: userObj.email,
            subject:'Welcome Msg from Growgreen Website',
            html:'<html><body><h4 style="color:green">Welcome to Growgreen. Thankyou for registering with us as a Valuable Customer! </h4> <br><img src="https://cdn.shopify.com/s/files/1/0047/9730/0847/products/nurserylive-combo-packs-plants-set-of-3-outdoor-flowering-plants-for-beautiful-garden-16969318301836_578x578.jpg?v=1634228699" alt="" height="250px;"><br><p style="color:red">Please check our new offers.</p><br><a href="#">Login Here!</a></body></html>'
        };
        console.log(mailOptions.to);
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });

    }).catch( (err)=>{
        console.log(err);
        res.status(400).send(err);
    })
});

app.get('/getAllUsers', (req,res)=>{
    UserTable.findAll({raw:true}).then( (data)=>{
        console.log("All users are displayed!");
        res.status(200).send(data);
    }).catch( (err)=>{
        console.error(err);
        res.status(400).send(err);
    })
});


app.get('/getUserById/:id' , (req,res)=>{
    var id = req.params.id;
    UserTable.findAll({where:{id:id} , raw:true}).then( (data)=>{
        console.log("User is displayed by ID");
        res.status(200).send(data);
    }).catch( (err)=>{
        console.error(err);
        res.status(400).send(err);
    })
});

app.get('/getUserByName/:name' , (req,res)=>{
    var name = req.params.name;
    UserTable.findAll({where:{name:name} , raw:true} ).then( (data)=>{
        console.log("User is displayed by Name");
        res.status(200).send(data);
    }).catch( (err)=>{
        console.error(err);
        res.status(400).send(err);
    })
})

app.get('/getProducts', (req,res)=>{
    Cart.findAll({raw:true}).then( (data)=>{
        console.log("All Cart Products are displayed!");
        res.status(200).send(data);
    }).catch( (err)=>{
        console.error(err);
        res.status(400).send(err);
    })
})
app.get('/getPlants', (req,res)=>{
    plants.findAll({raw:true}).then( (data)=>{
        console.log("All Plants are displayed!");
        res.status(200).send(data);
    }).catch( (err)=>{
        console.error(err);
        res.status(400).send(err);
    })
})

 
app.listen(3000, ()=>{
    console.log("Server is listening at http://localhost:3000");
});
