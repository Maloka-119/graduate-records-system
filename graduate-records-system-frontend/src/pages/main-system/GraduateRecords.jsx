import { useTranslation } from 'react-i18next';
import '../../i18n/i18n';
import { Globe  } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Upload, Plus, Trash2, Eye, FileText, Calendar, LogOut, Database, Archive ,ArrowLeft} from 'lucide-react';
import * as XLSX from 'xlsx';
import './GraduateRecords.css';
import { BASE_URL } from "../../component/api"
import UploadHistoryPage from './UploadHistory';


const GraduateRecords = ({ onLogout }) => {
  const [graduates, setGraduates] = useState([]);
  const [uploadHistory, setUploadHistory] = useState([]);
  const [activeView, setActiveView] = useState('workspace');
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { t, i18n } = useTranslation();
  const token = localStorage.getItem('authToken');
  const facultiesData = [
    { ar: "كلية الهندسة بحلوان", en: "Faculty of Engineering (Helwan)" },
    { ar: "كلية الهندسة بالمطرية", en: "Faculty of Engineering (Mataria)" },
    { ar: "كلية الحاسبات والذكاء الاصطناعي", en: "Faculty of Computers & Artificial Intelligence" },
    { ar: "كلية العلوم", en: "Faculty of Science" },
    { ar: "كلية الصيدلة", en: "Faculty of Pharmacy" },
    { ar: "كلية الطب", en: "Faculty of Medicine" },
    { ar: "كلية التمريض", en: "Faculty of Nursing" },
    { ar: "كلية التكنولوجيا والتعليم", en: "Faculty of Technology & Education" },
    { ar: "كلية الاقتصاد وإدارة الأعمال الدولية بالشيخ زايد", en: "Faculty of International Business & Economics (Sheikh Zayed)" },
    { ar: "كلية الآداب", en: "Faculty of Arts" },
    { ar: "كلية الحقوق", en: "Faculty of Law" },
    { ar: "كلية التجارة وإدارة الأعمال", en: "Faculty of Commerce & Business Administration" },
    { ar: "كلية الخدمة الاجتماعية", en: "Faculty of Social Work" },
    { ar: "كلية التربية", en: "Faculty of Education" },
    { ar: "كلية التربية النوعية", en: "Faculty of Specific Education" },
    { ar: "كلية السياحة والفنادق", en: "Faculty of Tourism & Hotels" },
    { ar: "كلية الفنون الجميلة", en: "Faculty of Fine Arts" },
    { ar: "كلية الفنون التطبيقية", en: "Faculty of Applied Arts" },
    { ar: "كلية التربية الفنية", en: "Faculty of Art Education" },
    { ar: "كلية التربية الموسيقية", en: "Faculty of Music Education" },
    { ar: "كلية التربية الرياضية بنين", en: "Faculty of Physical Education (Men)" },
    { ar: "كلية التربية الرياضية بنات", en: "Faculty of Physical Education (Women)" },
    { ar: "المعهد القومي للملكية الفكرية", en: "National Institute of Intellectual Property" },
    { ar: "معهد التمريض", en: "Nursing Institute" }
  ];
  
  const [faculties, setFaculties] = useState(facultiesData);
  

  const [newGraduate, setNewGraduate] = useState({
    fullName: '',
    nationalId: '',
    faculty: '',
    department: '',
    graduationYear: ''
  });
  
  const [newGraduatesBatch, setNewGraduatesBatch] = useState([]);

  // console.log(localStorage.getItem('authToken'));

  useEffect(() => {
    fetchAllGraduates();
  }, []);
  
  const fetchAllGraduates = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/all-graduates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
  
      // لو مفيش بيانات
      if (res.status === 404) {
        setGraduates([]); // ← أهم حاجة
        return;
      }
  
      const data = await res.json();
  
      if (Array.isArray(data.graduates)) {
        setGraduates(data.graduates);
      } else {
        setGraduates([]); // ← تأمين إضافي
      }
  
    } catch (error) {
      console.error('Failed to fetch graduates:', error);
      setGraduates([]); // ← عشان ميسيبش البيانات القديمة
    }
  };
  
  
  
  
  if (!token) {
    alert('You are not logged in or token is missing');
    return;
  }
  
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
  };
  
  const handleSaveUpload = async () => {
    if (!selectedFile) return;
  
    const formData = new FormData();
    formData.append('file', selectedFile);
  
    try {
      const res = await fetch(`${BASE_URL}/api/graduates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const result = await res.json();
      // console.log('Upload response:', result);
  
      // if (result.addedGraduates) {
      //   setGraduates(prev => [...prev, ...result.addedGraduates]);
      // }
  
      const addedCount = result?.results?.added || 0;
  
      if (result.metadata) {
        setUploadHistory(prev => [...prev, {
          batchId: result.metadata.batchId,
          createdBy: result.metadata.createdBy,
          createdByName: result.metadata.createdByName,
          createdAt: result.metadata.createdAt,
          fileInfo: result.fileInfo,
          added: addedCount
        }]);
        fetchAllGraduates();
      }
  
      setSelectedFile(null);
      alert(t('uploadSuccess', { count: addedCount }));
    } catch (error) {
      alert(t('uploadFailed', { message: error.message }));
    }
  };
  
  
  const handleCancelUpload = () => {
    setSelectedFile(null);
  };
  
  const handleAddRow = () => {
    if (!newGraduate.fullName || !newGraduate.nationalId || !newGraduate.faculty || 
        !newGraduate.department || !newGraduate.graduationYear) {
          alert(t('fillAllFields'));
      return;
    }
    setNewGraduatesBatch([...newGraduatesBatch, { ...newGraduate }]);
    setNewGraduate({ fullName: '', nationalId: '', faculty: '', department: '', graduationYear: '' });
  };

  const handleDeleteRow = (index) => {
    setNewGraduatesBatch(newGraduatesBatch.filter((_, i) => i !== index));
  };
  
  const handleSaveBatch = async () => {
    if (newGraduatesBatch.length === 0) return;
  
    try {
      const res = await fetch(`${BASE_URL}/api/graduates`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ graduates: newGraduatesBatch })
      });
      const result = await res.json();
  
      // if (result.addedGraduates) {
      //   setGraduates(prev => [...prev, ...result.addedGraduates]);
      // }
  
      if (result.metadata) {
        setUploadHistory(prev => [...prev, {
          batchId: result.metadata.batchId,
          createdBy: result.metadata.createdBy,
          createdByName: result.metadata.createdByName,
          createdAt: result.metadata.createdAt,
          fileInfo: { filename: 'manual entry', mimetype: 'manual', size: newGraduatesBatch.length },
          added: result.results.added
        }]);
        fetchAllGraduates();
      }
  
      setNewGraduatesBatch([]);
    } catch (error) {
      alert(t('saveBatchFailed', { message: error.message }));
    }
  };
  
  

  return (
    <div className="app-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>{t('appTitle')}</h1>
        </div>
        <div className="header-right">
          <button onClick={() => setActiveView('workspace')} className={`nav-btn ${activeView === 'workspace' ? 'active' : ''}`}>{t('workspace')}</button>
          <button onClick={() => setActiveView('history')} className={`nav-btn ${activeView === 'history' ? 'active' : ''}`}>{t('uploadHistory')}</button>
          <button 
            className="icon-btn lang-btn" 
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
          >
            <Globe  size={20} /> {i18n.language === 'en' ? 'AR' : 'EN'}
          </button>
          <button onClick={onLogout} className="logout-btn"><LogOut className="icon-sm" /></button>
        </div>
      </div>
    </header>

    <main className="main-content">
      {activeView === 'workspace' && (
        <div className="workspace">
          <section className="card">
            <h2 className="card-title"><Upload className="icon-sm" /> {t('uploadFiles')}</h2>
            <div className="upload-zone">
              <input type="file" id="fileUpload" accept=".json,.xlsx,.xls" onChange={handleFileSelect} className="file-input"/>
              <label htmlFor="fileUpload" className="upload-label">
                <Upload className="icon-sm" /> {t('chooseFile')}
              </label>
              <p className="upload-hint">{t('uploadHint')}</p>

              {selectedFile && (
                <div className="upload-preview">
                  <span>{selectedFile.name}</span>
                  <button className="save-upload" onClick={handleSaveUpload}>{t('saveUpload')}</button>
                  <button className="cancel-upload" onClick={handleCancelUpload}>{t('cancel')}</button>
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <h2 className="card-title"><Plus className="icon-sm" /> {t('manualEntry')}</h2>
            <div className="manual-entry-grid">
              <input type="text" placeholder={t('fullName')} value={newGraduate.fullName} onChange={(e) => setNewGraduate({...newGraduate, fullName: e.target.value})} className="input-field"/>
              <input type="number" placeholder={t('nationalId')} value={newGraduate.nationalId} onChange={(e) => setNewGraduate({...newGraduate, nationalId: e.target.value})} className="input-field"/>
              <select value={newGraduate.faculty} onChange={(e) => setNewGraduate({...newGraduate, faculty: e.target.value})} className="input-field">
                <option value="">{t('faculty')}</option>
                {faculties.map((f, idx) => (
                  <option key={idx} value={i18n.language === 'ar' ? f.ar : f.en}>{i18n.language === 'ar' ? f.ar : f.en}</option>
                ))}
              </select>
              <input type="text" placeholder={t('department')} value={newGraduate.department} onChange={(e) => setNewGraduate({...newGraduate, department: e.target.value})} className="input-field"/>
              <input type="number" placeholder={t('graduationYear')} value={newGraduate.graduationYear} onChange={(e) => setNewGraduate({...newGraduate, graduationYear: e.target.value})} className="input-field"/>
            </div>
            <div className="batch-actions">
              <button className="btn-icon" onClick={handleAddRow}><Plus className="icon-add" /></button>
              <button className="btn-save" onClick={handleSaveBatch}>{t('saveAll')}</button>
            </div>

            {newGraduatesBatch.length > 0 && (
              <div className="batch-preview">
                <h3>{t('batchPreview')} ({newGraduatesBatch.length})</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('fullName')}</th>
                      <th>{t('nationalId')}</th>
                      <th>{t('faculty')}</th>
                      <th>{t('department')}</th>
                      <th>{t('graduationYear')}</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newGraduatesBatch.map((grad, idx) => (
                      <tr key={idx}>
                        <td>{grad.fullName}</td>
                        <td>{grad.nationalId}</td>
                        <td>{grad.faculty}</td>
                        <td>{grad.department}</td>
                        <td>{grad.graduationYear}</td>
                        <td>
                          <button className="trash-btn" onClick={() => handleDeleteRow(idx)}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="card">
            <h2 className="card-title"><Database className="icon-sm" /> {t('allRecords')} ({graduates.length})</h2>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('fullName')}</th>
                    <th>{t('nationalId')}</th>
                    <th>{t('faculty')}</th>
                    <th>{t('department')}</th>
                    <th>{t('graduationYear')}</th>
                  </tr>
                </thead>
                <tbody>
  {graduates.map((grad, idx) => (
    <tr key={idx} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
      <td>{grad.fullName}</td>
      <td>{grad.nationalId}</td>
      <td>{grad.faculty}</td>
      <td>{grad.department}</td>
      <td>{grad.graduationYear}</td>
    </tr>
  ))}
</tbody>

              </table>
              {graduates.length === 0 && <div className="empty-state">{t('noRecords')}</div>}
            </div>
          </section>
        </div>
      )}

      {activeView === 'history' && <UploadHistoryPage uploadHistory={uploadHistory} fetchAllGraduates={fetchAllGraduates}/>}
    </main>
  </div>
  );
};

export default GraduateRecords;
