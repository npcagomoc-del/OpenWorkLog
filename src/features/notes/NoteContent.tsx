type Props = { readonly content: string; readonly onToggle?: (line: number) => void };
export function NoteContent({ content, onToggle }: Props) {
  const occurrences = new Map<string, number>();
  const lines = content.split('\n').map((line) => {
    const identity = line.replace(/^(\s*-\s*\[)[ xX](\])/, '$1 $2');
    const occurrence = (occurrences.get(identity) ?? 0) + 1;
    occurrences.set(identity, occurrence);
    return { line, key: `${identity}:${occurrence}` };
  });
  return (
    <div className="note-content">
      {lines.map(({ line, key }, index) => {
        const checklist = /^\s*-\s*\[([ xX])\]\s*(.*)$/.exec(line);
        if (checklist)
          return (
            <label className="note-check" key={key}>
              <input
                type="checkbox"
                checked={checklist[1] !== ' '}
                disabled={!onToggle}
                onChange={() => onToggle?.(index)}
              />
              <span>{checklist[2]}</span>
            </label>
          );
        if (line.startsWith('### ')) return <h4 key={key}>{line.slice(4)}</h4>;
        if (line.startsWith('## ')) return <h3 key={key}>{line.slice(3)}</h3>;
        if (line.startsWith('# ')) return <h2 key={key}>{line.slice(2)}</h2>;
        if (line.startsWith('- '))
          return (
            <p className="note-bullet" key={key}>
              <span aria-hidden="true">•</span>
              {line.slice(2)}
            </p>
          );
        if (line.startsWith('> ')) return <blockquote key={key}>{line.slice(2)}</blockquote>;
        return line ? <p key={key}>{line}</p> : <div className="note-line-space" key={key} />;
      })}
    </div>
  );
}
