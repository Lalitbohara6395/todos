/**
 * MONGODB CRUD TUTORIAL (Day 1 - Total Beginners)
 * 
 * This file teaches you how to:
 * 1. Connect to MongoDB using Mongoose.
 * 2. STRUCTURE your data with "Schemas" and "Models".
 * 3. Use ENVIRONMENT VARIABLES (.env) for security.
 * 4. Perform Create, Read, Update, and Delete (CRUD).
 * 
 * TO RUN THIS STANDALONE:
 * 1. npm install dotenv (We already did this for you!)
 * 2. Create a .env.local file in the project root.
 * 3. Add your URI: MONGODB_URI=your_mongodb_connection_string
 * 4. Run: node src/mongodb-basic.js
 */

// 1. IMPORT LIBRARIES
const mongoose = require('mongoose');
const path = require('path');

// NEW: Import 'dotenv' to load secrets from '.env.local'
// This keeps your database password safe and off GitHub!
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// 2. USE ENVIRONMENT VARIABLES
// Instead of hardcoding, we use 'process.env'
const MONGODB_URI = process.env.MONGODB_URI;

// Check if the URI is actually there
if (!MONGODB_URI) {
    console.error("ERROR: MONGODB_URI is missing from .env.local!");
    process.exit(1); // Stop the script
}

// 3. DEFINE THE STRUCTURE (SCHEMA)
// MongoDB is flexible, but "Schemas" help us keep our data organized.
// Let's imagine we are building a simple "To-Do" app.
const todoSchema = new mongoose.Schema({
    task: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
    // NOTE: MongoDB automatically adds an "_id" field for you! 
    // You don't need to define it here. It's a unique ID for every document.
});

// 4. CREATE THE MODEL
// A Model is like a "Class" that allows us to interact with a specific Collection in MongoDB.
// We explicitly set the collection name to 'vhc26_todos' to avoid mixing data with other apps.
const Todo = mongoose.model('Todo', todoSchema, 'vhc26_todos');

// 5. THE MAIN FUNCTION
// We use 'async' because talking to a database takes time, and we need to 'await' it.
async function runTutorial() {
    try {
        console.log("--- STARTING TUTORIAL ---");

        // --- STEP A: CONNECT TO DATABASE ---
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully!\n");

        // --- STEP B: CREATE (The 'C' in CRUD) ---
        console.log("1. CREATING a new Todo...");
        const newTodo = new Todo({
            task: "Learn MongoDB Day 1",
            isCompleted: false
        });

        // When we save, MongoDB returns the FULL document, which NOW includes its unique ID!
        const savedTodo = await newTodo.save();
        console.log("Created Todo with ID:", savedTodo._id); // <--- HERE is how we get the ID!
        console.log("--------------------------\n");

        // --- STEP C: READ (The 'R' in CRUD) ---
        console.log("2. READING (Finding) Todos...");
        // Every todo returned here will have its own unique ._id
        const allTodos = await Todo.find();
        console.log("Current Todos in DB (check their IDs):", allTodos);

        // Find a specific one by task name
        const singleTodo = await Todo.findOne({ task: "Learn MongoDB Day 1" });
        console.log("Found specific Todo:", singleTodo.task);
        console.log("--------------------------\n");

        // --- STEP D: UPDATE (The 'U' in CRUD) ---
        console.log("3. UPDATING a Todo...");
        // Let's mark the todo we just found as completed
        const updatedTodo = await Todo.findOneAndUpdate(
            { task: "Learn MongoDB Day 1" }, // Which one to find
            { isCompleted: true },           // What to change
            { new: true }                    // Returns the updated version
        );
        console.log("Updated Todo status:", updatedTodo.isCompleted);
        console.log("--------------------------\n");

        // // --- STEP E: DELETE (The 'D' in CRUD) ---
        // console.log("4. DELETING a Todo...");
        // // Delete by its ID
        // const deletedResult = await Todo.findByIdAndDelete(savedTodo._id);
        // console.log("Deleted Todo with ID:", deletedResult._id);
        // console.log("--------------------------\n");

        // --- NEW STEP F: SLIGHTLY ADVANCED METHODS (Bonus!) ---
        console.log("5. BONUS: Advanced Mongoose Methods...");

        // Let's create two temporary todos for demonstration
        await Todo.create([
            { task: "Finish Lesson 1", isCompleted: true },
            { task: "Start Lesson 2", isCompleted: false },
        ]);

        // A. FILTERING: Find only completed todos
        const completedOnly = await Todo.find({ isCompleted: true });
        console.log("Filtered (Completed Only):", completedOnly.length, "todos found.");

        // B. SORTING: Sort by task name (1 for A-Z, -1 for Z-A)
        const sortedTodos = await Todo.find().sort({ task: 1 });
        console.log("Sorted alphabetically:", sortedTodos.map(t => t.task));

        // C. LIMITING & SELECTING: Get only 1 todo, and only its task name (hide ID/meta)
        const limitedTodo = await Todo.findOne()
            .select('task -_id') // Get 'task', hide '_id'
            .limit(1);
        console.log("Limited & Selected (Clean Output):", limitedTodo);

        // D. COUNTING: How many documents are in this collection?
        const totalCount = await Todo.countDocuments();
        console.log("Total todos remaining:", totalCount);
        console.log("--------------------------\n");

        // // Clean up bonus todos before finishing
        // await Todo.deleteMany({ task: { $regex: "Lesson" } });

        console.log("--- TUTORIAL FINISHED SUCCESSFULLY ---");

        console.log("\nPRO TIP: Never share your .env.local file!");
        console.log("Make sure '.env*' is in your .gitignore file to keep it private.");

    } catch (error) {
        // Always handle errors so your app doesn't crash!
        console.error("ERROR DURING TUTORIAL:", error.message);
    } finally {
        // Close the connection when done to clean up
        await mongoose.connection.close();
        console.log("Database connection closed.");
    }
}

runTutorial();

/**
 * --- Assignment ---
 * 
 * 
 * 1. ADD A FIELD: Update the 'todoSchema' to include a 'priority' field 
 *    (e.g., type: String, enum: ['high', 'medium', 'low']).
 * 
 * 2. FILTER CHALLENGE: Create a new function that finds all 'high' priority 
 *    tasks that are NOT yet completed.
 * 
 * 3. MULTI-DELETE: Use Todo.deleteMany() to remove all completed tasks 
 *    from the database in one go.
 * 
 * 4. LOGICAL OPERATORS: Try using an '$or' query to find tasks that are 
 *    EITHER 'high' priority OR have 'Finish' in their name.
 * 
 * 5. Create a .env file and add your MongoDB URI to it.
 * 
 */
