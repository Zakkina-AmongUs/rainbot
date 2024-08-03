const data = require("./test.json")
const fs = require("fs")

data.Data["test"] = [];
data.Data["test"]["two"] = 1;
console.log(data)
fs.writeFileSync("./test.json", JSON.stringify(data, null, 2), "utf-8")
