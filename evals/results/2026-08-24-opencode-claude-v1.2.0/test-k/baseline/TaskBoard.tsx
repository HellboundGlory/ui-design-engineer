import { useMemo, useState } from "react";
import {
  Stack,
  Title,
  Group,
  Button,
  TextInput,
  Select,
  SimpleGrid,
  Paper,
  Text,
  Grid,
  Badge,
  Box,
} from "@mantine/core";
import { IconPlus, IconSearch, IconX } from "@tabler/icons-react";
import { TaskCard } from "../components/TaskCard";
import { TaskFormModal, type TaskFormValues } from "../components/TaskFormModal";
import { DeleteTaskModal } from "../components/DeleteTaskModal";
import { PROJECT_OPTIONS, TEAM_OPTIONS } from "../data";
import type { Task, TaskStatus } from "../types";

const columns: { status: TaskStatus; label: string }[] = [
  { status: "backlog", label: "Backlog" },
  { status: "in-progress", label: "In progress" },
  { status: "in-review", label: "In review" },
  { status: "done", label: "Done" },
];

const initialTasks: Task[] = [
  {
    id: "t1",
    title: "Draft renewal proposal outline",
    description: "First pass on structure and pricing tiers.",
    project: "Q3 renewal deck",
    assignee: "Priya Nair",
    priority: "high",
    status: "in-progress",
    dueDate: "2026-08-27",
  },
  {
    id: "t2",
    title: "Audit legacy auth service dependencies",
    description: "",
    project: "Platform migration",
    assignee: "Devon Clarke",
    priority: "high",
    status: "backlog",
    dueDate: "2026-08-22",
  },
  {
    id: "t3",
    title: "Write onboarding welcome email copy",
    description: "",
    project: "Onboarding revamp",
    assignee: "Sam Okafor",
    priority: "medium",
    status: "in-review",
    dueDate: "2026-09-02",
  },
  {
    id: "t4",
    title: "Set up partner sandbox environment",
    description: "",
    project: "Partner integrations",
    assignee: "Priya Nair",
    priority: "medium",
    status: "backlog",
    dueDate: null,
  },
  {
    id: "t5",
    title: "Migrate billing records to new schema",
    description: "",
    project: "Platform migration",
    assignee: "Devon Clarke",
    priority: "high",
    status: "in-progress",
    dueDate: "2026-09-10",
  },
  {
    id: "t6",
    title: "Finalize onboarding checklist UI copy",
    description: "",
    project: "Onboarding revamp",
    assignee: "Sam Okafor",
    priority: "low",
    status: "done",
    dueDate: "2026-08-10",
  },
  {
    id: "t7",
    title: "Review renewal deck with legal",
    description: "",
    project: "Q3 renewal deck",
    assignee: "Priya Nair",
    priority: "low",
    status: "done",
    dueDate: "2026-08-05",
  },
  {
    id: "t8",
    title: "Scope API rate limits for partner tier",
    description: "",
    project: "Partner integrations",
    assignee: "Devon Clarke",
    priority: "medium",
    status: "in-review",
    dueDate: "2026-08-30",
  },
];

let nextId = initialTasks.length + 1;

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${task.dueDate}T00:00:00`) < today;
}

function isDueThisWeek(task: Task) {
  if (!task.dueDate || task.status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${task.dueDate}T00:00:00`);
  const weekOut = new Date(today);
  weekOut.setDate(weekOut.getDate() + 7);
  return due >= today && due <= weekOut;
}

