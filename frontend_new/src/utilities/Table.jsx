import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CityRow = ({ name, description, path }) => {
  const navigate = useNavigate();
  return (
    <Motion.tr
      whileHover={{ scale: 1.01 }}
      className="border-bottom"
    >
      <td className="px-4 py-3 fw-semibold text-dark">{name}</td>
      <td className="px-3 py-3 text-secondary">{description}</td>
      <td className="px-4 py-3 text-end">
        <button
          onClick={() => navigate(path)}
          className="btn btn-info btn-sm text-white"
        >
          Visit
        </button>
      </td>
    </Motion.tr>
  )
}

const Table = ({ cities }) => {
  return (
    <div className="table-responsive rounded-3 shadow bg-white mx-auto" style={{ maxWidth: '900px' }}>
      <table className="table table-hover mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th className="px-3 py-3 text-secondary fw-semibold small">City</th>
            <th className="px-3 py-3 text-secondary fw-semibold small">Description</th>
            <th className="px-3 py-3 text-secondary fw-semibold small text-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {cities.map((city, index) => (
            <CityRow
              key={index}
              name={city.name}
              description={city.description}
              path={city.path}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table;