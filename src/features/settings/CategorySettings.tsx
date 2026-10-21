import { Archive, Plus, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card, Field, IconButton, Notice, useToast } from '../../components/ui';
import { actions } from '../../data/actions';
import type { Category } from '../../domain/models';

function CategoryRow({ category }: { readonly category: Category }) {
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  async function update(archive = false) {
    setBusy(true);
    try {
      await actions.updateCategory(
        category.id,
        archive ? { archived: !category.archived } : { name: name.trim(), color },
      );
      toast(
        archive
          ? category.archived
            ? 'Category restored.'
            : 'Category archived. Existing records keep it.'
          : 'Category saved.',
      );
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Could not save category.', 'error');
    } finally {
      setBusy(false);
    }
  }
  return (
    <form
      className="category-row"
      onSubmit={(event) => {
        event.preventDefault();
        void update();
      }}
    >
      <input
        aria-label={`Color for ${category.name}`}
        type="color"
        value={color}
        onChange={(event) => setColor(event.target.value)}
      />
      <input
        aria-label={`Category name: ${category.name}`}
        required
        maxLength={60}
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      {category.archived && <Badge>Archived</Badge>}
      <Button
        type="submit"
        busy={busy}
        size="sm"
        disabled={name.trim() === category.name && color === category.color}
      >
        Save
      </Button>
      <IconButton
        disabled={busy}
        label={`${category.archived ? 'Restore' : 'Archive'} ${category.name}`}
        onClick={() => void update(true)}
      >
        {category.archived ? <RotateCcw size={18} /> : <Archive size={18} />}
      </IconButton>
    </form>
  );
}

export function CategorySettings({ categories }: { readonly categories: readonly Category[] }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#0969c7');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  async function add() {
    if (
      categories.some(
        (category) => category.name.toLocaleLowerCase() === name.trim().toLocaleLowerCase(),
      )
    ) {
      setError('That category already exists. You can rename or restore it below.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await actions.createCategory({ name: name.trim(), color, archived: false });
      setName('');
      toast('Category added.');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not add category.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card className="card-pad stack" id="categories">
      <div>
        <h2>Categories</h2>
        <p className="muted">
          Add or rename your categories. Archiving hides a category from new work and preserves
          existing records.
        </p>
      </div>
      <form
        className="category-add"
        onSubmit={(event) => {
          event.preventDefault();
          void add();
        }}
      >
        <Field label="New category" htmlFor="category-name">
          <input
            required
            id="category-name"
            value={name}
            maxLength={60}
            placeholder="e.g. Infrastructure"
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field label="Color" htmlFor="category-color">
          <input
            id="category-color"
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </Field>
        <Button type="submit" busy={busy}>
          <Plus size={18} />
          Add category
        </Button>
      </form>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="stack">
        {categories.map((category) => (
          <CategoryRow key={`${category.id}-${category.updatedAt}`} category={category} />
        ))}
      </div>
      {categories.length === 0 && (
        <p className="muted">No categories yet. Add one to organize your work.</p>
      )}
    </Card>
  );
}
