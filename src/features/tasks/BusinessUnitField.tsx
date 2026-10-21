import { Field } from '../../components/ui';
export function BusinessUnitField({
  id,
  value,
  units,
  onChange,
}: {
  readonly id: string;
  readonly value: string;
  readonly units: readonly string[];
  readonly onChange: (unit: string) => void;
}) {
  return (
    <Field label="Business Unit" htmlFor={id}>
      <input
        id={id}
        list={`${id}-options`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Unassigned"
      />
      <datalist id={`${id}-options`}>
        {units.map((unit) => (
          <option value={unit} key={unit} />
        ))}
      </datalist>
    </Field>
  );
}
