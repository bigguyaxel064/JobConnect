import { useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminPage.css';
import ApplicationLogsTable from './components/ApplicationLogsTable.jsx';
import ApplicationsTable from './components/ApplicationsTable.jsx';

import AdvertisementsTable from './components/AdvertisementsTable.jsx';
import CompaniesTable from './components/CompaniesTable.jsx';
import UsersTable from './components/UsersTable.jsx';

const sections = [
  { key: 'applications', label: 'Candidatures', component: <ApplicationsTable /> },
  { key: 'logs', label: 'Journal des candidatures', component: <ApplicationLogsTable /> },
  { key: 'ads', label: 'Annonces', component: <AdvertisementsTable /> },
  { key: 'companies', label: 'Entreprises', component: <CompaniesTable /> },
  { key: 'users', label: 'Utilisateurs', component: <UsersTable /> },
];

function AdminDashboard() {
  const [active, setActive] = useState(sections[0].key);

  return (
    <>
      <ToastContainer />
      <div className="admin-dashboard">
        <nav>
          {sections.map(section => (
            <button
              key={section.key}
              className={active === section.key ? 'active' : ''}
              onClick={() => setActive(section.key)}
            >
              {section.label}
            </button>
          ))}
        </nav>
        <div>{sections.find(s => s.key === active)?.component}</div>
      </div>
    </>
  );
}

export default AdminDashboard;
