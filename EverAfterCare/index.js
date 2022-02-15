const express = require('express')
const app = express()

app.use(express.static("public"));

app.get('/menu', (req, res) => {
    res.render('menu.ejs')
})
app.get('/services', (req, res) => {
    res.render('services.ejs')
})
app.listen(3000)