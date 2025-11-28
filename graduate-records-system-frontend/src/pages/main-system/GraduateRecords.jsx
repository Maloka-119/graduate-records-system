// import { useTranslation } from 'react-i18next';
// import '../../i18n/i18n';
// import { Globe  } from 'lucide-react';
// import React, { useState, useEffect } from 'react';
// import { Upload, Plus, Trash2, Eye, FileText, Calendar, LogOut, Database, Archive ,ArrowLeft} from 'lucide-react';
// import * as XLSX from 'xlsx';
// import './GraduateRecords.css';
// import { BASE_URL } from "../../component/api"

// const GraduateRecords = ({ currentUser, onLogout }) => {
//   const [graduates, setGraduates] = useState([]);
//   const [uploadHistory, setUploadHistory] = useState([]);
//   const [activeView, setActiveView] = useState('workspace');
//   const [selectedUpload, setSelectedUpload] = useState(null);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const { t, i18n } = useTranslation();
//   const facultiesData = [
//     { ar: "كلية الهندسة بحلوان", en: "Faculty of Engineering (Helwan)" },
//     { ar: "كلية الهندسة بالمطرية", en: "Faculty of Engineering (Mataria)" },
//     { ar: "كلية الحاسبات والذكاء الاصطناعي", en: "Faculty of Computers & Artificial Intelligence" },
//     { ar: "كلية العلوم", en: "Faculty of Science" },
//     { ar: "كلية الصيدلة", en: "Faculty of Pharmacy" },
//     { ar: "كلية الطب", en: "Faculty of Medicine" },
//     { ar: "كلية التمريض", en: "Faculty of Nursing" },
//     { ar: "كلية التكنولوجيا والتعليم", en: "Faculty of Technology & Education" },
//     { ar: "كلية الاقتصاد وإدارة الأعمال الدولية بالشيخ زايد", en: "Faculty of International Business & Economics (Sheikh Zayed)" },
//     { ar: "كلية الآداب", en: "Faculty of Arts" },
//     { ar: "كلية الحقوق", en: "Faculty of Law" },
//     { ar: "كلية التجارة وإدارة الأعمال", en: "Faculty of Commerce & Business Administration" },
//     { ar: "كلية الخدمة الاجتماعية", en: "Faculty of Social Work" },
//     { ar: "كلية التربية", en: "Faculty of Education" },
//     { ar: "كلية التربية النوعية", en: "Faculty of Specific Education" },
//     { ar: "كلية السياحة والفنادق", en: "Faculty of Tourism & Hotels" },
//     { ar: "كلية الفنون الجميلة", en: "Faculty of Fine Arts" },
//     { ar: "كلية الفنون التطبيقية", en: "Faculty of Applied Arts" },
//     { ar: "كلية التربية الفنية", en: "Faculty of Art Education" },
//     { ar: "كلية التربية الموسيقية", en: "Faculty of Music Education" },
//     { ar: "كلية التربية الرياضية بنين", en: "Faculty of Physical Education (Men)" },
//     { ar: "كلية التربية الرياضية بنات", en: "Faculty of Physical Education (Women)" },
//     { ar: "المعهد القومي للملكية الفكرية", en: "National Institute of Intellectual Property" },
//     { ar: "معهد التمريض", en: "Nursing Institute" }
//   ];
  
//   const [faculties, setFaculties] = useState(facultiesData);
  

//   const [newGraduate, setNewGraduate] = useState({
//     fullName: '',
//     nationalId: '',
//     faculty: '',
//     department: '',
//     graduationYear: ''
//   });
  
//   const [newGraduatesBatch, setNewGraduatesBatch] = useState([]);

//   useEffect(() => {
//     loadData();
//   }, [currentUser]);

//   const loadData = async () => {
//     try {
//       const gradsRes = await fetch(`${BASE_URL}/graduates?user=${currentUser}`);
//       const uploadsRes = await fetch(`${BASE_URL}/uploads?user=${currentUser}`);
//       const gradsData = await gradsRes.json();
//       const uploadsData = await uploadsRes.json();

//       setGraduates(gradsData);
//       setUploadHistory(uploadsData);
//     } catch (error) {
//       console.error('Failed to load data:', error);
//     }
//   };

