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
 