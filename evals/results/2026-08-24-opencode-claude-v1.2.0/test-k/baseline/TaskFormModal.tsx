import { useState } from "react";
import {
  Modal,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
  Stack,
  SegmentedControl,
} from "@mantine/core";
import type { Priority, Task, TaskStatus } from "../types";
import { PROJECT_OPTIONS, TEAM_OPTIONS } from "../data";

const statusOptions: { value: TaskStatus; label: string }[] = [
  { value: "backlog", label: "Backlog" },
  { value: "in-progress", label: "In progress" },
  { value: "in-review", label: "In review" },
  { value: "done", label: "Done" },
];

export interface TaskFormValues {
  title: string;
  description: string;
  project: string;
  assignee: string;
  priority: Priority;
  status: TaskStatus;
  dueDate: string;
}

const emptyValues: TaskFormValues = {
  title: "",
  description: "",
  project: "",
  assignee: "",
  priority: "medium",
  status: "backlog",
  dueDate: "",
};

function taskToValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description,
    project: task.project,
    assignee: task.assignee,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ?? "",
  };
}

interface TaskFormModalProps {
  opened: boolean;
  task: Task | null;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
}

type Errors = Partial<Record<"title" | "project" | "assignee", string>>;

// Rendered with a `key` tied to each open (see TaskBoard) so the component
// remounts fresh whenever it's opened, giving each session its own initial
// state without needing an effect to resynchronize on every prop change.
export function TaskFormModal({ opened, task, onClose, onSubmit }: TaskFormModalProps) {
  const [values, setValues] = useState<TaskFormValues>(() =>
    task ? taskToValues(task) : emptyValues,
  );
  const [errors, setErrors] = useState<Errors>({});

  function update<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: Errors = {};
    if (values.title.trim().length < 3) {
      next.title = "Title must be at least 3 characters.";
    }
    if (!values.project) {
      next.project = "Choose a project.";
    }
    if (!values.assignee) {
      next.assignee = "Choose an assignee.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...values, title: values.title.trim() });
  }

  return (
    <Modal opened={opened} onClose={onClose} title={task ? "Edit task" : "New task"} centered>
      <form onSubmit={handleSubmit} noValidate>
        <Stack gap="sm">
          <TextInput
            label="Title"
            placeholder="e.g. Draft renewal proposal"
            required
            value={values.title}
            onChange={(e) => update("title", e.currentTarget.value)}
            error={errors.title}
            data-autofocus
          />
          <Textarea
            label="Description"
            placeholder="Optional details"
            autosize
            minRows={2}
            maxRows={5}
            value={values.description}
            onChange={(e) => update("description", e.currentTarget.value)}
          />
          <Group grow>
            <Select
              label="Project"
              placeholder="Select project"
              required
              data={PROJECT_OPTIONS}
              value={values.project || null}
              onChange={(v) => update("project", v ?? "")}
              error={errors.project}
            />
            <Select
              label="Assignee"
              placeholder="Select assignee"
              required
              data={TEAM_OPTIONS}
              value={values.assignee || null}
              onChange={(v) => update("assignee", v ?? "")}
              error={errors.assignee}
            />
          </Group>
          <Group grow align="flex-start">
            <TextInput
              label="Due date"
              type="date"
              value={values.dueDate}
              onChange={(e) => update("dueDate", e.currentTarget.value)}
            />
            <Select
              label="Status"
              data={statusOptions.map((s) => ({ value: s.value, label: s.label }))}
              value={values.status}
              onChange={(v) => update("status", (v as TaskStatus) ?? values.status)}
              allowDeselect={false}
            />
          </Group>
          <Stack gap={4}>
            <SegmentedControl
              value={values.priority}
              onChange={(v) => update("priority", v as Priority)}
              data={[
                { label: "Low", value: "low" },
                { label: "Medium", value: "medium" },
                { label: "High", value: "high" },
              ]}
              fullWidth
            />
          </Stack>
          <Group justify="flex-end" mt="sm">
            <Button variant="default" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button type="submit">{task ? "Save changes" : "Create task"}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
