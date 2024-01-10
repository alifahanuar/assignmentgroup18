const express = require('express'); 
const { MongoClient, ObjectId } = require('mongodb'); 
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
const app = express(); 
const port = process.env.PORT || 1999; 
const jwt = require('jsonwebtoken'); 
const MongoURI = process.env.MONGODB_URI
const bodyParser = require('body-parser');
const cors = require('cors');
// const ejs = require('ejs');

app.use(express.json()); 

// Swagger options
const options = {
    definition: {
      openapi: '3.0.0', // Specify the OpenAPI version
      info: {
        title: 'Visitor Management API',
        version: '1.0.0',
        description: 'API for managing visitors in a security system',
      },
      servers: [
        {
          url: `https://isgroup18.azurewebsites.net/`,
        },
      ],
      components: {
        securitySchemes: {
          jwt:{
                      type: 'http',
                      scheme: 'bearer',
                      in: "header",
                      bearerFormat: 'JWT'
          },
        },
      },
          security:[{
              "jwt": []
    }]
    },
    apis: ['./index.js'], // Path to the API routes file(s)
  };
  
  const swaggerSpec = swaggerJSDoc(options);
  app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// MongoDB connection URL 
const uri = 'mongodb+srv://alfhanuar:AwiVGJjZJAW5vaFc@cluster0.y7nkbk7.mongodb.net/VisitorManagement'; 

// Create a new MongoClient 

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); 
// Connect to MongoDB 
client.connect() 
.then(() => { 
console.log('Connected to MongoDB'); 
}) 
.catch((error) => { 
console.error('Error connecting to MongoDB:', error); 
}); 

// Define collection names 
const db = client.db('VisitorManagement'); 
// const usersCollection = db.collection('users'); 
const visitorsCollection = db.collection('visitors'); 
const usersCollection = db.collection('users'); 
const securityCollection = db.collection('security'); 
const hostelCollection = db.collection('hostel'); 
const blockCollection = db.collection('block'); 
const vehicleCollection = db.collection('vehicle'); 
const adminsCollection = db.collection('admins'); 
const visitorPassCollection = db.collection('visitorpass');


function login(reqUsername, reqPassword) { 
    return usersCollection.findOne({ username: reqUsername, password: reqPassword }) 
      .then(matchUsers => { 
        if (!matchUsers) { 
          return { 
            success: false, 
            message: "User not found!" 
          }; 
        } else { 
          return { 
            success: true, 
            users: matchUsers
          }; 
        } 
      }) 
      .catch(error => { 
        console.error('Error in login:', error); 
        return { 
          success: false, 
          message: "An error occurred during login." 
        }; 
      }); 
  } 
    
  
  function register(reqUsername, reqPassword, reqName, reqEmail) { 
    return usersCollection.insertOne({ 
      username: reqUsername, 
      password: reqPassword, 
      name: reqName, 
      email: reqEmail 
    }) 
      .then(() => { 
        return "Registration User Successful!"; 
      }) 
      .catch(error => {      console.error('Error in register:', error); 
        return "An error occurred during registration."; 
      }); 
  } 

  function loginAdmins(reqUsername, reqPassword) { 
    return adminsCollection.findOne({ username: reqUsername, password: reqPassword }) 
      .then(matchAdmins => { 
        if (!matchAdmins) { 
          return { 
            success: false, 
            message: "Admin not found!" 
          }; 
        } else { 
          return { 
            success: true, 
            admins: matchAdmins
          }; 
        } 
      }) 
      .catch(error => { 
        console.error('Error in login:', error); 
        return { 
          success: false, 
          message: "An error occurred during login." 
        }; 
      }); 
  }  

function registerAdmins(reqUsername, reqPassword) { 
  return adminsCollection.insertOne({ 
    username: reqUsername, 
    password: reqPassword, 
  }) 
    .then(() => { 
      return "Registration Admin Successful!"; 
    }) 
    .catch(error => { console.error('Error in register:', error); 
      return "An error occurred during registration."; 
    }); 
} 

function generateToken(userData) { 
  const token = jwt.sign(userData, 'inipassword'); 
  return token; 
} 
function verifyToken(req, res, next) { 
  let header = req.headers.authorization; 
  console.log(header); 
 
  let token = header.split(' ')[1]; 
  jwt.verify(token, 'inipassword', function (err, decoded) { 
    if (err) { 
      res.send('Invalid Token'); 
    } 
 
    req.user = decoded; 
    next(); 
  }); 
} 
 
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with the provided credentials.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username for the new user.
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 description: The password for the new user.
 *                 example: password123
 *               name:
 *                 type: string
 *                 description: The name of the new user.
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the new user.
 *                 example: john.doe@example.com
 *     responses:
 *       '200':
 *         description: Registration successful.
 *         content:
 *           application/json:
 *             example:
 *               message: Registration User Successful!
 *       '500':
 *         description: An error occurred during registration.
 *         content:
 *           application/json:
 *             example:
 *               error: An error occurred during registration.
 */
 
