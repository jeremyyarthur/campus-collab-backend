const { Pool } = require("pg")

const pool = new Pool({
    connectionString: "postgresql://jeremyyarthur:f0ucfaL0nXvy7XkNMg1xs2RZkB5xg0Pe@dpg-d4k169shg0os73advls0-a.oregon-postgres.render.com/campus_collab",
    ssl: {
        require: true,
        rejectUnauthorized: false,   
    }
})

pool.on("connect", () => {
    console.log("Connected to Postgres Database")
})
module.exports = pool;