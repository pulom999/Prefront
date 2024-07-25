import React, { useState, useEffect, ChangeEvent } from 'react';
import Papa from 'papaparse';
import Modal from 'react-modal';
import axios from 'axios';

interface Student {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

Modal.setAppElement('#root');

const App: React.FC = () => {
  const [data, setData] = useState<Student[]>([]);
  const [newMember, setNewMember] = useState<Student>({
    student_id: '',
    first_name: '',
    last_name: '',
    email: '',
  });
  const [mainModalIsOpen, setMainModalIsOpen] = useState(false);
  const [csvModalIsOpen, setCsvModalIsOpen] = useState(false);
  const [addMemberModalIsOpen, setAddMemberModalIsOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchStudents = async () => {
    try {
      const response = await axios.get<Student[]>('/api/QueryStudents');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);
  
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setCsvFile(file);
      Papa.parse<Student>(file, {
        header: true,
        complete: async (results) => {
          // สร้างข้อมูลใหม่ในรูปแบบที่ backend คาดหวัง
          const updatedData: Student[] = results.data.map(item => ({
            student_id: item['student_id'] || '',
            first_name: item['first_name'] || '',
            last_name: item['last_name'] || '',
            email: item['email'] || '',
          }));
  
          const formData = new FormData();
          formData.append('file', file);
  
          try {
            const response = await axios.put('/api/MultiCreateStudent', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              },
              onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                  const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                  setUploadProgress(percentCompleted);
                }
              }
            });
  
            console.log('Response:', response);
            setData(prevData => [...prevData, ...updatedData]);
          } catch (error) {
            console.error('Error uploading CSV data:', error);
            if (axios.isAxiosError(error) && error.response) {
              console.error('Error details:', error.response.data);
            }
          }
        },
      });
    }
  };
  
  
  const handleRemoveMember = async (index: number) => {
    const student = data[index];
    try {
      await axios.delete(`/api/DeleteStudent?student_id=${student.student_id}`);
      const updatedData = data.filter((_, i) => i !== index);
      setData(updatedData);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleAddMember = async () => {
    const newMemberData = { ...newMember };
    try {
      await axios.put('/api/CreateStudent', newMemberData);
      setData([...data, newMemberData]);
      setNewMember({
        student_id: '',
        first_name: '',
        last_name: '',
        email: '',
      });
      setAddMemberModalIsOpen(false);
      setMainModalIsOpen(true);
    } catch (error) {
      console.error('Error adding new member:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
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
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>StudentID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>NAME</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>EMAIL</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>REMOVE</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
                You haven't added anyone to your course yet. Add students or other instructors to your course.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.student_id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.first_name} {row.last_name}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{row.email}</td>
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
          Add Single User
        </button>
        <button
          onClick={openCsvModal}
          style={{ padding: '10px' }}
        >
          Upload CSV
        </button>
      </Modal>

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
          name="student_id"
          placeholder="StudentID"
          value={newMember.student_id}
          onChange={handleInputChange}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={newMember.first_name}
          onChange={handleInputChange}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={newMember.last_name}
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
            <div>Upload Progress: {uploadProgress}%</div>
            {/* Add any additional logic to display a preview of the CSV data here */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default App;