// Register route 
app.post('/register', (req, res) => { 
  console.log(req.body); 
 
  let result = register(req.body.username, req.body.password, req.body.name, req.body.email); 
  result.then(response => { 
    res.send(response); 
  }).catch(error => { 
    console.error('Error in register route:', error); 
    res.status(500).send("An error occurred during registration."); 
  }); 
}); 

// Register route 
app.post('/registeradmin', (req, res) => { 
    console.log(req.body); 
   
    let result = registerAdmins(req.body.username, req.body.password); 
    result.then(response => { 
      res.send(response); 
    }).catch(error => { 
      console.error('Error in register route:', error); 
      res.status(500).send("An error occurred during registration."); 
    }); 
  }); 

/**
 * @swagger
 * /login:
 *   post:
 *     summary:  User Login
 *     description: User Authentication.
 *     tags:
 *       - Authentication
 *     parameters:
 *       - name: username
 *         in: query
 *         required: true
 *         type: string
 *       - name: password
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             example:
 *               token: "your_access_token"
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: "An error occurred during login"
 */

// Login route 
app.post('/login', (req, res) => { 
  console.log(req.body); 
 
  let result = login(req.body.username, req.body.password); 
  result.then(response => { 
    console.log(response); // Log the response received 
 
    if (response.success) { 
      let token = generateToken(response.users); 
      res.send(token);    } else { 
      res.status(401).send(response.message); 
    } 
  }).catch(error => { 
    res.status(500).json({ error: 'An error occurred during login', details: error.message });
  }); 
}); 

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Dummy user data (replace with a proper authentication system)
const users = [
  { username: 'user1', password: 'password1' },
  { username: 'user2', password: 'password2' },
];

// Routes
// app.get('/', (req, res) => {
//   res.render('login');
// });

/**
 * @swagger
 * /loginadmin:
 *   get:
 *     summary: Admin Login
 *     description: Authenticate and log in an administrator.
 *     tags:
 *       - Authentication
*     parameters:
 *       - name: username
 *         in: query
 *         required: true
 *         type: string
 *       - name: password
 *         in: query
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             example:
 *               token: "your_access_token"
 *       '401':
 *         description: Unauthorized
 *       '500':
 *         description: "An error occurred during login"
 */
app.get('/loginadmin', (req, res) => {
    const { username, password } = req.body;
    loginAdmins(username, password)
    .then(response => {
        if (response.success) {
            // If authentication is successful, you can generate a token or send a success message
            res.send('Admin logged in successfully');
        } else {
            // If authentication fails, send an appropriate response
            res.status(401).send(response.message);
        }
    })
    .catch(error => {
        console.error('Error during admin login:', error);
        res.status(500).send('Error during admin login');
    });
});


/**
 * @swagger
 * /visitorData:
 *   post:
 *     summary: Create a visitor
 *     description: Create a New Visitor
 *     tags:
 *       - Visitors Management
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication
 *         schema:
 *           type: string
 *       - name: visitorname
 *         in: formData
 *         required: true
 *         type: string
 *       - name: phoneNumber
 *         in: formData
 *         required: true
 *         type: string
 *       - name: age
 *         in: formData
 *         required: true
 *         type: string
 *       - name: gender
 *         in: formData
 *         required: true
 *         type: string
  *       - name: visitingPurpose
 *         in: formData
 *         required: true
 *         type: string
 *       - name: visitingPerson
 *         in: formData
 *         required: true
 *         type: string
 *       - name: visitedDate
 *         in: formData
 *         required: true
 *         type: string
 *       - name: timeIn
 *         in: formData
 *         required: true
 *         type: string
*       - name: timeOut
 *         in: formData
 *         required: true
 *         type: string
 *     responses:
 *       201:
 *         description: Visitor record created successfully.
 *       401:
 *         description: Invalid token
 *       500:
 *         description: An error occurred while creating the visitor record
 */ 

 //Create a visitor 
app.post('/visitorData', verifyToken, (req, res) => { 
  const { 
    visitorID, 
    visitorName, 
    age,
    gender,
    phoneNumber, 
    visitingPurpose, 
    visitingPerson, 
    visitedDate, 
    timeIn, 
    timeOut,   vehicleType 
  } = req.body; 
 
  const visitorData = { 
    visitorID, 
    visitorName, 
    age,
    gender,
    phoneNumber, 
    visitingPurpose, 
    visitingPerson, 
    visitedDate, 
    timeIn, 
    timeOut, 
    vehicleType 
  }; 
  visitorsCollection 
    .insertOne(visitorData) 
    .then(() => { 
      res.send(visitorData); 
    }) 
    .catch((error) => { 
      console.error('Error creating visitor:', error); 
      res.status(500).send('An error occurred while creating the visitor'); 
    }); 
}); 

