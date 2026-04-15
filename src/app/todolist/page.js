'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TodoListPage() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const json = await res.json();
      if (json.success) setTodos(json.data);
    } catch (error) {
      console.error('Failed to fetch:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ ADD TODO with default status
  const addTodo = async (e) => {
    e.preventDefault();
    if (!input) return;

    try {
      const res = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: input, status: 'pending' }),
      });

      const json = await res.json();
      if (json.success) {
        setTodos([json.data, ...todos]);
        setInput('');
      }
    } catch (error) {
      console.error('Failed to add:', error);
    }
  };

  // ✅ DELETE (same)
  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTodos(todos.filter((t) => t._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  // ✅ NEW: update status
  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();

      if (json.success) {
        setTodos(todos.map((t) => (t._id === id ? json.data : t)));
      }
    } catch (error) {
      console.error('Status update failed:', error);
    }
  };

 return (
  <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center py-12 px-4">
    
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
      
      {/* Heading */}
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        ✨ Todo List
      </h1>

      {/* Input */}
      <form onSubmit={addTodo} className="flex gap-2 mb-6">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="Enter task..."
        />
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition">
          Add
        </button>
      </form>

      {/* List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : (
        <div className="space-y-4">
          {todos.map((todo) => (
            <div
              key={todo._id}
              className="flex items-center justify-between bg-gray-50 p-4 rounded-xl shadow-sm hover:shadow-md transition"
            >
              
              {/* Task */}
              <span
                className={`font-medium ${
                  todo.status === 'completed'
                    ? 'line-through text-green-500'
                    : todo.status === 'rejected'
                    ? 'text-red-500'
                    : 'text-gray-700'
                }`}
              >
                {todo.task}
              </span>

              {/* Controls */}
              <div className="flex items-center gap-2">
                
                {/* Dropdown */}
              {todo.status === 'completed' ? (
  <span className="text-green-600 font-semibold">
    ✅ Completed
  </span>
) : (
  <select
    value={todo.status || 'pending'}
    onChange={(e) =>
      updateStatus(todo._id, e.target.value)
    }
    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-1 focus:ring-blue-400"
  >
    <option value="pending">⏳ Pending</option>
    <option value="completed">✅ Completed</option>
    <option value="rejected">❌ Rejected</option>
  </select>
)}
                {/* Delete */}
             {todo.status !== 'completed' && (
  <button
    onClick={() => deleteTodo(todo._id)}
    className="text-red-500 hover:text-red-600 font-semibold text-sm"
  >
    Delete
  </button>
)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    <Link
      href="/"
      className="mt-6 text-gray-600 hover:text-blue-600 transition"
    >
      ← Go Home
    </Link>
  </div>
);
}

console.log('todo');
console.log('todo');


