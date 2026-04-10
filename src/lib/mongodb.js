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
