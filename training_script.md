# Next.js + MongoDB: Intern Training Script (App Router Edition)

Welcome everyone! Today we're going to build a functional **To-Do List** using Next.js (App Router) and MongoDB. This guide is designed to be read aloud step-by-step, with code snippets that are commented on **every single line** for absolute clarity.

---

## 1. App Router vs. Page Router
**What to say:**
"Today we are using the **App Router**. 
- **What is it?** It's the modern standard for Next.js. Instead of just files, we use folders.
- **Example:** A folder called `app/about` with a [page.js](file:///c:/Users/vrish/Downloads/VHC/Training/my-app/src/app/page.js) inside becomes your `yoursite.com/about` page.
- **Why learn it?** It's faster, more powerful, and supports modern React features like Server Components."

---

## 2. Structure of an App Router Project
**What to say:**
"Let's look at our folders:
- `src/app`: Where our pages and API routes live.
- `src/app/api`: Where our backend logic lives.
- `src/lib`: Shared utilities (database connection).
- `src/models`: Data structures (Schemas)."

---

## 3. MongoDB & .env Basics
**What to say:**
"We use MongoDB to store our todos. To keep our credentials safe, we use a `.env.local` file. This stays on your computer and is never shared on GitHub."

**Action: Create `.env.local`**
"Paste this into `.env.local` in your root folder:"
```env
MONGODB_URI=your_mongodb_connection_string_here
```

---

## 4. Good Practices & Async
**What to say:**
"We use `async` and `await` because database operations take time. We don't want the browser to hang. 
Also, we always use `try...catch` blocks to handle errors gracefully if the database is down."

---

## 5. Step-by-Step Implementation

### Step 1: Install Mongoose
"Run this to install the MongoDB library:"
```bash
npm install mongoose
```

### Step 2: Database Utility
"Create `src/lib/mongodb.js`. Every line is commented to show how we manage connections:"
```javascript
import mongoose from 'mongoose'; // Import the mongoose library to interact with MongoDB

const MONGODB_URI = process.env.MONGODB_URI; // Pull the secret connection string from the .env.local file

if (!MONGODB_URI) { // Check if the connection string is missing from the environment
  throw new Error('Please define the MONGODB_URI environment variable'); // Stop the app and show a helpful error if missing
}

let cached = global.mongoose; // Look for an existing database connection in the global scope to reuse it

if (!cached) { // If no connection exists in the global scope yet...
  cached = global.mongoose = { conn: null, promise: null }; // ...initialize a fresh cache object to store the connection
}

async function dbConnect() { // Define the main asynchronous function to connect to the database
  if (cached.conn) { // If we already have a successful connection stored...
    return cached.conn; // ...return the existing connection immediately to save time
  }

  if (!cached.promise) { // If we are not already in the middle of connecting...
    const opts = { // Define options for the connection
      bufferCommands: false, // Tell mongoose not to queue commands while waiting for the connection
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => { // Start the connection and save the promise
      return mongoose; // Return the mongoose instance once the connection is successful
    });
  }

  try { // Try to resolve the connection promise
    cached.conn = await cached.promise; // Wait for the connection to finish and save the result to the cache
  } catch (e) { // If something goes wrong during the connection attempt...
    cached.promise = null; // ...clear the promise so we can attempt a fresh connection next time
    throw e; // ...re-throw the error so the calling function knows it failed
  }

  return cached.conn; // Return the active and working database connection
}

export default dbConnect; // Export the function so it can be imported by our API routes
```

### Step 3: The Todo Model
"Create `src/models/Todo.js`. This tells MongoDB what a 'Todo' object looks like:"
```javascript
import mongoose from 'mongoose'; // Import the mongoose library

const TodoSchema = new mongoose.Schema({ // Create a new blueprint (Schema) for our Todo data
  task: { // Define a property called "task"
    type: String, // Specify that the task name must be a text string
    required: [true, 'Please provide a task name.'], // Make this field mandatory with a custom error message
  },
  completed: { // Define a property called "completed"
    type: Boolean, // Specify that this is a True/False value
    default: false, // Set the default value to False (not done)
  },
}, { // Second argument for schema options
  timestamps: true, // Automatically manage 'createdAt' and 'updatedAt' fields for us
});

export default mongoose.models.Todo || mongoose.model('Todo', TodoSchema, 'todos_vhc26'); // Export the model, creating it only if it doesn't already exist
```

> [!TIP]
> **Why suffix the collection?**
> If you are using a shared MongoDB URI (where multiple apps use the same database), suffixing your collection (e.g., `_vhc26`) ensures your app's data doesn't mix with others.

### Step 4: API Routes (Backend)
"Create `src/app/api/todos/route.js`. This handles GET (fetch) and POST (create):"
```javascript
import { NextResponse } from 'next/server'; // Import Next.js helper for sending back responses
import dbConnect from '@/lib/mongodb'; // Import our custom database connection utility
import Todo from '@/models/Todo'; // Import our Todo data model

export async function GET() { // Define the function for handling GET requests
  try { // Start a try block to handle potential errors
    await dbConnect(); // Ensure we are connected to the database before querying
    const todos = await Todo.find({}).sort({ createdAt: -1 }); // Fetch all todos and sort them by newest first
    return NextResponse.json({ success: true, data: todos }); // Return a successful JSON response with the todos
  } catch (error) { // If something goes wrong...
    return NextResponse.json({ success: false, error: error.message }, { status: 400 }); // Return a failure response with the error details
  }
}

export async function POST(request) { // Define the function for handling POST (create) requests
  try { // Start a try block
    await dbConnect(); // Connect to the database
    const body = await request.json(); // Wait for the request body data and parse it into an object
    const todo = await Todo.create(body); // Create a new entry in the database using the body data
    return NextResponse.json({ success: true, data: todo }, { status: 201 }); // Return success with the new todo item
  } catch (error) { // If creation fails...
    return NextResponse.json({ success: false, error: error.message }, { status: 400 }); // Return failure status code 400
  }
}
```

### Step 5: Handling Specific IDs
"Create `src/app/api/todos/[id]/route.js`. This handles DELETE and TOGGLE:"
```javascript
import { NextResponse } from 'next/server'; // Import the response helper
import dbConnect from '@/lib/mongodb'; // Import the database utility
import Todo from '@/models/Todo'; // Import the Todo model

export async function DELETE(request, { params }) { // Handler for deleting a specific todo by ID
  try { // Try block
    await dbConnect(); // Connect to DB
    const { id } = await params; // Extract the specific ID from the URL parameters
    await Todo.findByIdAndDelete(id); // Search for the ID in the database and delete it
    return NextResponse.json({ success: true, message: 'Deleted' }); // Return success message
  } catch (error) { // On error
    return NextResponse.json({ success: false, error: error.message }, { status: 400 }); // Return error
  }
}

export async function PATCH(request, { params }) { // Handler for updating (partially modifying) an item
  try { // Try block
    await dbConnect(); // Connect to DB
    const { id } = await params; // Get ID from URL
    const body = await request.json(); // Get the update data (like 'completed: true') from the request
    const todo = await Todo.findByIdAndUpdate(id, body, { new: true }); // Update the document and return the NEW version of it
    return NextResponse.json({ success: true, data: todo }); // Return the updated todo
  } catch (error) { // On error
    return NextResponse.json({ success: false, error: error.message }, { status: 400 }); // Return error
  }
}
```

### Step 6: The Frontend (Homepage)
"Replace everything in `src/app/page.js` with this code:"
```javascript
'use client'; // Tell Next.js this is a Client Component so we can use state and interactivity

import { useState, useEffect } from 'react'; // Import state and effect hooks from React
import Link from 'next/link'; // Import Link for internal routing

export default function TodoPage() { // Our main functional component for the page
  const [todos, setTodos] = useState([]); // Create state to store our list of todos
  const [input, setInput] = useState(''); // Create state to manage the text in our input field
  const [loading, setLoading] = useState(true); // Create a loading state to show while fetching data

  useEffect(() => { // Hook that runs once when the component finishes mounting
    fetchTodos(); // Call our custom fetch function
  }, []); // Empty dependency array ensures this only runs once

  const fetchTodos = async () => { // Function to grab all todos from our API
    const res = await fetch('/api/todos'); // Send a GET request to our API endpoint
    const json = await res.json(); // Convert the raw response into a JSON object
    if (json.success) setTodos(json.data); // If it was successful, save the data to our state
    setLoading(false); // Turn off the loading indicator
  };

  const addTodo = async (e) => { // Function to handle form submission for new todos
    e.preventDefault(); // Prevent the default browser behavior of refreshing the page
    if (!input) return; // Exit early if the input is empty text

    const res = await fetch('/api/todos', { // Send a POST request to add the new task
      method: 'POST', // HTTP method POST for creation
      headers: { 'Content-Type': 'application/json' }, // Tell the server we are sending JSON data
      body: JSON.stringify({ task: input }), // Convert our input state into a JSON string
    });

    const json = await res.json(); // Wait for the response JSON
    if (json.success) { // If adding was successful...
      setTodos([json.data, ...todos]); // ...add the new todo to the beginning of our current list
      setInput(''); // ...clear the input field for the next task
    }
  };

  const deleteTodo = async (id) => { // Function to remove a task
    const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' }); // Call our dynamic API route with the ID
    const json = await res.json(); // Parse the response
    if (json.success) { // If deletion worked...
      setTodos(todos.filter((t) => t._id !== id)); // ...remove that item from our local UI state
    }
  };

  const toggleTodo = async (id, completed) => { // Function to check/uncheck a task
    const res = await fetch(`/api/todos/${id}`, { // PATCH request to the specific ID
      method: 'PATCH', // Update method
      headers: { 'Content-Type': 'application/json' }, // Specify JSON format
      body: JSON.stringify({ completed: !completed }), // Send the opposite of its current status
    });
    const json = await res.json(); // Parse result
    if (json.success) { // If toggle worked...
      setTodos(todos.map((t) => (t._id === id ? json.data : t))); // ...update only that one item in our list
    }
  };

  return ( // The user interface structure
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center"> {/* Container div */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6"> {/* Main card container */}
        <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">App Router Todo List</h1> {/* Page Header */}
        
        <form onSubmit={addTodo} className="flex gap-2 mb-6"> {/* Form setup */}
          <input
            type="text"
            className="flex-1 border rounded-lg p-2 focus:outline-blue-500"
            placeholder="Type a task here..."
            value={input} // Bind the value to our state
            onChange={(e) => setInput(e.target.value)} // Update state on every keystroke
          />
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">Add</button> {/* Add button */}
        </form>

        {loading ? <p className="text-center font-medium">Loading...</p> : ( // Show loading message or the list
          <ul className="space-y-3"> {/* Unordered list for todos */}
            {todos.map((todo) => ( // Loop through each todo item
              <li key={todo._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition"> {/* List item */}
                <div className="flex items-center gap-3"> {/* Left side: Checkbox and Task */}
                  <input
                    type="checkbox"
                    checked={todo.completed} // Checkbox reflects state
                    onChange={() => toggleTodo(todo._id, todo.completed)} // Clicking checkbox triggers toggle
                    className="w-5 h-5 cursor-pointer accent-blue-600"
                  />
                  <span className={`${todo.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{todo.task}</span> {/* Task name */}
                </div>
                <button onClick={() => deleteTodo(todo._id)} className="text-red-500 hover:font-bold">Delete</button> {/* Delete button */}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Link href="/about" className="mt-6 text-blue-500 underline">Learn about this training</Link> {/* Navigation Link */}
    </div>
  );
}
```

### Step 7: Adding a New Page (Routing)
"Create `src/app/about/page.js`. This shows how folders create routes:"
```javascript
import Link from 'next/link'; // Import Link to go back home

export default function AboutPage() { // Functional component for the About page
  return ( // The HTML we want to show
    <div className="min-h-screen bg-white p-20 flex flex-col items-center text-center"> {/* Styled container */}
      <h1 className="text-4xl font-extrabold mb-4">About This Project</h1> {/* Main header */}
      <p className="text-xl text-slate-600 max-w-lg mb-8"> {/* Project description */}
        This app was built to teach interns the fundamentals of Next.js App Router, 
        MongoDB database connection, and API route management.
      </p>
      <Link href="/" className="bg-slate-800 text-white px-6 py-3 rounded-full hover:bg-slate-700 transition"> {/* Home button */}
        Back to Todo List
      </Link>
    </div>
  );
}
```
---

**Summary:**
"You've built a full-stack app using the App Router! You've learned about folders as routes, connecting to a real database, and creating a working CRUD interface."
