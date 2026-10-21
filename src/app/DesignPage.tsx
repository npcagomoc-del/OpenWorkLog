import { useState } from 'react';
import { Check, Inbox, Plus, Search } from 'lucide-react';
import { Brand } from '../components/Brand';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  IconButton,
  Modal,
  Notice,
  PageHeader,
  SegmentedControl,
  StatusBadge,
  useToast,
} from '../components/ui';
export default function DesignPage() {
  const [view, setView] = useState('List');
  const [modal, setModal] = useState(false);
  const { toast } = useToast();
  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="OpenWorkLog"
        title="Component showcase"
        description="Shared controls and states for a comfortable, accessible workspace."
      />
      <Card className="card-pad stack">
        <Brand />
        <div className="cluster">
          <Button variant="primary" onClick={() => toast('Your change has been saved.')}>
            <Plus size={18} />
            Primary action
          </Button>
          <Button onClick={() => setModal(true)}>Open dialog</Button>
          <Button variant="ghost">Quiet action</Button>
          <Button disabled>Disabled</Button>
          <Button busy>Saving</Button>
          <IconButton label="Search">
            <Search size={20} />
          </IconButton>
        </div>
        <div className="cluster">
          <StatusBadge status="Open" />
          <StatusBadge status="In Progress" />
          <StatusBadge status="Closed" />
          <Badge>Demo</Badge>
        </div>
        <SegmentedControl
          label="View"
          value={view}
          onChange={setView}
          options={[
            { value: 'List', label: 'List' },
            { value: 'Table', label: 'Table' },
            { value: 'Board', label: 'Board' },
          ]}
        />
      </Card>
      <Card className="card-pad form-grid">
        <Field
          label="Task name"
          htmlFor="sample-name"
          hint="A clear name makes it easier to find later."
        >
          <input id="sample-name" placeholder="What needs to get done?" />
        </Field>
        <Field label="Required field" htmlFor="sample-error" error="Enter a task name.">
          <input id="sample-error" aria-invalid="true" />
        </Field>
        <Field label="Status" htmlFor="sample-status">
          <select id="sample-status">
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
          </select>
        </Field>
        <Field label="Work done" htmlFor="sample-work">
          <textarea id="sample-work" placeholder="Describe what you worked on." />
        </Field>
      </Card>
      <Notice>Saved on this device. Your workspace is available offline after installation.</Notice>
      <Card>
        <EmptyState
          title="A clear place to begin"
          description="Add your first task and make room for the work that matters today."
          icon={<Inbox size={28} />}
          action={
            <Button variant="primary">
              <Plus size={18} />
              Add a task
            </Button>
          }
        />
      </Card>
      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="A focused conversation"
        footer={
          <>
            <Button onClick={() => setModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setModal(false);
                toast('The dialog was confirmed.');
              }}
            >
              <Check size={18} />
              Confirm
            </Button>
          </>
        }
      >
        <p className="muted">
          This dialog traps keyboard focus, closes with Escape, and returns focus to its trigger.
        </p>
      </Modal>
    </div>
  );
}
