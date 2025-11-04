import { useState } from 'react';
import '../styles/tablas.css';

function Table({ columns = [], data = [], rowsPerPage = 5 }) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const searchableCols = columns.filter(c => typeof c.accessor === 'string' && c.accessor);

  // 🔎 Filtrar datos por búsqueda (solo columnas con accessor válido)
  const filteredData = data.filter(row =>
    searchableCols.some(col =>
      String(row?.[col.accessor] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  // 🔀 Ordenamiento
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const valueA = a?.[sortConfig.key];
    const valueB = b?.[sortConfig.key];
    if (valueA == null && valueB == null) return 0;
    if (valueA == null) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valueB == null) return sortConfig.direction === 'asc' ? 1 : -1;
    if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // 📄 Paginación
  const totalPages = Math.ceil(sortedData.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, startIndex + rowsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSort = (accessor) => {
    if (!accessor) return;
    let direction = 'asc';
    if (sortConfig.key === accessor && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key: accessor, direction });
  };

  return (
    <div className="table-wrapper">
      {/* Buscador */}
      <div className="table-search">
        <input
          type="text"
          placeholder="Buscar..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {/* Tabla */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col, index) => {
                const headerText = col.header ?? col.label ?? col.key ?? '';
                const sortable = !!col.accessor;
                const activeSort = sortConfig.key === col.accessor;
                return (
                  <th
                    key={index}
                    onClick={sortable ? () => handleSort(col.accessor) : undefined}
                    className={`${sortable ? 'sortable' : ''} ${activeSort ? 'active-sort' : ''}`}
                    style={col.width ? { width: col.width } : undefined}
                    title={sortable ? 'Ordenar' : undefined}
                  >
                    {headerText}
                    {activeSort && (
                      <span className="sort-indicator">
                        {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((col, colIndex) => {
                    const value = col.accessor ? row?.[col.accessor] : undefined;
                    const content = typeof col.render === 'function'
                    ? col.render(row, startIndex + rowIndex)
                    : value ?? '';
                    return <td key={colIndex}>{content}</td>;
                  })}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="no-data">
                  No hay datos disponibles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="pagination">
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          ◀
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          ▶
        </button>
      </div>
    </div>
  );
}

export default Table;