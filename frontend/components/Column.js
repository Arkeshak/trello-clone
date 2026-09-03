import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

const LABELS = {
  todo: 'To Do',
  doing: 'Doing',
  done: 'Done'
};

export default function Column({ status, tasks, currentUser, onDelete, onAssign, allUsers }) {
  return (
    <div className="column">
      <div className="column-header">
        <div className="column-title">
          <span className={`column-dot dot-${status}`}></span>
          {LABELS[status]}
        </div>
        <span className="column-count">{tasks.length}</span>
      </div>
      <Droppable droppableId={status}>
        {(provided) => (
          <div
            className="column-drop-area"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.length === 0 && (
              <div className="empty-col">No tasks here yet</div>
            )}
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                currentUser={currentUser}
                onDelete={onDelete}
                onAssign={onAssign}
                allUsers={allUsers}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
