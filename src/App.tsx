import { useState } from 'react';
import Papa from 'papaparse';
import Modal from 'react-modal';

// Set the app element to avoid accessibility issues
Modal.setAppElement('#root');

function App() {
  const [data, setData] = useState([]);
  const [newMember, setNewMember] = useState({ firstName: '', lastName: '', email: '' });
  const [mainModalIsOpen, setMainModalIsOpen] = useState(false);
  const [csvModalIsOpen, setCsvModalIsOpen] = useState(false);
  const [addMemberModalIsOpen, setAddMemberModalIsOpen] = useState(false);
  const [csvFile, setCsvFile] = useState(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setData(results.data);
        setCsvFile(file); // Store the file
      },
    });
  };

  const handleRemoveMember = (index) => {
    const updatedData = data.filter((_, i) => i !== index);
    setData(updatedData);
  };

  const handleAddMember = () => {
    setData([...data, { ...newMember, role: 'Student'}]);
    setNewMember({ firstName: '', lastName: '', email: '' });
    setAddMemberModalIsOpen(false);
    setMainModalIsOpen(true); // Return to main modal
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember((prev) => ({ ...prev, [name]: value }));
  };

  const openMainModal = () => setMainModalIsOpen(true);
  const closeMainModal = () => setMainModalIsOpen(false);

  const openCsvModal = () => {
    setMainModalIsOpen(false);
    setCsvModalIsOpen(true);
  };

  const closeCsvModal = () => setCsvModalIsOpen(false);

  const openAddMemberModal = () => {
    setMainModalIsOpen(false);
    setAddMemberModalIsOpen(true);
  };

  const closeAddMemberModal = () => setAddMemberModalIsOpen(false);

  return (
    <div style={{ padding: '20px' }}>
      <h2>List of Members</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>NAME</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>EMAIL</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>ROLE</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>SUBMISSIONS</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>REMOVE</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                You haven't added anyone to your course yet. Add students or other instructors to your course.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.firstName} {row.lastName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.Email}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.role}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.submissions}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleRemoveMember(index)}
                    style={{ backgroundColor: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <button
        onClick={openMainModal}
        style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer' }}
      >
        Add Member
      </button>

      {/* Main Modal for selection */}
      <Modal
        isOpen={mainModalIsOpen}
        onRequestClose={closeMainModal}
        contentLabel="Select Upload Type Modal"
        style={{
          content: {
            width: '500px',
            margin: 'auto',
            padding: '20px',
          },
        }}
      >
        <h2>Select Upload Type</h2>
        <button
          onClick={openAddMemberModal}
          style={{ marginRight: '10px', padding: '10px' }}
        >
          Add SingleUser
        </button>
        <button
          onClick={openCsvModal}
          style={{ padding: '10px' }}
        >
          Upload CSV
        </button>
      </Modal>

      {/* Modal for adding single user */}
      <Modal
        isOpen={addMemberModalIsOpen}
        onRequestClose={closeAddMemberModal}
        contentLabel="Add Single User Modal"
        style={{
          content: {
            width: '500px',
            margin: 'auto',
            padding: '20px',
          },
        }}
      >
        <h3>Add New Member</h3>
        <input
          type="text"
          name="firstName"
          placeholder="First Name"
          value={newMember.firstName}
          onChange={handleInputChange}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="text"
          name="lastName"
          placeholder="Last Name"
          value={newMember.lastName}
          onChange={handleInputChange}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={newMember.email}
          onChange={handleInputChange}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button
          onClick={handleAddMember}
          style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer' }}
        >
          Add Member
        </button>
      </Modal>

      {/* Modal for uploading CSV */}
      <Modal
        isOpen={csvModalIsOpen}
        onRequestClose={closeCsvModal}
        contentLabel="Upload CSV Modal"
        style={{
          content: {
            width: '500px',
            margin: 'auto',
            padding: '20px',
          },
        }}
      >
        <h3>Upload CSV File</h3>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
        />
        {csvFile && (
          <div style={{ marginTop: '20px' }}>
            <h4>Uploaded File: {csvFile.name}</h4>
            {/* Add any additional logic to display a preview of the CSV data here */}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default App;
