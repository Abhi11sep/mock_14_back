const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const cors = require('cors')
const jwt=require('jsonwebtoken')
const { connection } = require('./configs/db')
const { UserModel } = require('./models/userModel')

app.use(cors({ origin: "*" }))
app.use(express.json())

app.post("/signup", (req, res) => {
    const { email, password } = req.body
    try {
        bcrypt.hash(password, 2, async (err, hash) => {
            if (err) {
                console.log('unable to hash password')
            }
            const user = await UserModel({ email, password: hash })
            await user.save()
            console.log('registered')
            res.send()
        });
    } catch (error) {
        res.send('unable to register')
    }
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await UserModel.find({ email })
        console.log(user)
        if (user.length > 0) {
            bcrypt.compare(password, user[0].password, function (err, result) {
                if (result) {
                    const token = jwt.sign({ userID: user[0]._id }, 'abhi');
                    console.log(`logged in, welcome ${user[0].email},\n token : ${token}`)
                    res.send({ "msg": "logged in", "token": `${token}` })
                } else {
                    res.send('wrong cerdentials')
                }
            });
        } else {
            res.send('login first')
        }
    } catch (error) {
        res.send('error while login')
    }
})

app.listen(8080, async (req, res) => {
    try {
        await connection;
        console.log("connected to database")
    } catch (error) {
        console.log("unable to connect with database")
    }
    console.log("running on port 8080")
})