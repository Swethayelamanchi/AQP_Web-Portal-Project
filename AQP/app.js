const express = require('express')
var path = require('path');
const app = express()
app.set('view engine', 'ejs')

// postgres local connection string
const { Pool, Client } = require('pg')


app.use(express.static(path.join(__dirname, 'public')))

app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
  })

app.get('/', function (req, res) {
    res.render('index',{'error':0,'errormessage':'','query':''})
})

app.get('/result', (req, res,next) => {
        query = req.param('query');

        pool = new Pool({
            user: 'postgres',
            host: 'localhost',
            database: 'postgres',
            password: 'Swetha78',
            port: 5432,
        })

        GetPostgreStats(query);
        GetPostgresResult(query);

        setTimeout(function(){ 
            try{
                res.render('result',
                    {
                        'planningTime' : planningTime ,
                        'executionTime' : executionTime ,
                        'rowsCount' : rowsCount , 
                        'data' : tableData,
                        'query': query
                    })
                }
                catch (error) {
                    res.render('index',{'error':1,
                                        'errormessage': queryerror ? "SQL query is not valid. Please check the query." : "Internal error. Please try again.",
                                        'query':query});
                }
            }, 10000);

  });

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})

// postgres stats request
function GetPostgreStats(query)
{
        pool.query('EXPLAIN ANALYZE ' + query , (err, res) => {
            if (!err) 
            {
                res.rows.forEach(element => {
    
                    if(element["QUERY PLAN"].includes('Planning time'))
                        planningTime = element["QUERY PLAN"];
        
                    if(element["QUERY PLAN"].includes('Execution time'))
                        executionTime = element["QUERY PLAN"];
                    });
            }
            else{
                queryerror = true;
            }
          })
}

function GetPostgresResult(query)
{
        pool.query(query, (err, res) => {
            if (!err) {
                rowsCount = res.rows.length;
                tableData= res.rows;
                pool.end()
              }
              else{
                  queryerror = true;
              }
        })
}