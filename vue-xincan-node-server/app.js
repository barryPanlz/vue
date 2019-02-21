let express 	= require('express');
let app 		= express();
let url 		= require("url");
let bodyParser 	= require('body-parser');
let mysql      	= require('mysql');
//引用bodyParser 这个不要忘了写
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//设置跨域访问
app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	res.header("X-Powered-By",' 3.2.1');
	res.header("Content-Type", "application/json;charset=utf-8");
	next();
 });

// 连接mysql
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '123456',
  database : 'vue-xincan'
});
connection.connect();
let dataBaseOption = function(sql, callback){
	connection.query(sql, function (error, results, fields) {
		  if (error) throw error;
		  callback(results);
		  results = '';
	});
};


// 用户操作 根据条件查询用户分页信息
app.get('/user',function(req,res){
	let search = url.parse(req.url,true).search,
		param = url.parse(req.url,true).query
		page = (param.page - 1) * param.size
		size = param.size
		sqlCount = "SELECT count(*) count FROM employee where 1=1 ";
		sql  = "SELECT ";
		sql += "id ";
		sql += ",login_name loginName ";
		sql += ",login_password loginPassword ";
		sql += ",name ";
		sql += ",sex ";
		sql += ",phone ";
		sql += ",email ";
		sql += ",area_id areaId ";
		sql += ",organization_id organizationId ";
		sql += ",date_format(create_time,'%Y-%m-%d %H:%m:%i') createTime ";
		sql += " FROM employee where 1=1 "; // 查询用户信息

	let searchParam = JSON.parse(param.param);
	if(search != null){
		if(searchParam.loginName != undefined & searchParam.loginName != ''){
			sqlCount += " and login_name='" + searchParam.loginName + "'";
			sql += " and login_name='" + searchParam.loginName + "'";
		}
		if(searchParam.name != undefined & searchParam.name != ''){
			sqlCount += " and name='" + searchParam.name + "'";
			sql += " and name='" + searchParam.name + "'";
		}
		if(searchParam.sex != undefined & searchParam.sex != ''){
			sqlCount += " and sex='" + searchParam.sex + "'";
			sql += " and sex='" + searchParam.sex + "'";
		}
		if(searchParam.areaId != undefined & searchParam.areaId != ''){
			sqlCount += " and area_id='" + searchParam.areaId + "'";
			sql += " and area_id='" + searchParam.areaId + "'";
		}
		if(searchParam.organizationId != undefined & searchParam.organizationId != ''){
			sqlCount += " and organization_id='" + searchParam.organizationId + "'";
			sql += " and organization_id='" + searchParam.organizationId + "'";
		}
	}
	sql += " order by create_time desc";
	sql += " limit " + page + ", " + size;
	console.log("------------------------------------------");
	console.log(sqlCount);
	console.log("------------------------------------------");
	console.log(sql);
	console.log("------------------------------------------");

	// 查询总条数
	dataBaseOption(sqlCount, function(total){
		let count = total[0].count;
		dataBaseOption(sql, function(result){
			res.status(200),
			res.json({count:count,msg:'查询成功', data:result});
		});
	});

});


// 用户操作 根据条件添加修改用户信息
app.get('/user/edit',function(req,res){
	let param = url.parse(req.url,true).query
		,sql = "";

	if(param.id == undefined){
		sql  = "insert into employee (id, login_name, login_password, name, sex, phone, email, area_id, organization_id, create_time) ";
		sql += "value ";
		sql += "(replace(UUID(), '-', ''), '" +param.loginName+ "', '" +param.loginPassword+ "', '" +param.name+ "', '" +param.sex+ "', '"
		+param.phone+ "', '" +param.email+ "', '" +param.areaId+ "', '" +param.organizationId+ "', now())";
	}else{
		sql  = "update employee set ";
		sql += " login_name = '" + param.loginName + "'";
		sql += ", login_password = '" + param.loginPassword + "'";
		sql += ", name = '" + param.name + "'";
		sql += ", sex = '" + param.sex + "'";
		sql += ", phone = '" + param.phone + "'";
		sql += ", email = '" + param.email + "'";
		sql += ", area_id = '" + param.areaId + "'";
		sql += ", organization_id = '" + param.organizationId + "'";
		sql += ", create_time = now() ";
		sql += "where id = '" + param.id+ "'";
	}
	dataBaseOption(sql, function(result){
		let resultObject = {
			code:200
			,msg: param.id === undefined ? "添加成功": "修改成功"
			,data: result
		};
		res.status(200),
		res.json(resultObject);
	});
});

// 用户操作 根据条件添加修改用户信息
app.get('/user/delete',function(req,res){
	let param = url.parse(req.url,true).query;
	let id = "";

	let ids = param.id.split(",");
	for(let i  = 0; i < ids.length; i++){
		id += ",'" + ids[i] + "'";
	}
	let sql = "DELETE FROM employee where id in (" + id.substr(1) + ")";
	console.log(sql);
	console.log("--------------------------------------------------------");
	dataBaseOption(sql, function(result){
		let resultObject = {
			code:200
			,msg: "删除成功"
			,data: result
		};
		res.status(200),
		res.json(resultObject);
	});
});

//////////////////////////////////////////////////////////////////////////////////////////////////////

// 表格显隐列样式 获取当前表格列的信息
app.get('/table/select',function(req,res){
	let param = url.parse(req.url,true).query;
	let sql = "SELECT * FROM table_cell_show where name = '" + param.name + "'";
	dataBaseOption(sql, function(result){
		res.status(200),
		res.json(result);
	});
});

// 表格显隐列样式 更新当前表格列的信息
app.get('/table/status',function(req,res){
	var param = url.parse(req.url,true).query;
	let deleteSql = "delete from table_cell_show where name = '" + param.name + "'";
	let insertSql = "insert into table_cell_show (id, name, content, create_time) " +
		"value (replace(UUID(), '-', ''), '" + param.name + "', '" + param.content + "', now())";
	// 删除显隐列数据
	dataBaseOption(deleteSql, function(result){
		// 增加显隐列数据
		dataBaseOption(insertSql, function(result){
			res.status(200),
			res.json(result);
		});
	});
});



//配置服务端口
let server = app.listen(3000, function () {

	let host = server.address().address;

	let port = server.address().port;

	console.log('Example app listening at http://%s:%s', host, port);
});



