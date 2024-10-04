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

async function refreshTable(){
  await dp.query("SELECT country_code FROM visited_country",(err,res)=>{
    if (err){
      console.log("error excuting the query "+err.stack);
    }
    else{
      const arr = res.rows
      arr2 = [];
      arr.forEach(
        (code)=>{
          arr2.push(code.country_code)
        }
      );
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


app.get("/", async (req, res) => {
  await
  res.render("index.ejs",{
    countries: arr2,
    total: arr2.length
  });
});

let newCountriesCode = [];

async function AddCountry(cCode){
  await dp.query("INSERT INTO visited_country (country_code) VALUES ($1)",[cCode]);

}

app.post("/add", async(req,res)=>{
  const inputtedCountry = req.body.country;

  const matchedCountry = allCountries.find((country) => country.country_name === inputtedCountry);
  

  if (matchedCountry) {
    AddCountry(matchedCountry.country_code);
    refreshTable();
    console.log(matchedCountry.country_code);
    res.redirect("/");
  }
  else{
    console.log("no such country found");
    res.render("index.ejs", {
      countries: arr2,
      total: arr2.length,
      error: "Country do not exist, try again."
    });
  }

  
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
