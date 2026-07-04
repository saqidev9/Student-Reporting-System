import React, { useState, useEffect } from "react";
import { useSettings } from "./useSettings";
import { useCurrentUser } from "../elements/Logout/usecurruntuser"; // reuse the hook built earlier for Logout
import ChangePassword from "./changePass";
import {
  formatFullDate,
  formatRelativeTime,
  formatTimeLabel,
} from "./dateUtils";
import { IoTimeOutline } from "react-icons/io5";
import { GoBell, GoTag, GoPeople } from "react-icons/go";

function ComingSoonCard({ icon: Icon, title, description }) {
  return (
    <div className="flex items-center justify-between border border-gray-200 rounded-xl p-4 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 flex-shrink-0">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">
        Coming soon
      </span>
    </div>
  );
}

function Settings() {
  const { settings, loading, error, updateDeadline } = useSettings();
  const { user } = useCurrentUser();

  const [deadlineInput, setDeadlineInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [passOpen, setPassOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // inside Settings.jsx
  const changingPassword = async ({ currentPassword, newPassword }) => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:3000/api/auth/change-password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    const result = await res.json();
    console.log(result);

    if (!res.ok || !result.success) {
      const message =
        result.errors?.[0]?.message ||
        result.message ||
        "Failed to change password.";
      throw new Error(message);
    }

    setPassOpen(false);
  };
  // Sync local input state whenever settings load/refresh
  useEffect(() => {
    if (settings?.submissionDeadline) {
      setDeadlineInput(settings.submissionDeadline);
    }
  }, [settings]);

  const isAdmin = user?.role === "admin";
  const hasChanges =
    deadlineInput && deadlineInput !== settings?.submissionDeadline;

  const handleSave = async () => {
    if (!deadlineInput) {
      setSaveError("Please select a deadline time.");
      return;
    }
    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess(false);
      await updateDeadline(deadlineInput);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      setSaveError(err.message || "Failed to save deadline.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          Failed to load settings: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure deadlines and policies for report submissions.
        </p>
      </div>

      {/* Top row: Current settings + Submission Deadline form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current settings (read-only) */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-base font-semibold text-gray-900">
              Current settings
            </h2>
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Active
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-5">
            Read-only summary of the active configuration.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">
                Daily submission deadline
              </span>
              <span className="text-sm font-medium text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md">
                {settings?.submissionDeadline || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-500">Last updated</span>
              <span className="text-sm text-gray-700">
                {formatFullDate(settings?.submissionDeadlineUpdatedAt)}
                {settings?.submissionDeadlineUpdatedAt && (
                  <span className="text-gray-400">
                    {" "}
                    · {formatRelativeTime(settings.submissionDeadlineUpdatedAt)}
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-500">Max late submission</span>
              <span className="text-sm text-gray-700">
                {settings?.maxLateSubmissionDays ?? "—"} day
                {settings?.maxLateSubmissionDays === 1 ? "" : "s"}
              </span>
            </div>
            <span
              onClick={() => setPassOpen(true)}
              className="
    text-sm 
    text-gray-700 
    cursor-pointer 
    font-medium
    transition-all 
    duration-200
    ease-in-out
    hover:text-blue-600
    hover:underline
    hover:underline-offset-4
    active:scale-95
    active:text-blue-700
  "
            >
              Change your password
            </span>
            {passOpen && (
              <ChangePassword
                isOpen={passOpen}
                onClose={() => setPassOpen(false)}
                onSubmit={changingPassword}
              />
            )}
          </div>
        </div>

        {/* Submission Deadline (editable form) */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <h2 className="text-base font-semibold text-gray-900">
            Submission Deadline
          </h2>
          <p className="text-xs text-gray-400 mt-1 mb-5">
            Set the daily cutoff time for report submissions. The updated
            deadline takes effect from the following day.
          </p>

          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Deadline (24-hour)
          </label>
          <div className="relative">
            <input
              type="time"
              value={deadlineInput}
              onChange={(e) => {
                setDeadlineInput(e.target.value);
                setSaveError("");
              }}
              disabled={!isAdmin}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <IoTimeOutline
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={18}
            />
          </div>

          <p className="text-xs text-gray-400 mt-2 mb-4">
            Students must submit before this time each day.
          </p>

          {!isAdmin && (
            <p className="text-xs text-amber-600 mb-3">
              Only admins can update the submission deadline.
            </p>
          )}
          {saveError && (
            <p className="text-xs text-red-500 mb-3">{saveError}</p>
          )}
          {saveSuccess && (
            <p className="text-xs text-green-600 mb-3">
              Deadline updated successfully.
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !isAdmin || !hasChanges}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Deadline"}
          </button>
        </div>
      </div>

      {/* More settings */}
      <div className="mt-6">
        <h2 className="text-base font-semibold text-gray-900">More settings</h2>
        <p className="text-xs text-gray-400 mb-4">
          Additional policies will live here as the system grows.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ComingSoonCard
            icon={GoBell}
            title="Notifications"
            description="Email reminders and digests"
          />
          <ComingSoonCard
            icon={GoTag}
            title="Tag taxonomy"
            description="Topic and skill tags"
          />
          <ComingSoonCard
            icon={GoPeople}
            title="Roles & access"
            description="Admin invitations and permissions"
          />
        </div>
      </div>
    </div>
  );
}

export default Settings;
