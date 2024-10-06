import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3008;
const dp = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "World",
  password: "mo55407499",
  port: 5432
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

dp.connect()

let arr2 = [];
let visited_countries;

async function refreshTable(){
  await dp.query("SELECT * FROM visited_country",(err,res)=>{
    if (err){
      console.log("error excuting the query "+err.stack);
    }
    else{
      visited_countries = res.rows;
    }
  });
}
refreshTable()

let allCountries;
await dp.query("SELECT country_code, country_name FROM countries",(err,res)=>{
  if(err){
    console.log(err.stack);
  }
  else{
    allCountries = res.rows;
  }
})

let CurrId;
let users = [];

async function refreshUserTable()
{
  await dp.query("SELECT * FROM users",(err,res)=>{
    if(err) 
    {                                                                             //getting users data from the pgTable
      console.log("error excuing the query",err.stack)
    }
    else
    {
      users = res.rows;
      CurrId = users[0].id        //probelm 1 how could the CurrId reassigned when refreshing the table SOLVED AS THE USER WILL GET BACK TO '/' AFTER ADDING NEW USER
      console.log(CurrId);
    }
  });
}

refreshUserTable();



app.get("/", async (req, res) => {
  let CurrUserList = [];
  console.log(`cuurent id is ${CurrId}`);
  console.log(visited_countries);
  visited_countries.forEach(country => {
    console.log(`${country.user_id} is ${CurrId}`);
    if(country.user_id == CurrId){
      console.log("HELLO WORLD");
      CurrUserList.push(country.country_code);
    }
  });


  let CurrentUserColor = users.find((user)=> user.id == CurrId);
  console.log("This below is the country list full feild");

  console.log(CurrUserList);
  await
  res.render("index.ejs",{
    countries: CurrUserList,
    total: CurrUserList.length,
    users: users,
    color: CurrentUserColor.color
  });
});


async function AddCountry(cCode,UserId){
  await dp.query("INSERT INTO visited_country (country_code,user_id) VALUES ($1,$2)",[cCode,UserId]);

}

app.post("/add", async(req,res)=>{
  const inputtedCountry = req.body.country;

  const matchedCountry = allCountries.find((country) => country.country_name === inputtedCountry);
  const tem1 = req.body.user

  if (matchedCountry) {
    AddCountry(matchedCountry.country_code,CurrId);
    refreshTable();
    console.log(matchedCountry.country_code);
    res.redirect("/");
  }
  else{
    console.log("no such country found");
    res.render("index.ejs", {
      countries: visited_countries.country_code,
      total: visited_countries.length,
      error: "Country do not exist, try again.",
    });
  }

  
})



app.post("/user",(req,res)=>{
  if(req.body.add == "new"){
    res.render("new.ejs");
  }else
  {
    CurrId = req.body.user;
    console.log("Current from prfile userId "+ CurrId);
    res.redirect("/");
  }
})

app.post("/new",async (req,res)=>{
  let username = req.body.name;
  let usernameColor = req.body.color;
  console.log(`username: ${username} color: ${usernameColor}`);
  await dp.query("INSERT INTO users (username,color) VALUES ($1,$2)",[username,usernameColor]);
  refreshUserTable();
  res.redirect("/")
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
