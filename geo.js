const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const PORT = 3100;
const http = require('http');
const nodemailer = require('nodemailer');
const MONGO_URL = 'mongodb://localhost:27017';
const client = new MongoClient(MONGO_URL);
let db;
let kludasparbaude = 0;

// nodemailer
setInterval(checkGeoServer, 5000);

let geoNavPieejams = false;
const GEO_URL = 'http://localhost:8080/geoserver';
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'msgrupa123@gmail.com',
    pass: 'mbyw uzqj jtcy ofbn'
  }
});

function sendEmail(subject, text) {
  const timestamp = new Date().toLocaleString('lv-LV');
  const mailOptions = {
    from: 'msgrupa123@gmail.com',
    to: 'mdgeoserver@gmail.com',
    subject: subject,
    text: `${text}\nLaiks: ${timestamp}`
  };
 
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('E-pasta kļūda:', error);
    } else {
      console.log('E-pasts nosūtīts:', info.response);
    }
  });
}
 

function checkGeoServer() {
  const req = http.get(GEO_URL, (res) => {
    if (!geoNavPieejams) {
      return;
    }

    sendEmail('GeoServeris darbojas!', 'GeoServeris ir pieejams un darbojas.');
    geoNavPieejams = false;
  });

  req.on('error', (err) => {
    if (geoNavPieejams) {
      return;
    }

    sendEmail('GeoServeris nav pieejams!', 'GeoServeris nav pieejams vai Docker ir izslēgts.');
    geoNavPieejams = true;
  });

  req.end();
}

app.use(express.static(__dirname));

//  /getmap funkcija 
app.get('/getmap', async (req, res) => {
  const name = req.query.name;
  if (!name) {
    return res.status(400).send('Nav kartes nosaukuma.');
  }

  try {
    const map = await db.collection('maps').findOne({ name: name });
    if (map) {
      res.json({ link: map.link });
      kludasparbaude = 200;
    } else {
      res.status(404).json({ error: 'Karte nav atrasta.' });
      kludasparbaude = 404;
    }
  } catch (err) {
    console.error('Kļūda pieprasījumā:', err);
    res.status(500).send('Servera kļūda!');
    kludasparbaude = 500;
  }
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`# HELP kludasparbaude Statusa kods no getmap pieprasījuma\n# TYPE kludasparbaude gauge\nkludasparbaude ${kludasparbaude}`);
});

// mongoDB
async function run() {
  try {
    await client.connect();
    db = client.db('Mapes');
    const collection = db.collection('maps');

    const count = await collection.countDocuments();
    if (count === 0) {
      await collection.insertMany([
        {
          name: "world_map",
          link: "http://localhost:8080/geoserver/ne/wms?service=WMS&version=1.1.0&request=GetMap&layers=ne%3Aworld&bbox=-180.0%2C-90.0%2C180.0%2C90.0&width=768&height=384&srs=EPSG%3A4326&styles=&format=application/openlayers"
        },
        {
          name: "world_rectangle",
          link: "http://localhost:8080/geoserver/tiger/wms?service=WMS&version=1.1.0&request=GetMap&layers=tiger%3Agiant_polygon&bbox=-180.0%2C-90.0%2C180.0%2C90.0&width=768&height=384&srs=EPSG%3A4326&styles=&format=application/openlayers"
        },
        {
          name: "manhattan_poi",
          link: "http://localhost:8080/geoserver/tiger/wms?service=WMS&version=1.1.0&request=GetMap&layers=tiger%3Apoi&bbox=-74.0118315772888%2C40.70754683896324%2C-74.00153046439813%2C40.719885123828675&width=641&height=768&srs=EPSG%3A4326&styles=&format=application/openlayers"
        },
        {
          name: "manhattan_landmarks",
          link: "http://localhost:8080/geoserver/tiger/wms?service=WMS&version=1.1.0&request=GetMap&layers=tiger%3Apoly_landmarks&bbox=-74.047185%2C40.679648%2C-73.90782%2C40.882078&width=528&height=768&srs=EPSG%3A4326&styles=&format=application/openlayers"
        },
        {
          name: "manhattan_roads",
          link: "http://localhost:8080/geoserver/tiger/wms?service=WMS&version=1.1.0&request=GetMap&layers=tiger%3Atiger_roads&bbox=-74.02722%2C40.684221%2C-73.907005%2C40.878178&width=476&height=768&srs=EPSG%3A4326&styles=&format=application/openlayers"
        },
        {
          name: "sample_arcgrid",
          link: "http://localhost:8080/geoserver/nurc/wms?service=WMS&version=1.1.0&request=GetMap&layers=nurc%3AArc_Sample&bbox=-180.0%2C-90.0%2C180.0%2C90.0&width=768&height=384&srs=EPSG%3A4326&styles=&format=application/openlayers"
        },
        {
          name: "na_sample_imagery",
          link: "http://localhost:8080/geoserver/nurc/wms?service=WMS&version=1.1.0&request=GetMap&layers=nurc%3AImg_Sample&bbox=-130.85168%2C20.7052%2C-62.0054%2C54.1141&width=768&height=372&srs=EPSG%3A4326&styles=&format=application/openlayers"
        },
        {
          name: "pk50095",
          link: "http://localhost:8080/geoserver/nurc/wms?service=WMS&version=1.1.0&request=GetMap&layers=nurc%3APk50095&bbox=347649.93086859107%2C5176214.082539256%2C370725.976428591%2C5196961.352859256&width=768&height=690&srs=EPSG%3A32633&styles=&format=application/openlayers"
        },
        {
          name: "mosaic",
          link: "http://localhost:8080/geoserver/nurc/wms?service=WMS&version=1.1.0&request=GetMap&layers=nurc%3Amosaic&bbox=6.346%2C36.492%2C20.83%2C46.591&width=768&height=535&srs=EPSG%3A4326&styles=&format=application/openlayers"
        },
        {
          name: "usa_population",
          link: "http://localhost:8080/geoserver/topp/wms?service=WMS&version=1.1.0&request=GetMap&layers=topp%3Astates&bbox=-124.73142200000001%2C24.955967%2C-66.969849%2C49.371735&width=768&height=330&srs=EPSG%3A4326&styles=&format=application/openlayers"
        },
      ]);
    }

    app.listen(PORT, () => console.log(`Serveris darbojas uz http://localhost:${PORT}`));
  } catch (err) {
    console.error('MongoDB notika kļūda:', err);
  }
}

run();