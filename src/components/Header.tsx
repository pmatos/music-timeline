interface HeaderProps {
  instrument: string;
  instruments: string[];
  onInstrumentChange: (instrument: string) => void;
}

export function Header({ instrument, instruments, onInstrumentChange }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__left">
        <h1 className="header__title">{instrument} Music Timeline</h1>
        <select className="header__select" value={instrument.toLowerCase()}
          onChange={(e) => onInstrumentChange(e.target.value)}>
          {instruments.map((inst) => (
            <option key={inst} value={inst}>
              {inst.charAt(0).toUpperCase() + inst.slice(1)}
            </option>
          ))}
        </select>
      </div>
      <div className="header__right">
        <span>Sponsored by </span>
        <a href="https://rightkey.app" target="_blank" rel="noopener noreferrer">Rightkey.app</a>
      </div>
    </header>
  );
}
