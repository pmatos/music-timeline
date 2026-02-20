interface HeaderProps {
  instrument: string;
  instruments: string[];
  onInstrumentChange: (instrument: string) => void;
}

const NEW_INSTRUMENT_URL = 'https://github.com/pmatos/music-timeline/issues/new?template=new-instrument.yml';

export function Header({ instrument, instruments, onInstrumentChange }: HeaderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === '__new__') {
      window.open(NEW_INSTRUMENT_URL, '_blank', 'noopener,noreferrer');
      e.target.value = instrument.toLowerCase();
      return;
    }
    onInstrumentChange(value);
  };

  return (
    <header className="header">
      <div className="header__left">
        <div className="header__title-row">
          <h1 className="header__title">{instrument} Music Timeline</h1>
          <select className="header__select" value={instrument.toLowerCase()}
            onChange={handleChange}>
            {instruments.map((inst) => (
              <option key={inst} value={inst}>
                {inst.charAt(0).toUpperCase() + inst.slice(1)}
              </option>
            ))}
            <option value="__new__">New Instrument...</option>
          </select>
        </div>
        <div className="header__subtitle">
          In collaboration with{' '}
          <a href="https://rightkey.app" target="_blank" rel="noopener noreferrer">Rightkey.app</a>
        </div>
      </div>
    </header>
  );
}
