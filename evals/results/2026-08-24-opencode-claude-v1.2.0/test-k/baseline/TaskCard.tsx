import { Paper, Group, Text, Badge, Menu, ActionIcon, Stack, Avatar } from "@mantine/core";
import {
  IconDots,
  IconPencil,
  IconTrash,
  IconCalendar,
  IconArrowRight,
} from "@tabler/icons-react";
import type { Task, TaskStatus } from "../types";

const priorityColor: Record<Task["priority"], string> = {
  low: "gray",
  medium: "yellow",
  high: "red",
};

const statusOrder: TaskStatus[] = ["backlog", "in-progress", "in-review", "done"];

const statusLabel: Record<TaskStatus, string> = {
  backlog: "Backlog",
  "in-progress": "In progress",
  "in-review": "In review",
  done: "Done",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDueDate(iso: string | null) {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function isOverdue(task: Task) {
  if (!task.dueDate || task.status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${task.dueDate}T00:00:00`) < today;
}

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (task: Task, status: TaskStatus) => void;
}

export function TaskCard({ task, onEdit, onDelete, onMove }: TaskCardProps) {
  const overdue = isOverdue(task);
  const nextStatuses = statusOrder.filter((s) => s !== task.status);
  const dueLabel = formatDueDate(task.dueDate);

  return (
    <Paper p="sm" radius="md" withBorder>
      <Stack gap={6}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text size="sm" fw={600} lineClamp={2}>
            {task.title}
          </Text>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                aria-label={`Actions for ${task.title}`}
              >
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => onEdit(task)}>
                Edit
              </Menu.Item>
              <Menu.Label>Move to</Menu.Label>
              {nextStatuses.map((s) => (
                <Menu.Item
                  key={s}
                  leftSection={<IconArrowRight size={14} />}
                  onClick={() => onMove(task, s)}
                >
                  {statusLabel[s]}
                </Menu.Item>
              ))}
              <Menu.Divider />
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={() => onDelete(task)}
              >
                Delete
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        <Text size="xs" c="dimmed" lineClamp={2}>
          {task.project}
        </Text>

        <Group justify="space-between" mt={4}>
          <Group gap={6}>
            <Avatar size={20} radius="xl" color="brand">
              <Text size="9px" fw={700}>
                {initials(task.assignee)}
              </Text>
            </Avatar>
            <Badge size="xs" variant="light" color={priorityColor[task.priority]}>
              {task.priority}
            </Badge>
          </Group>
          {dueLabel && (
            <Group gap={4}>
              <IconCalendar size={13} color={overdue ? "var(--mantine-color-red-6)" : undefined} />
              <Text size="xs" c={overdue ? "red" : "dimmed"} fw={overdue ? 600 : 400}>
                {dueLabel}
              </Text>
            </Group>
          )}
        </Group>
      </Stack>
    </Paper>
  );
}
