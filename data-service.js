//Server: peanut.db.elephantsql.com
//user name: qvvnkarx
//password: bBaIXZn64C0GhmhQXNFg212E2mBUfxrM
const Sequelize = require('sequelize');
var sequelize = new Sequelize('qvvnkarx', 'qvvnkarx', 'bBaIXZn64C0GhmhQXNFg212E2mBUfxrM', {
    host: 'peanut.db.elephantsql.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
    },
    query :{raw:true}
   });

sequelize.authenticate().then(()=> console.log('Connection success.'))
.catch((err)=>console.log("Unable to connect to DB.", err));

var Employee = sequelize.define('Employee',{
    employeeNum: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    SSN: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressState:Sequelize.STRING,
    addressPostal: Sequelize.STRING,
    maritalStatus: Sequelize.STRING,
    isManager: Sequelize.BOOLEAN,
    employeeManagerNum: Sequelize.INTEGER,
    status: Sequelize.STRING,
    department: Sequelize.INTEGER,
    hireDate: Sequelize.STRING
},{
    createdAt: false, // disable createdAt
    updatedAt: false // disable updatedAt
});

var Department =sequelize.define('Department',{
    departmentId: {
        type: Sequelize.INTEGER,
        primaryKey: true, 
        autoIncrement: true
    },
    departmentName: Sequelize.STRING
    },{
        createdAt: false, // disable createdAt
        updatedAt: false // disable updatedAt
});

exports.initialize = function() {
    //console.log("in init function");
    return new Promise(function(resolve,reject){
            sequelize.sync().then(function(){
                console.log("success");
                resolve();
            }).catch((err)=>{
                reject("unable to sync the database");
            });
    });
    //}).then(new Promise (function(resolve,reject){
    //     //console.log("reading departments");
    //     reject();
    //}));
}

exports.getAllEmployees = function() {
    //console.log("in get all employees function");
    return new Promise (function(resolve,reject){
        Employee.findAll().then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
    });
} 

exports.getManagers = function() {
    //console.log("in get Managers");

    console.log(employees[0]);
    return new Promise(function(resolve,reject){
        reject();
    }) 
}

exports.getDepartments = function(){
    //console.log("in get departments");
    return new Promise(function(resolve,reject){
        Department.findAll().then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
    });
}

exports.addEmployee = function(employeeData){
    return new Promise(function(resolve,reject){
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for(data in employeeData){
            if (employeeData[data] == "")
                employeeData[data] = null;
            console.log(employeeData[data]);     
        }
        Employee.create(employeeData).then(()=>{
            resolve()
        }).catch((err)=>{
            reject("unable to create employee");
        });
    });
}

exports.getEmployeesByStatus = function(empStatus){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            where: {
                status: empStatus
            }
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
    });
}

exports.getEmployeesByDepartment = function(dept){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            where: {
                department: dept
            }
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
    });
}

exports.getEmployeesByManager = function(mang){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            where: {
                employeeManagerNum: mang
            }
        }).then((data)=>{
            resolve(data);
        }).catch((err)=>{
            reject("no results returned");
        });
    });
}

exports.getEmployeeByNum = function(num){
    return new Promise(function(resolve,reject){
        Employee.findAll({
            where: {
                employeeNum: num
            }
        }).then((data)=>{
            resolve(data[0]);
        }).catch((err)=>{
            reject("no results returned");
        });
    });

}

exports.updateEmployee=function(employeeData){
    return new Promise(function(resolve,reject){
        employeeData.isManager = (employeeData.isManager) ? true : false;
        for(data in employeeData){
            if (employeeData[data] == "")
                employeeData[data] = null;
        }
        Employee.update(employeeData, {
            where: {employeeNum: employeeData.employeeNum}
        }).then(()=>{
            resolve()
        }).catch((err)=>{
            reject("unable to update employee");
        });
    });
}

exports.addDepartment = function(departmentData){
    return new Promise(function(resolve,reject){
        for(data in departmentData){
            if (departmentData[data] == "")
                departmentData[data] = null;
        }
        Department.create(departmentData).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("unable to create department");
        });
    });
}

exports.updateDepartment = function(departmentData){
    return new Promise(function(resolve,reject){
        for(data in departmentData){
            if (departmentData[data] == "")
                departmentData[data] = null;
        }
        Department.update(departmentData ,{
            where: {departmentId: departmentData.departmentId}
        }).then(()=>{
            resolve();
        }).catch((err)=>{
            reject("unable to update department");
        });
    });
}

exports.getDepartmentById = function(id){
    console.log(id);
    return new Promise(function(resolve,reject){
        Department.findAll({
            where: {
                departmentId: id
            }
        }).then((data)=>{
            resolve(data[0]);
        }).catch((err)=>{
            reject("no results returned");
        });
    });
}

exports.deleteEmployeeByNum = function(empNum){
    return new Promise(function(resolve,reject){
    console.log(empNum);
    Employee.destroy({
        where: {employeeNum:empNum}
    }).then(()=>{
        resolve();
    }).catch((err)=>{
        reject();
    });
    });
}