//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;
//     setSelectedFile(file);
//   };
  
//   const handleSaveUpload = async () => {
//     if (!selectedFile) return;
  
//     const formData = new FormData();
//     formData.append('file', selectedFile);
//     formData.append('user', currentUser);
  
//     try {
//       const res = await fetch(`${BASE_URL}/uploads/file`, { method: 'POST', body: formData });
//       const result = await res.json();
//       setGraduates(result.graduates);
//       setUploadHistory(result.uploadHistory);
//       setSelectedFile(null);
//       alert(t('uploadSuccess', { count: result.uploadCount }));
//     } catch (error) {
//       alert(t('uploadFailed', { message: error.message }));
//     }
//   };
  
//   const handleCancelUpload = () => {
//     setSelectedFile(null);
//   };
  

//   const handleAddRow = () => {
//     if (!newGraduate.fullName || !newGraduate.nationalId || !newGraduate.faculty || 
//         !newGraduate.department || !newGraduate.graduationYear) {
//           alert(t('fillAllFields'));
//       return;
//     }
//     setNewGraduatesBatch([...newGraduatesBatch, { ...newGraduate }]);
//     setNewGraduate({ fullName: '', nationalId: '', faculty: '', department: '', graduationYear: '' });
//   };

//   const handleDeleteRow = (index) => {
//     setNewGraduatesBatch(newGraduatesBatch.filter((_, i) => i !== index));
//   };

//   const handleSaveBatch = async () => {
//     if (newGraduatesBatch.length === 0) return;

//     try {
//       const res = await fetch(`${BASE_URL}/graduates/batch`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ user: currentUser, graduates: newGraduatesBatch })
//       });
//       const result = await res.json();

//       setGraduates(result.graduates);
//       setUploadHistory(result.uploadHistory);
//       setNewGraduatesBatch([]);
//     } catch (error) {
//       alert(t('saveBatchFailed', { message: error.message }));
//     }
//   };

//   const handleDeleteUpload = async (uploadId) => {
//     try {
//       await fetch(`${BASE_URL}/uploads/${uploadId}`, { method: 'DELETE' });
//       setGraduates(graduates.filter(g => !uploadHistory.find(u => u.id === uploadId)?.data.some(d => d.id === g.id)));
//       setUploadHistory(uploadHistory.filter(u => u.id !== uploadId));
//       setSelectedUpload(null);
//       setActiveView('workspace');
//     } catch (error) {
//       alert(t('deleteUploadFailed', { message: error.message }));
//     }
//   };

//   return (
//     <div className="app-container" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
//     <header className="app-header">
//       <div className="header-content">
//         <div className="header-left">
//           <h1>{t('appTitle')}</h1>
//           <p className="user-welcome">{t('welcomeUser', { user: currentUser })}</p>
//         </div>
//         <div className="header-right">
       
//           <button onClick={() => setActiveView('workspace')} className={`nav-btn ${activeView === 'workspace' ? 'active' : ''}`}>{t('workspace')}</button>
//           <button onClick={() => setActiveView('history')} className={`nav-btn ${activeView === 'history' ? 'active' : ''}`}>{t('uploadHistory')}</button>
//           <button 
//     className="icon-btn lang-btn" 
//     onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'ar' : 'en')}
//   >
//     <Globe  size={20} /> {i18n.language === 'en' ? 'AR' : 'EN'}
//   </button>
//           <button onClick={onLogout} className="logout-btn"><LogOut className="icon-sm" /></button>
          
//         </div>
//       </div>
//     </header>

//     <main className="main-content">
//       {activeView === 'workspace' && (
//         <div className="workspace">
//           <section className="card">
//             <h2 className="card-title"><Upload className="icon-sm" /> {t('uploadFiles')}</h2>
//             <div className="upload-zone">
//   <input
//     type="file"
//     id="fileUpload"
//     accept=".json,.xlsx,.xls"
//     onChange={handleFileSelect}
//     className="file-input"
//   />
//   <label htmlFor="fileUpload" className="upload-label">
//     <Upload className="icon-sm" /> {t('chooseFile')}
//   </label>
//   <p className="upload-hint">{t('uploadHint')}</p>

