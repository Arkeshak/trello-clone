import { Draggable } from '@hello-pangea/dnd';

export default function TaskCard({ task, index, currentUser, onDelete, onAssign, allUsers }) {
  const isAdmin = currentUser.role === 'admin';
  const isUnassigned = !task.assignee;
  const isAssignedToMe = task.assignee && task.assignee._id === currentUser._id;

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="task-card-title">{task.title}</div>
          {task.description && (
            <div className="task-card-desc">{task.description}</div>
          )}
          <div className="task-card-footer">
            <div className="task-assignee">
              {task.assignee ? (
                <>
                  <span>👤</span>
                  <span className="name">{task.assignee.username}</span>
                </>
              ) : (
                <span>Unassigned</span>
              )}
            </div>
            <div className="task-actions">
              {/* Admin: assign to any user via dropdown */}
              {isAdmin && (
                <select
                  id={`assign-select-${task._id}`}
                  className="btn btn-sm btn-secondary"
                  value={task.assignee?._id || ''}
                  onChange={(e) => onAssign(task._id, e.target.value || null)}
                  style={{ padding: '4px 6px', fontSize: '12px' }}
                >
                  <option value="">Unassigned</option>
                  {allUsers.map((u) => (
                    <option key={u._id} value={u._id}>{u.username}</option>
                  ))}
                </select>
              )}
              {/* Normal user: assign unassigned task to self */}
              {!isAdmin && isUnassigned && (
                <button
                  id={`assign-self-${task._id}`}
                  className="btn btn-sm btn-secondary"
                  onClick={() => onAssign(task._id, currentUser._id)}
                >
                  Assign to me
                </button>
              )}
              {/* Admin: delete task */}
              {isAdmin && (
                <button
                  id={`delete-task-${task._id}`}
                  className="btn-danger"
                  onClick={() => onDelete(task._id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
