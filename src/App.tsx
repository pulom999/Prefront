import React, { useState, useEffect, ChangeEvent } from 'react';
import Papa from 'papaparse';
import Modal from 'react-modal';
import axios from 'axios';
import { Student } from './types';
import { FaEdit, FaTrash } from 'react-icons/fa';

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
  const [updateStudentModalIsOpen, setUpdateStudentModalIsOpen] = useState(false);
  //const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [studentToUpdate, setStudentToUpdate] = useState<Student | null>(null);

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
      //setCsvFile(file);
      Papa.parse<Student>(file, {
        header: true,
        complete: async (results) => {
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

  const handleUpdateStudent = async () => {
    if (!studentToUpdate) return;

    try {
      await axios.put('/api/UpdateStudent', studentToUpdate);
      setData(prevData => prevData.map(s => s.student_id === studentToUpdate.student_id ? studentToUpdate : s));
      closeUpdateStudentModal();
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewMember(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentToUpdate(prev => prev ? { ...prev, [name]: value } : null);
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

  const openUpdateStudentModal = (student: Student) => {
    setStudentToUpdate(student);
    setUpdateStudentModalIsOpen(true);
  };

  const closeUpdateStudentModal = () => {
    setUpdateStudentModalIsOpen(false);
    setStudentToUpdate(null);
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>List of Members</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>StudentID</th>
            <th>NAME</th>
            <th>EMAIL</th>
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
                <td>{row.student_id}</td>
                <td>{row.first_name} {row.last_name}</td>
                <td>{row.email}</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                <button
                  onClick={() => openUpdateStudentModal(row)}
                 style={{backgroundColor: 'transparent',border: 'none',cursor: 'pointer',color: '#007bff',fontSize: '20px',marginRight: '10px'
                 }}
                 aria-label="update"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleRemoveMember(index)}
                  style={{backgroundColor: 'transparent',border: 'none',cursor: 'pointer',color: 'red',fontSize: '20px'
                 }}
                 aria-label="delete"
                >
                  <FaTrash />
                </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      
      <button
        onClick={openMainModal}
        style={{ backgroundColor: '#555', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', marginTop: '20px' }}
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
            height: '300px',
            margin: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          },
        }}
      >
        <h2 style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
          Select Upload Type
        </h2>
        <button
          onClick={openAddMemberModal}
          style={{ padding: '10px', width: '200px', backgroundColor: '#555', color: 'white', border: 'none', cursor: 'pointer', marginBottom: '20px' }}
        >
          Add Single User
        </button>
        <button
          onClick={openCsvModal}
          style={{ padding: '10px', width: '200px', backgroundColor: '#555', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Upload CSV
        </button>
      </Modal>
      <Modal
        isOpen={csvModalIsOpen}
        onRequestClose={closeCsvModal}
        contentLabel="Upload CSV Modal"
        style={{
          content: {
            width: '500px',
            height: '400px',
            margin: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          },
        }}
      >
        <h2 style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
          Upload CSV File
        </h2>
        <input type="file" accept=".csv" onChange={handleFileUpload} style={{ color: 'white' }} />
        {uploadProgress > 0 && (
          <div>
            <p>Upload progress: {uploadProgress}%</p>
            {uploadProgress === 100 && <p>Upload complete!</p>}
          </div>
        )}
      </Modal>
      <Modal
        isOpen={addMemberModalIsOpen}
        onRequestClose={closeAddMemberModal}
        contentLabel="Add Member Modal"
        style={{
          content: {
            width: '500px',
            height: '500px',
            margin: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          },
        }}
      >
        <h2 style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
          Add Member
        </h2>
        <input
          type="text"
          name="student_id"
          value={newMember.student_id}
          onChange={handleInputChange}
          placeholder="Student ID"
          style={{ padding: '10px', margin: '10px 0', backgroundColor: '#444', color: 'white', border: '1px solid #555' }}
        />
        <input
          type="text"
          name="first_name"
          value={newMember.first_name}
          onChange={handleInputChange}
          placeholder="First Name"
          style={{ padding: '10px', margin: '10px 0', backgroundColor: '#444', color: 'white', border: '1px solid #555' }}
        />
        <input
          type="text"
          name="last_name"
          value={newMember.last_name}
          onChange={handleInputChange}
          placeholder="Last Name"
          style={{ padding: '10px', margin: '10px 0', backgroundColor: '#444', color: 'white', border: '1px solid #555' }}
        />
        <input
          type="text"
          name="email"
          value={newMember.email}
          onChange={handleInputChange}
          placeholder="Email"
          style={{ padding: '10px', margin: '10px 0', backgroundColor: '#444', color: 'white', border: '1px solid #555' }}
        />
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button
            onClick={handleAddMember}
            style={{ backgroundColor: '#555', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', marginTop: '20px' }}
          >
            Add member
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={updateStudentModalIsOpen}
        onRequestClose={closeUpdateStudentModal}
        contentLabel="Update Student Modal"
        style={{
          content: {
            width: '500px',
            height: '500px',
            margin: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#333',
            color: 'white',
            border: '1px solid #555',
          },
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
          },
        }}
      >
        <h2 style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
          Update Student
        </h2>
        <input
          type="text"
          name="student_id"
          value={studentToUpdate?.student_id || ''}
          onChange={handleUpdateInputChange}
          placeholder="Student ID"
          style={{ padding: '10px', margin: '10px 0', backgroundColor: '#444', color: 'white', border: '1px solid #555' }}
        />
        <input
          type="text"
          name="first_name"
          value={studentToUpdate?.first_name || ''}
          onChange={handleUpdateInputChange}
          placeholder="First Name"
          style={{ padding: '10px', margin: '10px 0', backgroundColor: '#444', color: 'white', border: '1px solid #555' }}
        />
        <input
          type="text"
          name="last_name"
          value={studentToUpdate?.last_name || ''}
          onChange={handleUpdateInputChange}
          placeholder="Last Name"
          style={{ padding: '10px', margin: '10px 0', backgroundColor: '#444', color: 'white', border: '1px solid #555' }}
        />
        <input
          type="text"
          name="email"
          value={studentToUpdate?.email || ''}
          onChange={handleUpdateInputChange}
          placeholder="Email"
          style={{ padding: '10px', margin: '10px 0', backgroundColor: '#444', color: 'white', border: '1px solid #555' }}
        />
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <button
            onClick={handleUpdateStudent}
            style={{ backgroundColor: '#555', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', marginTop: '20px' }}
          >
            Update Student
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default App;
