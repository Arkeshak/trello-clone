import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { DragDropContext } from '@hello-pangea/dnd';
import Navbar from '../components/Navbar';
import Column from '../components/Column';
import CreateTaskModal from '../components/CreateTaskModal';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const STATUSES = ['todo', 'doing', 'done'];

export default function BoardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch tasks and users once user is loaded
  useEffect(() => {
    if (user) {
      fetchTasks();
      if (user.role === 'admin') {
        fetchUsers();
      }
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setPageLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setAllUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Drag and drop: update task status when dropped into a different column
  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;

    // Optimistically update state
    setTasks((prev) =>
      prev.map((t) => (t._id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus });
    } catch (err) {
      console.error('Error updating task status:', err);
      // Revert on failure
      fetchTasks();
    }
  };

  const handleCreate = async (form) => {
    const { data } = await api.post('/tasks', form);
    setTasks((prev) => [...prev, data]);
  };

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleAssign = async (taskId, assigneeId) => {
    try {
      const { data } = await api.put(`/tasks/${taskId}`, { assignee: assigneeId });
      setTasks((prev) => prev.map((t) => (t._id === taskId ? data : t)));
    } catch (err) {
      console.error('Error assigning task:', err);
    }
  };

  if (authLoading || !user) return null;

  if (pageLoading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading tasks...</div>
      </>
    );
  }

  const getTasksForStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <>
      <Head>
        <title>Board — TaskBoard</title>
        <meta name="description" content="Your Kanban task board. Drag and drop tasks between columns." />
      </Head>

      <Navbar />

      <div className="board-page">
        <div className="board-header">
          <h2>Task Board</h2>
          <button id="open-create-modal" className="btn btn-primary" style={{ width: 'auto' }} onClick={() => setShowModal(true)}>
            + New Task
          </button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="board-columns">
            {STATUSES.map((status) => (
              <Column
                key={status}
                status={status}
                tasks={getTasksForStatus(status)}
                currentUser={user}
                onDelete={handleDelete}
                onAssign={handleAssign}
                allUsers={allUsers}
              />
            ))}
          </div>
        </DragDropContext>
      </div>

      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  );
}