/**
 * @swagger
 * /issuepass:
 *   post:
 *     summary: Issue a visitor pass
 *     description: To issue a visitor pass.
 *     tags:
 *       - Administrator Management
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       description: Visitor pass details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               _Id:
 *                 type: string
 *               issuedBy:
 *                 type: string
 *               validUntil:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Visitor pass issued successfully.
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: An error occurred while issuing the pass
 */
 
// Admin Issue Visitor Pass
app.post('/issuepass', verifyToken, async (req, res) => {
    const { _Id, issuedBy, validUntil } = req.body;
  
    try {
      const visitorPass = db.collection('visitorpass');
  
      const newPass = {
        _Id,
        issuedBy,
        validUntil,
        issuedAt: new Date(),
      };
  
      await visitorPass.insertOne(newPass);
      res.status(201).json( 'Visitor pass issued successfully' );
    } catch (error) {
      console.error('Issue Pass Error:', error.message);
      res.status(500).json('An error occurred while issuing the pass');
    }
  });
  

/**
 * @swagger
 * /retrievepass/{_id}:
 *   get:
 *     summary: Retrieve visitor pass by ID
 *     tags:
 *       - Visitors Management
 *     parameters:
 *       - in: path
 *         name: _id
 *         required: true
 *         description: ID of the visitor pass to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             example:
 *               _id: "12345"
 *               issuedBy: "Admin123"
 *               validUntil: "2024-12-31"
 *               issuedAt: "2024-01-06T12:00:00Z"
 *       404:
 *         description: No pass found for the given visitor
 *         content:
 *           application/json:
 *             example:
 *               error: "No pass found for this visitor"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             example:
 *               error: "An error occurred while retrieving the pass"
 *               details: "Internal server error details"
 */

app.get('/retrievepass/:_id', async (req, res) => {
  const _Id = req.params._id;

  try {
    const visitorPass = db.collection('visitorpass');
    const pass = await visitorPass.findOne({ _id });

    if (!pass) {
      return res.status(404).json({ error: 'No pass found for this visitor' });
    }

    res.json(pass);
  } catch (error) {
    console.error('Retrieve Pass Error:', error.message);
    res.status(500).json({ error: 'An error occurred while retrieving the pass', details: error.message });
  }
});

/**
 * @swagger
 * /visitor/{id}:
 *   put:
 *     summary: Update a visitor
 *     description: To update details of a visitor.
 *     tags:
 *       - Administrator Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - name: visitorname
 *         in: formData
 *         required: true
 *         type: string
 *       - name: phoneNumber
 *         in: formData
 *         required: true
 *         type: string
 *       - name: age
 *         in: formData
 *         required: true
 *         type: string
 *       - name: gender
 *         in: formData
 *         required: true
 *         type: string
 *       - name: visitingPurpose
 *         in: formData
 *         required: true
 *         type: string
 *       - name: visitingPerson
 *         in: formData
 *         required: true
 *         type: string
 *       - name: visitedDate
 *         in: formData
 *         required: true
 *         type: string
 *       - name: timeIn
 *         in: formData
 *         required: true
 *         type: string
 *       - name: timeOut
 *         in: formData
 *         required: true
 *         type: string 
 *     requestBody:
 *       description: Visitor data to update
 *       required: true
 *       content:
 *         application/json:
 *           example:
 *             name: "John Doe"
 *             phoneNumber: "1234567890"
 *             visitingPurpose: "Meeting"
 *             visitingPerson: "Jane Doe"
 *             visitedDate: "2023-01-01"
 *             timeIn: "12:00 PM"
 *             timeOut: "02:00 PM"
 *             vehicleType: "Car"
 *     responses:
 *       200:
 *         description: Visitor updated successfully
 *       404:
 *         description: Visitor not found
 *       500:
 *         description: An error occurred while updating the visitor
 */

// Update a visitor 
app.put('/visitor/:id', verifyToken, async (req, res) => { 
  const { id } = req.params; 
  const visitorData = req.body; 
 
  try { 
    const visitorObjectId = new ObjectId(id); 
    const updateResult = await visitorsCollection.updateOne({ _id: visitorObjectId }, { $set: 
visitorData }); 
    if (updateResult.modifiedCount === 1) { 
      res.send('Visitor updated successfully'); 
    } else { 
      res.status(404).send('Visitor not found'); 
    } 
  } catch (error) { 
    console.error('Error updating visitor:', error); 
    res.status(500).send('Error updating visitor'); 
  } 
}); 
 

/**
 * @swagger
 * /visitor/{id}:
 *   delete:
 *     summary: Delete a visitor
 *     description: Use this route to delete a visitor by its ID.
 *     tags:
 *       - Administrator Management
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Unique ID of the visitor to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Visitor deleted successfully
 *       404:
 *         description: Visitor not found
 *       500:
 *         description: An error occurred while deleting the visitor
 */