//   {selectedFile && (
//     <div className="upload-preview">
//       <span>{selectedFile.name}</span>
//       <button className="save-upload" onClick={handleSaveUpload}>{t('saveUpload')}</button>
//       <button className="cancel-upload" onClick={handleCancelUpload}>{t('cancel')}</button>
//     </div>
//   )}
// </div>

//           </section>

//           <section className="card">
//             <h2 className="card-title"><Plus className="icon-sm" /> {t('manualEntry')}</h2>
//             <div className="manual-entry-grid">
//               <input type="text" placeholder={t('fullName')} value={newGraduate.fullName} onChange={(e) => setNewGraduate({...newGraduate, fullName: e.target.value})} className="input-field"/>
//               <input type="text" placeholder={t('nationalId')} value={newGraduate.nationalId} onChange={(e) => setNewGraduate({...newGraduate, nationalId: e.target.value})} className="input-field"/>
//               <select 
//   value={newGraduate.faculty} 
//   onChange={(e) => setNewGraduate({...newGraduate, faculty: e.target.value})} 
//   className="input-field"
// >
//   <option value="">{t('faculty')}</option>
//   {faculties.map((f, idx) => (
//     <option key={idx} value={i18n.language === 'ar' ? f.ar : f.en}>
//       {i18n.language === 'ar' ? f.ar : f.en}
//     </option>
//   ))}
// </select>


//               <input type="text" placeholder={t('department')} value={newGraduate.department} onChange={(e) => setNewGraduate({...newGraduate, department: e.target.value})} className="input-field"/>
//               <input type="text" placeholder={t('graduationYear')} value={newGraduate.graduationYear} onChange={(e) => setNewGraduate({...newGraduate, graduationYear: e.target.value})} className="input-field"/>
//             </div>
//             <div className="batch-actions">
//               <button className="btn-icon" onClick={handleAddRow}>
//                 <Plus className="icon-add" /> 
//               </button>
//               <button className="btn-save" onClick={handleSaveBatch}>
//               {t('saveAll')}
//               </button>
//             </div>

//             {newGraduatesBatch.length > 0 && (
//               <div className="batch-preview">
//                 <h3>{t('batchPreview')} ({newGraduatesBatch.length})</h3>
//                 <table className="data-table">
//                   <thead>
//                     <tr>
//                       <th>{t('fullName')}</th>
//                       <th>{t('nationalId')}</th>
//                       <th>{t('faculty')}</th>
//                       <th>{t('department')}</th>
//                       <th>{t('graduationYear')}</th>
//                       <th>Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {newGraduatesBatch.map((grad) => (
//                       <tr key={grad.id}>
//                         <td>{grad.fullName}</td>
//                         <td>{grad.nationalId}</td>
//                         <td>{grad.faculty}</td>
//                         <td>{grad.department}</td>
//                         <td>{grad.graduationYear}</td>
//                         <td>
//                         <button className="trash-btn" onClick={() => handleDeleteRow(grad.id)}>
//                           <Trash2 size={16} />
//                         </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </section>

//           <section className="card">
//             <h2 className="card-title"><Database className="icon-sm" /> {t('allRecords')} ({graduates.length})</h2>
//             <div className="table-container">
//               <table className="data-table">
//                 <thead>
//                   <tr>
//                     <th>{t('fullName')}</th>
//                     <th>{t('nationalId')}</th>
//                     <th>{t('faculty')}</th>
//                     <th>{t('department')}</th>
//                     <th>{t('graduationYear')}</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {graduates.map((grad, idx) => (
//                     <tr key={grad.id} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
//                       <td>{grad.fullName}</td>
//                       <td>{grad.nationalId}</td>
//                       <td>{grad.faculty}</td>
//                       <td>{grad.department}</td>
//                       <td>{grad.graduationYear}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               {graduates.length === 0 && <div className="empty-state">{t('noRecords')}</div>}
//             </div>
//           </section>
//         </div>
//       )}

