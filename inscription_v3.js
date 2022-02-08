const http = require('http');
const formidable = require('formidable');
const fs = require('fs');
const oracledb = require('oracledb');
const dbConfig = require('./dbconfig.js');
const cryptoo = require('crypto');

let libPath;
if (libPath && fs.existsSync(libPath)) {
    oracledb.initOracleClient({ libDir: libPath });
}

http.createServer(function (req, res) {



    let parametres = req.url.slice(1).split("/"); //sépare la route et les paramètre du URL

    let route = parametres[0];

    
    






    if(route == 'login') {
        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
            let user_ = fields.username;
            let pass_ = fields.passwd;
           
            async function run() {
                let connection;          
                try {
                    let sql, binds, options, result;
                    connection = await oracledb.getConnection(dbConfig);
                    sql = 'SELECT user_id AS I, username AS U, mdp AS P, first_name AS F, last_name AS L, mail AS E FROM utilisateur WHERE username=:1 and mdp=:2';
                    binds = [user_, pass_];
                    options = { outFormat: oracledb.OUT_FORMAT_OBJECT, };
                    result = await connection.execute(sql, binds, options);

			
                    if(result.rows.length == '1' && user_ == result.rows[0]['U'] && pass_ == result.rows[0]['P']) {
                        let first_name = result.rows[0]['F'];
                        let last_name = result.rows[0]['L'];
                        let email = result.rows[0]['E'];
						let user_id = result.rows[0]['I'];
						let token = cryptoo.randomBytes(50).toString('hex');
														
						sql = `INSERT INTO session_rest VALUES (TO_NUMBER(TO_CHAR(SYSTIMESTAMP, 'SSSSFF')), :1, SYSDATE, :2)`;
						binds = [user_id, token];
						options = {
							autoCommit: true,
							bindDefs: [
								{ type: oracledb.NUMBER},
								{ type: oracledb.STRING, maxSize: 200}
							]
						};
						result = await connection.execute(sql, binds, options);
						console.log("Number of rows inserted:", result.rowsAffected);
						
                        res.writeHead(200, {'Content-Type': 'text/html', 'HTTP2-Settings': token});
                        res.write('<!DOCTYPE html>');
                        res.write('<meta charset="UTF-8">');
                        res.write('<html><body><center>');
                        //res.write("<script>var req = new XMLHttpRequest(); req.open('GET', document.location, false); req.send(null); while (req.readyState != 4) {}; var header = req.getResponseHeader('HTTP2-Settings'); alert(header);</script>");
                        res.write('<h1>User information</h1><br>');
                        res.write('<form action=/login> <input type="submit" value="Deconnexion"/> </form>');
                        
                        res.write('<form action=/afficheremp method="post"> <label for="deptno">Deptno : </label> <input type="number" id="deptno" name="deptno"><br><br> <input type="submit" value="Afficher Employé"/> </form>');
                        
                        res.write('</center></body></html>');
                        return res.end();
                    } else {
                        login_page(res);
                    }  
                } catch (err) {
                    console.error(err);
                } finally {
                    if (connection) {
                        try {
                            await connection.close();
                        } catch (err) {
                        console.error(err);
                        }
                    }
                }        
            }
            run();
        });
    } else if(route == 'inscription') {
        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {
        update_user(fields.token, fields.prenom, fields.nom, fields.courriel, err);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<meta charset="UTF-8">');
        res.write('<p> Prénom: '+fields.prenom+'</p><br><br>');
        res.write('<p> Nom: '+fields.nom+'</p><br><br>');
        res.write('<p> Courriel: '+fields.courriel+'</p><br><br>');
        return res.end();
      });
    }else if(route=='inscrit'){


        
        let form = new formidable.IncomingForm();
        form.parse(req, function (err, fields, files) {

        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write('<!DOCTYPE html>');
        res.write('<meta charset="UTF-8">');
        res.write('<html><body><center>');    
        insert_user(fields.username, fields.passwd, fields.prenom, fields.nom, fields.email);
        res.write('</center></body></html>');
        
    });


    }else if(route == 'afficheremp'){
        
        
        var numdeptno = -1;
        if(parametres.length == 2){
        let deptno = parametres[1];
        numdeptno = Number(deptno);

        }

        

        affiemp(numdeptno, res);




    }else if(route=='loginfailed'){
            login_page(res);
    }else if(route=='inscriptionfailed'){
        login_page(res);
} else {
        login_page(res);
    }
    function login_page(res) {


        fs.readFile('Login.html', function(err, data) {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write(data);
            return res.end();
          });

    }




    async function affiemp(depno, res){
        



        try {

        let sql, binds, options, result;
        connection = await oracledb.getConnection(dbConfig);

            
        if(depno == -1){
            sql = `SELECT ename as I, job as L FROM emp where deptno != :1`;
                binds = [-1];
            }else{
                
            sql = `SELECT ename as I, job as L FROM emp where deptno = :1`;
        binds = [depno];
        }
            options = { outFormat: oracledb.OUT_FORMAT_OBJECT, };
            result = await connection.execute(sql, binds, options);




            for (let i = 0; i < result.rows.length; i++) {
                let fname = result.rows[i]['I'];
                let lastname = result.rows[i]['L'];
                res.write('<p>' + fname + " " + lastname +'</p>')
              }
        

            } catch (err) {
                console.error(err);
            } finally {
                if (connection) {
                    try {
                        await connection.close();
                    } catch (err) {
                    console.error(err);
                    }
                }
            }  

    }


    async function insert_user( username, mdp, prenom, nom,  courriel, err) {
        let connection;          


        if(username.length == 0  || mdp.length == 0 || prenom.length == 0|| nom.length == 0|| courriel.length == 0){

            res.write('<p> Inscription Echouer ;Champs de texte vide</p>');
            res.write('<script> setTimeout(function(){window.location.href = \'/inscriptionfailed\';}, 2000);</script>');
            return;
        }




        try {
            let sql, binds, options, result;
            connection = await oracledb.getConnection(dbConfig);
            
            let iduser = 0;

			sql = 'SELECT user_id AS I FROM utilisateur WHERE user_id = :1';
            binds = [iduser]; 
            options = { outFormat: oracledb.OUT_FORMAT_OBJECT, };
            result = await connection.execute(sql, binds, options);

            
            while(iduser == 0 || result.rows.length > 0){
                iduser = 99 + (Math.floor(Math.random() * 801));
                sql = 'SELECT user_id AS I FROM utilisateur WHERE user_id = :1';
                binds = [iduser]; 
                options = { outFormat: oracledb.OUT_FORMAT_OBJECT, };
                result = await connection.execute(sql, binds, options);



            }
			



			sql = `SELECT username AS I FROM utilisateur where username = :1 `;
            binds = [username];
            options = { outFormat: oracledb.OUT_FORMAT_OBJECT, };
            result = await connection.execute(sql, binds, options);

            if(result.rows.length > 0){
                
        res.write('<p> Inscription Echouer ; Nom dutilisateur déja utiliser</p>')
        res.write('<script> setTimeout(function(){window.location.href = \'/inscriptionfailed\';}, 2000);</script>');
                return;
            }



            sql = 'insert into utilisateur values(:1, :2, :3, :4, :5, :6)';

            

            binds = [iduser,username, mdp, prenom, nom, courriel];
            options = {
                autoCommit: true,
                bindDefs: [
                    { type: oracledb.STRING, maxSize: 50 },
                    { type: oracledb.STRING, maxSize: 50 },
                    { type: oracledb.STRING, maxSize: 100 },
                    { type: oracledb.NUMBER }
                ]
            };
            result = await connection.execute(sql, binds, options);
            console.log("Number of rows inserted :", result.rowsAffected);
            } catch (err) {
                console.error(err);
            } finally {
                if (connection) {
                    try {
                        await connection.close();
                    } catch (err) {
                    console.error(err);
                    }
                }
            }  
            
        res.write('<p> Vous Êtes Inscrit </p>')
        }        
    

    async function update_user(jeton, prenom, nom, courriel, err) {
        let connection;          
        try {
            let sql, binds, options, result;
            connection = await oracledb.getConnection(dbConfig);
			
			sql = `SELECT util_id AS I FROM session_rest WHERE jeton=:1`;
            binds = [jeton];
            options = { outFormat: oracledb.OUT_FORMAT_OBJECT, };
            result = await connection.execute(sql, binds, options);
			let user_id = result.rows[0]['I'];
			
            sql = `UPDATE utilisateur SET first_name=:1,last_name=:2,mail=:3 WHERE user_id=:4`;
            binds = [prenom, nom, courriel, user_id];
            options = {
                autoCommit: true,
                bindDefs: [
                    { type: oracledb.STRING, maxSize: 50 },
                    { type: oracledb.STRING, maxSize: 50 },
                    { type: oracledb.STRING, maxSize: 100 },
                    { type: oracledb.NUMBER }
                ]
            };
            result = await connection.execute(sql, binds, options);
            console.log("Number of rows updated:", result.rowsAffected);
            } catch (err) {
                console.error(err);
            } finally {
                if (connection) {
                    try {
                        await connection.close();
                    } catch (err) {
                    console.error(err);
                    }
                }
            }          
    }



}).listen(3000);
