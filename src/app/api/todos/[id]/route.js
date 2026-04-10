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