export function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  const filteredTasks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.project.toLowerCase().includes(q)) {
        return false;
      }
      if (assigneeFilter && t.assignee !== assigneeFilter) return false;
      if (priorityFilter && t.priority !== priorityFilter) return false;
      if (projectFilter && t.project !== projectFilter) return false;
      return true;
    });
  }, [tasks, search, assigneeFilter, priorityFilter, projectFilter]);

  const stats = useMemo(
    () => ({
      total: tasks.length,
      overdue: tasks.filter(isOverdue).length,
      dueThisWeek: tasks.filter(isDueThisWeek).length,
      done: tasks.filter((t) => t.status === "done").length,
    }),
    [tasks],
  );

  function openCreate() {
    setEditingTask(null);
    setFormKey((k) => k + 1);
    setModalOpened(true);
  }

  function openEdit(task: Task) {
    setEditingTask(task);
    setFormKey((k) => k + 1);
    setModalOpened(true);
  }

  function closeModal() {
    setModalOpened(false);
    setEditingTask(null);
  }

  function handleSubmit(values: TaskFormValues) {
    if (editingTask) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? { ...t, ...values, dueDate: values.dueDate || null }
            : t,
        ),
      );
    } else {
      const newTask: Task = {
        id: `t${nextId++}`,
        ...values,
        dueDate: values.dueDate || null,
      };
      setTasks((prev) => [...prev, newTask]);
    }
    closeModal();
  }

  function requestDelete(task: Task) {
    setDeletingTask(task);
  }

  function confirmDelete(task: Task) {
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
    setDeletingTask(null);
  }

  function handleMove(task: Task, status: TaskStatus) {
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
  }

  const hasFilters = Boolean(search || assigneeFilter || priorityFilter || projectFilter);

  function clearFilters() {
    setSearch("");
    setAssigneeFilter(null);
    setPriorityFilter(null);
    setProjectFilter(null);
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Task Board</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={openCreate}>
          New task
        </Button>
      </Group>

      <SimpleGrid cols={{ base: 2, sm: 4 }}>
        <Paper p="md" radius="md">
          <Text size="sm" c="dimmed">
            Total tasks
          </Text>
          <Text size="xl" fw={700}>
            {stats.total}
          </Text>
        </Paper>
        <Paper p="md" radius="md">
          <Text size="sm" c="dimmed">
            Overdue
          </Text>
          <Text size="xl" fw={700} c={stats.overdue > 0 ? "red" : undefined}>
            {stats.overdue}
          </Text>
        </Paper>
        <Paper p="md" radius="md">
          <Text size="sm" c="dimmed">
            Due this week
          </Text>
          <Text size="xl" fw={700}>
            {stats.dueThisWeek}
          </Text>
        </Paper>
        <Paper p="md" radius="md">
          <Text size="sm" c="dimmed">
            Completed
          </Text>
          <Text size="xl" fw={700}>
            {stats.done}
          </Text>
        </Paper>
      </SimpleGrid>

      <Paper p="md" radius="md">
        <Group gap="sm" wrap="wrap">
          <TextInput
            placeholder="Search tasks or projects"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ flex: "1 1 220px" }}
            aria-label="Search tasks or projects"
          />
          <Select
            placeholder="Project"
            data={PROJECT_OPTIONS}
            value={projectFilter}
            onChange={setProjectFilter}
            clearable
            style={{ width: 180 }}
            aria-label="Filter by project"
          />
          <Select
            placeholder="Assignee"
            data={TEAM_OPTIONS}
            value={assigneeFilter}
            onChange={setAssigneeFilter}
            clearable
            style={{ width: 160 }}
            aria-label="Filter by assignee"
          />
          <Select
            placeholder="Priority"
            data={["low", "medium", "high"]}
            value={priorityFilter}
            onChange={setPriorityFilter}
            clearable
            style={{ width: 140 }}
            aria-label="Filter by priority"
          />
          {hasFilters && (
            <Button
              variant="subtle"
              color="gray"
              leftSection={<IconX size={14} />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          )}
        </Group>
      </Paper>

      <Grid>
        {columns.map((col) => {
          const columnTasks = filteredTasks.filter((t) => t.status === col.status);
          return (
            <Grid.Col key={col.status} span={{ base: 12, sm: 6, lg: 3 }}>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={600} size="sm">
                    {col.label}
                  </Text>
                  <Badge variant="light" color="brand" size="sm">
                    {columnTasks.length}
                  </Badge>
                </Group>
                <Stack gap="xs" mih={80}>
                  {columnTasks.length === 0 && (
                    <Box
                      p="md"
                      style={{
                        border: "1px dashed var(--mantine-color-gray-4)",
                        borderRadius: "var(--mantine-radius-md)",
                        textAlign: "center",
                      }}
                    >
                      <Text size="xs" c="dimmed">
                        {hasFilters ? "No matching tasks" : "Nothing here yet"}
                      </Text>
                    </Box>
                  )}
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={openEdit}
                      onDelete={requestDelete}
                      onMove={handleMove}
                    />
                  ))}
                </Stack>
              </Stack>
            </Grid.Col>
          );
        })}
      </Grid>

      <TaskFormModal
        key={formKey}
        opened={modalOpened}
        task={editingTask}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <DeleteTaskModal
        task={deletingTask}
        onCancel={() => setDeletingTask(null)}
        onConfirm={confirmDelete}
      />
    </Stack>
  );
}
