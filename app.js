const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const validator = require("validator");
const alert = require('alert');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(express.static('public'));


let flag = 0;

// ----------------Mongoose-----------------

mongoose.connect('mongodb://localhost:27017/mydb', { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: true }).then(() => console.warn('db connection done'))

// const usersSchema = {
//     name: String,
//     email: String,
//     balance: Number,
//     accountNo: Number
// }

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        // minlength: [2, "minimum  10 letters"],
        maxlength: 30
    },

    email: {
        type: String,
        // required: true,
        // unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {

                throw new Error("Invalid Email");
            }
        }
    },
    balance: Number,
    accountNo: Number
})








const User = mongoose.model('User', usersSchema);

const user1 = new User({
    name: "Sudha Rani ",
    // email: "sujal10sty@gmail.com",
    email: "sudha1998rani@gmail.com",
    balance: 100000,
    accountNo: 1201595
})

const user2 = new User({
    name: "Amritha Rohini",
    email: "amro05@gmail.com",
    balance: 100000,
    accountNo: 12015952
})

const user3 = new User({
    name: "Shashank kumar",
    email: "shashankshekhar@gmail.com",
    balance: 100000,
    accountNo: 12015953
})

const user4 = new User({
    name: "Suman Ghosh",
    email: "nakhun.kala.lover@gmail.com",
    balance: 100000,
    accountNo: 12015954
})

const user5 = new User({
    name: "Chandini",
    email: "cchandini@gmail.com",
    balance: 100000,
    accountNo: 12015955
})

const user6 = new User({
    name: "Surbhi",
    email: "shekharsurya@gmail.com",
    balance: 100000,
    accountNo: 12015956
})

const userArray = [user1, user2, user3, user4, user5, user6];


// -------x--------Mongoose-------x---------



// ------------------Date-----------------

var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
var today = new Date();
let day = today.toLocaleDateString("en-US", options);

// ---------x--------Date-------x---------



const history = [];
let amount = 0;


app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/index.html`);
})

app.get('/get-started', (req, res) => {

    User.find({}, (err, foundUsers) => {
        if (foundUsers.length === 0) {
            User.insertMany(userArray, (err) => {
                if (err) console.log(err);
            })
        } else {
            res.render('get-started', {
                balance: foundUsers[0].balance
            })
        }
    })

})

app.get('/add', (req, res) => {
    User.find({}, (err, foundUsers) => {
        res.render('add', {
            balance: foundUsers[0].balance
        })
    })
})



app.get('/transaction', (req, res) => {

    User.find({}, (err, foundUsers) => {
        if (foundUsers.length === 0) {
            User.insertMany(userArray, (err) => {

            })
        } else {
            res.render('transaction', {
                users: foundUsers,
                balance: foundUsers[0].balance
            })
        }
    })

})

app.get('/members', (req, res) => {

    User.find({}, (err, foundUsers) => {
        if (foundUsers.length === 0) {
            User.insertMany(userArray, (err) => {

            })

            res.redirect('/members');
        } else {

            res.render('members', {
                users: foundUsers,
                balance: foundUsers[0].balance
            })
        }
    })

})

app.post('/get-started', (req, res) => {

    amount = Number(req.body.amount);

    User.find({}, (err, foundUsers) => {
        if (foundUsers.length === 0) {
            User.insertMany(userArray, (err) => {

            })
        } else {

            if (amount > foundUsers[0].balance) {
                alert('failed')
                res.redirect('/transaction');
            } else {
                foundUsers[0].balance -= amount;

                foundUsers[0].save();

                User.findById(req.body.select, (err, found) => {
                    found.balance += amount;
                    found.save();
                    console.log(found.balance)
                    history.push({
                        sender: foundUsers[0].name,
                        receiver: found.name,
                        amount: amount,
                        date: day
                    })
                })

                alert('successful')
                res.render('get-started', {
                    balance: foundUsers[0].balance
                })
            }

        }
    })


})

app.post('/members', async(req, res) => {
    console.log("reuest", req.body)
    let user = await User.findOne({ email: req.body.email })

    if (user) return res.send("User exists")
        // User.find({}, (err, foundUsers) => {
        // if (foundUsers.length === 0) {
        //     User.insertMany(userArray, (err) => {

    //     })
    // } else {

    // let newuser
    user = new User({
        name: req.body.name,
        email: req.body.email,
        balance: Number(req.body.balance),
        accountNo: Number(req.body.account)
    })

    // foundUsers[0].balance += Number(req.body.money);
    // foundUsers[0].save();

    await user.save();

    res.redirect('/members');

    // }
})

// })

app.get('/add-money', (req, res) => {
    User.find({}, (err, foundUsers) => {
        if (foundUsers.length === 0) {
            User.insertMany(userArray, (err) => {

            })
        } else {
            res.render('add-money', {
                history: history,
                balance: foundUsers[0].balance
            })
        }
    })
})

app.get('/transaction-history', (req, res) => {

    User.find({}, (err, foundUsers) => {
        if (foundUsers.length === 0) {
            User.insertMany(userArray, (err) => {

            })
        } else {
            res.render('history', {
                history: history,
                balance: foundUsers[0].balance
            })
        }
    })

})

let port = process.env.PORT;
if (port == null || port == "") {
    port = 8000;
}
app.listen(port);