//       {activeView === 'history' && !selectedUpload && (
//         <section className="card">
//           <h2 className="card-title"><FileText className="icon-sm" />  {t('uploadHistory')} ({uploadHistory.length})</h2>
//           <div className="history-list">
//             {uploadHistory.map((upload) => (
//               <div key={upload.id} className="history-item">
//                 <div className="history-info">
//                   <div className="history-details">
//                     <h3>{upload.fileName}</h3>
//                     <div className="history-meta">
//                       <span className="meta-item"><Calendar className="icon-xs" /> {new Date(upload.date).toLocaleString()}</span>
//                       <span>{upload.recordCount} records</span>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="history-actions">
//                   <button onClick={() => setSelectedUpload(upload)} className="btn-view"><Eye className="icon-xs" />{t('view')}</button>
//                   <button onClick={() => {if(window.confirm(t('deleteConfirm'))) handleDeleteUpload(upload.id)}} className="btn-delete"><Trash2 className="icon-xs" /> {t('delete')}</button>
//                 </div>
//               </div>
//             ))}
//             {uploadHistory.length === 0 && <div className="empty-state">{t('noUploadHistory')}</div>}
//           </div>
//         </section>
//       )}

//       {activeView === 'history' && selectedUpload && (
//         <section className="card">
//           <div className="upload-detail-header">
//             <div>
//               <h2 className="card-title">{selectedUpload.fileName}</h2>
//               <p className="upload-detail-meta">{new Date(selectedUpload.date).toLocaleString()} • {selectedUpload.recordCount} records</p>
//             </div>
//             <button onClick={() => setSelectedUpload(null)} className="btn-back"><ArrowLeft size={18} />{t('backToHistory')}</button>
//           </div>
//           <div className="table-container">
//             <table className="data-table">
//               <thead>
//                 <tr>
//                 <th>{t('fullName')}</th>
//                 <th>{t('nationalId')}</th>
//                 <th>{t('faculty')}</th>
//                 <th>{t('department')}</th>
//                 <th>{t('graduationYear')}</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {selectedUpload.data.map((grad, idx) => (
//                   <tr key={grad.id} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
//                     <td>{grad.fullName}</td>
//                     <td>{grad.nationalId}</td>
//                     <td>{grad.faculty}</td>
//                     <td>{grad.department}</td>
//                     <td>{grad.graduationYear}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </section>
//       )}
//     </main>
//   </div>
//   );
// };

// export default GraduateRecords;


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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const gradsRes = await fetch(`${BASE_URL}/graduates`);
      const uploadsRes = await fetch(`${BASE_URL}/uploads`);
      const gradsData = await gradsRes.json();
      const uploadsData = await uploadsRes.json();

      setGraduates(gradsData);
      setUploadHistory(uploadsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

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
      const res = await fetch(`${BASE_URL}/graduates`, { method: 'POST', body: formData });
      const result = await res.json();
  
      if (result.addedGraduates) {
        setGraduates(prev => [...prev, ...result.addedGraduates]);
      }
  
      if (result.metadata) {
        setUploadHistory(prev => [...prev, {
          batchId: result.metadata.batchId,
          createdBy: result.metadata.createdBy,
          createdByName: result.metadata.createdByName,
          createdAt: result.metadata.createdAt,
          fileInfo: result.fileInfo,
          added: result.results.added
        }]);
      }
  
      setSelectedFile(null);
      alert(t('uploadSuccess', { count: result.results.added }));
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
      const res = await fetch(`${BASE_URL}/graduates/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ graduates: newGraduatesBatch })
      });
      const result = await res.json();
  
      if (result.addedGraduates) {
        setGraduates(prev => [...prev, ...result.addedGraduates]);
      }
  
      if (result.metadata) {
        setUploadHistory(prev => [...prev, {
          batchId: result.metadata.batchId,
          createdBy: result.metadata.createdBy,
          createdByName: result.metadata.createdByName,
          createdAt: result.metadata.createdAt,
          fileInfo: { filename: 'manual entry', mimetype: 'manual', size: newGraduatesBatch.length },
          added: result.results.added
        }]);
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
                    <tr key={grad.id} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
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

      {activeView === 'history' && <UploadHistoryPage uploadHistory={uploadHistory}/>}
    </main>
  </div>
  );
};

export default GraduateRecords;


