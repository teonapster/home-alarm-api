var http = require('http')
var auth = require('basic-auth')
var compare = require('tsscmp')
var fs = require("fs");
var url = require('url');

console.log(`only user ${process.env.USERNAME} is granted`)

// Create server
const server = http.createServer(function (req, res) {
    const credentials = auth(req)
    const urlParts = url.parse(req.url, true);
    res.setHeader('Access-Control-Allow-Origin: http://localhost:8100');
    res.setHeader('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token');

    // Check credentials
    // The "check" function will typically be against your user store
    if (!credentials || !check(credentials.name, credentials.pass)) {
        res.statusCode = 401
        res.setHeader('WWW-Authenticate', 'Basic realm="example"')
        res.end('Access denied')
    } else {
        serve(urlParts,res);
        res.end('Access granted')
    }
})

function serve(urlParts,res) {
    if (urlParts.path.includes('/alarm')) {
        console.log(urlParts.query.lock)
        const shouldLock = urlParts.query.lock === 'true';
        setAlarmState(shouldLock);
    } else if (urlParts.path.includes('/status')) {
        const status = JSON.parse(fs.readFileSync('alarm-state.json', 'utf8'));
        console.log(status);
        res.end(JSON.stringify(status));
    }
    
}

// Basic function to validate credentials for example
function check(name, pass) {
    let valid = true

    // Simple method to prevent short-circut and use timing-safe compare
    valid = compare(name, process.env.USERNAME) && valid
    valid = compare(pass, process.env.PASSWORD) && valid

    return valid
}

function setAlarmState(locked) {
    const myJson = { locked };
    fs.writeFile("alarm-state.json", JSON.stringify(myJson), "utf8", () => { });
}



// Listen
server.listen(process.env.PORT || 3000)