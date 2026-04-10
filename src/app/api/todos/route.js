import { NextResponse } from 'next/server'; // Import Next.js helper for sending back responses
import dbConnect from '@/lib/mongodb'; // Import our custom database connection utility
import Todo from '@/models/Todo'; // Import our Todo data model

// Define the function for handling GET requests (this reads all to-dos from the database)
export async function GET() {
  // Start a try block to handle potential errors safely
  try {
    // Wait for the database connection (this ensures we are connected before querying)
    await dbConnect();
    // Fetch all to-dos using our Todo model, sorting them by newest first (createdAt: -1)
    const todos = await Todo.find({}).sort({ createdAt: -1 });
    // Return a successful JSON response (success: true) containing the list of to-dos
    return NextResponse.json({ success: true, data: todos });
  }
  // If something goes wrong, catch the error here
  catch (error) {
    // Return a failure JSON response (success: false) with the error message and status code 400
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
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

// Define the function for handling PUT (update) requests
export async function PUT(request) {
  // Start a try block for safety
  try {
    // Ensure we are connected to the database
    await dbConnect();
    // Get the data from the request body (including the id of the todo to update)
    const { id, ...updateData } = await request.json();
    // Find the specific todo by its ID and update it with the new data
    const updatedTodo = await Todo.findByIdAndUpdate(id, updateData, {
      new: true, // This option returns the updated document instead of the old one
      runValidators: true, // This ensures the new data still follows our Schema rules
    });
    // Return a success response with the newly updated todo
    return NextResponse.json({ success: true, data: updatedTodo });
  }
  // Handle any errors that occur during the update
  catch (error) {
    // Return a failure response with the error message
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// Define the function for handling DELETE requests
export async function DELETE(request) {
  // Start a try block
  try {
    // Connect to the database
    await dbConnect();
    // Get the ID of the todo we want to delete from the request body
    const { id } = await request.json();
    // Delete the document that matches this specific ID
    await Todo.findByIdAndDelete(id);
    // Return a success response confirming the deletion
    return NextResponse.json({ success: true, message: 'Todo deleted successfully' });
  }
  // Catch any errors
  catch (error) {
    // Return a failure response
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
