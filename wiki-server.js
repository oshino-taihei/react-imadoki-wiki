const path = require('path')
const NeDB = require('nedb')
const db = new NeDB({
    filename: path.join(__dirname, 'wiki.db'),
    autoload: true
})

const express = require('express')
const app = express()
const port = 3001
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}))
app.listen(port, () => {
    console.log('起動しました: ', `http://localhost:${port}`)
})

// Wikiデータ取得API
app.get('/api/get/:wikiname', (req, res) => {
    const wikiname = req.params.wikiname
    db.find({name: wikiname}, (err, docs) => {
        if (err) {
            res.json({status: false, msg: err})
            return
        }
        if (docs.length === 0) {
            docs = [{name: wikiname, body: ''}]
        }
        res.json({status: true, data: docs[0]})
    })
})

// Wikiデータ書き込みAPI
app.post('/api/put/:wikiname', (req, res) => {
    const wikiname = req.params.wikiname
    const body = req.body.body
    console.log('/api/put/' + wikiname, body)
    db.find({name: wikiname}, (err, docs) => {
        if (err) {
            res.json({status: false, msg: err})
            return
        }
        if (docs.length === 0) {
            // エントリがなければ挿入
            db.insert({name: wikiname, body: body})
        } else {
            // エントリがあれば更新
            db.update({name: wikiname}, {name: wikiname, body: body})
        }
        res.json({status: true})
    })
})

// publicディレクトリを自動で返す
app.use('/wiki/:wikiname', express.static('./public'))
app.use('/edit/:wikiname', express.static('./public'))
app.get('/', (req, res) => {
    res.redirect(302, '/wiki/FrontPage')
})