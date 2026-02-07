const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');

require('dotenv').config({ path: "./config.env" });
const port = process.env.PORT || 5000;

// Function to kill process using port 5000
const killPort5000 = () => {
    return new Promise((resolve, reject) => {
        exec('netstat -ano | findstr :5000', (error, stdout, stderr) => {
            if (stdout) {
                const lines = stdout.split('\n');
                for (const line of lines) {
                    if (line.includes('LISTENING')) {
                        const parts = line.trim().split(/\s+/);
                        const pid = parts[parts.length - 1];
                        if (pid && pid !== '0') {
                            exec(`taskkill /F /PID ${pid}`, (killError) => {
                                if (killError) {
                                    console.log(`Could not kill process ${pid}:`, killError.message);
                                } else {
                                    console.log(`Killed process ${pid} using port 5000`);
                                }
                            });
                        }
                    }
                }
            }
            // Wait a moment for processes to be killed
            setTimeout(resolve, 1000);
        });
    });
};

// use middlewares
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', process.env.FRONTEND_URL],
    credentials: true
}));
app.use(express.json());

// MongoDB Connection
const con = require('./db/connection');
const model = require('./models/model');

// Using Routes
app.use(require('./routes/route'));

if (process.env.NODE_ENV == 'production') {
    // app.use(express.static(path.join(__dirname, '../client/build')));

    // app.get('/', function(req, res){
    //     res.sendFile('D: /Study/My Projects/MERN Expense Tracker/client/build/index.html');
    // });
    app.get('/', function (req, res) {
        res.send('API running');
    });
}
else {
    app.get('/', function (req, res) {
        res.send('API running');
    });
}

con.then(db => {
    if (!db) return process.exit(1);
    else {
        // Initialize categories if not exist
        const initializeCategories = async () => {
            const categories = [
                { type: "Investment", color: "#FCBE44" },
                { type: "Expense", color: "#FF0000" },
                { type: "Savings", color: "#00FF00" }
            ];
            for (const cat of categories) {
                const existing = await model.Categories.findOne({ type: cat.type });
                if (!existing) {
                    await new model.Categories(cat).save();
                    console.log(`Created category: ${cat.type}`);
                }
            }
        };
        initializeCategories();

        // Start server with port cleanup
        const startServer = async () => {
            console.log('Checking port 5000 availability...');
            await killPort5000();
            
            // listen to the http server
            app.listen(port, function (err) {
                if (err) { 
                    console.error('Failed to start server:', err);
                    if (err.code === 'EADDRINUSE') {
                        console.log('Port 5000 is still occupied. Please try again in a moment.');
                    }
                    process.exit(1);
                }
                else {
                    console.log(`Server is running on: http://localhost:${port}`);
                    console.log(`API endpoints available at: http://localhost:${port}/api`);
                }
            });
            app.on('error', err => {
                if (err.code === 'EADDRINUSE') {
                    console.log('Port 5000 is busy. Attempting to free the port...');
                    killPort5000().then(() => {
                        console.log('Port cleared. Please restart the server.');
                    });
                } else {
                    console.log("Failed to Connect with HTTP Server: " + err);
                }
            });
        };
        
        startServer();
    }
    // error in mongodb connection
}).catch(error => {
    console.log("Connection failed...!" + error);
})
