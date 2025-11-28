import React, { useEffect, useState } from 'react';
import { Eye, Trash2, Calendar, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from "../../component/api";

const UploadHistoryPage = () => {
  const { t } = useTranslation();
  const [uploadHistory, setUploadHistory] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(null);

  useEffect(() => {
    loadUploadHistory();
  }, []);

  const loadUploadHistory = async () => {
    try {
      const res = await fetch(`${BASE_URL}/batches`);
      const data = await res.json();
      const formattedUploads = data.batches.map(batch => ({
        id: batch.batchId,
        fileName: `Batch ${batch.batchId}`,
        date: batch.createdAt,
        recordCount: batch.graduateCount,
        data: []
      }));
      setUploadHistory(formattedUploads);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUploadDetails = async (batchId) => {
    try {
      const res = await fetch(`${BASE_URL}/graduates/batch/${batchId}`);
      const data = await res.json();
      setSelectedUpload({
        id: data.batchId,
        fileName: `Batch ${data.batchId}`,
        date: data.graduates[0]?.createdAt,
        recordCount: data.totalGraduates,
        data: data.graduates
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUpload = async (batchId) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      await fetch(`${BASE_URL}/graduates/batch/${batchId}`, { method: 'DELETE' });
      setUploadHistory(prev => prev.filter(u => u.id !== batchId));
      setSelectedUpload(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {!selectedUpload && (
        <section className="card">
          <h2 className="card-title">{t('uploadHistory')} ({uploadHistory.length})</h2>
          <div className="history-list">
            {uploadHistory.map((upload) => (
              <div key={upload.id} className="history-item">
                <div className="history-info">
                  <h3>{upload.fileName}</h3>
                  <div className="history-meta">
                    <span className="meta-item"><Calendar size={14} /> {new Date(upload.date).toLocaleString()}</span>
                    <span>{upload.recordCount} records</span>
                  </div>
                </div>
                <div className="history-actions">
                  <button onClick={() => loadUploadDetails(upload.id)} className="btn-view">
                    <Eye size={14} /> {t('view')}
                  </button>
                  <button onClick={() => handleDeleteUpload(upload.id)} className="btn-delete">
                    <Trash2 size={14} /> {t('delete')}
                  </button>
                </div>
              </div>
            ))}
            {uploadHistory.length === 0 && <div className="empty-state">{t('noUploadHistory')}</div>}
          </div>
        </section>
      )}

      {selectedUpload && (
        <section className="card">
          <div className="upload-detail-header">
            <div>
              <h2 className="card-title">{selectedUpload.fileName}</h2>
              <p className="upload-detail-meta">{new Date(selectedUpload.date).toLocaleString()} • {selectedUpload.recordCount} records</p>
            </div>
            <button onClick={() => setSelectedUpload(null)} className="btn-back">
              <ArrowLeft size={18} /> {t('backToHistory')}
            </button>
          </div>
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
                {selectedUpload.data.map((grad, idx) => (
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
          </div>
        </section>
      )}
    </>
  );
};

export default UploadHistoryPage;
