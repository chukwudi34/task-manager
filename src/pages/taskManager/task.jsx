import React, { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { FiFilter } from "react-icons/fi";
import { PaystackButton } from "react-paystack";
import ReusableInput from "../../common/ReusableInput";
import ReusableSelect from "../../common/ReusableSelect";
import { apiHelpers } from "../../services/axiosInstance";
import Swal from "sweetalert2";
import { Modal } from "react-bootstrap";
import AddTask from "./addTask";
import { toast } from "react-toastify";
import ViewTask from "./ViewTask";
import moment from "moment";

export default function Task() {
  const [filter, setFilter] = useState({ name: "", status: "", date: "" });
  const [isProUser, setIsProUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({ full_name: "", email: "" });
  const [tasks, setTasks] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [userId, setUserId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const handleDeleteTask = (taskId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this task?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        setLoading(true);
        apiHelpers
          .delete(`/tasks/${taskId}`)
          .then(() => {
            setTasks(tasks.filter((task) => task.id !== taskId));

            Swal.fire("Deleted!", "Task has been deleted.", "success");
          })
          .catch((err) => {
            console.error(err);
            Swal.fire("Error!", "Failed to delete task.", "error");
          })
          .finally(() => setLoading(false));
      }
    });
  };

  const handleAddTask = () => {
    if (!isProUser && tasks.length >= 5) {
      setShowModal(true);
      return;
    }
    setShowAddTaskModal(true);
  };

  // Fetch user ID once from localStorage
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("taskUser"));
    if (savedUser?.data?.id) {
      setUserId(savedUser.data.id);
    }
  }, [refreshKey]);

  // Fetch tasks when filters/userId/refreshKey change
  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    apiHelpers
      .get("/tasks", {
        search: filter.name,
        status: filter.status,
        date: filter.date
          ? moment(filter.date).format("YYYY-MM-DD")
          : undefined,
        user_id: userId,
      })
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [filter, userId, refreshKey]);

  // Check if Pro Plan is active
  useEffect(() => {
    const proTransaction = localStorage.getItem("pro_transaction");
    if (proTransaction) {
      const transactionData = JSON.parse(proTransaction);
      if (transactionData.status === "approved") {
        setIsProUser(true);
      }
    }
  }, []);

  const handleViewTask = (taskId) => {
    setSelectedTaskId(taskId);
    setShowViewModal(true);
  };

  // Payment logic
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;
  const amount = import.meta.env.VITE_TASK_AMOUNT;

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: paymentInfo.email,
    amount: amount,
    publicKey: publicKey,
    metadata: {
      custom_fields: [
        {
          display_name: "Upgrade to Pro",
          variable_name: "upgrade_to_pro",
          value: "Pro Plan",
        },
        {
          display_name: "Full Name",
          variable_name: "full_name",
          value: paymentInfo.full_name,
        },
      ],
    },
  };

  const initiatePayment = (reference) => {
    setLoading(true);
    apiHelpers
      .post("/payment/initialize", {
        email: paymentInfo.email,
        full_name: paymentInfo.full_name,
        amount,
        plan: "Pro",
        user_id: userId,
      })
      .then((response) => {
        verifyPayment(reference, response.data.data.id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const verifyPayment = (reference, tran_id) => {
    apiHelpers
      .post("/payment/verify", { reference, tran_id })
      .then((response) => {
        localStorage.setItem(
          "pro_transaction",
          JSON.stringify({ ...response.data.data })
        );
        toast.success(response.data.message);
        setIsProUser(true);
        setShowModal(false);
      })
      .catch((error) => {
        toast.error(error?.response?.data?.message || "Payment failed");
      });
  };

  const onSuccess = (reference) => initiatePayment(reference);
  const onClose = (reference) => {
    console.log("Payment window closed.");
    setShowModal(false);
    // initiatePayment(reference);
  };

  const filteredTasks = tasks.filter((task) => {
    return (
      (!filter.name ||
        task.name?.toLowerCase().includes(filter.name.toLowerCase()) ||
        task.description?.toLowerCase().includes(filter.name.toLowerCase())) &&
      (!filter.status || task.status === filter.status) &&
      (!filter.date ||
        moment(task.date).format("YYYY-MM-DD") ===
          moment(filter.date).format("YYYY-MM-DD"))
    );
  });

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-700 w-full absolute inset-0 flex flex-col items-center">
        {/* Task Card */}
        <div className="flex items-center justify-center flex-grow p-4 sm:p-6 w-full">
          <div className="bg-white rounded-3xl shadow-lg w-full max-w-xl p-4 sm:p-6 max-h-[80vh] sm:h-[80vh] overflow-auto  flex flex-col">
            {/* Logo */}

            <div className="py-8">
              <img
                src="/images/path_to_global.png"
                alt="Logo"
                className="w-30 h-16  object-cover mx-auto"
              />
            </div>
            {!isProUser && tasks.length >= 5 && (
              <div className="mb-4 alert alert-info">
                <p className="text-red-600 text-xs font-medium text-center">
                  You have reached your free limit of 5 tasks. Upgrade to Pro
                  for unlimited tasks.
                </p>
              </div>
            )}
            {/* Add Task or Upgrade */}
            <div className="flex flex-wrap gap-2 justify-center sm:justify-between">
              <button
                onClick={handleAddTask}
                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-4 py-2 rounded-full shadow-md text-sm sm:text-base w-full sm:w-auto"
              >
                + Add Task
              </button>
              {!isProUser && tasks.length >= 5 ? (
                <>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-full text-sm sm:text-base w-full sm:w-auto "
                  >
                    Upgrade to Pro
                  </button>
                </>
              ) : isProUser ? (
                <span className="flex justify-center items-center bg-green-200 text-green-700 text-xs sm:text-sm font-medium px-2 py-1 rounded-full w-full sm:w-auto text-center">
                  Pro Plan (Unlimited Tasks)
                </span>
              ) : (
                <span className="inline-block bg-gray-200 text-gray-600 text-xs sm:text-sm font-medium px-3 py-1 rounded-full w-full sm:w-auto text-center sm:text-left">
                  Free Plan, 5 Tasks Limit
                </span>
              )}
            </div>
            {/* Filter Inputs */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center gap-2 text-purple-700 font-medium mb-2">
                <button
                  type="button"
                  className="sm:hidden focus:outline-none cursor:pointer"
                  onClick={() => setShowFilters((prev) => !prev)}
                >
                  Show Filter
                  {/* <FiFilter className="w-5 h-5" /> */}
                </button>
                <span className="text-sm sm:text-base hidden sm:inline">
                  Filter
                </span>
              </div>
              {/* Filters: show on sm+ or if showFilters is true on mobile */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 ${
                  showFilters ? "" : "hidden"
                } sm:grid`}
              >
                <ReusableInput
                  type="text"
                  placeholder="Search by task name, description"
                  className="w-full text-sm sm:text-base"
                  onChange={(e) =>
                    setFilter({ ...filter, name: e.target.value })
                  }
                />
                <ReusableSelect
                  className="w-full text-sm sm:text-base"
                  options={[
                    { label: "All Status", value: "" },
                    { label: "Completed", value: "completed" },
                    { label: "Pending", value: "pending" },
                  ]}
                  onChange={(e) =>
                    setFilter({ ...filter, status: e.target.value })
                  }
                />
                <ReusableInput
                  type="date"
                  className="w-full text-sm sm:text-base"
                  onChange={(e) =>
                    setFilter({ ...filter, date: e.target.value })
                  }
                />
              </div>
            </div>
            {/* Task List */}
            <h3 className="text-base sm:text-lg font-bold text-gray-700 mb-4">
              All Tasks
            </h3>
            <div className="overflow-y-auto flex-grow pr-1 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600 mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">Loading tasks...</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="alert alert-info text-center">
                  <span className="text-gray-500 text-sm">No Record Found</span>
                </div>
              ) : (
                filteredTasks.map((task, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-100 rounded-xl p-3 sm:p-4 mb-3 shadow-sm"
                  >
                    <div className="bg-purple-600 text-white p-2 sm:p-3 rounded-xl mr-3 sm:mr-4">
                      <FaCalendarAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                        {task.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">
                        {task.created_at
                          ? moment(task.created_at).format("YYYY-MM-DD")
                          : ""}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          task.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : task.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : task.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {task.status === "in_progress"
                          ? "In Progress"
                          : task.status.charAt(0).toUpperCase() +
                            task.status.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-blue-600 px-2 py-1 rounded bg-blue-100 text-xs"
                        onClick={() => handleViewTask(task.id)}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        className="text-red-600 px-2 py-1 rounded bg-red-100 text-xs"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl w-full max-w-sm relative">
            <h3 className="text-lg font-bold mb-4">Upgrade to Pro</h3>
            <div className="mb-2">
              <ReusableInput
                type="text"
                placeholder="Full Name"
                value={paymentInfo.full_name}
                onChange={(e) =>
                  setPaymentInfo({ ...paymentInfo, full_name: e.target.value })
                }
                className="mb-3 w-full text-sm sm:text-base mt-4"
              />
            </div>
            <div className="mb-2">
              <ReusableInput
                type="email"
                placeholder="Email Address"
                value={paymentInfo.email}
                onChange={(e) =>
                  setPaymentInfo({ ...paymentInfo, email: e.target.value })
                }
                className="mb-3 w-full text-sm sm:text-base"
              />
            </div>
            <PaystackButton
              className="bg-purple-600 text-white px-4 py-2 rounded-full w-full text-center text-sm sm:text-base mt-2"
              {...{
                ...paystackConfig,
                email: paymentInfo.email,
                metadata: {
                  custom_fields: [
                    {
                      display_name: "Full Name",
                      variable_name: "full_name",
                      value: paymentInfo.name,
                    },
                    {
                      display_name: "Upgrade to Pro",
                      variable_name: "upgrade_to_pro",
                      value: "Pro Plan",
                    },
                  ],
                },
                onSuccess,
                onClose,
                initiatePayment,
              }}
              text="Proceed to Payment"
              disabled={!paymentInfo.email || !paymentInfo.full_name}
            />
            <span
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 sm:right-3 text-gray-400 hover:text-gray-600 text-lg sm:text-xl cursor-pointer"
            >
              ×
            </span>
          </div>
        </div>
      )}
      <Modal show={showAddTaskModal} onHide={() => setShowAddTaskModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Task</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AddTask
            onClose={() => setShowAddTaskModal(false)}
            onTaskAdded={() => setRefreshKey((k) => k + 1)}
          />
        </Modal.Body>
      </Modal>
      {/* View/Edit Task Modal */}
      <ViewTask
        taskId={selectedTaskId}
        show={showViewModal}
        onClose={() => setShowViewModal(false)}
        onTaskUpdated={() => setRefreshKey((k) => k + 1)}
      />
    </>
  );
}
