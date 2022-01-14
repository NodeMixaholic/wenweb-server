let GUN = require('gun')
let fs = require('fs');
let crypto = require('crypto');
var path = require('path');
let gun = GUN(['https://gun-manhattan.herokuapp.com/gun', 'http://localhost:8765/gun'])
let domain = "change.me"
let wendomain = `@wenweb@${domain}`
let login = [];
login[0] = wendomain;
let pubkey;

let user = gun.user()
let keydir = path.join(__dirname, 'keys')
let pagedir = path.join(__dirname, 'pages')
console.log(`KEYS DIRECTORY: ${keydir}`)
console.log(`PAGES DIRECTORY: ${pagedir}`)
fs.mkdir(keydir, (error) => {
    console.log(`DEBUG: Directorys already exist or error details below.
    ${error}`)
})
fs.mkdir(pagedir, (error) => {
    console.log(`DEBUG: Directorys already exist or error details below.
    ${error}`)
})

fs.readFile(path.join(keydir, 'privatekey') , 'utf8', function(err, data){
    if (err) {
        crypto.generateKey("aes", {"length": 256}, (err, k) => {
            if (err) throw err;
            let kkey = k.export().toString('hex')
            login[1] = kkey
            fs.writeFile(path.join(keydir, 'privatekey'), kkey, {encoding: 'utf8'}, () => {
                console.log('OK')
            })
        })
    }
    login[1] =  data
})

let u;
try {
    user.create(login[0], login[1])
    u = user.auth(login[0], login[1])
} catch {
    
    u = user.auth(login[0], login[1])
}

let coredb = user.get('wenweb')
let pages = coredb.get('@pages')
fs.readdirSync(pagedir).map(fileName => {
    let page = pages.get(`@${fileName}`) //note that index is now home and pages are written in SMD (Sam's Mark Down)
    let fpath = path.join(pagedir, fileName)
    fs.readFile(fpath , 'utf8', function(err, data){
        if (err) throw err;
        page.put(data)
    })
})
