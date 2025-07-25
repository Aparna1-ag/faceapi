const express = require("express")
const dotenv  = require("dotenv")
const mysql = require("mysql2/promise")
const cors = require("cors")

dotenv.config()




const app = express()

app.use(cors({
    origin: "*", 
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: "Content-Type"
}))

app.use(express.json())



app.use(express.urlencoded({extended: true}))



const PORT = process.env.PORT

const pool = mysql.createPool({
        host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
    
            database: process.env.DB_DATABASE,
    
        
    
    
    
    
    })

    pool.getConnection((err, conn) => {
        if (err) {console.log(err) 
            return}

    })

    // pool.query("CREATE TABLE facedata (id INT(11) AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255), descriptorArr LONGTEXT)", (err, result) => {
    //     if (err) throw err
    //     console.log(result)
    // })

    // pool.query("INSERT INTO facedata VALUES (1, 'Amy', '[1, 2, 4, 5]')", (err, res) => {
    //     if (err) throw err
    //     console.log(res.insertId)
    // })

// pool.query("TRUNCATE TABLE facedata", (err, res) => {
//         if (err) throw err
//         // console.log(res.insertId)
//     })



app.post('/sendfacedata', async(req, res) => {

//    if (!req.body || !req.body.empName || !req.body.descriptorArray) {
//     res.status(400).json({
//         error: "must contain username and descriptor array"
//     })

if (!req.body || !req.body.descriptorArray) {
    res.status(400).json({
        error: "must contain username and descriptor array"
    })



   }

//    const {empName, descriptorArray} = req.body

const {descriptorArray} = req.body
// JSON.stringify(descriptorArray)
console.log(descriptorArray)


    try {
       const [rows] =  await pool.query("INSERT INTO facedata (descriptorArr) VALUES (?)", [descriptorArray])
        console.log(rows)
        res.json({
            success: true,
            insertId: rows.insertId
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({error: "error processing request"})
    }
    
})



app.get("/hello", (req, res) => {
    res.send("Hellooooo")

})

 let myFace = [-0.15438969433307648,0.12781894207000732,0.020888933911919594,-0.09723711013793945,-0.10600880533456802,-0.08944127708673477,-0.014097509905695915,-0.16867978870868683,0.23204241693019867,-0.11260706186294556,0.18693770468235016,0.01380869373679161,-0.14202623069286346,-0.09136468172073364,-0.007924601435661316,0.11585073173046112,-0.18198861181735992,-0.1756545603275299,-0.05803634598851204,-0.08994773030281067,0.01446473877876997,-0.012472148053348064,0.06020454689860344,0.07391106337308884,-0.18080401420593262,-0.3612016439437866,-0.10819283872842789,-0.1476885974407196,0.03673192113637924,-0.058903343975543976,0.050477273762226105,0.06469165533781052,-0.23255427181720734,-0.05311558395624161,0.03938810154795647,0.10608629882335663,0.010200259275734425,-0.0508289597928524,0.14022263884544373,-0.0410991795361042,-0.2010953724384308,-0.10138042271137238,0.08017261326313019,0.22313207387924194,0.1515984833240509,-0.02700314298272133,0.07131989300251007,-0.11160281300544739,0.06948006898164749,-0.1597336381673813,0.021148743107914925,0.0946357473731041,0.0444500558078289,0.009953231550753117,0.07218409329652786,-0.18939997255802155,0.021830039098858833,0.09342479705810547,-0.172592893242836,-0.012569032609462738,0.025646120309829712,-0.0412118136882782,-0.16195131838321686,-0.03952284902334213,0.3119572699069977,0.14910417795181274,-0.13288332521915436,-0.13490749895572662,0.2604016065597534,-0.13763219118118286,-0.014779367484152317,0.05861758440732956,-0.10494296997785568,-0.1434914618730545,-0.2662315368652344,-0.044460225850343704,0.446491539478302,0.08666356652975082,-0.16299284994602203,0.07620121538639069,-0.21379424631595612,0.020031116902828217,-0.0631781741976738,0.07908528298139572,-0.14104430377483368,0.1195618286728859,-0.06978859752416611,0.05142469331622124,0.18714281916618347,0.025912215933203697,0.00013323519669938833,0.18915748596191406,-0.010643106885254383,0.006951079238206148,0.04267813637852669,-0.015998033806681633,-0.13949905335903168,-0.06966182589530945,-0.16170857846736908,-0.11199796199798584,0.050637032836675644,-0.07751204073429108,-0.03441435098648071,0.17050577700138092,-0.29738402366638184,0.15390180051326752,0.05086968466639519,-0.06594524532556534,0.003980816341936588,0.035365696996450424,-0.03378605097532272,-0.07649897783994675,0.1534312218427658,-0.25271308422088623,0.17362265288829803,0.17480218410491943,0.05469249561429024,0.22104187309741974,0.06025589630007744,0.0445103719830513,-0.024478210136294365,-0.05051770433783531,-0.15432745218276978,-0.01892849989235401,0.026293231174349785,-0.10602911561727524,0.024027541279792786,0.02075563371181488]



//  for (let x = 0; x < myFace1.length; x++) {
//     console.log(x, myFace1[x])

//  }



app.post("/compare", (req, res) => {
    let {userFace} = req.body
    // const [rows] = pool.query("SELECT * FROM facedata")

//      for (let x = 0; x < userFace.length; x++) {
//     console.log(x, userFace[x])

//  }



    const faceMatcher = (desArr) => {
         desArr =   JSON.parse(JSON.stringify(desArr))

         userFace = JSON.parse(userFace)





        let differenceOfSquares = []


        for (let a = 0 ; a < userFace.length; a++) {
            differenceOfSquares.push((Math.pow(Number(desArr[a]), 2)) - (Math.pow(Number(userFace[a]), 2)))
            console.log(a, userFace[a])
            console.log(a, desArr[a])

            

          
        }

        console.log(differenceOfSquares)

        let sumOfDifferences = 0

        for (let each of differenceOfSquares) {
            sumOfDifferences += each
        }

        console.log(sumOfDifferences)

        const euclideanDistance = Math.sqrt(sumOfDifferences)

        console.log(euclideanDistance)




    }

   




    faceMatcher(myFace)


    res.json({
        success: true
    })

})









app.listen(PORT, () => {
    console.log("App listening to port " + PORT)
})