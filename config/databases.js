let mysql = require ('mysql');
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'semp4'
});
connection.connect(function(error){
    if(!!error){
        console.log(error)
    }else{
        console.log('connection Succes')
    }
})

module.exports = connection;