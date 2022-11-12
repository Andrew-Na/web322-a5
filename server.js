/*********************************************************************************
* WEB322 – Assignment 5
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: Andrew Sequeira Student ID: 055099063 Date: November 12, 2022
*
* Online (Cyclic) Link: ________________________________________________________
*
********************************************************************************/ 
var express = require("express");
var multer = require("multer");
var app = express();
var path = require("path");
var data_service = require("./data-service.js");
const fs = require('node:fs');
var exphbs = require("express-handlebars");

var HTTP_PORT = process.env.PORT || 8080;
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));


app.engine(".hbs", exphbs.engine({
    extname:".hbs" ,
    defaultLayout: "main",
    helpers: {
        navLink: function(url, options){
        return '<li' + 
        ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
        '><a href=" ' + url + ' ">' + options.fn(this) + '</a></li>';
       },
       equal: function (lvalue, rvalue, options) {
        if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
        if (lvalue != rvalue) {
        return options.inverse(this);
        } else {
        return options.fn(this);
        } 
       }  }
}));

app.set("view engine", ".hbs");

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}

const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function(req,file,cb){
        cb(null,Date.now() + path.extname(file.originalname));
    }
});

//tell multer to utilize disk storage function when naming files rather than default
const upload = multer({storage:storage});

data_service.initialize().then(function(){
    app.listen(HTTP_PORT,onHttpStart);
}).catch((err)=>{
    console.log(err);
});
//app.use(express.static('public'));

app.use(function(req,res,next){
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
   });

app.get("/",(req,res)=>{
    //res.sendFile(path.join(__dirname,"/views/home.html"));
    //sending the proper css wanted to default template
    res.render("home",{style:'site.css'});
});

app.get("/about",(req,res)=>{
    //res.sendFile(path.join(__dirname,"/views/about.html"));
    res.render("about",{style:'site.css'});
});

app.get("/employees",(req,res)=>{
    //console.log(req.query.status);

    if (req.query.status)
    {
        //console.log(req.query.status);
        data_service.getEmployeesByStatus(req.query.status).then((data)=>{
            if (data.length > 0) res.render("employees",{employees: data,style:'site.css'});
            else res.render("employees",{message:"no results"});
        }).catch((err)=>{
            res.render("employees",{message:"no results"});
        });
    }
    else if (req.query.department)
    {
        data_service.getEmployeesByDepartment(req.query.department).then((data)=>{
            if (data.length > 0) res.render("employees", {employees: data, style:'site.css'})
            else res.render("employees",{message:"no results"});
        }).catch((err)=>{
            res.render("employees",{message:"no results",style:'site.css'});
        });
    }
    else if (req.query.manager)
    {
        data_service.getEmployeesByManager(req.query.manager).then((data)=>{
            if (data.length > 0) res.render("employees",{employees: data, style:'site.css'});
            else res.render("employees",{message:"no results"});
        }).catch((err)=>{
            res.render("employees",{message:"no results",style:'site.css'});
        });
    }
    else
    {
        data_service.getAllEmployees().then((data)=>{
            if (data.length > 0) res.render("employees",{employees: data,style:'site.css'});
            else res.render("employees",{message:"no results" ,style:'site.css'});
        }).catch((err)=>{
            res.render({message:"no results",style:'site.css'})
        });
    }

});


app.get("/departments",(req,res)=>{
    data_service.getDepartments().then((data)=>{
        if (data.length > 0) res.render("departments",{departments: data, style:'site.css'})
        else res.render("departments",{message:"no results", style:'site.css'});
    }).catch((err)=>{
        res.render({message:"no results",style:'site.css'})
    });
});

app.get("/departments/add",(req,res)=>{
    res.render("addDepartment",{style:'add.css'});
});

app.post("/departments/add",(req,res)=>{
    const formData = req.body;
    data_service.addDepartment(formData).then(()=>{
        res.redirect("/departments");
    }).catch((err)=>{
        res.status(500).render("error",{errorCode: "500", message:"Unable to Add Department"});
    });
})

app.get("/employees/add",(req,res)=>{
    data_service.getDepartments().then((data)=>{
        res.render("addEmployee",{departments: data, style:'add.css'});
    }).catch((err)=>{
        res.render("addEmployee", {departments: []})
    });
   
});

app.get("/images/add",(req,res)=>{
    //res.sendFile(path.join(__dirname,"/views/addImage.html"));
    res.render("addImage",{style:'add.css'});
});

app.post("/images/add",upload.single("imageFile"),(req,res)=>{
    res.redirect("/images");
});

app.get("/images",(req,res)=>{
    fs.readdir("./public/images/uploaded",function(err,items){
        var imageList = {};
        imageList.images = items;
        console.log(imageList);
        // res.json(imageList);
        res.render("images",imageList)
    });
});

app.post("/employees/add",(req,res)=>{
    const formData = req.body;
    data_service.addEmployee(formData).then(()=>{
        res.redirect("/employees");
    }).catch((err)=>{
        res.status(500).render("error",{errorCode: "500", message:"Unable to Add Employee"});
    });
       
    
});

app.get("/employee/:empNum", (req, res) => {
    // initialize an empty object to store the values
    let viewData = {};
    data_service.getEmployeeByNum(req.params.empNum).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error 
    }).then(data_service.getDepartments)
    .then((data) => {
        viewData.departments = data; // store department data in the "viewData" object as "departments"
    // loop through viewData.departments and once we have found the departmentId that matches
    // the employee's "department" value, add a "selected" property to the matching 
    // viewData.departments object
    for (let i = 0; i < viewData.departments.length; i++) {
        if (viewData.departments[i].departmentId == viewData.employee.department) {
            viewData.departments[i].selected = true;
        }
    }
    }).catch(() => {
        viewData.departments = []; // set departments to empty if there was an error
    }).then(() => {
        if (viewData.employee == null) { // if no employee - return an error
            res.status(404).render("error",{errorCode: "404", message:"Employee Not Found"});
        } else {
            res.render("employee", { viewData: viewData }); // render the "employee" view
        }
        });
   });
   

app.get("/department/*",(req,res)=>{
    data_service.getDepartmentById(req.params[0]).then((data)=>{
       // console.log(data);
        if (data) //if not undefined
            res.render("department",{department: data});
        else
            res.status(404).render("error",{errorCode: "404", message:"Department Not Found"});
    }).catch((err)=>{
        console.log("catch");
        res.status(404).render("error",{errorCode: "404", message:"Department Not Found"});;
    });
});

app.post("/employee/update", (req, res) => { 
    console.log(req.body);
    data_service.updateEmployee(req.body).then(()=>{
        res.redirect("/employees");
    }).catch((err)=>{
        res.status(500).render("error",{errorCode: "500", message:"Unable to Update Employee"});
    });

});

app.post("/department/update",(req,res)=>{
    console.log(req.body);
    data_service.updateDepartment(req.body).then(()=>{
        res.redirect("/departments");
    }).catch((err)=>{
        res.status(500).render("error",{errorCode: "500", message:"Unable to Update Department"});
    });
       
});

app.get("/employees/delete/*",(req,res)=>{
    data_service.deleteEmployeeByNum(req.params[0]).then(()=>{
        res.redirect("/employees");
    }).catch((err)=>{
        res.status(500).render("error",{errorCode: "500", message:"Unable to Remove Employee / Employee not found"});
    });
});

//get any other route that is not found
app.get("*",(req,res)=>{
    res.status(404).render("error",{errorCode: "404", message:"Page Not Found"});
});