// Delete a visitor 
app.delete('/visitor/:id', verifyToken, async (req, res) => { 
  const { id } = req.params; 
 
  try { 
    const visitorObjectId = new ObjectId(id); 
    const deleteResult = await visitorsCollection.deleteOne({ _id: visitorObjectId }); 
 
    if (deleteResult.deletedCount === 1) { 
      res.send('Visitor deleted successfully'); 
    } else { 
      res.status(404).send('Visitor not found'); 
    } 
  } catch (error) { 
    console.error('Error deleting visitor:', error); 
    res.status(500).send('Error deleting visitor'); 
  } 
}); 
 
/**
 * @swagger
 * /allvisitors:
 *   get:
 *     summary: Get all visitors
 *     description: To retrieve a list of all visitors.
 *     tags:
 *       - Administrator Management
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         required: true
 *         description: Bearer token for authentication
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of all visitors
 *       401:
 *         description: Unauthorized - Invalid token
 *       500:
 *         description: An error occurred while retrieving the visitors
 */

// View all visitors 
app.get('/allvisitors', async (req, res) => { 
  try {    const visitors = await visitorsCollection.find().toArray(); 
    res.send(visitors); 
  } catch (error) { 
    console.error('Error viewing visitors:', error); 
    res.status(500).send('Error viewing visitors'); 
  } 
}); 
 
//Security register 
app.post('/security-register', (req, res) => { 
  const { securityID, name, workshift} = req.body; 
 
  if (!securityID ||!name || !workshift ) { 
    res.status(500).send('Missing required fields'); 
    return; 
  } 
 
  securityCollection 
    .insertOne({ securityID, name, workshift }) 
    .then(() => { 
      res.send('Security registered successfully'); 
    }) 
    .catch((error) => { 
      console.error('Error registering security:', error); 
      res.status(500).send('An error occurred while registering the security'); 
    }); 
}); 
 
// Security login 
app.post('/security-login', async (req, res) => { 
  const { securityID, name } = req.body; 
 
  try { const security = await securityCollection.findOne({ securityID, name }); 
 
    if (security) { 
      res.send('Security logged in successfully'); 
    } else { 
      res.status(401).send('Invalid username or password'); 
    } 
  } catch (error) { 
    console.error('Error logging in:', error); 
    res.status(500).send('Error logging in'); 
  } 
}); 
 
// Security logout 
app.post('/security/logout', (req, res) => { 
  res.send('Security logged out successfully'); 
}); 
 
// Visitor access information 
app.get('/visitorAccess', (req, res) => { 
  const phoneNumber = req.body.phoneNumber; 
 
  visitorsCollection 
    .find({ phoneNumber }) 
    .toArray() 
    .then((visitors) => { 
      if (visitors.length === 0) { 
        res.send('No visitors found with the given contact number'); 
      } else { 
        res.send(visitors); 
      } 
    }) 
    .catch((error) => { 
      console.error('Error retrieving visitors by contact:', error);      res.status(500).send('An error occurred while retrieving visitors by contact'); 
    }); 
}); 
 
// View a specific visitor 
app.get('/visitor',verifyToken, (req, res) => { 
  visitorsCollection 
    .find({}) 
    .toArray() 
    .then((visitors) => { 
      res.json(visitors); 
    }) 
    .catch((error) => { 
      console.error('Error retrieving visit details:', error); 
      res.status(500).send('An error occurred while retrieving visit details'); 
    }); 
}); 
 
// View all hostel 
app.get('/hostel', async (req, res) => { 
  try { 
    const hostel = await hostelCollection.find().toArray(); 
    res.send(hostel); 
  } catch (error) { 
    console.error('Error viewing hostel:', error); 
    res.status(500).send('Error viewing hostel'); 
  } 
}); 
 
// View all block 
app.get('/block', async (req, res) => { 
  try { 
    const block = await blockCollection.find().toArray(); 
    res.send(block);  } catch (error) { 
    console.error('Error viewing block:', error); 
    res.status(500).send('Error viewing block'); 
  } 
}); 
 
// View all vehicle 
app.get('/vehicle', async (req, res) => { 
  try { 
    const vehicle = await vehicleCollection.find().toArray(); 
    res.send(vehicle); 
  } catch (error) { 
    console.error('Error viewing vehicle:', error); 
    res.status(500).send('Error viewing vehicle'); 
  } 
}); 
 

app.use(express.json()) 
app.use(cors({origin: ['http://localhost:yourLocalPort', 'https://isgroup18.azurewebsites.net'],
credentials: true,})); 
 
// Start the server 
app.listen(port, () => { 
  console.log(`Server is running on port ${port}`); 
});
