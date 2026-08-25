import { Modal, Text, Group, Button } from "@mantine/core";
import type { Task } from "../types";

interface DeleteTaskModalProps {
  task: Task | null;
  onCancel: () => void;
  onConfirm: (task: Task) => void;
}

export function DeleteTaskModal({ task, onCancel, onConfirm }: DeleteTaskModalProps) {
  return (
    <Modal opened={task !== null} onClose={onCancel} title="Delete task" centered size="sm">
      {task && (
        <>
          <Text size="sm">
            Delete <Text span fw={600}>{task.title}</Text>? This can't be undone.
          </Text>
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={onCancel}>
              Cancel
            </Button>
            <Button color="red" onClick={() => onConfirm(task)}>
              Delete task
            </Button>
          </Group>
        </>
      )}
    </Modal>
  );
}
