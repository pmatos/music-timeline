export function Legend() {
  return (
    <div className="legend">
      <div className="legend-section">
        <span className="legend-line legend-line--relative" />
        <span>Relative</span>
        <span className="legend-line legend-line--student-teacher" />
        <span>Student/Teacher</span>
      </div>
      <div className="legend-section">
        <span className="legend-dot" style={{ backgroundColor: '#4A90D9' }} />
        <span>Composer</span>
        <span className="legend-dot" style={{ backgroundColor: '#E67E22' }} />
        <span>Player</span>
        <span className="legend-dot" style={{ backgroundColor: '#8E44AD' }} />
        <span>Both</span>
      </div>
    </div>
  );
}
