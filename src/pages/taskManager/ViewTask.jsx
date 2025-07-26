import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import ReusableInput from "../../common/ReusableInput";
import ReusableSelect from "../../common/ReusableSelect";
import { apiHelpers } from "../../services/axiosInstance";
import { toast } from "react-toastify";

export default function ViewTask({ taskId, show, onClose, onTaskUpdated }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [task, setTask] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTask, setEditTask] = useState({
    name: "",
    description: "",
    status: "",
  });

  useEffect(() => {
    if (show && taskId) {
      setLoading(true);
      setError(null);
      apiHelpers
        .get(`/tasks/${taskId}`)
        .then((res) => {
          setTask(res.data.data);
          setEditTask(res.data.data);
        })
        .catch(() => {
          setError("Failed to fetch task.");
        })
        .finally(() => setLoading(false));
    }
  }, [show, taskId]);

  const handleSaveEdit = () => {
    setLoading(true);
    apiHelpers
      .put(`/tasks/${editTask.id}`, editTask)
      .then(() => {
        setIsEditMode(false);
        setTask(editTask);
        toast.success("Task updated successfully!");
        if (onTaskUpdated) onTaskUpdated();
        if (onClose) onClose();
      })
      .catch(() => {
        toast.error("Failed to update task.");
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? "Edit Task" : "View Task"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading tasks...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : task && !isEditMode ? (
          <div>
            <p>
              <strong>Name:</strong> {task.name}
            </p>
            <p>
              <strong>Description:</strong> {task.description}
            </p>

            <p>
              <strong>Status:</strong> {task.status}
            </p>
          </div>
        ) : task && isEditMode ? (
          <div className="flex flex-col gap-3">
            <ReusableInput
              type="text"
              placeholder="Task Name"
              value={editTask.name}
              onChange={(e) =>
                setEditTask({ ...editTask, name: e.target.value })
              }
            />
            <ReusableInput
              type="text"
              placeholder="Description"
              value={editTask.description}
              onChange={(e) =>
                setEditTask({ ...editTask, description: e.target.value })
              }
            />
            <ReusableSelect
              options={[
                { label: "Pending", value: "pending" },
                { label: "In Progress", value: "in_progress" },
                { label: "Completed", value: "completed" },
              ]}
              value={editTask.status}
              onChange={(e) =>
                setEditTask({ ...editTask, status: e.target.value })
              }
            />
          </div>
        ) : null}
      </Modal.Body>
      <Modal.Footer>
        {task && (
          <>
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded mr-2"
              onClick={() => setIsEditMode((prev) => !prev)}
              disabled={loading}
            >
              {isEditMode ? "Cancel Edit" : "Edit Task"}
            </button>
            {isEditMode && (
              <button
                type="button"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-4 py-2 rounded-full shadow-md text-sm sm:text-base px-3 py-1 rounded"
                onClick={handleSaveEdit}
                disabled={loading}
              >
                Update
              </button>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}
